"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { EventBooking } from "@/lib/types";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function MyEventBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: EventBooking[];
      }>("/event-bookings/me");

      setBookings(response.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950">
            My Event Bookings
          </h1>
          <p className="mt-2 text-slate-500">
            View your camp activity reservations.
          </p>
        </div>

        {loading && <p className="text-slate-500">Loading bookings...</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">You have no event bookings yet.</p>

            <Link
              href="/camps"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800"
            >
              Browse Camps
            </Link>
          </div>
        )}

        <div className="grid gap-5">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {booking.event.title}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {booking.event.camp.name} — {booking.event.camp.city}
                    {booking.event.camp.district
                      ? ` / ${booking.event.camp.district}`
                      : ""}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-5 py-2 text-sm font-extrabold text-emerald-800">
                  {booking.guestCount} guest
                  {booking.guestCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Date</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(booking.event.dateTime).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Price</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    ₺{booking.event.price}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Booked At</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(booking.bookedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Camp</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {booking.event.camp.name}
                  </p>
                </div>
              </div>

              <Link
                href={`/camp-events/${booking.event.id}`}
                className="mt-6 inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
              >
                View Event
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}