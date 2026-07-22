"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { EventBooking } from "@/lib/types";

export default function MyEventBookingsPage() {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await apiRequest<ApiDataResponse<EventBooking[]>>("/event-bookings/me");
        setBookings(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Etkinlik biletleri yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Etkinlik Biletlerim</h1>
      {loading && <p className="mt-6 rounded-2xl bg-white p-6">Yükleniyor...</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      {!loading && bookings.length === 0 && <p className="mt-6 rounded-2xl bg-white p-6">Etkinlik bileti bulunamadı.</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{booking.event?.camp?.name}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{booking.event?.title}</h2>
            <p className="mt-2 text-slate-600">{formatDate(booking.event?.dateTime)} · {booking.guestCount} bilet · {formatPrice(booking.event?.price)}</p>
            {booking.event?.campId && (
              <Link href={`/camps/${booking.event.campId}`} className="mt-5 inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">
                Kamp detayına git
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
