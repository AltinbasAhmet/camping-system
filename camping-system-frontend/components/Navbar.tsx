"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getUser, logout, type User } from "@/lib/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isHashLink = href.includes("#");
  const active = !isHashLink && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-black transition ${
        active
          ? "bg-[#e8f5df] text-[#075b39]"
          : "text-[#063f2a] hover:bg-orange-50 hover:text-[#f26a0b]"
      }`}
    >
      {children}
    </Link>
  );
}

const roleLabels: Record<User["role"], string> = {
  USER: "Kullanıcı",
  CAMP_OWNER: "Kamp Sahibi",
  SYSTEM_ADMIN: "Sistem Yöneticisi",
  STAFF: "Personel",
};

const roleMenuItems: Record<User["role"], { href: string; label: string }[]> = {
  USER: [
    { href: "/reservations/me", label: "Rezervasyonlarım" },
    { href: "/event-bookings/me", label: "Biletlerim" },
    { href: "/my-events", label: "Etkinliklerim" },
  ],
  CAMP_OWNER: [
    { href: "/owner/dashboard", label: "Panelim" },
    { href: "/owner/camps", label: "Kamp Yerlerim" },
    { href: "/owner/reservations", label: "Rezervasyonlar" },
    { href: "/owner/checkin", label: "Check-in" },
    { href: "/owner/events", label: "Etkinliklerim" },
  ],
  SYSTEM_ADMIN: [
    { href: "/admin/dashboard", label: "Panel" },
    { href: "/admin/users", label: "Kullanıcılar" },
    { href: "/admin/staff", label: "Personel" },
    { href: "/admin/camps", label: "Kamplar" },
    { href: "/admin/reservations", label: "Rezervasyonlar" },
    { href: "/admin/events", label: "Etkinlikler" },
  ],
  STAFF: [
    { href: "/staff/dashboard", label: "Personel Paneli" },
    { href: "/staff/reservations", label: "Rezervasyonlar" },
    { href: "/staff/checkin", label: "Check-in / Check-out" },
  ],
};

function UserMenu({ user, onLogout, t }: { user: User; onLogout: () => void; t: (text: string) => string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = roleMenuItems[user.role] || [];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-[#075b39] ring-1 ring-emerald-100 transition hover:bg-emerald-100"
      >
        <span>{user.name}</span>
        <span className="text-xs font-semibold text-emerald-700/70">· {t(roleLabels[user.role])}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-[#063f2a] transition hover:bg-emerald-50"
            >
              {t(item.label)}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            {t("Çıkış")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Tarayıcı oturumundaki kullanıcı, sayfa geçişlerinde menüye yansıtılır.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  }, [pathname]);

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/camppal-logo.png"
            alt="CampPal logosu"
            width={210}
            height={82}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-2">
          <NavLink href="/camps">{t("Kamp Alanları")}</NavLink>
          <NavLink href="/events">{t("Etkinlikler")}</NavLink>
          <NavLink href="/#nasil-calisir">{t("Nasıl Çalışır?")}</NavLink>
          <NavLink href="/#hakkimizda">{t("Hakkımızda")}</NavLink>
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <LanguageSwitcher compact />
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} t={t} />
          ) : (
            <>
              <Link className="inline-flex items-center gap-2 rounded-2xl border border-[#075b39]/45 px-5 py-3 text-sm font-black text-[#075b39] transition hover:bg-emerald-50" href="/login">
                <span>👤</span> {t("Giriş Yap")}
              </Link>
              <Link className="inline-flex items-center gap-2 rounded-2xl bg-[#f26a0b] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#df5f09]" href="/register">
                <span>👥</span> {t("Kayıt Ol")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
