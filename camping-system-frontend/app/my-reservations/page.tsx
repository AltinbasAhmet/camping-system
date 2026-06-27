"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CampReservation } from "@/lib/types";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function MyReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<CampReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    fetchReservations();
  }, []);

  async function fetchReservations() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<{
        success: boolean;
        data: CampReservation[];
      }>("/reservations/me");

      setReservations(response.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reservations"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950">
            My Camp Reservations
          </h1>
          <p className="mt-2 text-slate-500">
            View your camp reservation details and reservation codes.
          </p>
        </div>

        {loading && <p className="text-slate-500">Loading reservations...</p>}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">You have no reservations yet.</p>
            <Link
              href="/camps"
              className="mt-5 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800"
            >
              Browse Camps
            </Link>
          </div>
        )}

        <div className="grid gap-5">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {reservation.camp?.name}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {reservation.camp?.city}
                    {reservation.camp?.district
                      ? ` / ${reservation.camp.district}`
                      : ""}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-5 py-2 text-sm font-extrabold text-emerald-800">
                  {reservation.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Code</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {reservation.reservationCode}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Dates</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {new Date(reservation.checkInDate).toLocaleDateString()} -{" "}
                    {new Date(reservation.checkOutDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Plate</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {reservation.plateNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/60 p-4">
                  <p className="text-sm font-bold text-slate-500">Guests</p>
                  <p className="mt-1 font-extrabold text-slate-950">
                    {reservation.guestCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}