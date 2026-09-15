import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import path from "path";
import { prisma } from "@/lib/db";
import { acceptanceEmail, declineEmail, resendEmail, sendEmail } from "@/lib/mailer";
import { isAdmin } from "@/lib/auth-server";
import { notifyChange } from "@/lib/realtime-server";

export const dynamic = "force-dynamic";

/** Days a consultation booking link stays live. */
const TOKEN_TTL_DAYS = 14;

/** Where the bride's booking page lives (the client web app). */
function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://akuann.com").replace(/\/$/, "");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function expiryDate(): Date {
  return new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Action = "ACCEPT" | "DECLINE" | "RESEND";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action: Action = body?.action;
    const note: string | null = body?.note?.toString().trim() || null;
    const reviewedBy: string | null = body?.reviewedBy?.toString().trim() || null;

    if (!["ACCEPT", "DECLINE", "RESEND"].includes(action)) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const onboarding = await prisma.clientOnboarding.findUnique({
      where: { id },
      include: { consultation: true },
    });
    if (!onboarding) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const logoPath = path.join(process.cwd(), "public", "Akuann_logo.png");
    const attachments = [
      { filename: "Akuann_logo.png", path: logoPath, cid: "akuann-logo" },
    ];

    /* ── Decline ────────────────────────────────────────────────────── */
    if (action === "DECLINE") {
      const updated = await prisma.clientOnboarding.update({
        where: { id },
        data: {
          status: "DECLINED",
          reviewNote: note,
          reviewedBy,
          reviewedAt: new Date(),
          bookingToken: null,
          bookingTokenExpiresAt: null,
        },
      });

      const mailed = await trySend(() =>
        sendEmail({
          to: [onboarding.emailAddress],
          replyTo: process.env.EMAIL_USER!,
          subject: "Regarding your Akuann Made enquiry",
          attachments,
          html: declineEmail({ fullName: onboarding.fullName, note }),
        })
      );

      notifyChange("clients", id);
      return NextResponse.json({ success: true, status: updated.status, emailSent: mailed });
    }

    /* ── Accept / Re-send ───────────────────────────────────────────── */
    if (action === "ACCEPT" && onboarding.status === "CONSULTATION_BOOKED") {
      return NextResponse.json(
        { error: "This bride has already booked a consultation." },
        { status: 409 }
      );
    }

    // Re-issuing after a booking means the old appointment is being released.
    if (
      action === "RESEND" &&
      onboarding.consultation &&
      onboarding.consultation.status === "BOOKED"
    ) {
      await prisma.consultation.update({
        where: { id: onboarding.consultation.id },
        data: { status: "CANCELLED" },
      });
    }

    const token = newToken();
    const expiresAt = expiryDate();

    await prisma.clientOnboarding.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        reviewNote: action === "ACCEPT" ? note : onboarding.reviewNote,
        reviewedBy: reviewedBy ?? onboarding.reviewedBy,
        reviewedAt: onboarding.reviewedAt ?? new Date(),
        bookingToken: token,
        bookingTokenExpiresAt: expiresAt,
      },
    });

    const bookingUrl = `${siteUrl()}/consultation/${token}`;
    const expiresOn = formatDate(expiresAt);

    const mailed = await trySend(() =>
      sendEmail({
        to: [onboarding.emailAddress],
        replyTo: process.env.EMAIL_USER!,
        subject:
          action === "ACCEPT"
            ? "Your Akuann Made consultation invitation"
            : "Your new Akuann Made booking link",
        attachments,
        html:
          action === "ACCEPT"
            ? acceptanceEmail({
                fullName: onboarding.fullName,
                bookingUrl,
                expiresOn,
                note,
              })
            : resendEmail({ fullName: onboarding.fullName, bookingUrl, expiresOn }),
      })
    );

    // The link is returned so the designer can also send it over WhatsApp,
    // which matters when email delivery is slow or the bride misses it.
    notifyChange("clients", id);
    return NextResponse.json({
      success: true,
      status: "ACCEPTED",
      bookingUrl,
      expiresOn,
      emailSent: mailed,
    });
  } catch (error) {
    console.error("Onboarding review error:", error);
    return NextResponse.json({ error: "Failed to record the review" }, { status: 500 });
  }
}

/**
 * The status change is the source of truth; a failed email must not undo it.
 * The caller is told whether the mail went out so the UI can prompt the
 * designer to send the link another way.
 */
async function trySend(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timeout")), 15000)
      ),
    ]);
    return true;
  } catch (error) {
    console.error("Review email failed:", error);
    return false;
  }
}
