"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Camp } from "@/lib/types";
import CampCard from "@/components/CampCard";

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCamps() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (city) params.append("city", city);

      const queryString = params.toString();
      const response = await apiRequest<{ success: boolean; data: Camp[] }>(
        `/camps${queryString ? `?${queryString}` : ""}`,
        { auth: false }
      );

      setCamps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camps");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCamps();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950">
            Caravan Camps
          </h1>
          <p className="mt-2 text-slate-600">
            Browse camps, facilities, photos, capacity and reservation options.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search camp"
              className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
            />

            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
            />

            <button
              onClick={fetchCamps}
              className="rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800"
            >
              Search
            </button>
          </div>
        </div>

        {loading && <p className="text-slate-500">Loading camps...</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && camps.length === 0 && (
          <p className="text-slate-500">No camps found.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {camps.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      </div>
    </main>
  );
}