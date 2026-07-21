"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, resolveImageUrl, type ApiDataResponse } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Camp, CampPhoto } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

const amenityFields = [
  ["hasToilet", "Tuvalet"],
  ["hasShower", "Duş"],
  ["hasHotWater", "Sıcak su"],
  ["hasElectricity", "Elektrik"],
  ["hasWifi", "Wi-Fi"],
  ["hasMarket", "Market"],
  ["petFriendly", "Evcil hayvan dostu"],
] as const;

type AmenityKey = (typeof amenityFields)[number][0];

type EditForm = {
  name: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  totalCapacity: number;
  caravanCapacity: number;
  tentCapacity: number;
  pricePerNight: number;
  hasToilet: boolean;
  hasShower: boolean;
  hasHotWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  hasMarket: boolean;
  petFriendly: boolean;
};

function campToEditForm(camp: Camp): EditForm {
  return {
    name: camp.name,
    description: camp.description,
    city: camp.city,
    district: camp.district || "",
    address: camp.address,
    phone: camp.phone,
    email: camp.email || "",
    totalCapacity: camp.totalCapacity,
    caravanCapacity: camp.caravanCapacity,
    tentCapacity: camp.tentCapacity || 0,
    pricePerNight: camp.pricePerNight || 0,
    hasToilet: camp.hasToilet,
    hasShower: camp.hasShower,
    hasHotWater: camp.hasHotWater,
    hasElectricity: camp.hasElectricity,
    hasWifi: camp.hasWifi,
    hasMarket: camp.hasMarket,
    petFriendly: camp.petFriendly,
  };
}

