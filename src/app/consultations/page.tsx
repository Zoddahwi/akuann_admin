import LiveRefresh from "@/components/LiveRefresh";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format, isToday, isTomorrow } from "date-fns";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Ruler,
  Video,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  BOOKED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
  NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
};

async function getConsultations() {
  try {
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      prisma.consultation.findMany({
        where: { scheduledAt: { gte: now }, status: { in: ["BOOKED"] } },
        include: { onboarding: true, measurementSheet: { select: { id: true } } },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.consultation.findMany({
        where: {
          OR: [{ scheduledAt: { lt: now } }, { status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] } }],
        },
        include: { onboarding: true, measurementSheet: { select: { id: true } } },
        orderBy: { scheduledAt: "desc" },
        take: 50,
      }),
    ]);
    return { upcoming, past };
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    return { upcoming: [], past: [] };
  }
}

type Row = Awaited<ReturnType<typeof getConsultations>>["upcoming"][number];

function dayLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, d MMMM yyyy");
}

export default async function ConsultationsPage() {
  const { upcoming, past } = await getConsultations();
  const todayCount = upcoming.filter((c) => isToday(new Date(c.scheduledAt))).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <LiveRefresh watch={["consultations", "clients"]} />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Consultations
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Every booked bridal appointment. Measurements are taken here, on the day.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat label="Today" value={todayCount} accent />
          <Stat label="Upcoming" value={upcoming.length} />
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
            No consultations booked yet. Accept a client in{" "}
            <Link href="/clients" className="underline">
              Clients
            </Link>{" "}
            to send a booking link.
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((c) => (
              <ConsultationCard key={c.id} c={c} highlight={isToday(new Date(c.scheduledAt))} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            Past &amp; closed
          </h2>
          <div className="space-y-4">
            {past.map((c) => (
              <ConsultationCard key={c.id} c={c} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`flex h-14 min-w-[92px] flex-col items-center justify-center rounded-2xl border px-4 ${
        accent ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white"
      }`}
    >
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
        {label}
      </span>
    </div>
  );
}

function ConsultationCard({
  c,
  highlight,
  muted,
}: {
  c: Row;
  highlight?: boolean;
  muted?: boolean;
}) {
  const when = new Date(c.scheduledAt);
  const isVirtual = c.format === "VIRTUAL";

  return (
    <Link
      href={`/consultations/${c.id}`}
      className={`block overflow-hidden rounded-[28px] border bg-white p-6 transition hover:shadow-md ${
        highlight ? "border-neutral-900 shadow-sm" : "border-neutral-200"
      } ${muted ? "opacity-70 hover:opacity-100" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${
              highlight ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {format(when, "MMM")}
            </span>
            <span className="text-xl font-semibold leading-none">{format(when, "d")}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-semibold text-neutral-900">
                {c.onboarding.fullName}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  STATUS_STYLE[c.status] ?? STATUS_STYLE.BOOKED
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
              {c.measurementSheet && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <Ruler size={10} />
                  Measured
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} />
                {dayLabel(when)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {format(when, "h:mm a")} · {c.durationMinutes} min
              </span>
              <span className="flex items-center gap-1.5">
                {isVirtual ? <Video size={12} /> : <MapPin size={12} />}
                {isVirtual ? "Virtual" : c.location || "Studio"}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={12} />
                {c.onboarding.phoneNumber}
              </span>
            </div>

            {c.clientNote && (
              <p className="mt-3 max-w-2xl rounded-xl bg-neutral-50 px-4 py-2.5 text-xs italic text-neutral-600">
                &ldquo;{c.clientNote}&rdquo;
              </p>
            )}
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Open →
        </span>
      </div>
    </Link>
  );
}
