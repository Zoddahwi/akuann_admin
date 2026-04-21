"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

interface InvoiceItem {
  description: string;
  rate: number;
  quantity: number;
  amount: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage(props: PageProps) {
  const router = useRouter();
  const { id } = use(props.params);

  const [isLoading, setIsLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [dueDate, setDueDate] = useState("On Receipt");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", rate: 0, quantity: 1, amount: 0 },
  ]);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setClientName(data.clientName || "");
          setClientEmail(data.clientEmail || "");
          setClientPhone(data.clientPhone || "");
          setClientAddress(data.clientAddress || "");
          setDueDate(data.dueDate || "On Receipt");
          if (data.items && data.items.length > 0) {
            setItems(data.items.map((i: any) => ({
              description: i.description,
              rate: i.rate,
              quantity: i.quantity,
              amount: i.amount
            })));
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  const addItem = () => {
    setItems([...items, { description: "", rate: 0, quantity: 1, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    
    if (field === "rate" || field === "quantity") {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      (newItems[index] as any)[field] = isNaN(numValue) ? 0 : numValue;
      newItems[index].amount = newItems[index].rate * newItems[index].quantity;
    } else {
      (newItems[index] as any)[field] = value;
    }
    
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // API call to update invoice
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        dueDate,
        totalAmount,
        items,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      router.push(`/invoices/${data.id}`);
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-32 text-center text-sm font-semibold text-neutral-500 uppercase tracking-widest">
        Loading invoice details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-semibold text-neutral-900">Edit Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[32px] border border-neutral-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">Client Information</h2>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="Mr Ernest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="0541023362"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">Invoice Details</h2>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Due Date / Terms</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="On Receipt"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Client Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
                placeholder="Amasaman, Ghana"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">Line Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-neutral-100">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 w-24">Qty</th>
                  <th className="px-6 py-3 w-32">Rate (GH₵)</th>
                  <th className="px-6 py-3 w-32">Amount</th>
                  <th className="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-neutral-300"
                        placeholder="Item name or description"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        required
                        value={item.quantity === null || isNaN(item.quantity) ? "" : item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm"
                        placeholder="1"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={item.rate === null || isNaN(item.rate) ? "" : item.rate}
                        onChange={(e) => updateItem(index, "rate", e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-neutral-900">
                      GH₵{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 pt-6 border-t border-neutral-100">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>GH₵{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-100 pt-2">
              <span>Total</span>
              <span>GH₵{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-95 shadow-xl"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