export default function OwnerCampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [photoCampId, setPhotoCampId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCover, setIsCover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editCampId, setEditCampId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadCamps() {
    try {
      const response = await apiRequest<ApiDataResponse<Camp[]>>("/camps/owner/my-camps");
      setCamps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp alanları yüklenemedi");
    }
  }

  useEffect(() => {
    loadCamps();
  }, []);

  async function addPhoto(event: FormEvent) {
    event.preventDefault();
    if (!photoCampId || !photoFile) return;
    setMessage("");
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      formData.append("isCover", String(isCover));

      await apiRequest<ApiDataResponse<CampPhoto>>(`/camps/${photoCampId}/photos/upload`, {
        method: "POST",
        body: formData,
      });
      setPhotoFile(null);
      setIsCover(false);
      setMessage("Fotoğraf eklendi.");
      loadCamps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf eklenemedi");
    } finally {
      setUploading(false);
    }
  }

  function startEdit(camp: Camp) {
    setEditCampId(camp.id);
    setEditForm(campToEditForm(camp));
    setMessage("");
    setError("");
  }

  function updateField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editCampId || !editForm) return;
    setSavingEdit(true);
    setMessage("");
    setError("");
    try {
      await apiRequest<ApiDataResponse<Camp>>(`/camps/owner/my-camps/${editCampId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          city: editForm.city,
          district: editForm.district || undefined,
          address: editForm.address,
          phone: editForm.phone,
          email: editForm.email || undefined,
          totalCapacity: Number(editForm.totalCapacity),
          caravanCapacity: Number(editForm.caravanCapacity),
          tentCapacity: Number(editForm.tentCapacity),
          pricePerNight: Number(editForm.pricePerNight),
          hasToilet: editForm.hasToilet,
          hasShower: editForm.hasShower,
          hasHotWater: editForm.hasHotWater,
          hasElectricity: editForm.hasElectricity,
          hasWifi: editForm.hasWifi,
          hasMarket: editForm.hasMarket,
          petFriendly: editForm.petFriendly,
        }),
      });
      setMessage("Kamp bilgileri güncellendi.");
      setEditCampId(null);
      setEditForm(null);
      loadCamps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp güncellenemedi");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-emerald-950">Kamp Yerlerim</h1>
        <Link href="/owner/camps/new" className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800">
          Yeni kamp ekle
        </Link>
      </div>
      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}
      <div className="mt-6 grid gap-5">
        {camps.map((camp) => (
          <article key={camp.id} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-emerald-700">{camp.city}{camp.district ? ` / ${camp.district}` : ""}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{camp.name}</h2>
                <p className="mt-2 text-slate-600">{camp.totalCapacity} kapasite · {formatPrice(camp.pricePerNight)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {amenityFields.filter(([key]) => camp[key as AmenityKey]).map(([key, label]) => (
                    <span key={key} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">✓ {label}</span>
                  ))}
                </div>
              </div>
              <StatusBadge status={camp.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white" href={`/camps/${camp.id}`}>Herkese açık detay</Link>
              <button type="button" onClick={() => setPhotoCampId(camp.id)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">Fotoğraf ekle</button>
              <button type="button" onClick={() => startEdit(camp)} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-white">Kamp bilgilerini düzenle</button>
            </div>

            {editCampId === camp.id && editForm && (
              <form onSubmit={saveEdit} className="mt-5 space-y-4 rounded-2xl bg-amber-50 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required className="rounded-xl border border-slate-200 px-3 py-2" value={editForm.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Kamp adı" />
                  <input required className="rounded-xl border border-slate-200 px-3 py-2" value={editForm.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Şehir" />
                  <input className="rounded-xl border border-slate-200 px-3 py-2" value={editForm.district} onChange={(e) => updateField("district", e.target.value)} placeholder="İlçe" />
                  <input required className="rounded-xl border border-slate-200 px-3 py-2" value={editForm.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Telefon" />
                  <input required className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2" value={editForm.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Adres" />
                  <input className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2" value={editForm.email} onChange={(e) => updateField("email", e.target.value)} placeholder="E-posta (opsiyonel)" />
                </div>
                <textarea required className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" value={editForm.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Açıklama" />
                <div className="grid gap-3 sm:grid-cols-4">
                  <label className="text-sm font-bold text-slate-700">
                    Toplam kapasite
                    <input type="number" min={1} required className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2" value={editForm.totalCapacity} onChange={(e) => updateField("totalCapacity", Number(e.target.value))} />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Karavan kapasitesi
                    <input type="number" min={1} required className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2" value={editForm.caravanCapacity} onChange={(e) => updateField("caravanCapacity", Number(e.target.value))} />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Çadır kapasitesi
                    <input type="number" min={0} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2" value={editForm.tentCapacity} onChange={(e) => updateField("tentCapacity", Number(e.target.value))} />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Gecelik fiyat
                    <input type="number" min={0} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2" value={editForm.pricePerNight} onChange={(e) => updateField("pricePerNight", Number(e.target.value))} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Olanaklar</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {amenityFields.map(([key, label]) => (
                      <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${editForm[key] ? "bg-emerald-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
                        <input type="checkbox" className="hidden" checked={editForm[key]} onChange={(e) => updateField(key, e.target.checked)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button disabled={savingEdit} className="rounded-xl bg-emerald-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">
                    {savingEdit ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                  <button type="button" onClick={() => { setEditCampId(null); setEditForm(null); }} className="rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-800">
                    Vazgeç
                  </button>
                </div>
              </form>
            )}

            {camp.photos && camp.photos.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {camp.photos.map((photo) => (
                  <div key={photo.id} className="overflow-hidden rounded-2xl border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImageUrl(photo.imageUrl)} alt={camp.name} className="h-28 w-full object-cover" />
                    {photo.isCover && <p className="bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">Kapak</p>}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {photoCampId && (
        <form onSubmit={addPhoto} className="mt-8 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-emerald-950">Fotoğraf ekle</h2>
          <input
            required
            type="file"
            accept="image/png,image/jpeg"
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
            onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
          />
          <p className="mt-2 text-xs text-slate-500">Sadece JPEG veya PNG, en fazla 5MB.</p>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} /> Kapak fotoğrafı
          </label>
          <button disabled={uploading || !photoFile} className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
            {uploading ? "Yükleniyor..." : "Fotoğrafı yükle"}
          </button>
        </form>
      )}
    </section>
  );
}
