"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { saveAuth, type User } from "@/lib/auth";
import OtpVerifyForm from "@/components/OtpVerifyForm";
import { useLanguage } from "@/lib/i18n";

type LoginResponse = {
  success: boolean;
  message: string;
  otpRequired: boolean;
  purpose: "REGISTER" | "LOGIN";
  userId?: number;
  token?: string;
  user?: User;
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [notificationChannel, setNotificationChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<{ userId: number; message: string } | null>(null);
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (notificationChannel === "EMAIL" && !identifier.includes("@")) {
        throw new Error("E-posta ile kod almak için e-posta adresinizle giriş yapın.");
      }
      if (notificationChannel === "SMS" && identifier.includes("@")) {
        throw new Error("SMS ile kod almak için telefon numaranızla giriş yapın.");
      }

      const body = identifier.includes("@")
        ? { email: identifier, password, notificationChannel }
        : { phone: identifier, password, notificationChannel };
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      });
      if (!data.otpRequired && data.token && data.user) {
        handleVerified({ token: data.token, pendingApproval: false, user: data.user });
      } else if (data.userId) {
        setOtpStep({ userId: data.userId, message: data.message });
      } else {
        throw new Error("Giriş yanıtı geçersiz");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }

  function handleVerified(result: { token: string | null; pendingApproval: boolean; user: User }) {
    if (result.pendingApproval || !result.token) {
      setOtpStep(null);
      setPendingApprovalMessage("Hesabınız sistem yöneticisi onayını bekliyor. Onaylandığında giriş yapabileceksiniz.");
      return;
    }

    saveAuth(result.token, result.user);
    if (result.user.role === "CAMP_OWNER") router.push("/owner/dashboard");
    else if (result.user.role === "SYSTEM_ADMIN") router.push("/admin/dashboard");
    else if (result.user.role === "STAFF") router.push("/staff/dashboard");
    else router.push("/camps");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.35),transparent_32%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.28),transparent_32%),linear-gradient(180deg,#fff7ed,#ecfeff)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100/70 backdrop-blur">
        <Link href="/" className="mb-6 inline-flex text-sm font-black text-orange-600 hover:text-orange-800">{t("← Ana sayfaya dön")}</Link>
        <h1 className="text-3xl font-black text-slate-950">{t("Giriş yap")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("E-posta veya telefon ile giriş yapabilirsin.")}</p>

        {pendingApprovalMessage ? (
          <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">{pendingApprovalMessage}</p>
        ) : otpStep ? (
          <div className="mt-8">
            <OtpVerifyForm userId={otpStep.userId} notificationChannel={notificationChannel} infoMessage={otpStep.message} onVerified={handleVerified} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t("E-posta veya telefon")} />
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("Şifre")} type="password" />
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-black text-slate-900">{t("Doğrulama kodu nereye gelsin?")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold ${notificationChannel === "EMAIL" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-slate-200"}`}>
                <input className="sr-only" type="radio" name="notificationChannel" checked={notificationChannel === "EMAIL"} onChange={() => setNotificationChannel("EMAIL")} />
                {t("E-posta")}
              </label>
              <label className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold ${notificationChannel === "SMS" ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200"}`}>
                <input className="sr-only" type="radio" name="notificationChannel" checked={notificationChannel === "SMS"} onChange={() => setNotificationChannel("SMS")} />
                {t("SMS")}
              </label>
            </div>
          </div>
          {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-teal-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-100 hover:from-orange-600 hover:to-teal-600 disabled:opacity-60">
            {loading ? t("Giriş yapılıyor...") : t("Giriş yap")}
          </button>
          <div className="text-right">
            <Link className="text-sm font-bold text-emerald-700 hover:text-emerald-900" href="/forgot-password">{t("Şifremi unuttum")}</Link>
          </div>
        </form>
        )}

        <p className="mt-5 text-sm text-slate-600">
          {t("Hesabın yok mu?")} <Link className="font-bold text-orange-700" href="/register">{t("Kayıt ol")}</Link>
        </p>
      </div>
    </div>
  );
}
