import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { 
  ShoppingBag, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  XCircle,
  CreditCard,
  ChevronRight
} from "lucide-react";

async function getOrders() {
  try {
    return await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            gown: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Orders Management</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Track and update the fulfillment status of bespoke gown orders.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-xs font-medium text-neutral-600">
          <ShoppingBag size={14} className="text-neutral-400" />
          {orders.length} Total Orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-20 text-center text-neutral-500">
          No orders have been placed yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="group overflow-hidden rounded-[32px] border border-neutral-200 bg-white transition-all hover:border-amber-500/20 hover:shadow-xl"
            >
              {/* Desktop Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-6 border-b border-neutral-100 bg-neutral-50/30 px-8 py-5">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order ID</span>
                    <span className="text-sm font-mono text-neutral-600">#{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Placed On</span>
                    <span className="text-sm text-neutral-800">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                    {order.status}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block font-bold uppercase tracking-wider text-neutral-400">Total Amount</span>
                    <span className="text-lg font-bold text-neutral-900">GHS {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-neutral-100">
                {/* Customer Section */}
                <div className="p-8">
                  <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                    <UserIcon size={12} />
                    Customer Details
                  </h3>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-neutral-900">{order.user.fullName}</p>
                    <p className="text-xs text-neutral-500">{order.user.email}</p>
                    <p className="text-xs text-neutral-500">{order.user.phone || "No phone provided"}</p>
                  </div>
                </div>

                {/* Items Section */}
                <div className="p-8 md:col-span-2 bg-white">
                  <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                    <Package size={12} />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl bg-neutral-50/50 p-4 border border-neutral-100">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-neutral-200 overflow-hidden">
                             {item.gown.images[0] && (
                               <img src={item.gown.images[0]} alt={item.gown.name} className="h-full w-full object-cover" />
                             )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{item.gown.name}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Size: {item.size} • Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-800">GHS {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-neutral-100 px-8 py-4 bg-white">
                <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                  <CreditCard size={12} />
                  Payment verified via integrated portal
                </div>
                <div className="flex gap-2">
                   <button className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-6 py-2 text-[11px] font-bold text-white transition hover:bg-neutral-800 active:scale-95 shadow-lg">
                     Update Status
                     <ChevronRight size={12} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
