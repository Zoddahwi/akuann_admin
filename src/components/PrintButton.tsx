"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-2 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50 active:scale-95 no-print"
    >
      <Printer size={16} />
      Print / PDF
    </button>
  );
}
