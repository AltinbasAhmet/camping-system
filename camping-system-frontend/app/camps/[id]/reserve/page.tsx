"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Camp } from "@/lib/types";
import { getUser } from "@/lib/auth";

type GuestForm = {
  fullName: string;
  nationalId: string;
};

export default function ReserveCampPage() {
  const params = useParams();
  const router = useRouter();
  const campId = params.id as string;

  const [camp, setCamp] = useState<Camp | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guests, setGuests] = useState<GuestForm[]>([
    { fullName: "", nationalId: "" },
  ]);

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

    if (user.role !== "USER") {
      setError("Only users can make camp reservations.");
      setLoading(false);
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

      setCamp(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camp");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestCountChange(value: number) {
    const safeValue = Math.max(1, value);
    setGuestCount(safeValue);

    setGuests((prevGuests) => {
      const nextGuests = [...prevGuests];

      if (safeValue > nextGuests.length) {
        while (nextGuests.length < safeValue) {
          nextGuests.push({ fullName: "", nationalId: "" });
        }
      } else {
        nextGuests.length = safeValue;
      }

      return nextGuests;
    });
  }

  function updateGuest(index: number, field: keyof GuestForm, value: string) {
    setGuests((prevGuests) => {
      const nextGuests = [...prevGuests];
      nextGuests[index] = {
        ...nextGuests[index],
        [field]: value,
      };
      return nextGuests;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select check-in and check-out dates.");
      }

      if (!plateNumber.trim()) {
        throw new Error("Plate number is required.");
      }

      const hasEmptyGuest = guests.some((guest) => !guest.fullName.trim());

      if (hasEmptyGuest) {
        throw new Error("Please enter all guest names.");
      }

      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: {
          id: number;
          reservationCode: string;
        };
      }>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          campId: Number(campId),
          checkInDate,
          checkOutDate,
          plateNumber,
          guestCount,
          guests,
        }),
      });

      setSuccess(
        `Reservation created successfully. Code: ${response.data.reservationCode}`
      );

      setTimeout(() => {
        router.push("/my-reservations");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <p className="text-slate-500">Loading reservation page...</p>
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
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href={`/camps/${camp.id}`}
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back to camp detail
        </Link>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-950">
              Reserve {camp.name}
            </h1>
            <p className="mt-2 text-slate-500">
              {camp.city}
              {camp.district ? ` / ${camp.district}` : ""} — ₺
              {camp.pricePerNight || 0}/night
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

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(event) => setCheckInDate(event.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(event) => setCheckOutDate(event.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Plate Number
                </label>
                <input
                  value={plateNumber}
                  onChange={(event) => setPlateNumber(event.target.value)}
                  placeholder="01ABC123"
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Guest Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(event) =>
                    handleGuestCountChange(Number(event.target.value))
                  }
                  className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Guest Information
              </h2>

              {guests.map((guest, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      Guest {index + 1} Full Name
                    </label>
                    <input
                      value={guest.fullName}
                      onChange={(event) =>
                        updateGuest(index, "fullName", event.target.value)
                      }
                      placeholder="Full name"
                      className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-bold text-slate-700">
                      National ID
                    </label>
                    <input
                      value={guest.nationalId}
                      onChange={(event) =>
                        updateGuest(index, "nationalId", event.target.value)
                      }
                      placeholder="Optional for MVP"
                      className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Creating reservation..." : "Create Reservation"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}