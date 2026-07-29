"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";

type ForgotResponse = { success: boolean; userId: number; message: string };

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [step, setStep] = useState<{ userId: number; message: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const body = identifier.includes("@") ? { email: identifier, notificationChannel: channel } : { phone: identifier, notificationChannel: channel };
      const response = await apiRequest<ForgotResponse>("/auth/forgot-password", { method: "POST", body: JSON.stringify(body), auth: false });
      setStep({ userId: response.userId, message: response.message });
    } catch (err) { setError(err instanceof Error ? err.message : "Kod gönderilemedi"); }
    finally { setLoading(false); }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (!step) return;
    setLoading(true); setError("");
    try {
      const response = await apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ userId: step.userId, code, password }), auth: false });
      setMessage(response.message);
      setStep(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Şifre yenilenemedi"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-xl">
        <Link href="/login" className="text-sm font-black text-emerald-700">← Girişe dön</Link>
        <h1 className="mt-5 text-3xl font-black text-slate-950">Şifremi unuttum</h1>
        <p className="mt-2 text-sm text-slate-600">Kayıtlı iletişim bilginize tek kullanımlık kod gönderelim.</p>
        {message ? <div className="mt-6 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">{message} <Link href="/login" className="underline">Giriş yap</Link></div> : step ? (
          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <p className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-800">{step.message}</p>
            <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Doğrulama kodu" />
            <input required minLength={6} type="password" className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Yeni şifre" />
            <button disabled={loading} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">Şifreyi yenile</button>
          </form>
        ) : (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <input required className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="E-posta veya telefon" />
            <div className="grid grid-cols-2 gap-3">{(["EMAIL", "SMS"] as const).map((item) => <label key={item} className={`cursor-pointer rounded-2xl border p-3 text-center text-sm font-black ${channel === item ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}><input className="sr-only" type="radio" checked={channel === item} onChange={() => setChannel(item)} />{item === "EMAIL" ? "E-posta" : "SMS"}</label>)}</div>
            <button disabled={loading} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white disabled:opacity-50">Kod gönder</button>
          </form>
        )}
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>
    </div>
  );
}
