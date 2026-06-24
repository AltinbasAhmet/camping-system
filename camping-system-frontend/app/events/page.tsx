"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import EventCard, { EventItem } from "@/components/EventCard";

type EventsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: EventItem[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [capacity, setCapacity] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();

      if (search.trim()) {
        query.set("search", search.trim());
      }

      if (capacity.trim()) {
        query.set("capacity", capacity.trim());
      }

      if (sort) {
        query.set("sort", sort);
      }

      query.set("limit", "20");

      const data = await apiRequest<EventsResponse>(
        `/events?${query.toString()}`,
        {
          auth: false,
        }
      );

      setEvents(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadEvents();
  };

  const inputClass =
    "w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-5 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
          Events
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Browse available events and book your ticket.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-8 grid grid-cols-1 gap-4 rounded-[28px] border border-blue-100 bg-white/80 p-6 shadow-lg shadow-blue-100/50 backdrop-blur md:grid-cols-4"
      >
        <input
          placeholder="Search title or description"
          className={`${inputClass} md:col-span-2`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Minimum capacity"
          className={inputClass}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

<div className="relative">
  <select
    className={`w-full appearance-none rounded-[999px] border border-blue-100 bg-blue-50/40 px-5 py-4 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
      sort === "" ? "text-slate-400" : "text-slate-800"
    }`}
    value={sort}
    onChange={(e) => setSort(e.target.value)}
  >
    <option value="">Sort by date</option>
    <option value="asc">Oldest</option>
    <option value="desc">Newest</option>
  </select>

  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
    ▾
  </span>
</div>

        <button className="rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 py-4 text-lg font-bold text-white shadow-md transition hover:from-blue-800 hover:to-sky-600 hover:shadow-lg md:col-span-4">
          Search
        </button>
      </form>

      {loading && <p className="text-slate-500">Loading events...</p>}

      {error && (
        <p className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-slate-500">No events found.</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </main>
  );
}