"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { User } from "@/lib/auth";

type VerifyOtpResponse = {
  success: boolean;
  message: string;
  pendingApproval: boolean;
  token: string | null;
  user: User;
};

type ResendOtpResponse = {
  success: boolean;
  message: string;
};

export default function OtpVerifyForm({
  userId,
  notificationChannel,
  infoMessage,
  onVerified,
}: {
  userId: number;
  notificationChannel: "EMAIL" | "SMS";
  infoMessage?: string;
  onVerified: (result: { token: string | null; pendingApproval: boolean; user: User }) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ userId, code }),
        auth: false,
      });
      onVerified({ token: data.token, pendingApproval: data.pendingApproval, user: data.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod doğrulanamadı");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    setError("");
    setResendMessage("");
    try {
      const data = await apiRequest<ResendOtpResponse>("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ userId, notificationChannel }),
        auth: false,
      });
      setResendMessage(data.message || "Yeni kod gönderildi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod tekrar gönderilemedi");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
      <p className="text-lg font-black text-emerald-900">Doğrulama kodu gerekli</p>
      <p className="mt-2 text-sm leading-6 text-emerald-800">
        {infoMessage || `${notificationChannel === "SMS" ? "Telefonunuza SMS ile" : "E-posta adresinize"} gönderilen 6 haneli kodu girin.`}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          required
          inputMode="numeric"
          maxLength={8}
          className="w-full rounded-2xl border border-emerald-200 px-4 py-3 text-center text-2xl font-black tracking-[0.3em]"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="••••••"
        />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {resendMessage && <p className="rounded-xl bg-white p-3 text-sm font-semibold text-emerald-700">{resendMessage}</p>}
        <button disabled={loading} className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800 disabled:opacity-50">
          {loading ? "Doğrulanıyor..." : "Kodu doğrula"}
        </button>
        <button
          type="button"
          onClick={resendCode}
          disabled={resending}
          className="w-full rounded-2xl bg-white px-4 py-3 font-bold text-emerald-800 ring-1 ring-emerald-200 disabled:opacity-50"
        >
          {resending ? "Gönderiliyor..." : "Kodu tekrar gönder"}
        </button>
      </form>
    </div>
  );
}
