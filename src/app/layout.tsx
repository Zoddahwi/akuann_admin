import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShoppingBag, User as UserIcon, Scissors, Home, FileText } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akuann Studio Dashboard",
  description: "Bespoke bridal studio management and client onboarding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-50 flex flex-col`}>
        {/* Simple Studio Navigation */}
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white transition-transform group-hover:scale-110">
                <Scissors size={16} />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-900">Akuann Studio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors">
                <Home size={14} />
                Home
              </Link>
              <Link href="/gowns" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors">
                <Scissors size={14} />
                Gowns
              </Link>
              <Link href="/clients" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors">
                <UserIcon size={14} />
                Clients
              </Link>
              <Link href="/orders" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors">
                <ShoppingBag size={14} />
                Orders
              </Link>
              <Link href="/invoices" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors">
                <FileText size={14} />
                Invoices
              </Link>
            </nav>

            <div className="flex items-center gap-4">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Portal Active</span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-neutral-100 bg-white py-8 text-center">
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
             Internal Use Only • Akuann Bespoke Bridal Studio
           </p>
        </footer>
      </body>
    </html>
  );
}
