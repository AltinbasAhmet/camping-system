"use client";

import { FormEvent, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { Camp, CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function CheckinPanel({ camps = [] }: { camps?: Camp[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [campId, setCampId] = useState("");
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function searchReservation(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setReservations([]);

    try {
      const response = await apiRequest<ApiDataResponse<CampReservation[]>>("/checkin/search-by-plate", {
        method: "POST",
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          ...(campId ? { campId: Number(campId) } : {}),
        }),
      });
      setReservations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyon bulunamadı");
    }
  }

  async function updateStatus(reservation: CampReservation, action: "confirm" | "checkout") {
    setActingId(reservation.id);
    setMessage("");
    setError("");

    try {
      const response = await apiRequest<ApiDataResponse<CampReservation>>(
        `/checkin/${reservation.id}/${action}`,
        { method: "POST" }
      );
      setReservations((current) =>
        current.map((item) => item.id === reservation.id ? response.data : item)
      );
      setMessage(action === "confirm" ? "Personel misafirin geldiğini onayladı." : "Personel misafirin çıktığını onayladı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-600">Gişe giriş ve çıkış işlemi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-900">Rezervasyon bul</h1>
        <p className="mt-2 text-slate-600">Rezervasyon kodu, plaka, rezervasyon sahibi veya misafir adını yazın.</p>
        <form onSubmit={searchReservation} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            required
            minLength={2}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rezervasyon kodu, plaka veya ad soyad"
          />
          {camps.length > 0 && (
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={campId} onChange={(event) => setCampId(event.target.value)}>
              <option value="">Tüm atanmış kamplar</option>
              {camps.map((camp) => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
            </select>
          )}
          <button className="rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white transition hover:bg-emerald-600">Ara</button>
        </form>
      </div>

      {message && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      {reservations.length > 1 && (
        <p className="mt-6 text-sm font-bold text-slate-600">{reservations.length} uygun rezervasyon bulundu.</p>
      )}

      <div className="mt-6 grid gap-5">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-600">{reservation.reservationCode}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{reservation.user?.name}</h2>
                <p className="mt-2 text-slate-600">{reservation.camp?.name} · {formatOnlyDate(reservation.checkInDate)} - {formatOnlyDate(reservation.checkOutDate)} · {reservation.guestCount} kişi{reservation.plateNumber ? ` · ${reservation.plateNumber}` : ""}</p>
              </div>
              <StatusBadge status={reservation.status} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {reservation.guests?.map((guest) => <div key={guest.id || guest.fullName} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{guest.fullName}{guest.nationalIdMasked ? ` · ${guest.nationalIdMasked}` : ""}</div>)}
            </div>
            {reservation.status === "PENDING" && (
              <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Bu rezervasyon henüz kamp sahibi tarafından onaylanmamış. Personel, yalnızca CONFIRMED durumundaki rezervasyonu “geldi” olarak işaretleyebilir.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                disabled={reservation.status !== "CONFIRMED" || actingId === reservation.id}
                onClick={() => updateStatus(reservation, "confirm")}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Geldi olarak işaretle
              </button>
              <button
                disabled={reservation.status !== "CHECKED_IN" || actingId === reservation.id}
                onClick={() => updateStatus(reservation, "checkout")}
                className="rounded-2xl bg-sky-500 px-5 py-3 font-black text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Çıktı olarak işaretle
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
