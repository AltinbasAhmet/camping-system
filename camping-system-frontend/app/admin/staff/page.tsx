"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest, type ApiDataResponse, type ApiListResponse } from "@/lib/api";
import type { Camp, StaffUser } from "@/lib/types";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [staffResponse, campResponse] = await Promise.all([
        apiRequest<ApiDataResponse<StaffUser[]>>("/admin/staff"),
        apiRequest<ApiListResponse<Camp>>("/admin/camps?limit=100"),
      ]);
      setStaff(staffResponse.data);
      setCamps(campResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Personel bilgileri alınamadı");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // İlk ekran verisini yükler.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, []);

  async function createStaff(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiRequest("/admin/staff", {
        method: "POST",
        body: JSON.stringify({ ...form, email: form.email || undefined, phone: form.phone || undefined }),
      });
      setForm({ name: "", email: "", phone: "", password: "" });
      setMessage("Personel hesabı oluşturuldu.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Personel oluşturulamadı");
    }
  }

  async function assign(staffId: number) {
    const campId = assignments[staffId];
    if (!campId) return;
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/camps/${campId}/staff`, { method: "POST", body: JSON.stringify({ userId: staffId }) });
      setMessage("Personel kampa atandı.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Atama yapılamadı");
    }
  }

  async function remove(campId: number, staffId: number) {
    setError("");
    setMessage("");
    try {
      await apiRequest(`/admin/camps/${campId}/staff/${staffId}`, { method: "DELETE" });
      setMessage("Personel kamp ataması kaldırıldı.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Atama kaldırılamadı");
    }
  }

  return (
    <section>
      <p className="text-sm font-black uppercase tracking-wide text-orange-600">Sistem yönetimi</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Personel yönetimi</h1>
      <p className="mt-2 text-slate-600">Personel hesabı oluşturun ve görev yapacağı kampı atayın.</p>

      <form onSubmit={createStaff} className="mt-8 grid gap-4 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm md:grid-cols-2">
        <input required className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Ad soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded-2xl border border-slate-200 px-4 py-3" type="email" placeholder="E-posta (veya telefon)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Telefon (veya e-posta)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required minLength={6} className="rounded-2xl border border-slate-200 px-4 py-3" type="password" placeholder="Geçici şifre (en az 6 karakter)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={!form.email && !form.phone} className="rounded-2xl bg-orange-600 px-5 py-3 font-black text-white disabled:opacity-50 md:col-span-2">Personel hesabı oluştur</button>
      </form>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {loading ? <p>Yükleniyor...</p> : staff.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">Henüz personel hesabı yok.</p> : staff.map((person) => {
          const assignedIds = new Set(person.staffAssignments.map((item) => item.campId));
          return (
            <article key={person.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">{person.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{person.email || person.phone}</p>
              <div className="mt-4 space-y-2">
                {person.staffAssignments.length === 0 ? <p className="text-sm text-amber-700">Henüz bir kampa atanmadı.</p> : person.staffAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-3">
                    <span className="text-sm font-bold text-emerald-900">{assignment.camp.name} · {assignment.camp.city}</span>
                    <button onClick={() => remove(assignment.campId, person.id)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-red-600">Kaldır</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <select className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 py-3" value={assignments[person.id] || ""} onChange={(e) => setAssignments({ ...assignments, [person.id]: e.target.value })}>
                  <option value="">Kamp seç</option>
                  {camps.filter((camp) => !assignedIds.has(camp.id)).map((camp) => <option key={camp.id} value={camp.id}>{camp.name} · {camp.city}</option>)}
                </select>
                <button onClick={() => assign(person.id)} disabled={!assignments[person.id]} className="rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">Ata</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
