"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp, CampReservation, EventBooking } from "@/lib/types";

export default function CampOwnerDashboardPage() {
  const router = useRouter();

  const [camps, setCamps] = useState<Camp[]>([]);
  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
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

    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [campsResponse, reservationsResponse, eventBookingsResponse] =
        await Promise.all([
          apiRequest<{ success: boolean; data: Camp[] }>(
            "/camps/owner/my-camps"
          ),
          apiRequest<{ success: boolean; data: CampReservation[] }>(
            "/reservations/owner"
          ),
          apiRequest<{ success: boolean; data: EventBooking[] }>(
            "/event-bookings/owner"
          ),
        ]);

      setCamps(campsResponse.data || []);
      setReservations(reservationsResponse.data || []);
      setEventBookings(eventBookingsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const totalReservations = reservations.length;
  const totalEventBookings = eventBookings.length;
  const totalCamps = camps.length;
  const activeCamps = camps.filter((camp) => camp.status === "ACTIVE").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Camp Owner Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your camps, reservations, events and check-ins.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/camp-owner/camps/new"
              className="rounded-full border border-emerald-200 bg-white px-6 py-3 font-extrabold text-emerald-700 hover:bg-emerald-50"
            >
              Create Camp
            </Link>
            
            <Link
              href="/camp-owner/events/new"
              className="rounded-full bg-emerald-700 px-6 py-3 font-extrabold text-white hover:bg-emerald-800"
            >
              Create Event
            </Link>

            <Link
              href="/camp-owner/checkin"
              className="rounded-full border border-emerald-200 bg-white px-6 py-3 font-extrabold text-emerald-700 hover:bg-emerald-50"
            >
              Check-in
            </Link>
          </div>
        </div>

        {loading && <p className="text-slate-500">Loading dashboard...</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-5 md:grid-cols-4">
              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Total Camps</p>
                <p className="mt-2 text-4xl font-extrabold text-slate-950">
                  {totalCamps}
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Active Camps</p>
                <p className="mt-2 text-4xl font-extrabold text-slate-950">
                  {activeCamps}
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Camp Reservations
                </p>
                <p className="mt-2 text-4xl font-extrabold text-slate-950">
                  {totalReservations}
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Event Bookings
                </p>
                <p className="mt-2 text-4xl font-extrabold text-slate-950">
                  {totalEventBookings}
                </p>
              </div>
            </section>

            <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  My Camps
                </h2>
              </div>

              {camps.length === 0 ? (
                <p className="mt-5 text-slate-500">No camps found.</p>
              ) : (
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
                          <p className="text-xs font-bold text-slate-500">
                            Capacity
                          </p>
                          <p className="mt-1 font-extrabold text-slate-950">
                            {camp.totalCapacity}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-bold text-slate-500">
                            Events
                          </p>
                          <p className="mt-1 font-extrabold text-slate-950">
                            {camp.events?.length || 0}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-bold text-slate-500">
                            Reservations
                          </p>
                          <p className="mt-1 font-extrabold text-slate-950">
                            {camp.reservations?.length || 0}
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

                        <Link
                          href={`/camp-owner/events/new?campId=${camp.id}`}
                          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
                        >
                          Add Event
                        </Link>
                        
                        <Link
                          href={`/camp-owner/camps/${camp.id}/photos`}
                          className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          Manage Photos
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    Recent Camp Reservations
                  </h2>

                  <Link
                    href="/camp-owner/reservations"
                    className="text-sm font-extrabold text-emerald-700"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="rounded-2xl bg-emerald-50/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-extrabold text-slate-950">
                            {reservation.camp?.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {reservation.plateNumber} ·{" "}
                            {reservation.guestCount} guests
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-emerald-800">
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {reservations.length === 0 && (
                    <p className="text-slate-500">No reservations yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    Recent Event Bookings
                  </h2>

                  <Link
                    href="/camp-owner/event-bookings"
                    className="text-sm font-extrabold text-emerald-700"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {eventBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl bg-emerald-50/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-extrabold text-slate-950">
                            {booking.event?.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {booking.event?.camp?.name} · {booking.guestCount}{" "}
                            guests
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-emerald-800">
                          Event
                        </span>
                      </div>
                    </div>
                  ))}

                  {eventBookings.length === 0 && (
                    <p className="text-slate-500">No event bookings yet.</p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}