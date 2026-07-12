"use client";

import { useEffect, useState } from "react";
import { apiRequest, type ApiListResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";
import type { CampReservation } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

const statusOptions = ["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_IN", "CHECKED_OUT"] as const;

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadReservations() {
    try {
      const query = statusFilter ? `?status=${statusFilter}&limit=50` : "?limit=50";
      const response = await apiRequest<ApiListResponse<CampReservation>>(`/admin/reservations${query}`);
      setReservations(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyonlar yüklenemedi");
    }
  }

  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function changeStatus(reservationId: number, status: string) {
    setActingId(reservationId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/reservations/${reservationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage("Rezervasyon durumu güncellendi.");
      loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rezervasyon güncellenemedi");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Tüm Rezervasyonlar</h1>
      <p className="mt-2 text-slate-600">
        Sistem yöneticisi olarak, kamp sahibinin veya kampçının artık değiştiremeyeceği geçmiş tarihli
        rezervasyonlar dahil her rezervasyonun durumunu değiştirebilirsiniz.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("")} className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === "" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>Tümü</button>
        {statusOptions.map((status) => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === status ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>
            {status.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4">
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
                <select
                  disabled={actingId === reservation.id}
                  value={reservation.status}
                  onChange={(event) => changeStatus(reservation.id, event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        ))}
        {reservations.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-600">Rezervasyon bulunamadı.</p>}
      </div>
    </section>
  );
}
