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
    "min-w-[150px] rounded-full border border-blue-200 bg-blue-50 px-9 py-4 text-center text-lg font-bold text-blue-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 hover:shadow-md";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-blue-700"
        >
          Event Booking
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/events" className={navButtonClass}>
            Events
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
                <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-blue-100 bg-white p-3 shadow-xl shadow-blue-100/70">
                  {user.role === "ATTENDEE" && (
                    <Link
                      href="/my-bookings"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-5 py-3 text-center font-bold text-blue-800 transition hover:bg-blue-50"
                    >
                      My Bookings
                    </Link>
                  )}

                  {user.role === "ORGANISER" && (
                    <>
                      <Link
                        href="/organiser/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-blue-800 transition hover:bg-blue-50"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/organiser/events/new"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-2xl px-5 py-3 text-center font-bold text-blue-800 transition hover:bg-blue-50"
                      >
                        Create Event
                      </Link>
                    </>
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