"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, resolveImageUrl, type ApiDataResponse, type ApiListResponse } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Camp, CampEvent } from "@/lib/types";

type EventWithCamp = CampEvent & {
  camp: Camp;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");
      try {
        const campsResponse = await apiRequest<ApiListResponse<Camp>>("/camps?limit=100", { auth: false });
        const activeCamps = campsResponse.data || [];

        const eventResults = await Promise.allSettled(
          activeCamps.map(async (camp) => {
            const response = await apiRequest<ApiDataResponse<CampEvent[]>>(`/camp-events/camp/${camp.id}`, { auth: false });
            return (response.data || []).map((event) => ({ ...event, camp: event.camp || camp }));
          })
        );

        const mergedEvents = eventResults.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
        setEvents(mergedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Etkinlikler yüklenemedi");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.camp?.city).filter(Boolean))).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return events
      .filter((event) => {
        const matchesSearch = !query ||
          event.title.toLocaleLowerCase("tr-TR").includes(query) ||
          event.description.toLocaleLowerCase("tr-TR").includes(query) ||
          event.camp?.name?.toLocaleLowerCase("tr-TR").includes(query);
        const matchesCity = !city || event.camp?.city === city;
        return matchesSearch && matchesCity;
      })
      .sort((a, b) => {
        const diff = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        return sort === "asc" ? diff : -diff;
      });
  }, [city, events, search, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-[#fffdf8] p-6 shadow-[0_22px_80px_rgba(9,63,42,0.10)] ring-1 ring-emerald-900/10 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-[#f26a0b]">CampPal etkinlikleri</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#063f2a] sm:text-5xl">
              Kamp etkinliklerini keşfet ve filtrele
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600">
              Kamp alanlarında düzenlenen etkinlikleri tarih, şehir ve arama kelimesine göre inceleyebilirsin. Etkinliğe katılmak için ilgili kamp detayına geçmen yeterli.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.7rem] border border-emerald-100 bg-white p-4 shadow-sm md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Ara</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Etkinlik veya kamp adı"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#f26a0b] focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Şehir</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#f26a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="">Tüm şehirler</option>
                {cities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Sıralama</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as "asc" | "desc")}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#f26a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="asc">Yaklaşan önce</option>
                <option value="desc">En uzak tarih önce</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {loading && <p className="mt-8 rounded-3xl bg-white p-6 font-semibold text-slate-600 shadow-sm">Etkinlikler yükleniyor...</p>}
      {error && <p className="mt-8 rounded-3xl bg-red-50 p-6 font-semibold text-red-700">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-slate-600">
              {filteredEvents.length} etkinlik gösteriliyor
            </p>
            {(search || city) && (
              <button
                type="button"
                onClick={() => { setSearch(""); setCity(""); setSort("asc"); }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#075b39] transition hover:bg-emerald-50"
              >
                Filtreleri temizle
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const ticketsSold = event.bookings?.reduce((sum, booking) => sum + booking.guestCount, 0) || event.ticketsSold || 0;
              const remaining = Math.max(0, event.capacity - ticketsSold);

              return (
                <article key={event.id} className="group overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,82,55,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,82,55,0.14)]">
                  <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#f26a0b,#ffb45f_42%,#075b39)]">
                    {event.photos?.[0]?.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(event.photos[0].imageUrl)} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs font-black uppercase tracking-wide text-white/80">{event.camp?.city}{event.camp?.district ? ` / ${event.camp.district}` : ""}</p>
                      <h2 className="mt-2 line-clamp-2 text-2xl font-black leading-tight">{event.title}</h2>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm font-black text-[#075b39]">{formatDate(event.dateTime)}</p>
                    <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-600">{event.description}</p>

                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-sm font-black text-[#063f2a]">{event.camp?.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">Kalan kapasite: {remaining} · {formatPrice(event.price)}</p>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <Link
                        href={`/camps/${event.campId}`}
                        className="flex-1 rounded-2xl bg-[#075b39] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#06472e]"
                      >
                        Detaya Git
                      </Link>
                      <Link
                        href={`/camps/${event.campId}`}
                        className="rounded-2xl border border-[#f26a0b]/30 bg-orange-50 px-4 py-3 text-sm font-black text-[#f26a0b] transition hover:bg-orange-100"
                      >
                        Bilet Al
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-dashed border-emerald-200 bg-white p-10 text-center shadow-sm">
              <p className="text-5xl">🗓️</p>
              <h2 className="mt-4 text-2xl font-black text-[#063f2a]">Bu filtrelere uygun etkinlik bulunamadı</h2>
              <p className="mt-2 font-medium text-slate-600">Arama kelimesini veya şehir filtresini değiştirerek tekrar deneyebilirsin.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
