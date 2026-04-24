import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { 
  FileText, 
  Plus, 
  Search, 
  TrendingUp, 
  Calculator, 
  CheckCircle2, 
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

async function getInvoices() {
  try {
    return await prisma.invoice.findMany({
      where: { 
        // @ts-ignore - isActive field will be available after migration
        isActive: true 
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        clientEmail: true,
        date: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default async function InvoicesListPage() {
  const invoices = await getInvoices();
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'PAID' ? inv.totalAmount : 0), 0);
  const pendingAmount = invoices.reduce((sum, inv) => sum + (inv.status === 'PENDING' ? inv.totalAmount : 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Invoice Management</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Generate and track professional receipts for your bespoke services.
        </p>
        <Link 
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 shadow-md mt-2"
        >
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Calculator size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Pending</p>
              <p className="text-xl font-bold text-neutral-900">GHS {pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Paid Revenue</p>
              <p className="text-xl font-bold text-neutral-900">GHS {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-neutral-50 p-3 text-neutral-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Invoices</p>
              <p className="text-xl font-bold text-neutral-900">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-20 text-center text-neutral-500">
          No invoices have been created yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Invoice</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Client</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="group hover:bg-neutral-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-neutral-600 uppercase">#{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-semibold text-neutral-900">{invoice.clientName}</p>
                    <p className="text-xs text-neutral-500">{invoice.clientEmail}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-neutral-500">
                    {format(new Date(invoice.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[invoice.status]}`}>
                      {invoice.status === 'PAID' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-neutral-900">
                    GH₵{invoice.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/invoices/${invoice.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-amber-600 transition-colors"
                    >
                      View
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
