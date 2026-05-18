"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Scissors, User, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[75vh] w-full overflow-hidden flex items-center justify-center py-16 md:py-24"
    >
      {/* Background Decorative System */}
      <div className="bg-grid-overlay" />
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="mouse-aura" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 
            className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight animate-fade-in-up"
            style={{ '--delay': '0ms' } as React.CSSProperties}
          >
            Akuann Studio Dashboard
          </h1>
          <p 
            className="mt-6 text-base md:text-lg text-neutral-500 leading-relaxed animate-fade-in-up"
            style={{ '--delay': '100ms' } as React.CSSProperties}
          >
            Welcome to your private studio management suite. Control your collection, track onboarding measurement profiles, and manage customer orders.
          </p>
        </div>

        {/* Dashboard Grid Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Gowns */}
          <Link 
            href="/gowns" 
            className="group relative overflow-hidden rounded-[32px] border border-neutral-200/80 bg-white/70 backdrop-blur-md p-8 transition-all hover:border-neutral-900 hover:shadow-2xl hover:-translate-y-1.5 animate-fade-in-up"
            style={{ '--delay': '200ms' } as React.CSSProperties}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors group-hover:bg-neutral-800">
              <Scissors size={20} className="animate-icon-hover" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Manage Gowns</h2>
            <p className="mt-2.5 text-sm text-neutral-500 leading-relaxed line-clamp-2">
              Add, edit, or remove designs from your collection and update availability.
            </p>
          </Link>

          {/* Card 2: Clients */}
          <Link 
            href="/clients" 
            className="group relative overflow-hidden rounded-[32px] border border-neutral-200/80 bg-white/70 backdrop-blur-md p-8 transition-all hover:border-neutral-900 hover:shadow-2xl hover:-translate-y-1.5 animate-fade-in-up"
            style={{ '--delay': '300ms' } as React.CSSProperties}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors group-hover:bg-neutral-800">
              <User size={20} className="animate-icon-hover" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Onboarding</h2>
            <p className="mt-2.5 text-sm text-neutral-500 leading-relaxed line-clamp-2">
              Review detailed client style profiles, measurements, and event timelines.
            </p>
          </Link>
          
          {/* Card 3: Orders */}
          <Link 
            href="/orders" 
            className="group relative overflow-hidden rounded-[32px] border border-neutral-200/80 bg-white/70 backdrop-blur-md p-8 transition-all hover:border-neutral-900 hover:shadow-2xl hover:-translate-y-1.5 animate-fade-in-up"
            style={{ '--delay': '400ms' } as React.CSSProperties}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white transition-colors group-hover:bg-neutral-800">
              <CheckCircle2 size={20} className="animate-icon-hover" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Manage Orders</h2>
            <p className="mt-2.5 text-sm text-neutral-500 leading-relaxed line-clamp-2">
              Track customer orders, payment status, and fulfillment journeys.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

