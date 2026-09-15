"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function InvoiceActions({ invoiceId, status }: { invoiceId: string, status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // These actions used to fail silently: a request that did not succeed left
  // the button looking like it had done nothing at all.
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        setError("Could not update this invoice. Please try again.");
        return;
      }

      router.refresh();

      // Generate receipt when status changes to PAID
      if (newStatus === "PAID") {
        setTimeout(() => {
          const receiptUrl = `/invoices/${invoiceId}/receipt`;

          // Try to open in new tab
          const newWindow = window.open(receiptUrl, '_blank', 'noopener,noreferrer');

          // Fallback if popup is blocked
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = receiptUrl;
          }
        }, 1000); // Increased timeout to ensure status is updated
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const deleteInvoice = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Could not delete this invoice. Please try again.");
        return;
      }

      router.push("/invoices");
      // Without this the list can render from the client router cache and still
      // show the invoice that was just deleted.
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
      setConfirmingDelete(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      open={confirmingDelete}
      busy={busy}
      destructive
      title="Delete this invoice?"
      message="It will be removed from your invoice list. Nothing is erased, so it can be restored later."
      confirmLabel="Delete invoice"
      cancelLabel="Keep it"
      onConfirm={deleteInvoice}
      onCancel={() => setConfirmingDelete(false)}
    />
  );

  const notice = error ? (
    <p role="alert" className="w-full text-xs font-bold text-red-600">
      {error}
    </p>
  ) : null;

  if (status === "PAID") return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => updateStatus("PENDING")}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 active:scale-95 shadow-sm disabled:opacity-50"
      >
        <XCircle size={14} />
        Mark as Pending
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 active:scale-95 shadow-sm disabled:opacity-50"
      >
        <Trash2 size={14} />
        {busy ? "Working…" : "Delete"}
      </button>
      {notice}
      {dialog}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => updateStatus("PAID")}
        disabled={busy}
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 shadow-md disabled:opacity-50"
      >
        <CheckCircle2 size={16} />
        Mark as Paid
      </button>
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-6 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-95 disabled:opacity-50"
      >
        <XCircle size={16} />
        Cancel
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 active:scale-95 shadow-sm disabled:opacity-50"
      >
        <Trash2 size={16} />
        {busy ? "Working…" : "Delete"}
      </button>
      {notice}
      {dialog}
    </div>
  );
}
