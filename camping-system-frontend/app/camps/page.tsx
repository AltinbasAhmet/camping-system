"use client";

import { FormEvent, useEffect, useState } from "react";
import CampCard from "@/components/CampCard";
import { apiRequest, type ApiListResponse } from "@/lib/api";
import type { Camp } from "@/lib/types";

const featureFilters = [
  ["hasToilet", "Tuvalet"],
  ["hasShower", "Duş"],
  ["hasHotWater", "Sıcak su"],
  ["hasElectricity", "Elektrik"],
  ["hasWifi", "Wi-Fi"],
] as const;

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCamps(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (city.trim()) params.set("city", city.trim());
    Object.entries(features).forEach(([key, value]) => {
      if (value) params.set(key, "true");
    });

    try {
      const response = await apiRequest<ApiListResponse<Camp>>(`/camps?${params.toString()}`, { auth: false });
      setCamps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp alanları yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Public camp listing</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Kamp alanlarını keşfet</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Şehir, anahtar kelime ve tesis özelliklerine göre aktif kamp alanlarını listeleyebilirsin.
        </p>

        <form onSubmit={loadCamps} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kamp adı veya açıklama"
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Şehir"
          />
          <button className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800">
            Ara
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {featureFilters.map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              <input
                type="checkbox"
                checked={Boolean(features[key])}
                onChange={(event) => setFeatures((prev) => ({ ...prev, [key]: event.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="mb-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      {loading ? (
        <p className="rounded-2xl bg-white p-6 text-slate-600">Yükleniyor...</p>
      ) : camps.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-slate-600">Hiç aktif kamp alanı bulunamadı.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {camps.map((camp) => <CampCard key={camp.id} camp={camp} />)}
        </div>
      )}
    </section>
  );
}
