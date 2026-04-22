"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

export default function InvoiceActions({ invoiceId, status }: { invoiceId: string, status: string }) {
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      router.refresh();
    }
  };

  const deleteInvoice = async () => {
    if (!confirm("Are you sure you want to delete this invoice? This can be restored later.")) return;

    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/invoices");
    }
  };

  if (status === "PAID") return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("PENDING")}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 active:scale-95 shadow-sm"
      >
        <XCircle size={14} />
        Mark as Pending
      </button>
      <button
        onClick={deleteInvoice}
        className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 active:scale-95 shadow-sm"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("PAID")}
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 shadow-md"
      >
        <CheckCircle2 size={16} />
        Mark as Paid
      </button>
      <button
        onClick={() => updateStatus("CANCELLED")}
        className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-6 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-95"
      >
        <XCircle size={16} />
        Cancel
      </button>
      <button
        onClick={deleteInvoice}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 active:scale-95 shadow-sm"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}
