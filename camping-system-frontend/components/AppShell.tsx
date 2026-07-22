"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LanguageProvider } from "@/lib/i18n";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <LanguageProvider>
      {!isAuthPage && <Navbar />}
      {isAuthPage && (
        <div className="fixed right-4 top-4 z-50">
          <LanguageSwitcher />
        </div>
      )}
      <main className={isAuthPage ? "min-h-screen" : "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </LanguageProvider>
  );
}
