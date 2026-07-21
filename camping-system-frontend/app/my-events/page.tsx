"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, type ApiDataResponse, type ApiListResponse } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { CampEvent } from "@/lib/types";

export default function MyEventsPage() {
  const [events, setEvents] = useState<CampEvent[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editCapacity, setEditCapacity] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadEvents() {
    try {
      const response = await apiRequest<ApiListResponse<CampEvent>>("/camp-events/me");
      setEvents(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlikler yüklenemedi");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function startEdit(event: CampEvent) {
    setEditId(event.id);
    setEditCapacity(event.capacity);
    setEditPrice(event.price);
    setMessage("");
    setError("");
  }

  async function saveEdit(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!editId) return;
    setActingId(editId);
    setMessage("");
    setError("");
    try {
      await apiRequest<ApiDataResponse<CampEvent>>(`/camp-events/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ capacity: Number(editCapacity), price: Number(editPrice) }),
      });
      setMessage("Etkinlik güncellendi.");
      setEditId(null);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlik güncellenemedi");
    } finally {
      setActingId(null);
    }
  }

  async function deleteEvent(eventId: number) {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;
    setActingId(eventId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/camp-events/${eventId}`, { method: "DELETE" });
      setMessage("Etkinlik silindi.");
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlik silinemedi (bileti satılmış etkinlikler silinemez)");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-emerald-950">Etkinliklerim</h1>
        <Link href="/events/new" className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800">
          Yeni etkinlik oluştur
        </Link>
      </div>
      <p className="mt-2 text-slate-600">Oluşturduğun etkinlikleri ve bilet satışlarını buradan takip edebilirsin.</p>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4">
        {events.map((event) => (
          <article key={event.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{event.camp?.name} · {event.camp?.city}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{event.title}</h2>
                <p className="mt-2 text-slate-600">
                  {formatDate(event.dateTime)} · {event.ticketsSold ?? 0}/{event.capacity} bilet satıldı · {formatPrice(event.price)}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(event)} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-white">Düzenle</button>
                <button
                  type="button"
                  disabled={actingId === event.id}
                  onClick={() => deleteEvent(event.id)}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>

            {editId === event.id && (
              <form onSubmit={saveEdit} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-amber-50 p-4">
                <label className="text-sm font-bold text-slate-700">
                  Kapasite
                  <input type="number" min={1} required className="mt-1 block rounded-xl border border-slate-200 px-3 py-2" value={editCapacity} onChange={(e) => setEditCapacity(Number(e.target.value))} />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Bilet fiyatı
                  <input type="number" min={0} className="mt-1 block rounded-xl border border-slate-200 px-3 py-2" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} />
                </label>
                <button disabled={actingId === event.id} className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50">Kaydet</button>
                <button type="button" onClick={() => setEditId(null)} className="rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-800">Vazgeç</button>
              </form>
            )}
          </article>
        ))}
        {events.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-600">Henüz oluşturduğun bir etkinlik yok.</p>}
      </div>
    </section>
  );
}
