"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getUser, User } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  bookedAt: string;
  event: {
    id: number;
    title: string;
    description: string;
    dateTime: string;
    capacity: number;
    organiser?: {
      id: number;
      name: string;
      email: string;
    };
  };
};

type BookingsResponse = {
  success: boolean;
  data: Booking[];
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getUser();
      setUser(currentUser);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "ATTENDEE") {
        setError("Only attendees can view this page.");
        return;
      }

      const data = await apiRequest<BookingsResponse>("/bookings/me");
      setBookings(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>

      <p className="text-gray-600 mb-8">
        View the tickets you booked as an attendee.
      </p>

      {loading && <p className="text-gray-600">Loading bookings...</p>}

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">{error}</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-gray-600">You do not have any bookings yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map((booking) => {
          const eventDate = new Date(booking.event.dateTime).toLocaleString();
          const bookedAt = new Date(booking.bookedAt).toLocaleString();

          return (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow border p-6"
            >
              <h2 className="text-xl font-bold mb-2">{booking.event.title}</h2>

              <p className="text-gray-600 mb-4">
                {booking.event.description}
              </p>

              <div className="space-y-2 text-sm text-gray-700 mb-5">
                <p>
                  <span className="font-semibold">Event date:</span>{" "}
                  {eventDate}
                </p>

                <p>
                  <span className="font-semibold">Booked at:</span> {bookedAt}
                </p>

                {booking.event.organiser && (
                  <p>
                    <span className="font-semibold">Organiser:</span>{" "}
                    {booking.event.organiser.name}
                  </p>
                )}
              </div>

              <Link
                href={`/events/${booking.event.id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                View Event
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}