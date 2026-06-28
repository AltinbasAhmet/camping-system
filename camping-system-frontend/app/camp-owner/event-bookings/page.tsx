"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp, EventBooking } from "@/lib/types";

export default function OwnerEventBookingsPage() {
  const router = useRouter();

  const [camps, setCamps] = useState<Camp[]>([]);
  const [selectedCampId, setSelectedCampId] = useState("");
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError("");

      const campsResponse = await apiRequest<{
        success: boolean;
        data: Camp[];
      }>("/camps/owner/my-camps");

      setCamps(campsResponse.data || []);

      const bookingsResponse = await apiRequest<{
        success: boolean;
        data: EventBooking[];
      }>("/event-bookings/owner");

      setBookings(bookingsResponse.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookings(campId: string) {
    try {
      setLoading(true);
      setError("");

      const path = campId
        ? `/event-bookings/owner?campId=${campId}`
        : "/event-bookings/owner";

      const response = await apiRequest<{
        success: boolean;
        data: EventBooking[];
      }>(path);

      setBookings(response.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCampChange(value: string) {
    setSelectedCampId(value);
    fetchBookings(value);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Event Bookings
            </h1>
            <p className="mt-2 text-slate-500">
              View event bookings made for your camp events.
            </p>
          </div>

          <Link
            href="/camp-owner/dashboard"
            className="rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block font-bold text-slate-700">
            Filter by Camp
          </label>

          <select
            value={selectedCampId}
            onChange={(event) => handleCampChange(event.target.value)}
            className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400 md:max-w-md"
          >
            <option value="">All camps</option>

            {camps.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>
        </section>

        {loading && <p className="text-slate-500">Loading event bookings...</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">No event bookings found.</p>
          </div>
        )}

        <div className="grid gap-5">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {booking.event?.title}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {booking.event?.camp?.name} — {booking.event?.camp?.city}
                    {booking.event?.camp?.district
                      ? ` / ${booking.event.camp.district}`
                      : ""}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-5 py-2 text-sm font-extrabold text-emerald-800">
                  {booking.guestCount} guest
                  {booking.guestCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">User</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {(booking as any).user?.name || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Event Date</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(booking.event.dateTime).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Price</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    ₺{booking.event.price}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Booked At</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(booking.bookedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Link
                href={`/camp-events/${booking.event.id}`}
                className="mt-6 inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
              >
                View Public Event Page
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}