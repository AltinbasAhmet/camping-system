"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp, CampReservation, EventBooking } from "@/lib/types";

export default function OwnerDashboardPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [campRes, reservationRes, ticketRes] = await Promise.all([
          apiRequest<ApiDataResponse<Camp[]>>("/camps/owner/my-camps"),
          apiRequest<ApiDataResponse<CampReservation[]>>("/reservations/owner"),
          apiRequest<ApiDataResponse<EventBooking[]>>("/event-bookings/owner"),
        ]);
        setCamps(campRes.data || []);
        setReservations(reservationRes.data || []);
        setEventBookings(ticketRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Panel yüklenemedi");
      }
    }
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeRezervasyonlar = reservations.filter((item) => ["CONFIRMED", "CHECKED_IN"].includes(item.status)).length;
    const totalEventGuests = eventBookings.reduce((sum, item) => sum + item.guestCount, 0);
    const eventCount = camps.reduce((sum, camp) => sum + (camp.events?.length || 0), 0);
    return [
      ["Kamp Alanları", camps.length],
      ["Etkinlikler", eventCount],
      ["Aktif rezervasyonlar", activeRezervasyonlar],
      ["Etkinlik misafirleri", totalEventGuests],
    ];
  }, [camps, reservations, eventBookings]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Kamp sahibi paneli</p>
          <h1 className="mt-2 text-4xl font-black text-emerald-950">Kamp sahibi paneli</h1>
        </div>
        <Link href="/owner/events/new" className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800">
          Etkinlik oluştur
        </Link>
      </div>

      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <article key={label} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-black text-emerald-950">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        <Link href="/owner/camps" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Kamp Yerlerim</Link>
        <Link href="/owner/reservations" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Rezervasyonlar</Link>
        <Link href="/owner/events" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Etkinliklerim</Link>
        <Link href="/owner/checkin" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Plaka ile giriş işlemi</Link>
      </div>
    </section>
  );
}
