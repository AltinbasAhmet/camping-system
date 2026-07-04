"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";

type CheckinGuest = {
  id: number;
  fullName: string;
  nationalIdMasked?: string | null;
};

type CheckinReservation = {
  id: number;
  campId: number;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  plateNumber: string;
  guestCount: number;
  reservationCode: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT";
  camp: {
    id: number;
    name: string;
    city: string;
    district?: string | null;
    address: string;
  };
  user: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  guests: CheckinGuest[];
};

export default function CampOwnerCheckinPage() {
  const router = useRouter();

  const [plateNumber, setPlateNumber] = useState("");
  const [reservationCode, setReservationCode] = useState("");

  const [reservation, setReservation] = useState<CheckinReservation | null>(
    null
  );

  const [reservationResults, setReservationResults] = useState<
    CheckinReservation[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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
  }, [router]);

  async function searchByPlate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setReservation(null);
      setReservationResults([]);

      if (!plateNumber.trim()) {
        throw new Error("Please enter a plate number.");
      }

      const response = await apiRequest<{
        success: boolean;
        data: CheckinReservation[];
      }>("/checkin/search-by-plate", {
        method: "POST",
        body: JSON.stringify({
          plateNumber: plateNumber.trim(),
        }),
      });

      const results = response.data || [];

      setReservationResults(results);

      if (results.length === 1) {
        setReservation(results[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation search failed");
    } finally {
      setLoading(false);
    }
  }

  async function searchByCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setReservation(null);
      setReservationResults([]);

      if (!reservationCode.trim()) {
        throw new Error("Please enter a reservation code.");
      }

      const response = await apiRequest<{
        success: boolean;
        data: CheckinReservation;
      }>("/checkin/search-by-code", {
        method: "POST",
        body: JSON.stringify({
          reservationCode: reservationCode.trim(),
        }),
      });

      setReservationResults([]);
      setReservation(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation search failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCheckIn() {
    if (!reservation) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: CheckinReservation;
      }>(`/checkin/${reservation.id}/confirm`, {
        method: "POST",
      });

      setReservation(response.data);

      setReservationResults((previous) =>
        previous.map((item) =>
          item.id === response.data.id ? response.data : item
        )
      );

      setSuccess(response.message || "Check-in completed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmCheckOut() {
    if (!reservation) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: CheckinReservation;
      }>(`/checkin/${reservation.id}/checkout`, {
        method: "POST",
      });

      setReservation(response.data);

      setReservationResults((previous) =>
        previous.map((item) =>
          item.id === response.data.id ? response.data : item
        )
      );

      setSuccess(response.message || "Check-out completed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    if (status === "CONFIRMED") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "CHECKED_IN") {
      return "bg-emerald-50 text-emerald-800";
    }

    if (status === "CHECKED_OUT") {
      return "bg-slate-100 text-slate-700";
    }

    if (status === "CANCELLED") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Check-in / Check-out
            </h1>

            <p className="mt-2 text-slate-500">
              Search reservations by vehicle plate or reservation code.
            </p>
          </div>

          <Link
            href="/camp-owner/dashboard"
            className="rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <form onSubmit={searchByPlate} className="space-y-4">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Search by Plate Number
                </label>

                <input
                  value={plateNumber}
                  onChange={(event) => setPlateNumber(event.target.value)}
                  placeholder="01ABC123"
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 uppercase outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-700 px-8 py-3 font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Searching..." : "Search Plate"}
              </button>
            </form>

            <form onSubmit={searchByCode} className="space-y-4">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Search by Reservation Code
                </label>

                <input
                  value={reservationCode}
                  onChange={(event) => setReservationCode(event.target.value)}
                  placeholder="RES-323985"
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 uppercase outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border border-emerald-200 bg-white px-8 py-3 font-extrabold text-emerald-700 shadow-sm hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {loading ? "Searching..." : "Search Code"}
              </button>
            </form>
          </div>
        </section>

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

        {!reservation && reservationResults.length === 0 && !loading && (
          <section className="rounded-[32px] border border-emerald-100 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Enter a plate number or reservation code to find a reservation.
            </p>
          </section>
        )}

        {reservationResults.length > 1 && (
          <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Reservation Results
            </h2>

            <p className="mt-2 text-slate-500">
              Multiple reservations found for this plate. Select the correct
              reservation.
            </p>

            <div className="mt-6 grid gap-4">
              {reservationResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReservation(item);
                    setError("");
                    setSuccess("");
                  }}
                  className={`rounded-3xl border p-5 text-left transition ${
                    reservation?.id === item.id
                      ? "border-emerald-400 bg-emerald-100"
                      : "border-emerald-100 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950">
                        {item.camp.name}
                      </h3>

                      <p className="mt-1 font-bold text-slate-500">
                        Code: {item.reservationCode}
                      </p>

                      <p className="mt-1 text-slate-500">
                        {new Date(item.checkInDate).toLocaleDateString()} -{" "}
                        {new Date(item.checkOutDate).toLocaleDateString()}
                      </p>

                      <p className="mt-1 text-slate-500">
                        Plate: {item.plateNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-extrabold ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                      <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-700">
                        {item.guestCount} guest
                        {item.guestCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {reservation && (
          <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-950">
                  {reservation.camp.name}
                </h2>

                <p className="mt-2 text-slate-500">
                  {reservation.camp.city}
                  {reservation.camp.district
                    ? ` / ${reservation.camp.district}`
                    : ""}{" "}
                  — {reservation.camp.address}
                </p>

                <p className="mt-2 font-bold text-slate-500">
                  Reservation Code:{" "}
                  <span className="text-slate-950">
                    {reservation.reservationCode}
                  </span>
                </p>
              </div>

              <span
                className={`rounded-full px-5 py-2 text-sm font-extrabold ${getStatusStyle(
                  reservation.status
                )}`}
              >
                {reservation.status}
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-slate-500">Plate</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">
                  {reservation.plateNumber}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-slate-500">Dates</p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {new Date(reservation.checkInDate).toLocaleDateString()} -{" "}
                  {new Date(reservation.checkOutDate).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-slate-500">Guests</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">
                  {reservation.guestCount}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 p-5">
                <p className="text-sm font-bold text-slate-500">Booked By</p>
                <p className="mt-1 font-extrabold text-slate-950">
                  {reservation.user?.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-emerald-50/70 p-6">
              <h3 className="text-2xl font-extrabold text-slate-950">
                Guest List
              </h3>

              {reservation.guests?.length === 0 ? (
                <p className="mt-4 text-slate-500">No guests found.</p>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {reservation.guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="rounded-2xl bg-white px-5 py-4 font-bold text-slate-700"
                    >
                      {guest.fullName}
                      {guest.nationalIdMasked
                        ? ` — ${guest.nationalIdMasked}`
                        : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {reservation.status === "CONFIRMED" && (
                <button
                  type="button"
                  onClick={confirmCheckIn}
                  disabled={actionLoading}
                  className="rounded-2xl bg-emerald-700 px-8 py-4 font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {actionLoading ? "Processing..." : "Confirm Check-in"}
                </button>
              )}

              {reservation.status === "CHECKED_IN" && (
                <button
                  type="button"
                  onClick={confirmCheckOut}
                  disabled={actionLoading}
                  className="rounded-2xl bg-slate-900 px-8 py-4 font-extrabold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {actionLoading ? "Processing..." : "Confirm Check-out"}
                </button>
              )}

              {reservation.status === "CHECKED_OUT" && (
                <div className="rounded-2xl bg-slate-100 px-6 py-4 font-extrabold text-slate-700">
                  This reservation has already checked out.
                </div>
              )}

              {reservation.status === "CANCELLED" && (
                <div className="rounded-2xl bg-red-50 px-6 py-4 font-extrabold text-red-700">
                  This reservation is cancelled.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}