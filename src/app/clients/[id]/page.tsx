import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Mail,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react";
import { ReviewActions } from "@/components/ReviewActions";
import { OnboardingSubmission } from "@/components/OnboardingSubmission";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING_REVIEW: {
    label: "Pending review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ACCEPTED: {
    label: "Accepted — awaiting booking",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CONSULTATION_BOOKED: {
    label: "Consultation booked",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  CONSULTED: { label: "Consulted", className: "bg-neutral-900 text-white border-neutral-900" },
  DECLINED: { label: "Declined", className: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

export default async function ClientSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.clientOnboarding.findUnique({
    where: { id },
    include: { consultation: true, measurementSheet: { select: { id: true } } },
  });

  if (!client) notFound();

  const badge = STATUS_STYLE[client.status] ?? STATUS_STYLE.PENDING_REVIEW;
  const consultation = client.consultation;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 no-print">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-900"
        >
          <ArrowLeft size={14} />
          All submissions
        </Link>
        <PrintButton />
      </div>

      {/* Header */}
      <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Bridal Client Onboarding Form
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                {client.fullName}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            {client.preferredName && client.preferredName !== client.fullName && (
              <p className="mt-1 text-sm text-neutral-500">
                Prefers to be called {client.preferredName}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
              <a
                href={`tel:${client.phoneNumber}`}
                className="flex items-center gap-1.5 transition hover:text-neutral-900"
              >
                <Phone size={12} />
                {client.phoneNumber}
              </a>
              <a
                href={`mailto:${client.emailAddress}`}
                className="flex items-center gap-1.5 transition hover:text-neutral-900"
              >
                <Mail size={12} />
                {client.emailAddress}
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {client.ceremonyLocation}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Submitted {format(new Date(client.createdAt), "d MMM yyyy, h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {consultation && consultation.status !== "CANCELLED" && (
          <Link
            href={`/consultations/${consultation.id}`}
            className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-3 text-xs text-indigo-900 transition hover:bg-indigo-50"
          >
            <CalendarCheck size={14} />
            <span className="font-semibold">
              {format(new Date(consultation.scheduledAt), "EEEE, d MMMM yyyy 'at' h:mm a")}
            </span>
            <span className="opacity-70">
              {consultation.format === "IN_PERSON" ? "In-Person" : "Virtual"}
            </span>
            {client.measurementSheet && (
              <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-bold uppercase tracking-wider">
                <Ruler size={10} />
                Measured
              </span>
            )}
            <span className="ml-auto font-bold uppercase tracking-wider">
              Open consultation →
            </span>
          </Link>
        )}

        {client.status === "DECLINED" && client.reviewNote && (
          <p className="mt-5 rounded-2xl bg-neutral-100 px-5 py-3 text-xs italic text-neutral-600">
            Reason sent: {client.reviewNote}
          </p>
        )}

        <div className="mt-6 no-print">
          <ReviewActions id={client.id} fullName={client.fullName} status={client.status} />
        </div>
      </div>

      {/* The form as she filled it */}
      <div className="mt-6 overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <OnboardingSubmission client={client} />
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-300">
        Akuann Made · Sophistication gracefully draped over contours
      </p>
    </div>
  );
}
