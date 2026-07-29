"use client";

import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { EventBooking } from "@/lib/types";

export default function OwnerEventBookingsPage() {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await apiRequest<ApiDataResponse<EventBooking[]>>("/event-bookings/owner");
        setBookings(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Etkinlik biletleri yüklenemedi");
      }
    }
    loadBookings();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Etkinlik Biletleri</h1>
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {bookings.length === 0 && !error && <p className="rounded-2xl bg-white p-6 text-slate-600">Etkinlik bileti yok.</p>}
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{booking.event?.camp?.name}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{booking.event?.title}</h2>
            <p className="mt-2 text-slate-600">{formatDate(booking.event?.dateTime)} · {booking.guestCount} bilet · {formatPrice(booking.event?.price)}</p>
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              Kullanıcı: {booking.user?.name} · {booking.user?.email || booking.user?.phone || "İletişim bilgisi yok"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
