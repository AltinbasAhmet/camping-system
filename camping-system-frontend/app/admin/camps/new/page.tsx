"use client";

import { FormEvent, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp } from "@/lib/types";

const emptyFeatures = {
  hasToilet: true,
  hasShower: true,
  hasHotWater: true,
  hasElectricity: true,
  hasWifi: false,
  hasMarket: false,
  petFriendly: false,
};

const featureLabels: Record<keyof typeof emptyFeatures, string> = {
  hasToilet: "Tuvalet",
  hasShower: "Duş",
  hasHotWater: "Sıcak su",
  hasElectricity: "Elektrik",
  hasWifi: "Wi-Fi",
  hasMarket: "Market",
  petFriendly: "Evcil hayvan dostu",
};

export default function AdminCreateCampPage() {
  const [ownerId, setOwnerId] = useState(2);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(50);
  const [caravanCapacity, setCaravanCapacity] = useState(30);
  const [tentCapacity, setTentCapacity] = useState(20);
  const [pricePerNight, setPricePerNight] = useState(1200);
  const [features, setFeatures] = useState(emptyFeatures);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createCamp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await apiRequest<ApiDataResponse<Camp>>("/camps/admin/create", {
        method: "POST",
        body: JSON.stringify({
          ownerId: Number(ownerId),
          name,
          description,
          city,
          ...(district ? { district } : {}),
          address,
          phone,
          ...(email ? { email } : {}),
          totalCapacity: Number(totalCapacity),
          caravanCapacity: Number(caravanCapacity),
          tentCapacity: Number(tentCapacity),
          pricePerNight: Number(pricePerNight),
          ...features,
        }),
      });
      setMessage(`Kamp oluşturuldu: ${response.data.name} (${response.data.customerNumber})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Sistem yöneticisi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Kamp sahibi için kamp alanı oluştur</h1>
        <p className="mt-2 text-slate-600">Seed verisinde kamp sahibi genelde ownerId=2 oluyor. Farklı kamp sahibi varsa ID değerini değiştir.</p>

        <form onSubmit={createCamp} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={ownerId} onChange={(e) => setOwnerId(Number(e.target.value))} placeholder="Kamp sahibi ID" />
            <input required className="rounded-2xl border border-slate-200 px-4 py-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kamp adı" />
            <input required className="rounded-2xl border border-slate-200 px-4 py-3" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir" />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="İlçe" />
            <input required className="rounded-2xl border border-slate-200 px-4 py-3 sm:col-span-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres" />
            <input required className="rounded-2xl border border-slate-200 px-4 py-3" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" />
          </div>
          <textarea required className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
          <div className="grid gap-4 sm:grid-cols-4">
            <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={totalCapacity} onChange={(e) => setTotalCapacity(Number(e.target.value))} placeholder="Toplam kapasite" />
            <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={caravanCapacity} onChange={(e) => setCaravanCapacity(Number(e.target.value))} placeholder="Karavan kapasitesi" />
            <input type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={tentCapacity} onChange={(e) => setTentCapacity(Number(e.target.value))} placeholder="Çadır kapasitesi" />
            <input type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} placeholder="Gecelik fiyat" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(features).map(([key, value]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
                <input type="checkbox" checked={value} onChange={(e) => setFeatures((prev) => ({ ...prev, [key]: e.target.checked }))} />
                {featureLabels[key as keyof typeof emptyFeatures]}
              </label>
            ))}
          </div>
          {message && <p className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
            {loading ? "Oluşturuluyor..." : "Kamp oluştur"}
          </button>
        </form>
      </div>
    </section>
  );
}
