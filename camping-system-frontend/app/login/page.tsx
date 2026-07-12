"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { saveAuth, type User } from "@/lib/auth";

type LoginResponse = { success: boolean; token: string; user: User; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = identifier.includes("@")
        ? { email: identifier, password }
        : { phone: identifier, password };
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      });
      saveAuth(data.token, data.user);
      if (data.user.role === "CAMP_OWNER") router.push("/owner/dashboard");
      else if (data.user.role === "SYSTEM_ADMIN") router.push("/admin/dashboard");
      else router.push("/camps");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.28),transparent_32%),linear-gradient(180deg,#fff7ed,#ecfeff)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100/70 backdrop-blur">
        <Link href="/" className="mb-6 inline-flex text-sm font-black text-orange-600 hover:text-orange-800">← Ana sayfaya dön</Link>
        <h1 className="text-3xl font-black text-slate-950">Giriş yap</h1>
        <p className="mt-2 text-sm text-slate-600">E-posta veya telefon ile giriş yapabilirsin.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="E-posta veya telefon" />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" type="password" />
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-teal-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-100 hover:from-orange-600 hover:to-teal-600 disabled:opacity-60">
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Hesabın yok mu? <Link className="font-bold text-orange-700" href="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}
