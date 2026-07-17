"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, resolveImageUrl, type ApiListResponse } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Camp } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

type AdminCamp = Camp & { _count: { reservations: number; events: number } };

const statusOptions = ["PENDING", "ACTIVE", "PASSIVE", "REJECTED"] as const;

export default function AdminCampsPage() {
  const [camps, setCamps] = useState<AdminCamp[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadCamps() {
    try {
      const query = statusFilter ? `?status=${statusFilter}&limit=50` : "?limit=50";
      const response = await apiRequest<ApiListResponse<AdminCamp>>(`/admin/camps${query}`);
      setCamps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamplar yüklenemedi");
    }
  }

  useEffect(() => {
    loadCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function changeStatus(campId: number, status: string) {
    setActingId(campId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/camps/${campId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage("Kamp durumu güncellendi.");
      loadCamps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp güncellenemedi");
    } finally {
      setActingId(null);
    }
  }

  async function deleteCamp(campId: number) {
    if (!confirm("Bu kampı silmek istediğinize emin misiniz?")) return;
    setActingId(campId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/camps/${campId}`, { method: "DELETE" });
      setMessage("Kamp silindi.");
      loadCamps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp silinemedi");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-emerald-950">Tüm Kamplar</h1>
        <Link href="/admin/camps/new" className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800">
          Kamp sahibi adına kamp oluştur
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter("")} className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === "" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>Tümü</button>
        {statusOptions.map((status) => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-2 text-sm font-bold ${statusFilter === status ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>
            {status}
          </button>
        ))}
      </div>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4">
        {camps.map((camp) => (
          <article key={camp.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {(() => {
                    const cover = camp.photos?.find((p) => p.isCover) || camp.photos?.[0];
                    return cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(cover.imageUrl)} alt={camp.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🏕️</div>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{camp.city}{camp.district ? ` / ${camp.district}` : ""} · {camp.customerNumber}</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{camp.name}</h2>
                  <p className="mt-2 text-slate-600">{camp.totalCapacity} kapasite · {formatPrice(camp.pricePerNight)}</p>
                  <p className="mt-1 text-sm text-slate-500">Sahip: {camp.owner?.name} ({camp.owner?.email || camp.owner?.phone})</p>
                  <p className="mt-1 text-sm text-slate-500">{camp._count.reservations} rezervasyon · {camp._count.events} etkinlik</p>
                </div>
              </div>
              <StatusBadge status={camp.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white" href={`/camps/${camp.id}`}>Herkese açık detay</Link>
              <select
                disabled={actingId === camp.id}
                value={camp.status}
                onChange={(event) => changeStatus(camp.id, event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={actingId === camp.id}
                onClick={() => deleteCamp(camp.id)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </article>
        ))}
        {camps.length === 0 && <p className="rounded-2xl bg-white p-6 text-slate-600">Kamp bulunamadı.</p>}
      </div>
    </section>
  );
}
