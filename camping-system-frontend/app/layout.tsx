import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "CampPal",
  description: "CampPal kamp rezervasyon, etkinlik ve check-in sistemi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#fffdf8] text-slate-950">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
