"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { Camp, CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function StaffReservationsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [campId, setCampId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadReservations() {
    const params = new URLSearchParams();
    if (campId) params.set("campId", campId);
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    try {
      const response = await apiRequest<ApiDataResponse<CampReservation[]>>(`/staff/reservations?${params.toString()}`);
      setReservations(response.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyonlar alınamadı");
    }
  }

  useEffect(() => {
    apiRequest<ApiDataResponse<Camp[]>>("/staff/camps").then((response) => setCamps(response.data)).catch(() => setCamps([]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReservations();
    // İlk yüklemede bütün rezervasyonları getirir; filtreler form ile uygulanır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    void loadReservations();
  }

  async function updateStatus(reservation: CampReservation, action: "confirm" | "checkout") {
    setActingId(reservation.id);
    setError("");
    setMessage("");
    try {
      await apiRequest(`/checkin/${reservation.id}/${action}`, { method: "POST" });
      setMessage(action === "confirm" ? "Misafir geldi olarak işaretlendi." : "Misafir çıktı olarak işaretlendi.");
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem tamamlanamadı");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section>
      <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Gişe işlemleri</p>
      <h1 className="mt-2 text-4xl font-black text-emerald-950">Rezervasyonlar</h1>
      <p className="mt-2 text-slate-600">Personel rezervasyonu onaylayamaz, reddedemez veya iptal edemez; onaylanmış rezervasyonu “geldi”, giriş yapılmış rezervasyonu “çıktı” olarak işaretleyebilir.</p>

      <form onSubmit={applyFilters} className="mt-6 grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_1.4fr_auto]">
        <select className="rounded-2xl border border-slate-200 px-4 py-3" value={campId} onChange={(e) => setCampId(e.target.value)}><option value="">Tüm kamplar</option>{camps.map((camp) => <option key={camp.id} value={camp.id}>{camp.name}</option>)}</select>
        <select className="rounded-2xl border border-slate-200 px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tüm durumlar</option>{["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}</select>
        <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Ad, plaka veya rezervasyon kodu" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white hover:bg-emerald-600">Filtrele</button>
      </form>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mt-6 space-y-4">
        {reservations.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">Bu filtrelerde rezervasyon yok.</p> : reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-sm font-black text-emerald-700">{reservation.reservationCode}</p><h2 className="mt-1 text-xl font-black text-slate-950">{reservation.user?.name}</h2><p className="mt-2 text-slate-600">{reservation.camp?.name} · {formatOnlyDate(reservation.checkInDate)} - {formatOnlyDate(reservation.checkOutDate)}</p><p className="mt-1 text-sm text-slate-500">{reservation.guestCount} kişi{reservation.plateNumber ? ` · ${reservation.plateNumber}` : ""} · {reservation.user?.phone || reservation.user?.email}</p></div>
              <StatusBadge status={reservation.status} />
            </div>
            {reservation.guests && reservation.guests.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{reservation.guests.map((guest) => <span key={guest.id || guest.fullName} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{guest.fullName}{guest.nationalIdMasked ? ` · ${guest.nationalIdMasked}` : ""}</span>)}</div>}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                disabled={reservation.status !== "CONFIRMED" || actingId === reservation.id}
                onClick={() => updateStatus(reservation, "confirm")}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Geldi olarak işaretle
              </button>
              <button
                disabled={reservation.status !== "CHECKED_IN" || actingId === reservation.id}
                onClick={() => updateStatus(reservation, "checkout")}
                className="rounded-2xl bg-sky-500 px-5 py-3 font-black text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
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
