"use client";

import { Fragment, useEffect, useState } from "react";
import { apiRequest, resolveImageUrl, type ApiListResponse } from "@/lib/api";
import type { UserRole } from "@/lib/auth";

type PendingCampApplication = {
  id: number;
  name: string;
  description: string;
  city: string;
  district?: string | null;
  address: string;
  phone: string;
  totalCapacity: number;
  caravanCapacity: number;
  tentCapacity?: number | null;
  pricePerNight?: number | null;
  photos: { id: number; imageUrl: string; isCover: boolean }[];
};

type AdminUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  _count: { ownedCamps: number; reservations: number; eventBookings: number };
  ownedCamps: PendingCampApplication[];
};

const roleLabels: Record<UserRole, string> = {
  USER: "Kullanıcı",
  CAMP_OWNER: "Kamp Sahibi",
  SYSTEM_ADMIN: "Sistem Yöneticisi",
  STAFF: "Personel",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  async function loadUsers() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&limit=50` : "?limit=50";
      const response = await apiRequest<ApiListResponse<AdminUser>>(`/admin/users${query}`);
      setUsers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcılar yüklenemedi");
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeRole(userId: number, role: UserRole) {
    setActingId(userId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMessage("Rol güncellendi.");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rol güncellenemedi");
    } finally {
      setActingId(null);
    }
  }

  async function changeVerification(userId: number, verificationStatus: "APPROVED" | "REJECTED") {
    setActingId(userId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/users/${userId}/verification`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStatus }),
      });
      setMessage(verificationStatus === "APPROVED" ? "Kamp sahibi onaylandı." : "Kamp sahibi başvurusu reddedildi.");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem tamamlanamadı");
    } finally {
      setActingId(null);
    }
  }

  async function deleteUser(userId: number) {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    setActingId(userId);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/admin/users/${userId}`, { method: "DELETE" });
      setMessage("Kullanıcı silindi.");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcı silinemedi");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-emerald-950">Kullanıcılar</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          loadUsers();
        }}
        className="mt-6 flex gap-3"
      >
        <input
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
          placeholder="İsim, e-posta veya telefon ara..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white">Ara</button>
      </form>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-xs font-black uppercase tracking-wide text-emerald-800">
            <tr>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">İletişim</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Doğrulama</th>
              <th className="px-4 py-3">Kamp / Rez. / Bilet</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const pendingCamp = user.role === "CAMP_OWNER" && user.verificationStatus === "PENDING" ? user.ownedCamps?.[0] : null;
              const coverPhoto = pendingCamp?.photos?.find((p) => p.isCover) || pendingCamp?.photos?.[0];

              return (
              <Fragment key={user.id}>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-600">{user.email || user.phone || "-"}</td>
                <td className="px-4 py-3">
                  <select
                    disabled={actingId === user.id}
                    value={user.role}
                    onChange={(event) => changeRole(user.id, event.target.value as UserRole)}
                    className="rounded-xl border border-slate-200 px-2 py-1 font-semibold"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {user.role === "CAMP_OWNER" ? (
                    user.verificationStatus === "APPROVED" ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Onaylı</span>
                    ) : user.verificationStatus === "REJECTED" ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">Reddedildi</span>
                        <button type="button" disabled={actingId === user.id} onClick={() => changeVerification(user.id, "APPROVED")} className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-black text-white disabled:opacity-50">Onayla</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">Onay bekliyor</span>
                        <button type="button" disabled={actingId === user.id} onClick={() => changeVerification(user.id, "APPROVED")} className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-black text-white disabled:opacity-50">Onayla</button>
                        <button type="button" disabled={actingId === user.id} onClick={() => changeVerification(user.id, "REJECTED")} className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-50">Reddet</button>
                      </div>
                    )
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {user._count.ownedCamps} / {user._count.reservations} / {user._count.eventBookings}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={actingId === user.id}
                    onClick={() => deleteUser(user.id)}
                    className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white disabled:opacity-50"
                  >
                    Sil
                  </button>
                </td>
              </tr>
              {pendingCamp && (
                <tr className="border-t border-amber-100 bg-amber-50/50">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-amber-200 bg-white p-4">
                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveImageUrl(coverPhoto.imageUrl)} alt={pendingCamp.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">🏕️</div>
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">Başvurulan kamp</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{pendingCamp.name}</p>
                        <p className="text-slate-600">{pendingCamp.city}{pendingCamp.district ? ` / ${pendingCamp.district}` : ""} — {pendingCamp.address}</p>
                        <p className="mt-1 text-slate-600">{pendingCamp.description}</p>
                        <p className="mt-1 text-slate-600">
                          Kapasite: {pendingCamp.totalCapacity} (karavan {pendingCamp.caravanCapacity}
                          {pendingCamp.tentCapacity ? `, çadır ${pendingCamp.tentCapacity}` : ""}) · Tel: {pendingCamp.phone}
                          {pendingCamp.pricePerNight ? ` · ${pendingCamp.pricePerNight} TL/gece` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </Fragment>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-slate-600">Kullanıcı bulunamadı.</p>}
      </div>
    </section>
  );
}
