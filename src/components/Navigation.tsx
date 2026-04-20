"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, User as UserIcon, Scissors, Home, FileText, Menu, X } from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/gowns", label: "Gowns", icon: Scissors },
    { href: "/clients", label: "Clients", icon: UserIcon },
    { href: "/orders", label: "Orders", icon: ShoppingBag },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b border-neutral-200 transition-colors ${isOpen ? 'bg-white' : 'bg-white/80 backdrop-blur-lg'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white transition-transform group-hover:scale-110">
            <Scissors size={16} />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-900">Akuann Studio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Portal Active</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center rounded p-2 text-neutral-900 hover:bg-neutral-100 transition-colors z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden flex flex-col px-6 pt-24 pb-6 overflow-y-auto">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 text-lg font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}
                >
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-50 text-neutral-400'}`}>
                    <item.icon size={20} />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto flex items-center justify-center gap-3 pt-10 border-t border-neutral-100">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Portal Active</span>
          </div>
        </div>
      )}
    </header>
  );
}
