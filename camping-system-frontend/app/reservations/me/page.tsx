"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function MyRezervasyonlarPage() {
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRezervasyonlar() {
      try {
        const response = await apiRequest<ApiDataResponse<CampReservation[]>>("/reservations/me");
        setReservations(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rezervasyonlar yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    loadRezervasyonlar();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Rezervasyonlarım</h1>
      {loading && <p className="mt-6 rounded-2xl bg-white p-6">Yükleniyor...</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      {!loading && reservations.length === 0 && <p className="mt-6 rounded-2xl bg-white p-6">Rezervasyon bulunamadı.</p>}
      <div className="mt-6 grid gap-4">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{reservation.reservationCode}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{reservation.camp?.name}</h2>
                <p className="mt-2 text-slate-600">
                  {formatOnlyDate(reservation.checkInDate)} - {formatOnlyDate(reservation.checkOutDate)} · {reservation.guestCount} kişi · {reservation.accommodationType === "CARAVAN" ? `🚐 ${reservation.plateNumber}` : "⛺ Çadır"}
                </p>
              </div>
              <StatusBadge status={reservation.status} />
            </div>
            {reservation.guests && reservation.guests.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {reservation.guests.map((guest) => (
                  <span key={guest.id || guest.fullName} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {guest.fullName}{guest.nationalIdMasked ? ` · ${guest.nationalIdMasked}` : ""}
                  </span>
                ))}
              </div>
            )}
            {reservation.campId && (
              <Link href={`/camps/${reservation.campId}`} className="mt-5 inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">
                Kamp detayına git
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
