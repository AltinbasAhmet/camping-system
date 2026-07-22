"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, resolveImageUrl, type ApiDataResponse } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { formatDate, formatOnlyDate, formatPrice } from "@/lib/format";
import type { Camp, CampComment, CampCommentSummary, CampEvent, CampReservation, EventBooking, ReservationGuest } from "@/lib/types";

type GuestInput = { fullName: string; nationalId: string };

const featureLabels: [keyof Camp, string][] = [
  ["hasToilet", "Tuvalet"],
  ["hasShower", "Duş"],
  ["hasHotWater", "Sıcak su"],
  ["hasElectricity", "Elektrik"],
  ["hasWifi", "Wi-Fi"],
  ["hasMarket", "Market"],
  ["petFriendly", "Pet friendly"],
];

export default function CampDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [events, setEtkinlikler] = useState<CampEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingGuestCounts, setBookingGuestCounts] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<CampComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [accommodationType, setAccommodationType] = useState<"TENT" | "CARAVAN">("TENT");
  const [plateNumber, setPlateNumber] = useState("");
  const [guests, setGuests] = useState<GuestInput[]>([{ fullName: "", nationalId: "" }]);

  const user = useMemo(() => getUser(), []);

  async function loadCamp() {
    setLoading(true);
    setError("");
    try {
      const [campResponse, eventsResponse, commentsResponse] = await Promise.all([
        apiRequest<ApiDataResponse<Camp>>(`/camps/${params.id}`, { auth: false }),
        apiRequest<ApiDataResponse<CampEvent[]>>(`/camp-events/camp/${params.id}`, { auth: false }),
        apiRequest<ApiDataResponse<CampCommentSummary>>(`/camps/${params.id}/comments`, { auth: false }),
      ]);
      setCamp(campResponse.data);
      setEtkinlikler(eventsResponse.data || []);
      setComments(commentsResponse.data.comments || []);
      setCommentTotal(commentsResponse.data.total || 0);
      setAverageRating(commentsResponse.data.averageRating ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kamp detayı yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  function setGuestCount(count: number) {
    const safeCount = Math.max(1, count);
    setGuests((prev) => Array.from({ length: safeCount }, (_, index) => prev[index] || { fullName: "", nationalId: "" }));
  }

  async function createReservation(event: FormEvent) {
    event.preventDefault();
    setReservationMessage("");

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiRequest<ApiDataResponse<CampReservation>>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          campId: Number(params.id),
          checkInDate,
          checkOutDate,
          accommodationType,
          ...(accommodationType === "CARAVAN" ? { plateNumber } : {}),
          guestCount: guests.length,
          guests: guests.map((guest) => ({
            fullName: guest.fullName,
            ...(guest.nationalId ? { nationalId: guest.nationalId } : {}),
          })) satisfies ReservationGuest[],
        }),
      });
      setReservationMessage(`Rezervasyon oluşturuldu: ${response.data.reservationCode}`);
    } catch (err) {
      setReservationMessage(err instanceof Error ? err.message : "Reservation failed");
    }
  }


  async function submitComment(event: FormEvent) {
    event.preventDefault();
    setCommentMessage("");
    if (!user) {
      router.push("/login");
      return;
    }
    if (commentText.trim().length < 3) {
      setCommentMessage("Yorum en az 3 karakter olmalıdır.");
      return;
    }
    setCommentSubmitting(true);
    try {
      await apiRequest<ApiDataResponse<CampComment>>(`/camps/${params.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText.trim(), rating: commentRating }),
      });
      setCommentText("");
      setCommentRating(5);
      setCommentMessage("Yorumunuz eklendi.");
      await loadCamp();
    } catch (err) {
      setCommentMessage(err instanceof Error ? err.message : "Yorum eklenemedi");
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function deleteComment(commentId: number) {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setCommentMessage("");
    try {
      await apiRequest(`/camps/comments/${commentId}`, { method: "DELETE" });
      setCommentMessage("Yorum silindi.");
      await loadCamp();
    } catch (err) {
      setCommentMessage(err instanceof Error ? err.message : "Yorum silinemedi");
    }
  }

  async function bookEvent(eventId: number) {
    setBookingMessage("");
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const guestCount = bookingGuestCounts[eventId] || 1;
      await apiRequest<ApiDataResponse<EventBooking>>("/event-bookings", {
        method: "POST",
        body: JSON.stringify({ eventId, guestCount }),
      });
      setBookingMessage("Etkinlik bileti alındı.");
      loadCamp();
    } catch (err) {
      setBookingMessage(err instanceof Error ? err.message : "Etkinlik bileti alınamadı");
    }
  }

  if (loading) return <p className="mx-auto max-w-7xl p-8">Yükleniyor...</p>;
  if (error) return <p className="mx-auto max-w-7xl p-8 text-red-700">{error}</p>;
  if (!camp) return null;

  const cover = camp.photos?.find((photo) => photo.isCover) || camp.photos?.[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
        <div className="h-72 bg-emerald-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImageUrl(cover.imageUrl)} alt={camp.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">🏕️</div>
          )}
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
              {camp.city}{camp.district ? ` / ${camp.district}` : ""}
            </p>
            <h1 className="mt-2 text-4xl font-black text-emerald-950">{camp.name}</h1>
            <p className="mt-4 leading-8 text-slate-600">{camp.description}</p>
            <p className="mt-4 text-sm text-slate-500">{camp.address}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {featureLabels.filter(([key]) => Boolean(camp[key])).map(([, label]) => (
                <span key={label} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-900">✓ {label}</span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-6">
            <p className="text-sm text-slate-600">Gecelik fiyat</p>
            <p className="text-3xl font-black text-emerald-950">{formatPrice(camp.pricePerNight)}</p>
            <div className="mt-5 grid gap-2 text-sm text-slate-700">
              <p><b>Toplam kapasite:</b> {camp.totalCapacity}</p>
              <p><b>Karavan kapasitesi:</b> {camp.caravanCapacity}</p>
              <p><b>Çadır kapasitesi:</b> {camp.tentCapacity ?? "-"}</p>
              {camp.checkInTime && <p><b>Giriş saati:</b> {camp.checkInTime}</p>}
              {camp.checkOutTime && <p><b>Çıkış saati:</b> {camp.checkOutTime}</p>}
              <p><b>Telefon:</b> {camp.phone}</p>
              {camp.email && <p><b>E-posta:</b> {camp.email}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={createReservation} className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-emerald-950">Rezervasyon yap</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input required type="date" className="rounded-2xl border border-slate-200 px-4 py-3" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
            <input required type="date" className="rounded-2xl border border-slate-200 px-4 py-3" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setAccommodationType("TENT")}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-black transition ${accommodationType === "TENT" ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                ⛺ Çadır
              </button>
              <button
                type="button"
                onClick={() => setAccommodationType("CARAVAN")}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-black transition ${accommodationType === "CARAVAN" ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                🚐 Karavan
              </button>
            </div>
            {accommodationType === "CARAVAN" && (
              <input required className="rounded-2xl border border-slate-200 px-4 py-3 sm:col-span-2" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="Plaka örn. 01ABC123" />
            )}
            <input type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3 sm:col-span-2" value={guests.length} onChange={(e) => setGuestCount(Number(e.target.value))} placeholder="Kişi sayısı" />
          </div>
          <div className="mt-4 space-y-3">
            {guests.map((guest, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-2">
                <input required className="rounded-2xl border border-slate-200 px-4 py-3" value={guest.fullName} onChange={(e) => setGuests((prev) => prev.map((item, i) => i === index ? { ...item, fullName: e.target.value } : item))} placeholder={`${index + 1}. misafir adı`} />
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={guest.nationalId} onChange={(e) => setGuests((prev) => prev.map((item, i) => i === index ? { ...item, nationalId: e.target.value } : item))} placeholder="T.C. no opsiyonel" />
              </div>
            ))}
          </div>
          {reservationMessage && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{reservationMessage}</p>}
          <button className="mt-5 w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800">
            Rezervasyon oluştur
          </button>
        </form>

        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-emerald-950">Kamp etkinlikleri</h2>
          {bookingMessage && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{bookingMessage}</p>}
          <div className="mt-5 space-y-4">
            {events.length === 0 ? <p className="text-slate-600">Bu kamp için etkinlik yok.</p> : events.map((item) => {
              const ticketsSold = item.bookings?.reduce((sum, booking) => sum + booking.guestCount, 0) || item.ticketsSold || 0;
              const remaining = item.capacity - ticketsSold;
              return (
                <article key={item.id} className="rounded-3xl border border-slate-100 p-4">
                  <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-800">{formatDate(item.dateTime)}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatPrice(item.price)} · Kalan kapasite: {remaining}</p>
                  <div className="mt-3 flex gap-2">
                    <input type="number" min={1} max={Math.max(1, remaining)} className="w-24 rounded-2xl border border-slate-200 px-3 py-2" value={bookingGuestCounts[item.id] || 1} onChange={(e) => setBookingGuestCounts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} />
                    <button type="button" onClick={() => bookEvent(item.id)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
                      Bilet al
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-emerald-950">Kamp yorumları</h2>
            <p className="mt-1 text-sm text-slate-600">{commentTotal} yorum{averageRating !== null ? ` · Ortalama ${averageRating}/5` : ""}</p>
          </div>
          {averageRating !== null && <div className="text-xl font-black text-amber-500">★ {averageRating}</div>}
        </div>

        <form onSubmit={submitComment} className="mt-6 rounded-3xl bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-black text-emerald-950">Yorum ekle</h3>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              Puan
              <select value={commentRating} onChange={(e) => setCommentRating(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <option value={5}>5 - Mükemmel</option>
                <option value={4}>4 - Çok iyi</option>
                <option value={3}>3 - İyi</option>
                <option value={2}>2 - Orta</option>
                <option value={1}>1 - Kötü</option>
              </select>
            </label>
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={1000}
            rows={4}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"
            placeholder={user ? "Kamp hakkındaki deneyiminizi paylaşın..." : "Yorum yapmak için giriş yapın."}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{commentText.length}/1000</span>
            <button disabled={commentSubmitting} className="rounded-2xl bg-emerald-700 px-5 py-2.5 font-black text-white hover:bg-emerald-800 disabled:opacity-60">
              {commentSubmitting ? "Yorum gönderiliyor..." : "Yorumu gönder"}
            </button>
          </div>
        </form>

        {commentMessage && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{commentMessage}</p>}

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-slate-600">Henüz yorum yapılmamış. İlk yorumu siz ekleyin.</p>
          ) : comments.map((comment) => {
            const canDelete = Boolean(user && (user.id === comment.userId || user.id === camp.ownerId || user.role === "SYSTEM_ADMIN"));
            return (
              <article key={comment.id} className="rounded-3xl border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-950">{comment.user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {comment.rating && <span className="font-black text-amber-500">{"★".repeat(comment.rating)}<span className="text-slate-300">{"★".repeat(5 - comment.rating)}</span></span>}
                    {canDelete && <button type="button" onClick={() => deleteComment(comment.id)} className="text-sm font-bold text-red-600 hover:text-red-800">Sil</button>}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{comment.content}</p>
              </article>
            );
          })}
        </div>
      </section>

    </section>
  );
}
