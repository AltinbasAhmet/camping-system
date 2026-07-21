"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import { formatOnlyDate } from "@/lib/format";

type DashboardStats = {
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalCamps: number;
  campsByStatus: Record<string, number>;
  totalReservations: number;
  reservationsByStatus: Record<string, number>;
  totalEvents: number;
  totalEventBookings: number;
  pendingReservations: {
    id: number;
    reservationCode: string;
    camp?: { name: string };
    user?: { name: string };
    createdAt: string;
  }[];
  pendingCamps: {
    id: number;
    name: string;
    city: string;
    owner?: { name: string; email?: string | null };
    createdAt: string;
  }[];
  pendingCampOwners: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    createdAt: string;
  }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await apiRequest<ApiDataResponse<DashboardStats>>("/admin/dashboard");
        setStats(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Panel verileri yüklenemedi");
      }
    }
    load();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Sistem yöneticisi</p>
      <h1 className="mt-2 text-4xl font-black text-emerald-950">Admin Paneli</h1>

      {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      {stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Toplam kullanıcı" value={stats.totalUsers} />
            <StatCard label="Toplam kamp" value={stats.totalCamps} />
            <StatCard label="Toplam rezervasyon" value={stats.totalReservations} />
            <StatCard label="Toplam bilet" value={stats.totalEventBookings} />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <Link href="/admin/users" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Kullanıcılar</Link>
            <Link href="/admin/camps" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Kamplar</Link>
            <Link href="/admin/reservations" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Rezervasyonlar</Link>
            <Link href="/admin/events" className="rounded-[2rem] border border-emerald-100 bg-white p-6 font-black text-emerald-950 shadow-sm hover:bg-emerald-50">Etkinlikler</Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-sky-200 bg-sky-50 p-6">
              <h2 className="text-xl font-black text-sky-900">Onay bekleyen kamp sahipleri ({stats.pendingCampOwners.length})</h2>
              {stats.pendingCampOwners.length === 0 && <p className="mt-3 text-sm text-sky-800">Bekleyen başvuru yok.</p>}
              <ul className="mt-3 space-y-2">
                {stats.pendingCampOwners.map((owner) => (
                  <li key={owner.id} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                    {owner.name} · {owner.email || owner.phone}
                  </li>
                ))}
              </ul>
              <Link href="/admin/users" className="mt-4 inline-block rounded-full bg-sky-700 px-4 py-2 text-sm font-black text-white">Kullanıcılara git</Link>
            </div>

            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-xl font-black text-amber-900">Onay bekleyen kamplar ({stats.campsByStatus.PENDING || 0})</h2>
              {stats.pendingCamps.length === 0 && <p className="mt-3 text-sm text-amber-800">Bekleyen kamp yok.</p>}
              <ul className="mt-3 space-y-2">
                {stats.pendingCamps.map((camp) => (
                  <li key={camp.id} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                    {camp.name} · {camp.city} — sahip: {camp.owner?.name}
                  </li>
                ))}
              </ul>
              <Link href="/admin/camps" className="mt-4 inline-block rounded-full bg-amber-600 px-4 py-2 text-sm font-black text-white">Tüm kampları gör</Link>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6">
              <h2 className="text-xl font-black text-emerald-900">Onay bekleyen rezervasyonlar ({stats.reservationsByStatus.PENDING || 0})</h2>
              {stats.pendingReservations.length === 0 && <p className="mt-3 text-sm text-emerald-800">Bekleyen rezervasyon yok.</p>}
              <ul className="mt-3 space-y-2">
                {stats.pendingReservations.map((res) => (
                  <li key={res.id} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                    {res.reservationCode} · {res.camp?.name} — {res.user?.name} · {formatOnlyDate(res.createdAt)}
                  </li>
                ))}
              </ul>
              <Link href="/admin/reservations" className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white">Tüm rezervasyonları gör</Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-black text-emerald-950">{value}</p>
    </article>
  );
}
