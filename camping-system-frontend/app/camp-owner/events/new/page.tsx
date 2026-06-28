"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp } from "@/lib/types";

export default function CreateCampEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedCampId = searchParams.get("campId");

  const [camps, setCamps] = useState<Camp[]>([]);
  const [campId, setCampId] = useState(preselectedCampId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState(0);

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

    fetchMyCamps();
  }, []);

  async function fetchMyCamps() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: Camp[];
      }>("/camps/owner/my-camps");

      setCamps(response.data || []);

      if (!preselectedCampId && response.data?.length > 0) {
        setCampId(String(response.data[0].id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camps");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!campId) {
        throw new Error("Please select a camp.");
      }

      if (!title.trim()) {
        throw new Error("Title is required.");
      }

      if (!description.trim()) {
        throw new Error("Description is required.");
      }

      if (!dateTime) {
        throw new Error("Date and time is required.");
      }

      await apiRequest("/camp-events", {
        method: "POST",
        body: JSON.stringify({
          campId: Number(campId),
          title,
          description,
          dateTime: new Date(dateTime).toISOString(),
          capacity,
          price,
        }),
      });

      setSuccess("Camp event created successfully.");

      setTimeout(() => {
        router.push("/camp-owner/dashboard");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/camp-owner/dashboard"
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back to dashboard
        </Link>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-950">
              Create Camp Event
            </h1>
            <p className="mt-2 text-slate-500">
              Add a new event for one of your camps.
            </p>
          </div>

          {loading && <p className="text-slate-500">Loading camps...</p>}

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

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Camp
                </label>

                <select
                  value={campId}
                  onChange={(event) => setCampId(event.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                >
                  {camps.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Event Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Canlı Müzik Gecesi"
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Event description"
                  rows={5}
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(event) => setDateTime(event.target.value)}
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(event) =>
                      setCapacity(Math.max(1, Number(event.target.value)))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Price
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(event) =>
                      setPrice(Math.max(0, Number(event.target.value)))
                    }
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Creating event..." : "Create Event"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}