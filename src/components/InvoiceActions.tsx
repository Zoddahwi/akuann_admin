"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

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

  if (status === "PAID") return (
    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
      <CheckCircle2 size={14} />
      Invoice Paid
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
    </div>
  );
}
