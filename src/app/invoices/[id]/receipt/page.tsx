import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!invoice) {
    console.error("Receipt: Invoice not found:", id);
    notFound();
  }

  // @ts-ignore - isActive field will be available after migration
  if (invoice.isActive === false) {
    console.error("Receipt: Invoice is inactive:", id);
    notFound();
  }

  if (invoice.status !== "PAID") {
    console.error("Receipt: Invoice not paid:", id, invoice.status);
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <Link
          href={`/invoices/${id}`}
          className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Invoice
        </Link>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
        </div>
      </div>

      <div id="receipt-document" className="bg-white p-8 md:p-16 border border-neutral-100 shadow-2xl rounded-sm print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">Akuann Made</h1>
            <div className="w-24 h-1 bg-emerald-500 mx-auto mb-4"></div>
          </div>
          <h2 className="text-5xl font-bold text-emerald-600 uppercase tracking-tighter mb-2">RECEIPT</h2>
          <p className="text-sm text-neutral-500">Official Payment Confirmation</p>
        </div>

        <div className="w-full h-px bg-neutral-100 mb-8" />

        {/* Receipt Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">RECEIPT FROM</span>
            <p className="text-xl font-bold text-neutral-900">Akuann Made</p>
            <p className="text-sm text-neutral-500 mt-1">Cemetary Road, Amasaman, Ghana</p>
            <a href="tel:0541023362" className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors block">0541023362</a>
            <a href="mailto:akuanngh88@gmail.com" className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors block">akuanngh88@gmail.com</a>
          </div>
          <div className="text-right md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">RECEIPT DETAILS</span>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">RECEIPT NUMBER</span>
                <p className="text-sm text-neutral-800 font-mono">{invoice.invoiceNumber}-R</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">PAYMENT DATE</span>
                <p className="text-sm text-neutral-800">{format(new Date(), "MMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">ORIGINAL INVOICE</span>
                <p className="text-sm text-neutral-800">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">RECEIPT FOR</span>
          <p className="text-xl font-bold text-neutral-900">{invoice.clientName}</p>
          {invoice.clientAddress && (
            <p className="text-sm text-neutral-500 mt-1 whitespace-pre-wrap">{invoice.clientAddress}</p>
          )}
          {invoice.clientPhone && (
            <a href={`tel:${invoice.clientPhone}`} className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors block mt-1">
              {invoice.clientPhone}
            </a>
          )}
          {invoice.clientEmail && (
            <a href={`mailto:${invoice.clientEmail}`} className="text-sm text-neutral-500 hover:text-emerald-600 transition-colors block mt-1">
              {invoice.clientEmail}
            </a>
          )}
        </div>

        {/* Paid Amount */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">AMOUNT PAID</span>
          <p className="text-4xl font-bold text-emerald-600">GH₵{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="w-32 h-1 bg-emerald-500 mx-auto mt-4"></div>
        </div>

        {/* Items Summary */}
        <div className="mb-12">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">PAYMENT SUMMARY</h3>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            {invoice.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex justify-between items-center px-4 py-3 text-sm ${index % 2 !== 0 ? 'bg-neutral-50' : 'bg-white'}`}
              >
                <div>
                  <span className="font-medium text-neutral-800">{item.description}</span>
                  <span className="text-neutral-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-neutral-900">GH₵{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="border-t border-neutral-200 bg-neutral-100 px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-900">Total Paid</span>
                <span className="text-xl font-bold text-emerald-600">GH₵{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Payment Confirmed</span>
          </div>
          <p className="text-sm text-neutral-600">Thank you for your payment. Your transaction has been successfully processed.</p>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400 italic mb-2">This receipt serves as proof of payment for the services rendered.</p>
          <p className="text-xs text-neutral-400">Thank you for choosing Akuann Made. We appreciate your business.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #receipt-document { border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; }
        }
      `}} />
    </div>
  );
}
