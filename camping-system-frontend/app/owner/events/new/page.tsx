"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp, CampEvent, EventPhoto } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function NewOwnerEventPage() {
  const router = useRouter();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [campId, setCampId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const photoPreviews = useMemo(
    () => photoFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photoFiles]
  );

  useEffect(() => () => photoPreviews.forEach(({ url }) => URL.revokeObjectURL(url)), [photoPreviews]);

  useEffect(() => {
    async function loadCamps() {
      try {
        const response = await apiRequest<ApiDataResponse<Camp[]>>("/camps/owner/my-camps");
        const activeCamps = (response.data || []).filter((camp) => camp.status === "ACTIVE");
        setCamps(activeCamps);
        if (activeCamps[0]) setCampId(String(activeCamps[0].id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kamp alanları yüklenemedi");
      }
    }
    loadCamps();
  }, []);

  function selectPhotos(files: FileList | null) {
    setError("");
    const selected = Array.from(files || []);
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (invalid) return setError(`${invalid.name}: yalnızca JPEG, PNG veya WEBP yükleyebilirsiniz.`);
    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) return setError(`${oversized.name}: dosya 5 MB'dan büyük olamaz.`);
    setPhotoFiles(selected);
  }

  function removePhoto(target: File) {
    setPhotoFiles((files) => files.filter((file) => file !== target));
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const selectedDate = new Date(dateTime);
      if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
        throw new Error("Etkinlik tarihi gelecekte olmalıdır.");
      }

      const response = await apiRequest<ApiDataResponse<CampEvent>>("/camp-events", {
        method: "POST",
        body: JSON.stringify({
          campId: Number(campId),
          title: title.trim(),
          description: description.trim(),
          dateTime: selectedDate.toISOString(),
          capacity: Number(capacity),
          price: Number(price)
        })
      });

      for (let index = 0; index < photoFiles.length; index += 1) {
        const formData = new FormData();
        formData.append("photo", photoFiles[index]);
        formData.append("isCover", String(index === 0));

        await apiRequest<ApiDataResponse<EventPhoto>>(
          `/camp-events/${response.data.id}/photos/upload`,
          { method: "POST", body: formData }
        );
      }

      setMessage(`Etkinlik${photoFiles.length ? " ve fotoğrafları" : ""} başarıyla oluşturuldu.`);
      setTimeout(() => router.push("/owner/events"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlik oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Kamp sahibi</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-950">Kamp etkinliği oluştur</h1>
        <p className="mt-2 text-slate-600">Etkinlik bilgilerini ve fotoğraflarını aynı formdan ekleyebilirsiniz.</p>

        <form onSubmit={createEvent} className="mt-6 space-y-5">
          <select required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={campId} onChange={(e) => setCampId(e.target.value)}>
            {camps.length === 0 && <option value="">Aktif kamp alanı bulunamadı</option>}
            {camps.map((camp) => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
          </select>
          <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Etkinlik başlığı" />
          <textarea required className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
          <input required type="datetime-local" className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Kapasite" />
            <input required type="number" min={0} step="0.01" className="rounded-2xl border border-slate-200 px-4 py-3" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Bilet fiyatı" />
          </div>

          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-5">
            <label className="block text-sm font-black text-emerald-950">
              Etkinlik fotoğrafları
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={loading} className="mt-3 block w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm" onChange={(e) => selectPhotos(e.target.files)} />
            </label>
            <p className="mt-2 text-xs text-slate-600">İlk seçilen fotoğraf kapak olur. Her dosya en fazla 5 MB olabilir.</p>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {photoPreviews.map(({ file, url }, index) => (
                  <div key={`${file.name}-${file.lastModified}`} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={file.name} className="h-36 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-xs font-semibold text-slate-700">{file.name}</span>
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">Kapak</span>}
                        <button type="button" onClick={() => removePhoto(file)} className="text-xs font-bold text-red-600">Kaldır</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && <p className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">{message}</p>}
          {error && <p className="rounded-2xl bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
          <button disabled={loading || !campId} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
            {loading ? (photoFiles.length ? "Etkinlik ve fotoğraflar kaydediliyor..." : "Oluşturuluyor...") : "Etkinlik oluştur"}
          </button>
        </form>
      </div>
    </section>
  );
}
