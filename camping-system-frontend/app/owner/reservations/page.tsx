"use client";

import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadReservations() {
    try {
      const response = await apiRequest<ApiDataResponse<CampReservation[]>>("/reservations/owner");
      setReservations(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyonlar yüklenemedi");
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  async function respond(reservationId: number, decision: "approve" | "reject") {
    setActingId(reservationId);
    setMessage("");
    setError("");
    try {
      await apiRequest<ApiDataResponse<CampReservation>>(`/reservations/${reservationId}/${decision}`, {
        method: "PATCH",
      });
      setMessage(decision === "approve" ? "Rezervasyon onaylandı." : "Rezervasyon reddedildi.");
      loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem tamamlanamadı");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Kamp Rezervasyonları</h1>
      {message && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4">
        {reservations.length === 0 && !error && <p className="rounded-2xl bg-white p-6 text-slate-600">Rezervasyon yok.</p>}
        {reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{reservation.camp?.name} · {reservation.reservationCode}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{reservation.user?.name}</h2>
                <p className="mt-2 text-slate-600">
                  {formatOnlyDate(reservation.checkInDate)} - {formatOnlyDate(reservation.checkOutDate)} · {reservation.guestCount} kişi · {reservation.accommodationType === "CARAVAN" ? `🚐 ${reservation.plateNumber}` : "⛺ Çadır"}
                </p>
                <p className="mt-1 text-sm text-slate-500">{reservation.user?.email || reservation.user?.phone || "İletişim bilgisi yok"}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={reservation.status} />
                {reservation.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actingId === reservation.id}
                      onClick={() => respond(reservation.id, "approve")}
                      className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      type="button"
                      disabled={actingId === reservation.id}
                      onClick={() => respond(reservation.id, "reject")}
                      className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </div>
                )}
              </div>
            </div>
            {reservation.guests && reservation.guests.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {reservation.guests.map((guest) => (
                  <div key={guest.id || guest.fullName} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                    {guest.fullName}{guest.nationalIdMasked ? ` · ${guest.nationalIdMasked}` : ""}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
