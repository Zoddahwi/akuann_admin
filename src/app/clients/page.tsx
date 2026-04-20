import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { 
  User, 
  Calendar, 
  MapPin, 
  Instagram, 
  Scissors, 
  Sparkles, 
  Wallet, 
  CheckCircle2,
  Clock
} from "lucide-react";

async function getClients() {
  try {
    return await prisma.clientOnboarding.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Client Onboarding</h1>
          <p className="mt-2 text-sm text-neutral-500">
            View and manage all bespoke bridal onboarding submissions.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-xs font-medium text-neutral-600">
          <User size={14} className="text-neutral-400" />
          {clients.length} Submissions
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-20 text-center text-neutral-500">
          No onboarding submissions found.
        </div>
      ) : (
        <div className="space-y-6">
          {clients.map((client) => (
            <div 
              key={client.id}
              className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              {/* Header / Summary Row */}
              <div className="border-b border-neutral-100 bg-neutral-50/50 px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">{client.fullName}</h2>
                      <div className="mt-1 flex items-center gap-4 text-xs text-neutral-500">
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
                          {format(new Date(client.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={`mailto:${client.emailAddress}`}
                      className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Email Client
                    </a>
                  </div>
                </div>
              </div>

              {/* Full Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                
                {/* Contact & Basics */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Contact Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Phone</span>
                        <span className="text-neutral-800 font-medium">{client.phoneNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Email</span>
                        <span className="text-neutral-800 font-medium break-all">{client.emailAddress}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Instagram</span>
                        <span className="flex items-center gap-1 text-neutral-800 font-medium italic">
                          <Instagram size={12} />
                          {client.instagramHandle || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Reception</span>
                        <span className="text-neutral-800 font-medium">{client.receptionLocation || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Garment Details */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Garment Details
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Gown Types</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {client.typeOfGown.map(t => (
                            <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Silhouette</span>
                        <span className="text-neutral-800 font-medium">{client.desiredSilhouette}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Neckline / Sleeves</span>
                        <span className="text-neutral-800 font-medium">
                          {client.preferredNeckline || "?"} • {client.sleevePreference || "?"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Train Length</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {client.trainLength.map(t => (
                            <span key={t} className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style & Vision */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Style Direction
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Three Words</span>
                        <p className="mt-0.5 text-xs italic text-neutral-700 leading-relaxed font-serif">
                          "{client.threeWords || "—"}"
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">The Feeling</span>
                        <p className="mt-0.5 text-xs text-neutral-700 leading-relaxed">
                          {client.feelWearing || "—"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400">Body Positivity</span>
                        <p className="mt-0.5 text-xs text-neutral-700 leading-relaxed">
                          <span className="text-emerald-600 font-medium">Loves:</span> {client.loveBodyParts || "—"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                          <span className="text-amber-600 font-medium">Soften:</span> {client.softenConceal || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment & Agreement */}
                <div className="p-8 bg-neutral-50/30">
                  <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Agreement
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-400">Budget Range</span>
                      <span className="text-neutral-800 font-medium">
                        {client.budgetRange.join(", ") || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-400">Ready for Deposit</span>
                      <span className={`inline-flex items-center gap-1.5 mt-1 text-xs font-bold ${client.readyForDeposit === 'Yes' ? 'text-emerald-600' : 'text-neutral-400'}`}>
                        {client.readyForDeposit === 'Yes' ? <CheckCircle2 size={14} /> : null}
                        {client.readyForDeposit}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-400">Brand Policy Confirmed</span>
                      <div className="mt-2 text-[10px] text-neutral-500 space-y-1">
                        <p>✓ All brand terms accepted</p>
                        <p>✓ Dec: {client.declarationDate || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
