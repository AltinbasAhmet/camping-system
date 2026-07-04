"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!name.trim()) {
        throw new Error("Name is required.");
      }

      if (!email.trim() && !phone.trim()) {
        throw new Error("Email or phone is required.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const response = await apiRequest<{
        success: boolean;
        message: string;
        token: string;
        user: {
          id: number;
          name: string;
          email?: string | null;
          phone?: string | null;
          role: "USER" | "CAMP_OWNER" | "SYSTEM_ADMIN" | "STAFF";
        };
      }>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          password,
        }),
      });

      saveAuth(response.token, response.user);
      router.push("/camps");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-12">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/60">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-950">
              Create Account
            </h1>

            <p className="mt-2 text-slate-500">
              Sign up as a camper and start making reservations.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Full Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Test User"
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Phone
              </label>

              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="05555555555"
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="123456"
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-emerald-700">
              Login
            </Link>
          </p>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            Camp owner accounts are created by the system admin. This sign up
            page is only for regular campers.
          </div>
        </section>
      </div>
    </main>
  );
}