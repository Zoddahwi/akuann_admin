import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth-server";
import { notifyChange } from "@/lib/realtime-server";

export const dynamic = "force-dynamic";

const STATUSES = ["BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
type ConsultationStatusValue = (typeof STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const status: ConsultationStatusValue | undefined = body?.status;
    const studioNote: string | undefined = body?.studioNote;
    const meetingLink: string | undefined = body?.meetingLink;

    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      select: { id: true, onboardingId: true },
    });
    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(studioNote !== undefined ? { studioNote: studioNote.trim() || null } : {}),
        ...(meetingLink !== undefined ? { meetingLink: meetingLink.trim() || null } : {}),
      },
    });

    // Keep the bride's journey status in step with her appointment.
    if (status === "COMPLETED") {
      await prisma.clientOnboarding.update({
        where: { id: consultation.onboardingId },
        data: { status: "CONSULTED" },
      });
    } else if (status === "CANCELLED" || status === "NO_SHOW") {
      // She is back to accepted — the designer can re-issue a booking link.
      await prisma.clientOnboarding.update({
        where: { id: consultation.onboardingId },
        data: { status: "ACCEPTED" },
      });
    } else if (status === "BOOKED") {
      await prisma.clientOnboarding.update({
        where: { id: consultation.onboardingId },
        data: { status: "CONSULTATION_BOOKED" },
      });
    }

    notifyChange("consultations", id);
    // The bride's journey status moves with the appointment, so client views
    // need to update too.
    notifyChange("clients", consultation.onboardingId);
    return NextResponse.json({ success: true, consultation: updated });
  } catch (error) {
    console.error("Consultation update error:", error);
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 });
  }
}
