"use client";

import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-emerald-200 bg-white p-1 shadow-sm ${compact ? "text-xs" : "text-sm"}`}
      aria-label="Dil seçimi"
    >
      <button
        type="button"
        onClick={() => setLanguage("tr")}
        className={`rounded-full px-3 py-2 font-black transition ${language === "tr" ? "bg-[#075b39] text-white" : "text-[#075b39] hover:bg-emerald-50"}`}
        aria-pressed={language === "tr"}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-2 font-black transition ${language === "en" ? "bg-[#075b39] text-white" : "text-[#075b39] hover:bg-emerald-50"}`}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}
