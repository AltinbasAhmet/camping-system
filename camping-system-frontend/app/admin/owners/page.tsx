"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { CampOwner } from "@/lib/types";

type OwnerForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

const initialForm: OwnerForm = {
  name: "",
  email: "",
  phone: "",
  password: "owner123",
};

export default function AdminOwnersPage() {
  const router = useRouter();

  const [owners, setOwners] = useState<CampOwner[]>([]);
  const [form, setForm] = useState<OwnerForm>(initialForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "SYSTEM_ADMIN") {
      router.push("/camps");
      return;
    }

    fetchOwners();
  }, []);

  async function fetchOwners() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: CampOwner[];
      }>("/admin/owners");

      setOwners(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load owners");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof OwnerForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateOwner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error("Owner name is required.");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required.");
      }

      if (!form.password.trim()) {
        throw new Error("Password is required.");
      }

      await apiRequest("/admin/owners", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });

      setSuccess("Camp owner account created successfully.");
      setForm(initialForm);
      setShowForm(false);
      fetchOwners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create owner");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Camp Owners
            </h1>
            <p className="mt-2 text-slate-500">
              Create camp owner accounts and review their camps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/camps"
              className="rounded-full border border-emerald-200 bg-white px-5 py-3 font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Admin Camps
            </Link>

            <button
              type="button"
              onClick={() => setShowForm((previous) => !previous)}
              className="rounded-full bg-emerald-700 px-6 py-3 font-extrabold text-white hover:bg-emerald-800"
            >
              {showForm ? "Close Form" : "Create Owner"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
            {success}
          </div>
        )}

        {showForm && (
          <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Create Camp Owner
            </h2>

            <p className="mt-2 text-slate-500">
              Create login credentials for a camp business.
            </p>

            <form onSubmit={handleCreateOwner} className="mt-8 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Owner / Business Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Adana Karavan İşletmesi"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Email
                  </label>

                  <input
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="owner@example.com"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="05551112233"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Temporary Password
                  </label>

                  <input
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="owner123"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Creating owner..." : "Create Owner Account"}
              </button>
            </form>
          </section>
        )}

        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Existing Camp Owners
          </h2>

          {loading && <p className="mt-5 text-slate-500">Loading owners...</p>}

          {!loading && owners.length === 0 && (
            <p className="mt-5 text-slate-500">No camp owners found.</p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {owners.map((owner) => (
              <div
                key={owner.id}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">
                      {owner.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {owner.email}
                    </p>

                    {owner.phone && (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {owner.phone}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-emerald-800">
                    ID: {owner.id}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <p className="text-sm font-bold text-slate-500">
                    Owned Camps
                  </p>

                  {owner.ownedCamps && owner.ownedCamps.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {owner.ownedCamps.map((camp) => (
                        <div
                          key={camp.id}
                          className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"
                        >
                          <span className="font-bold text-slate-700">
                            {camp.name}
                          </span>

                          <span className="text-xs font-extrabold text-emerald-700">
                            {camp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-slate-500">
                      No camps assigned yet.
                    </p>
                  )}
                </div>

                <Link
                  href={`/admin/camps`}
                  className="mt-5 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  Create Camp for Owner
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}