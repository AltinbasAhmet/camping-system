"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!currentPassword.trim()) {
        throw new Error("Current password is required.");
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }

      if (newPassword !== newPasswordAgain) {
        throw new Error("New passwords do not match.");
      }

      await apiRequest("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordAgain("");
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <Link
          href="/camps"
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back
        </Link>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Change Password
          </h1>

          <p className="mt-2 text-slate-500">
            Update your account password.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                New Password Again
              </label>

              <input
                type="password"
                value={newPasswordAgain}
                onChange={(event) => setNewPasswordAgain(event.target.value)}
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Changing password..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}