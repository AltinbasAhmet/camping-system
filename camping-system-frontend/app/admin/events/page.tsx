"use client";

import { useEffect, useState } from "react";
import { apiRequest, type ApiListResponse } from "@/lib/api";
import { formatOnlyDate, formatPrice } from "@/lib/format";
import type { CampEvent } from "@/lib/types";

type AdminCampEvent = CampEvent & { ticketsSold: number };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminCampEvent[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadEvents() {
    try {
      const response = await apiRequest<ApiListResponse<AdminCampEvent>>("/admin/camp-events?limit=50");
      setEvents(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlikler yüklenemedi");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function deleteEvent(eventId: number) {
    if (!confirm("Bu etkinliği ve tüm biletlerini silmek istediğinize emin misiniz?")) return;
    setActingId(eventId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/camp-events/${eventId}`, { method: "DELETE" });
      setMessage("Etkinlik silindi.");
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlik silinemedi");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Tüm Etkinlikler</h1>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4">
        {events.map((event) => (
          <article key={event.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{event.camp?.name}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{event.title}</h2>
                <p className="mt-2 text-slate-600">
                  {formatOnlyDate(event.dateTime)} · {event.ticketsSold}/{event.capacity} bilet satıldı · {formatPrice(event.price)}
                </p>
              </div>
              <button
                type="button"
                disabled={actingId === event.id}
                onClick={() => deleteEvent(event.id)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-600">Etkinlik bulunamadı.</p>}
      </div>
    </section>
  );
}
