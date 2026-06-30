"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp } from "@/lib/types";

type CreateCampForm = {
  ownerId: number;
  name: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  totalCapacity: number;
  caravanCapacity: number;
  tentCapacity: number;
  pricePerNight: number;
  hasToilet: boolean;
  hasShower: boolean;
  hasHotWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  hasMarket: boolean;
  petFriendly: boolean;
};

const initialForm: CreateCampForm = {
  ownerId: 2,
  name: "",
  description: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  email: "",
  totalCapacity: 1,
  caravanCapacity: 1,
  tentCapacity: 0,
  pricePerNight: 0,
  hasToilet: false,
  hasShower: false,
  hasHotWater: false,
  hasElectricity: false,
  hasWifi: false,
  hasMarket: false,
  petFriendly: false,
};

export default function AdminCampsPage() {
  const router = useRouter();

  const [camps, setCamps] = useState<Camp[]>([]);
  const [form, setForm] = useState<CreateCampForm>(initialForm);
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

    fetchCamps();
  }, []);

  async function fetchCamps() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: Camp[];
      }>("/camps", { auth: false });

      setCamps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camps");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof CreateCampForm>(
    field: K,
    value: CreateCampForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateCamp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!form.ownerId) {
        throw new Error("Owner ID is required.");
      }

      if (!form.name.trim()) {
        throw new Error("Camp name is required.");
      }

      if (!form.description.trim()) {
        throw new Error("Description is required.");
      }

      if (!form.city.trim()) {
        throw new Error("City is required.");
      }

      if (!form.address.trim()) {
        throw new Error("Address is required.");
      }

      if (!form.phone.trim()) {
        throw new Error("Phone is required.");
      }

      await apiRequest("/camps/admin/create", {
        method: "POST",
        body: JSON.stringify({
          ownerId: Number(form.ownerId),
          name: form.name,
          description: form.description,
          city: form.city,
          district: form.district || undefined,
          address: form.address,
          phone: form.phone,
          email: form.email || undefined,
          totalCapacity: Number(form.totalCapacity),
          caravanCapacity: Number(form.caravanCapacity),
          tentCapacity: Number(form.tentCapacity),
          pricePerNight: Number(form.pricePerNight),
          hasToilet: form.hasToilet,
          hasShower: form.hasShower,
          hasHotWater: form.hasHotWater,
          hasElectricity: form.hasElectricity,
          hasWifi: form.hasWifi,
          hasMarket: form.hasMarket,
          petFriendly: form.petFriendly,
        }),
      });

      setSuccess("Camp created successfully.");
      setForm(initialForm);
      setShowForm(false);
      fetchCamps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create camp");
    } finally {
      setSubmitting(false);
    }
  }

  const facilityFields: {
    key: keyof CreateCampForm;
    label: string;
  }[] = [
    { key: "hasToilet", label: "Toilet" },
    { key: "hasShower", label: "Shower" },
    { key: "hasHotWater", label: "Hot Water" },
    { key: "hasElectricity", label: "Electricity" },
    { key: "hasWifi", label: "Wi-Fi" },
    { key: "hasMarket", label: "Market" },
    { key: "petFriendly", label: "Pet Friendly" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Admin Camps
            </h1>
            <p className="mt-2 text-slate-500">
              Create and review camps on the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((previous) => !previous)}
            className="rounded-full bg-emerald-700 px-6 py-3 font-extrabold text-white hover:bg-emerald-800"
          >
            {showForm ? "Close Form" : "Create Camp"}
          </button>
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
              Create New Camp
            </h2>

            <p className="mt-2 text-slate-500">
              For now, enter the owner user ID manually. Later we can add an
              owner selector.
            </p>

            <form onSubmit={handleCreateCamp} className="mt-8 space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Owner ID
                  </label>
                  <input
                    type="number"
                    value={form.ownerId}
                    onChange={(event) =>
                      updateField("ownerId", Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block font-bold text-slate-700">
                    Camp Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Mersin Sahil Karavan Kampı"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={4}
                  placeholder="Camp description"
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    placeholder="Mersin"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    District
                  </label>
                  <input
                    value={form.district}
                    onChange={(event) =>
                      updateField("district", event.target.value)
                    }
                    placeholder="Erdemli"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Address
                  </label>
                  <input
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="Erdemli sahil yolu"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="05555555555"
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
                    placeholder="camp@example.com"
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Price Per Night
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.pricePerNight}
                    onChange={(event) =>
                      updateField("pricePerNight", Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalCapacity}
                    onChange={(event) =>
                      updateField("totalCapacity", Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Caravan Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.caravanCapacity}
                    onChange={(event) =>
                      updateField("caravanCapacity", Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Tent Capacity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.tentCapacity}
                    onChange={(event) =>
                      updateField("tentCapacity", Number(event.target.value))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 font-bold text-slate-700">Facilities</p>

                <div className="grid gap-3 md:grid-cols-3">
                  {facilityFields.map((field) => (
                    <label
                      key={field.key}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 font-bold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form[field.key])}
                        onChange={(event) =>
                          updateField(field.key, event.target.checked as never)
                        }
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Creating camp..." : "Create Camp"}
              </button>
            </form>
          </section>
        )}

        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Existing Active Camps
          </h2>

          {loading && <p className="mt-5 text-slate-500">Loading camps...</p>}

          {!loading && camps.length === 0 && (
            <p className="mt-5 text-slate-500">No active camps found.</p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {camps.map((camp) => (
              <div
                key={camp.id}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">
                      {camp.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {camp.city}
                      {camp.district ? ` / ${camp.district}` : ""}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-emerald-800">
                    {camp.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">Owner ID</p>
                    <p className="mt-1 font-extrabold text-slate-950">
                      {camp.ownerId}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">Capacity</p>
                    <p className="mt-1 font-extrabold text-slate-950">
                      {camp.totalCapacity}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">Price</p>
                    <p className="mt-1 font-extrabold text-slate-950">
                      ₺{camp.pricePerNight || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/camps/${camp.id}`}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}