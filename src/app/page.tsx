import Link from "next/link";
import { Scissors, User, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight text-center">Akuann Studio Dashboard</h1>
      <p className="mt-4 text-neutral-600 leading-relaxed max-w-xl mx-auto text-center">
        Welcome to your private studio management suite. Control your collection and review client profiles here.
      </p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/gowns" 
          className="group relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 transition-all hover:border-amber-500/30 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-600">
            <Scissors size={20} />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Manage Gowns</h2>
          <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
            Add, edit, or remove designs from your collection and update availability.
          </p>
        </Link>

        <Link 
          href="/clients" 
          className="group relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 transition-all hover:border-amber-500/30 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-600">
            <User size={20} />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Onboarding</h2>
          <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
            Review detailed client style profiles, measurements, and event timelines.
          </p>
        </Link>
        
        <Link 
          href="/orders" 
          className="group relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 transition-all hover:border-amber-500/30 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-600">
            <CheckCircle2 size={20} />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Manage Orders</h2>
          <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
            Track customer orders, payment status, and fulfillment journeys.
          </p>
        </Link>
      </div>
    </div>
  );
}
