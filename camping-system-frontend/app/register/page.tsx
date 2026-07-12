"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAuth, type User, type UserRole } from "@/lib/auth";

type RegisterResponse = { success: boolean; token: string | null; pendingApproval: boolean; user: User; message: string };

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: "USER", label: "Kampçı / Kullanıcı", description: "Kamp arar, rezervasyon yapar ve etkinlik bileti alır." },
  { value: "CAMP_OWNER", label: "Kamp alanı sahibi", description: "Kendi kamp alanını ve etkinliklerini yönetir." },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState("");

  // Kamp sahibi başvurusu için ek bilgiler — admin bu bilgilere (ve varsa
  // fotoğrafa) bakarak onay/red kararı verir.
  const [campName, setCampName] = useState("");
  const [campDescription, setCampDescription] = useState("");
  const [campCity, setCampCity] = useState("");
  const [campDistrict, setCampDistrict] = useState("");
  const [campAddress, setCampAddress] = useState("");
  const [campPhone, setCampPhone] = useState("");
  const [campTotalCapacity, setCampTotalCapacity] = useState(50);
  const [campCaravanCapacity, setCampCaravanCapacity] = useState(30);
  const [campTentCapacity, setCampTentCapacity] = useState(20);
  const [campPricePerNight, setCampPricePerNight] = useState(1200);
  const [campPhoto, setCampPhoto] = useState<File | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("password", password);
      formData.append("role", role);
      if (email) formData.append("email", email);
      if (phone) formData.append("phone", phone);

      if (role === "CAMP_OWNER") {
        formData.append("campName", campName);
        formData.append("campDescription", campDescription);
        formData.append("campCity", campCity);
        if (campDistrict) formData.append("campDistrict", campDistrict);
        formData.append("campAddress", campAddress);
        formData.append("campPhone", campPhone);
        formData.append("campTotalCapacity", String(campTotalCapacity));
        formData.append("campCaravanCapacity", String(campCaravanCapacity));
        formData.append("campTentCapacity", String(campTentCapacity));
        formData.append("campPricePerNight", String(campPricePerNight));
        if (campPhoto) formData.append("campPhoto", campPhoto);
      }

      const data = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: formData,
        auth: false,
      });

      if (data.pendingApproval || !data.token) {
        setPendingApprovalMessage(
          "Kamp sahibi hesabınız ve kamp başvurunuz oluşturuldu. Sistem yöneticisi, gönderdiğiniz kamp bilgilerini ve fotoğrafı inceledikten sonra onaylayacak."
        );
        return;
      }

      saveAuth(data.token, data.user);

      if (data.user.role === "CAMP_OWNER") router.push("/owner/dashboard");
      else if (data.user.role === "SYSTEM_ADMIN") router.push("/admin/dashboard");
      else router.push("/camps");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.28),transparent_32%),linear-gradient(180deg,#fff7ed,#ecfeff)] px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100/70 backdrop-blur">
        <Link href="/" className="mb-6 inline-flex text-sm font-black text-orange-600 hover:text-orange-800">
          ← Ana sayfaya dön
        </Link>

        <h1 className="text-3xl font-black text-slate-950">Kayıt ol</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          CampPal hesabını oluştur. Kampçı olarak rezervasyon yapabilir veya kamp alanı sahibi olarak panele geçebilirsin.
        </p>

        {pendingApprovalMessage ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-lg font-black text-emerald-900">Başvurunuz alındı</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">{pendingApprovalMessage}</p>
            <Link href="/login" className="mt-4 inline-block rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800">
              Giriş sayfasına git
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad soyad" required />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" type="password" required />

          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
            <p className="text-sm font-black text-slate-900">Hesap türü</p>
            <div className="mt-3 grid gap-3">
              {roleOptions.map((option) => (
                <label key={option.value} className={`cursor-pointer rounded-2xl border p-4 transition ${role === option.value ? "border-orange-500 bg-white shadow-md shadow-orange-100" : "border-orange-100 bg-white/70 hover:bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" name="role" value={option.value} checked={role === option.value} onChange={() => setRole(option.value)} className="mt-1" />
                    <div>
                      <p className="font-black text-slate-950">{option.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {role === "CAMP_OWNER" && (
            <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-sm font-black text-emerald-900">Kamp alanı bilgileri</p>
              <p className="text-xs leading-5 text-emerald-800">
                Sistem yöneticisi, hesabınızı onaylamadan önce buradaki bilgileri ve fotoğrafı inceleyecek.
              </p>
              <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="Kamp adı" />
              <textarea required className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" value={campDescription} onChange={(e) => setCampDescription(e.target.value)} placeholder="Kamp alanınızı tanıtın" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input required className="rounded-2xl border border-slate-200 px-4 py-3" value={campCity} onChange={(e) => setCampCity(e.target.value)} placeholder="Şehir" />
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={campDistrict} onChange={(e) => setCampDistrict(e.target.value)} placeholder="İlçe" />
              </div>
              <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={campAddress} onChange={(e) => setCampAddress(e.target.value)} placeholder="Adres" />
              <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={campPhone} onChange={(e) => setCampPhone(e.target.value)} placeholder="Kamp iletişim telefonu" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={campTotalCapacity} onChange={(e) => setCampTotalCapacity(Number(e.target.value))} placeholder="Toplam kapasite" />
                <input required type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3" value={campCaravanCapacity} onChange={(e) => setCampCaravanCapacity(Number(e.target.value))} placeholder="Karavan kapasitesi" />
                <input type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={campTentCapacity} onChange={(e) => setCampTentCapacity(Number(e.target.value))} placeholder="Çadır kapasitesi" />
                <input type="number" min={0} className="rounded-2xl border border-slate-200 px-4 py-3" value={campPricePerNight} onChange={(e) => setCampPricePerNight(Number(e.target.value))} placeholder="Gecelik fiyat" />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-900">Kamp fotoğrafı (JPEG/PNG)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  onChange={(e) => setCampPhoto(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

          <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-teal-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-100 transition hover:from-orange-600 hover:to-teal-600 disabled:opacity-60">
            {loading ? "Hesap oluşturuluyor..." : "Kayıt ol"}
          </button>
        </form>
        )}

        <p className="mt-5 text-sm text-slate-600">
          Zaten hesabın var mı? <Link className="font-black text-orange-700" href="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
