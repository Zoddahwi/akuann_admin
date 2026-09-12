"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save, UserX, XCircle } from "lucide-react";

type Status = "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export function ConsultationControls({
  id,
  status,
  studioNote,
}: {
  id: string;
  status: Status;
  studioNote: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState(studioNote ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Could not update this consultation.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      setError("Connection issue — please try again.");
    } finally {
      setBusy(null);
    }
  };

  const actions: { key: Status; label: string; icon: typeof Check; className: string }[] = [
    {
      key: "COMPLETED",
      label: "Mark completed",
      icon: Check,
      className: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    {
      key: "NO_SHOW",
      label: "No-show",
      icon: UserX,
      className: "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
    },
    {
      key: "CANCELLED",
      label: "Cancel",
      icon: XCircle,
      className: "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {actions
          .filter((a) => a.key !== status)
          .map((a) => (
            <button
              key={a.key}
              onClick={() => patch({ status: a.key }, a.key)}
              disabled={busy !== null}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 ${a.className}`}
            >
              {busy === a.key ? <Loader2 size={13} className="animate-spin" /> : <a.icon size={13} />}
              {a.label}
            </button>
          ))}
        {status !== "BOOKED" && (
          <button
            onClick={() => patch({ status: "BOOKED" }, "BOOKED")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            {busy === "BOOKED" ? <Loader2 size={13} className="animate-spin" /> : null}
            Re-open as booked
          </button>
        )}
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Studio notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="What was discussed, decisions made, fabrics shown…"
          className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
        />
        <button
          onClick={() => patch({ studioNote: note }, "note")}
          disabled={busy !== null}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy === "note" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saved && busy === null ? "Saved" : "Save notes"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
