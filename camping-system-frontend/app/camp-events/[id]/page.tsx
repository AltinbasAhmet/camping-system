"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CampEvent } from "@/lib/types";
import { getUser } from "@/lib/auth";

type CampEventDetail = CampEvent & {
  camp: {
    id: number;
    name: string;
    city: string;
    district?: string | null;
    address: string;
  };
  ticketsSold: number;
  remainingCapacity: number;
};

export default function CampEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<CampEventDetail | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: CampEventDetail;
      }>(`/camp-events/${eventId}`, { auth: false });

      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking() {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const user = getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "USER") {
        throw new Error("Only users can book camp events.");
      }

      await apiRequest("/event-bookings", {
        method: "POST",
        body: JSON.stringify({
          eventId: Number(eventId),
          guestCount,
        }),
      });

      setSuccess("Event booking created successfully.");

      setTimeout(() => {
        router.push("/my-event-bookings");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Event booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <p className="text-slate-500">Loading event...</p>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href={`/camps/${event.camp.id}`}
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back to camp
        </Link>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-5 py-2 text-sm font-extrabold text-emerald-800">
                Camp Event
              </div>

              <h1 className="text-4xl font-extrabold text-slate-950">
                {event.title}
              </h1>

              <p className="mt-3 text-lg font-medium text-slate-500">
                {event.camp.name} — {event.camp.city}
                {event.camp.district ? ` / ${event.camp.district}` : ""}
              </p>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                {event.description}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-slate-500">Date</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(event.dateTime).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-slate-500">Price</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    ₺{event.price}
                  </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-slate-500">Capacity</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {event.remainingCapacity} left / {event.capacity}
                  </p>
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Book this event
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose how many people will attend.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 text-emerald-700">
                  {success}
                </div>
              )}

              <div className="mt-6">
                <label className="mb-2 block font-bold text-slate-700">
                  Guest Count
                </label>

                <input
                  type="number"
                  min={1}
                  max={event.remainingCapacity}
                  value={guestCount}
                  onChange={(e) =>
                    setGuestCount(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <button
                onClick={handleBooking}
                disabled={submitting || event.remainingCapacity <= 0}
                className="mt-6 w-full rounded-2xl bg-emerald-700 px-6 py-4 font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Booking..." : "Book Event"}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}