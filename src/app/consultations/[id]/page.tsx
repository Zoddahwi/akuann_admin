import LiveRefresh from "@/components/LiveRefresh";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Video,
} from "lucide-react";
import { ConsultationControls } from "@/components/ConsultationControls";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  BOOKED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
  NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
};

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: { onboarding: true, measurementSheet: true },
  });

  if (!consultation) notFound();

  const when = new Date(consultation.scheduledAt);
  const client = consultation.onboarding;
  const isVirtual = consultation.format === "VIRTUAL";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <LiveRefresh watch={["consultations", "measurements"]} />
      <Link
        href="/consultations"
        className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-900"
      >
        <ArrowLeft size={14} />
        All consultations
      </Link>

      <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                {client.fullName}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  STATUS_STYLE[consultation.status] ?? STATUS_STYLE.BOOKED
                }`}
              >
                {consultation.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary" />
                {format(when, "EEEE, d MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                {format(when, "h:mm a")} · {consultation.durationMinutes} min
              </span>
              <span className="flex items-center gap-1.5">
                {isVirtual ? (
                  <Video size={14} className="text-primary" />
                ) : (
                  <MapPin size={14} className="text-primary" />
                )}
                {isVirtual ? "Virtual" : consultation.location || "Studio"}
              </span>
            </div>
          </div>

          <Link
            href={`/consultations/${consultation.id}/measurements`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:brightness-110"
          >
            <Ruler size={14} />
            {consultation.measurementSheet ? "Edit measurements" : "Take measurements"}
          </Link>
        </div>

        {consultation.clientNote && (
          <p className="mt-6 rounded-2xl bg-neutral-50 px-5 py-4 text-sm italic text-neutral-600">
            &ldquo;{consultation.clientNote}&rdquo;
            <span className="mt-1 block text-[10px] not-italic uppercase tracking-wider text-neutral-400">
              Her note when booking
            </span>
          </p>
        )}
      </div>

      {/* Contact + brief */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="Contact">
          <Row icon={Phone} value={client.phoneNumber} href={`tel:${client.phoneNumber}`} />
          <Row icon={Mail} value={client.emailAddress} href={`mailto:${client.emailAddress}`} />
          <Row icon={Instagram} value={client.instagramHandle || "—"} />
          <Row icon={CalendarDays} value={`Event: ${client.eventDate || "TBD"}`} />
          <Row icon={MapPin} value={client.ceremonyLocation} />
        </Panel>

        <Panel title="Her brief">
          <dl className="space-y-3 text-sm">
            <Brief label="Services" value={list(client.bridalServices)} />
            <Brief label="Number of looks" value={client.numberOfLooks} />
            <Brief label="Vision words" value={list(client.visionWords)} />
            <Brief label="Silhouette" value={list(client.silhouettePrefs, client.desiredSilhouette)} />
            <Brief
              label="Neckline / sleeves"
              value={`${list(client.necklinePrefs, client.preferredNeckline)} • ${list(
                client.sleevePrefs,
                client.sleevePreference
              )}`}
            />
            <Brief label="Train" value={list(client.trainPrefs, null, client.trainLength)} />
            <Brief label="Fabric" value={list(client.fabricPrefs)} />
            <Brief label="Embellishment" value={list(client.embellishmentPrefs)} />
            <Brief label="Colour" value={list(client.bridalColour)} />
            <Brief label="Preferred fit" value={client.preferredFit} />
            <Brief label="Investment" value={client.investmentRange} />
          </dl>
        </Panel>
      </div>

      {/* Measurement summary */}
      {consultation.measurementSheet && (
        <div className="mt-6 rounded-[32px] border border-emerald-200 bg-emerald-50/40 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              <Ruler size={14} />
              Measurements on file
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-emerald-700/70">
              Updated {format(new Date(consultation.measurementSheet.updatedAt), "d MMM yyyy")}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                ["Bust", consultation.measurementSheet.bust],
                ["Waist", consultation.measurementSheet.waist],
                ["Hip", consultation.measurementSheet.hip],
                ["Height", consultation.measurementSheet.height],
                ["Shoulder", consultation.measurementSheet.shoulderWidth],
                ["Waist→Floor", consultation.measurementSheet.waistToFloor],
                ["Fit", consultation.measurementSheet.preferredFit],
                ["Posture", consultation.measurementSheet.posture],
              ] as [string, string | null][]
            ).map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-neutral-900">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 rounded-[32px] border border-neutral-200 bg-white p-8">
        <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Appointment
        </h2>
        <ConsultationControls
          id={consultation.id}
          status={consultation.status}
          studioNote={consultation.studioNote}
        />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-neutral-200 bg-white p-8">
      <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2.5 text-sm text-neutral-700">
      <Icon size={14} className="shrink-0 text-neutral-400" />
      <span className="break-all">{value}</span>
    </span>
  );
  return href ? (
    <a href={href} className="block transition hover:text-neutral-900">
      {content}
    </a>
  ) : (
    content
  );
}

function Brief({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-wider text-neutral-400">{label}</dt>
      <dd className="text-neutral-800">{value || "—"}</dd>
    </div>
  );
}

/**
 * Render a preference, falling back to the pre-2026-08 columns so a bride who
 * submitted on the old form still shows a full brief on her consultation day.
 */
function list(
  primary: string[],
  legacyText?: string | null,
  legacyList?: string[]
): string {
  if (primary.length) return primary.join(", ");
  if (legacyText) return legacyText;
  if (legacyList?.length) return legacyList.join(", ");
  return "—";
}
