import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { RealtimeProvider } from "@/components/RealtimeProvider";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Akuann Admin",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Akuann Admin",
    title: "Akuann Studio Dashboard",
    description: "Bespoke bridal studio management and client onboarding.",
  },
  twitter: {
    card: "summary",
    title: "Akuann Studio Dashboard",
    description: "Bespoke bridal studio management and client onboarding.",
  },
};

/**
 * Rendered per request so the layout can read the Supabase values from the
 * runtime environment. They are Worker secrets, absent at build time, and a
 * prerendered layout would bake in `undefined` and silently disable live
 * updates on the statically rendered routes.
 */
export const dynamic = "force-dynamic";

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print {
                display: none !important;
              }
            }
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-50 flex flex-col`}>
        <RealtimeProvider
          url={process.env.NEXT_PUBLIC_SUPABASE_URL}
          anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
        >
        <Navigation />

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-neutral-100 bg-white py-8 text-center">
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">
             Internal Use Only • Akuann Bespoke Bridal Studio
           </p>
        </footer>

        <PWAInstallPrompt />
        </RealtimeProvider>
      </body>
    </html>
  );
}
