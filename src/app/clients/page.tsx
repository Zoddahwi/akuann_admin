import LiveRefresh from "@/components/LiveRefresh";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { ReviewActions } from "@/components/ReviewActions";
import { OnboardingSubmission } from "@/components/OnboardingSubmission";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "PENDING_REVIEW", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "CONSULTATION_BOOKED", label: "Booked" },
  { key: "CONSULTED", label: "Consulted" },
  { key: "DECLINED", label: "Declined" },
  { key: "ALL", label: "All" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING_REVIEW: { label: "Pending review", className: "bg-amber-50 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Accepted — awaiting booking", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CONSULTATION_BOOKED: { label: "Consultation booked", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  CONSULTED: { label: "Consulted", className: "bg-neutral-900 text-white border-neutral-900" },
  DECLINED: { label: "Declined", className: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

/** Accepted this long ago without booking → worth a nudge. */
const STALE_ACCEPT_MS = 7 * 24 * 60 * 60 * 1000;

async function getData(tab: TabKey) {
  // Read the clock here rather than during render, so the page stays pure.
  const staleBefore = Date.now() - STALE_ACCEPT_MS;

  try {
    const [clients, counts] = await Promise.all([
      prisma.clientOnboarding.findMany({
        where: tab === "ALL" ? {} : { status: tab },
        include: { consultation: true },
        // Newest first — the designer works the top of the queue.
        orderBy: { createdAt: "desc" },
      }),
      prisma.clientOnboarding.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of counts) {
      byStatus[row.status] = row._count._all;
      total += row._count._all;
    }
    byStatus.ALL = total;

    const rows = clients.map((client) => ({
      ...client,
      staleAccept:
        client.status === "ACCEPTED" &&
        client.reviewedAt !== null &&
        new Date(client.reviewedAt).getTime() < staleBefore,
    }));

    return { clients: rows, counts: byStatus };
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return { clients: [], counts: {} as Record<string, number> };
  }
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === status)
    ? (status as TabKey)
    : "PENDING_REVIEW";

  const { clients, counts } = await getData(tab);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <LiveRefresh watch={["clients", "measurements"]} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Client Onboarding
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Review each bridal enquiry. Accepting sends the bride a link to book her
            consultation; measurements are taken at that appointment.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-xs font-medium text-neutral-600">
          <User size={14} className="text-neutral-400" />
          {counts.ALL ?? 0} total
        </div>
      </div>

      {/* Status tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === tab;
          const count = counts[t.key] ?? 0;
          return (
            <Link
              key={t.key}
              href={`/clients?status=${t.key}`}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {clients.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-20 text-center text-neutral-500">
          Nothing here right now.
        </div>
      ) : (
        <div className="space-y-6">
          {clients.map((client) => {
            const badge = STATUS_STYLE[client.status] ?? STATUS_STYLE.PENDING_REVIEW;
            const consultation = client.consultation;
            const staleAccept = client.staleAccept;

            return (
              <div
                key={client.id}
                className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="border-b border-neutral-100 bg-neutral-50/50 px-8 py-6">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-neutral-900">
                            {client.fullName}
                          </h2>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            {client.ceremonyLocation}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {client.eventDate || "TBD"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Submitted {format(new Date(client.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${client.emailAddress}`}
                        className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Email Client
                      </a>
                      <Link
                        href={`/clients/${client.id}`}
                        className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700"
                      >
                        Open full form
                      </Link>
                    </div>
                  </div>

                  {/* Consultation strip */}
                  {consultation && consultation.status !== "CANCELLED" && (
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-3 text-xs text-indigo-900 transition hover:bg-indigo-50"
                    >
                      <CalendarCheck size={14} />
                      <span className="font-semibold">
                        {format(new Date(consultation.scheduledAt), "EEEE, d MMMM yyyy 'at' h:mm a")}
                      </span>
                      <span className="opacity-70">
                        {consultation.format === "IN_PERSON" ? "In-Person" : "Virtual"}
                      </span>
                      <span className="ml-auto font-bold uppercase tracking-wider">
                        Open consultation →
                      </span>
                    </Link>
                  )}

                  {staleAccept && !consultation && (
                    <p className="mt-4 rounded-2xl bg-amber-50 px-5 py-3 text-xs text-amber-800">
                      Accepted over a week ago and still not booked — consider re-sending her
                      link or following up on WhatsApp.
                    </p>
                  )}

                  {client.status === "DECLINED" && client.reviewNote && (
                    <p className="mt-4 rounded-2xl bg-neutral-100 px-5 py-3 text-xs italic text-neutral-600">
                      Reason sent: {client.reviewNote}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-5">
                    <ReviewActions
                      id={client.id}
                      fullName={client.fullName}
                      status={client.status}
                    />
                  </div>
                </div>

                <OnboardingSubmission client={client} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
