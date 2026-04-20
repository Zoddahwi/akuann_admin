import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import InvoiceActions from "@/components/InvoiceActions";
import PrintButton from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-8 flex items-center justify-between no-print">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>
        <div className="flex gap-3">
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
          <PrintButton />
        </div>
      </div>

      <div id="invoice-receipt" className="bg-white p-8 md:p-16 border border-neutral-100 shadow-2xl rounded-sm print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-12">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-neutral-800">Akuann Made</h1>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-neutral-900/10 uppercase tracking-tighter">
                {invoice.status === 'PAID' ? 'Receipt' : 'Invoice'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-neutral-500">Cemetary Road, Amasaman, Amasaman, Ghana</p>
          <p className="text-sm text-neutral-500">0541023362</p>
          <p className="text-sm text-neutral-500">akuanngh88@gmail.com</p>
        </div>

        <div className="w-full h-px bg-neutral-100 mb-8" />

        {/* Client & Invoice Info */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">BILL TO</span>
            <p className="text-xl font-bold text-neutral-900">{invoice.clientName}</p>
            {invoice.clientAddress && (
              <p className="text-sm text-neutral-500 mt-1 whitespace-pre-wrap">{invoice.clientAddress}</p>
            )}
          </div>
          <div className="text-right flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">DATE</span>
              <p className="text-sm text-neutral-800">{format(new Date(invoice.date), "MMM d, yyyy")}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">DUE</span>
              <p className="text-sm text-neutral-800">{invoice.dueDate || "On Receipt"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">INVOICE</span>
              <p className="text-sm text-neutral-800 uppercase">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Balance Due Header */}
        <div className="text-right mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">BALANCE DUE</span>
          <p className="text-2xl font-bold text-neutral-900">GH₵{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        {/* Table */}
        <div className="mb-12 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-12 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-4">
              <div className="col-span-6">DESCRIPTION</div>
              <div className="col-span-2 text-right">RATE</div>
              <div className="col-span-2 text-right">QTY</div>
              <div className="col-span-2 text-right">AMOUNT</div>
            </div>
            <div className="divide-y divide-neutral-100 border-x border-b border-neutral-50 bg-white">
              {invoice.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 px-6 py-5 text-sm ${index % 2 !== 0 ? 'bg-neutral-50/50' : 'bg-white'}`}
                >
                  <div className="col-span-6 text-neutral-800 font-medium">{item.description}</div>
                  <div className="col-span-2 text-right text-neutral-500">GH₵{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="col-span-2 text-right text-neutral-500">{item.quantity}</div>
                  <div className="col-span-2 text-right text-neutral-900 font-semibold">GH₵{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="flex flex-col items-end gap-3 pt-6 border-t-2 border-neutral-100">
          <div className="w-80 flex justify-between items-center text-sm">
            <span className="font-bold uppercase tracking-widest text-neutral-400 text-[10px]">TOTAL</span>
            <span className="text-lg font-bold text-neutral-900">GH₵{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full h-px bg-neutral-100" />
          <div className="w-80 flex justify-between items-center py-2">
            <span className="font-bold uppercase tracking-widest text-neutral-900 text-[11px]">BALANCE DUE</span>
            <span className="text-xl font-bold text-neutral-900">GH₵{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Note/Footer */}
        <div className="mt-20 pt-10 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400 italic">Thank you for choosing Akuann Made. We appreciate your patronage.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #invoice-receipt { border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; }
        }
      `}} />
    </div>
  );
}
