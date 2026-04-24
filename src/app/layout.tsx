import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-neutral-50 flex flex-col`}>
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
      </body>
    </html>
  );
}
