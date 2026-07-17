"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp, CampReservation } from "@/lib/types";

export default function StaffDashboardPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest<ApiDataResponse<Camp[]>>("/staff/camps"),
      apiRequest<ApiDataResponse<CampReservation[]>>("/staff/reservations"),
    ]).then(([campData, reservationData]) => {
      setCamps(campData.data);
      setReservations(reservationData.data);
    }).catch((err) => setError(err instanceof Error ? err.message : "Bilgiler alınamadı"));
  }, []);

  const checkedIn = reservations.filter((item) => item.status === "CHECKED_IN").length;
  const confirmed = reservations.filter((item) => item.status === "CONFIRMED").length;

  return (
    <section>
      <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Personel paneli</p>
      <h1 className="mt-2 text-4xl font-black text-emerald-950">Görev alanım</h1>
      <p className="mt-2 text-slate-600">Yalnızca size atanmış kampları ve bu kampların rezervasyonlarını görebilirsiniz.</p>
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[['Atanmış kamp', camps.length], ['Girişi bekleyen', confirmed], ['Kampta bulunan', checkedIn]].map(([label, value]) => <div key={String(label)} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-4xl font-black text-emerald-800">{value}</p></div>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/staff/reservations" className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white">Rezervasyonları gör</Link>
        <Link href="/staff/checkin" className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white">Check-in / Check-out</Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {camps.length === 0 ? <p className="rounded-2xl bg-amber-50 p-5 text-amber-800">Henüz bir kampa atanmadınız. Sistem yöneticisi atama yaptıktan sonra burada görünecek.</p> : camps.map((camp) => <article key={camp.id} className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black text-slate-950">{camp.name}</h2><p className="mt-2 text-slate-600">{camp.city}{camp.district ? ` / ${camp.district}` : ""}</p><p className="mt-3 text-sm font-bold text-emerald-700">{camp._count?.reservations || 0} toplam rezervasyon</p></article>)}
      </div>
    </section>
  );
}
