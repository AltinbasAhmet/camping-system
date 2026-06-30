"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp } from "@/lib/types";

type CampForm = {
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

const emptyForm: CampForm = {
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

export default function OwnerEditCampPage() {
  const params = useParams();
  const router = useRouter();

  const campId = params.id as string;

  const [camp, setCamp] = useState<Camp | null>(null);
  const [form, setForm] = useState<CampForm>(emptyForm);

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

    if (user.role !== "CAMP_OWNER") {
      router.push("/camps");
      return;
    }

    fetchCamp();
  }, [campId]);

  async function fetchCamp() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{ success: boolean; data: Camp }>(
        `/camps/${campId}`,
        { auth: false }
      );

      const campData = response.data;

      setCamp(campData);
      setForm({
        name: campData.name || "",
        description: campData.description || "",
        city: campData.city || "",
        district: campData.district || "",
        address: campData.address || "",
        phone: campData.phone || "",
        email: campData.email || "",
        totalCapacity: campData.totalCapacity || 1,
        caravanCapacity: campData.caravanCapacity || 1,
        tentCapacity: campData.tentCapacity || 0,
        pricePerNight: campData.pricePerNight || 0,
        hasToilet: campData.hasToilet,
        hasShower: campData.hasShower,
        hasHotWater: campData.hasHotWater,
        hasElectricity: campData.hasElectricity,
        hasWifi: campData.hasWifi,
        hasMarket: campData.hasMarket,
        petFriendly: campData.petFriendly,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camp");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof CampForm>(field: K, value: CampForm[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

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

      await apiRequest(`/camps/owner/${campId}`, {
        method: "PUT",
        body: JSON.stringify({
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

      setSuccess("Camp updated successfully.");

      setTimeout(() => {
        router.push("/camp-owner/dashboard");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update camp");
    } finally {
      setSubmitting(false);
    }
  }

  const facilityFields: {
    key: keyof CampForm;
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

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <p className="text-slate-500">Loading camp...</p>
      </main>
    );
  }

  if (!camp) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "Camp not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/camp-owner/dashboard"
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back to dashboard
        </Link>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-950">
              Edit Camp
            </h1>
            <p className="mt-2 text-slate-500">
              Update details for {camp.name}.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Camp Name
              </label>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
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
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
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
              {submitting ? "Updating camp..." : "Update Camp"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}