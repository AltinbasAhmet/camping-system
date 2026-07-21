"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp, CampPhoto } from "@/lib/types";

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

export default function OwnerCreateCampPage() {
  const router = useRouter();
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
  const [pricePerNight, setPricePerNight] = useState("");
  const [features, setFeatures] = useState(emptyFeatures);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const photoPreviews = useMemo(
    () => photoFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photoFiles]
  );

  async function createCamp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await apiRequest<ApiDataResponse<Camp>>("/camps/owner/my-camps", {
        method: "POST",
        body: JSON.stringify({
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
      if (photoFiles.length > 0) {
        for (let index = 0; index < photoFiles.length; index += 1) {
          const formData = new FormData();
          formData.append("photo", photoFiles[index]);
          formData.append("isCover", String(index === 0));

          await apiRequest<ApiDataResponse<CampPhoto>>(
            `/camps/${response.data.id}/photos/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
        }
      }

      setMessage(
        `Kampınız${photoFiles.length > 0 ? " ve fotoğrafları" : ""} oluşturuldu (${response.data.customerNumber}). Yayına alınmadan önce admin onayı bekleniyor.`
      );
      setTimeout(() => router.push("/owner/camps"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Kamp sahibi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Yeni kamp alanı ekle</h1>
        <p className="mt-2 text-slate-600">
          Kampınız kaydedildikten sonra sistem yöneticisi onayı bekleyecek (durum: beklemede). Onaylandıktan sonra
          herkese açık listede görünecek.
        </p>

        <form onSubmit={createCamp} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <input type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="Gecelik fiyat" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(features).map(([key, value]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
                <input type="checkbox" checked={value} onChange={(e) => setFeatures((prev) => ({ ...prev, [key]: e.target.checked }))} />
                {featureLabels[key as keyof typeof emptyFeatures]}
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-5">
            <label className="block text-sm font-black text-emerald-950">
              Kamp fotoğrafları
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg"
                className="mt-3 block w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm"
                onChange={(event) => setPhotoFiles(Array.from(event.target.files || []))}
              />
            </label>
            <p className="mt-2 text-xs text-slate-600">
              JPEG veya PNG yükleyebilirsiniz. İlk seçilen fotoğraf kapak fotoğrafı olur. Her dosya en fazla 5 MB olmalıdır.
            </p>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {photoPreviews.map(({ file, url }, index) => (
                  <div key={`${file.name}-${file.lastModified}`} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={file.name} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                      <span className="truncate text-slate-600">{file.name}</span>
                      {index === 0 && <span className="font-black text-emerald-700">Kapak</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {message && <p className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
            {loading ? (photoFiles.length > 0 ? "Kamp ve fotoğraflar kaydediliyor..." : "Kaydediliyor...") : "Kampı ekle"}
          </button>
        </form>
      </div>
    </section>
  );
}
