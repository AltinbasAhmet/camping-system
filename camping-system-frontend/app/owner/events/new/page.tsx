"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp, CampEvent } from "@/lib/types";

export default function NewOwnerEventPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [campId, setCampId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCamps() {
      try {
        const response = await apiRequest<ApiDataResponse<Camp[]>>("/camps/owner/my-camps");
        setCamps(response.data || []);
        if (response.data?.[0]) setCampId(String(response.data[0].id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kamp alanları yüklenemedi");
      }
    }
    loadCamps();
  }, []);

  async function createEvent(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const isoDate = new Date(dateTime).toISOString();
      const response = await apiRequest<ApiDataResponse<CampEvent>>("/camp-events", {
        method: "POST",
        body: JSON.stringify({
          campId: Number(campId),
          title,
          description,
          dateTime: isoDate,
          capacity: Number(capacity),
          price: Number(price),
        }),
      });
      setMessage(`Etkinlik oluşturuldu: ${response.data.title}`);
      setTimeout(() => router.push("/owner/dashboard"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlik oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Kamp sahibi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Kamp etkinliği oluştur</h1>
        <p className="mt-2 text-slate-600">Kendi kampında bir etkinlik oluştur.</p>

        <form onSubmit={createEvent} className="mt-6 space-y-4">
          <select required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={campId} onChange={(event) => setCampId(event.target.value)}>
            {camps.map((camp) => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
          </select>
          <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Etkinlik başlığı" />
          <textarea required className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Açıklama" />
          <input required type="datetime-local" className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} placeholder="Kapasite" />
            <input required type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={price} onChange={(event) => setPrice(Number(event.target.value))} placeholder="Gecelik fiyat" />
          </div>
          {message && <p className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
          <button disabled={loading || !campId} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
            {loading ? "Oluşturuluyor..." : "Etkinlik oluştur"}
          </button>
        </form>
      </div>
    </section>
  );
}
