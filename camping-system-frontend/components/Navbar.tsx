"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, logout, User } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  };

  const navButtonClass =
    "min-w-[130px] rounded-full border border-emerald-200 bg-emerald-50 px-7 py-3 text-center text-base font-bold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/85 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-emerald-700"
        >
          CampGate
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/camps" className={navButtonClass}>
            Camps
          </Link>

          {!user ? (
            <>
              <Link href="/login" className={navButtonClass}>
                Login
              </Link>

              <Link href="/register" className={navButtonClass}>
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={navButtonClass}
              >
                {user.name}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-emerald-100 bg-white p-3 shadow-xl shadow-emerald-100/70">
                  {user.role === "USER" && (
                    <>
                      <Link
                        href="/my-reservations"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        My Camp Reservations
                      </Link>

                      <Link
                        href="/my-event-bookings"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        My Event Bookings
                      </Link>
                    </>
                  )}

                  {user.role === "CAMP_OWNER" && (
                    <>
                      <Link
                        href="/camp-owner/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        Owner Dashboard
                      </Link>

                      <Link
                        href="/camp-owner/checkin"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        Check-in
                      </Link>
                    </>
                  )}

                  {user.role === "SYSTEM_ADMIN" && (
                    <Link
                      href="/admin/camps"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-5 py-3 text-center font-bold text-emerald-800 transition hover:bg-emerald-50"
                    >
                      Admin Camps
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-2xl bg-red-500 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}