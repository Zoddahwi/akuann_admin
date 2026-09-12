"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Loader2, Send, X } from "lucide-react";

type Status =
  | "PENDING_REVIEW"
  | "ACCEPTED"
  | "DECLINED"
  | "CONSULTATION_BOOKED"
  | "CONSULTED";

interface Props {
  id: string;
  fullName: string;
  status: Status;
}

export function ReviewActions({ id, fullName, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "ACCEPT" | "DECLINE" | "RESEND">(null);
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{
    bookingUrl?: string;
    emailSent: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (action: "ACCEPT" | "DECLINE" | "RESEND") => {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/onboardings/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note.trim() || null }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setDeclining(false);
      setNote("");
      setResult({
        bookingUrl: json.bookingUrl,
        emailSent: json.emailSent,
        message:
          action === "DECLINE"
            ? `${fullName} has been declined.`
            : action === "RESEND"
            ? "A new booking link has been issued."
            : `${fullName} has been accepted.`,
      });
      router.refresh();
    } catch {
      setError("Connection issue — please try again.");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!result?.bookingUrl) return;
    await navigator.clipboard.writeText(result.bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Post-action feedback ────────────────────────────────────────── */
  if (result) {
    return (
      <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Check size={16} className="text-emerald-600" />
          {result.message}
        </p>

        {!result.emailSent && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            The email could not be sent. The status is saved — please send the link below by
            WhatsApp instead.
          </p>
        )}

        {result.bookingUrl && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Her booking link
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-neutral-100 px-3 py-2 text-[11px] text-neutral-700">
                {result.bookingUrl}
              </code>
              <button
                onClick={copy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setResult(null)}
          className="mt-4 text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700"
        >
          Done
        </button>
      </div>
    );
  }

  /* ── Decline reason ──────────────────────────────────────────────── */
  if (declining) {
    return (
      <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">Decline {fullName}?</p>
        <p className="mt-1 text-xs text-neutral-500">
          She receives a gracious note. Anything you add here is included in it.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Optional — e.g. our calendar is full for that month, but we would love to work with you on a later date."
          className="mt-3 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => submit("DECLINE")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {busy === "DECLINE" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send decline
          </button>
          <button
            onClick={() => {
              setDeclining(false);
              setNote("");
            }}
            className="rounded-full px-4 py-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  /* ── Buttons ─────────────────────────────────────────────────────── */
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {status === "PENDING_REVIEW" && (
        <>
          <button
            onClick={() => submit("ACCEPT")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === "ACCEPT" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Accept &amp; send booking link
          </button>
          <button
            onClick={() => setDeclining(true)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <X size={13} />
            Decline
          </button>
        </>
      )}

      {(status === "ACCEPTED" || status === "CONSULTATION_BOOKED") && (
        <button
          onClick={() => submit("RESEND")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {busy === "RESEND" ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
          {status === "CONSULTATION_BOOKED" ? "Cancel & re-issue link" : "Re-send booking link"}
        </button>
      )}

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
