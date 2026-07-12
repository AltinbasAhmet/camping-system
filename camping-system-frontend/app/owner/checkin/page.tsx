"use client";

import { FormEvent, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function OwnerCheckinPage() {
  const [plateNumber, setPlateNumber] = useState("");
  const [reservation, setReservation] = useState<CampReservation | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function searchReservation(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setReservation(null);
    try {
      const response = await apiRequest<ApiDataResponse<CampReservation>>("/checkin/search-by-plate", {
        method: "POST",
        body: JSON.stringify({ plateNumber }),
      });
      setReservation(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyon bulunamadı");
    }
  }

  async function updateStatus(action: "confirm" | "checkout") {
    if (!reservation) return;
    setMessage("");
    setError("");
    try {
      const response = await apiRequest<ApiDataResponse<CampReservation>>(`/checkin/${reservation.id}/${action}`, {
        method: "POST",
      });
      setReservation(response.data);
      setMessage(action === "confirm" ? "Giriş işlemi tamamlandı." : "Çıkış işlemi tamamlandı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Plakaya göre giriş işlemi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Plaka ile rezervasyon bul</h1>
        <form onSubmit={searchReservation} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input required className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} placeholder="01ABC123" />
          <button className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800">Ara</button>
        </form>
      </div>

      {message && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      {reservation && (
        <article className="mt-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{reservation.reservationCode}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{reservation.user?.name}</h2>
              <p className="mt-2 text-slate-600">
                {reservation.camp?.name} · {formatOnlyDate(reservation.checkInDate)} - {formatOnlyDate(reservation.checkOutDate)} · {reservation.guestCount} kişi · {reservation.plateNumber}
              </p>
            </div>
            <StatusBadge status={reservation.status} />
          </div>
          {reservation.guests && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {reservation.guests.map((guest) => (
                <div key={guest.id || guest.fullName} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {guest.fullName}{guest.nationalIdMasked ? ` · ${guest.nationalIdMasked}` : ""}
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={reservation.status !== "CONFIRMED"} onClick={() => updateStatus("confirm")} className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
              Girişi onayla
            </button>
            <button disabled={reservation.status !== "CHECKED_IN"} onClick={() => updateStatus("checkout")} className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              Çıkışı onayla
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
