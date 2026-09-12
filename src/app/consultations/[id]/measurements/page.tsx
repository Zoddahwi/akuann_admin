import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { MeasurementSheetForm } from "@/components/MeasurementSheetForm";

export const dynamic = "force-dynamic";

export default async function MeasurementSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      onboarding: { include: { measurementSheet: true } },
    },
  });

  if (!consultation) notFound();

  const client = consultation.onboarding;
  const sheet = client.measurementSheet;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href={`/consultations/${consultation.id}`}
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-900"
      >
        <ArrowLeft size={14} />
        Back to consultation
      </Link>

      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Measurement Sheet
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          {client.fullName}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {format(new Date(consultation.scheduledAt), "EEEE, d MMMM yyyy 'at' h:mm a")} ·{" "}
          {consultation.format === "IN_PERSON" ? "In-Person" : "Virtual"} · Event{" "}
          {client.eventDate || "TBD"}
        </p>
      </div>

      <MeasurementSheetForm
        onboardingId={client.id}
        consultationId={consultation.id}
        clientName={client.fullName}
        initial={sheet}
        consultationCompleted={consultation.status === "COMPLETED"}
      />
    </div>
  );
}
