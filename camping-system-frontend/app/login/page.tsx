"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { saveAuth, User } from "@/lib/auth";
import { useRouter } from "next/navigation";

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: User;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      saveAuth(data.token, data.user);

      if (data.user.role === "ORGANISER") {
        router.push("/organiser/dashboard");
      } else {
        router.push("/events");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 px-5 py-12">
      <div className="w-full max-w-xl rounded-[32px] border border-blue-100 bg-white/85 p-8 shadow-xl shadow-blue-100/60 backdrop-blur">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          Login
        </h1>

        {error && (
          <p className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-blue-100 bg-blue-50/30 px-6 py-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-blue-100 bg-blue-50/30 px-6 py-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 py-5 text-lg font-bold text-white shadow-lg shadow-blue-200/70 transition hover:from-blue-800 hover:to-sky-600 hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-700 transition hover:text-blue-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}