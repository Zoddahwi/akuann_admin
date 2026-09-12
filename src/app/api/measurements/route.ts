import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Every measurement field the sheet can write. */
const FIELDS = [
  "takenBy",
  "height",
  "weight",
  "braSize",
  "dressSize",
  "shoeSize",
  "bust",
  "underbust",
  "highBust",
  "shoulderWidth",
  "neck",
  "shoulderToWaist",
  "waist",
  "hip",
  "waistToFloor",
  "shoulderToFloor",
  "armhole",
  "bicep",
  "sleeveLength",
  "preferredFit",
  "corsetPref",
  "heelHeight",
  "trainLength",
  "posture",
  "notes",
] as const;

/**
 * Create or update the measurement sheet for a bride. One sheet per
 * onboarding, so repeated saves during a consultation simply overwrite.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const onboardingId: string | undefined = body?.onboardingId;
    const consultationId: string | null = body?.consultationId ?? null;
    const completeConsultation: boolean = body?.completeConsultation === true;

    if (!onboardingId) {
      return NextResponse.json({ error: "onboardingId is required" }, { status: 400 });
    }

    const onboarding = await prisma.clientOnboarding.findUnique({
      where: { id: onboardingId },
      select: { id: true },
    });
    if (!onboarding) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const values: Record<string, string | null> = {};
    for (const field of FIELDS) {
      const raw = body?.[field];
      values[field] = typeof raw === "string" && raw.trim() ? raw.trim() : null;
    }

    const sheet = await prisma.measurementSheet.upsert({
      where: { onboardingId },
      create: { onboardingId, consultationId, ...values },
      update: { ...values, ...(consultationId ? { consultationId } : {}) },
    });

    // "Save & complete" closes the appointment out in one action.
    if (completeConsultation && consultationId) {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: "COMPLETED" },
      });
      await prisma.clientOnboarding.update({
        where: { id: onboardingId },
        data: { status: "CONSULTED" },
      });
    }

    return NextResponse.json({ success: true, sheet });
  } catch (error) {
    console.error("Measurement save error:", error);
    return NextResponse.json({ error: "Failed to save measurements" }, { status: 500 });
  }
}
