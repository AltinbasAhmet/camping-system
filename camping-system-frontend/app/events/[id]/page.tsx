"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getUser, User } from "@/lib/auth";
import { useParams } from "next/navigation";
import Link from "next/link";

type EventDetail = {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  capacity: number;
  ticketsSold?: number;
  remainingCapacity?: number;
  organiser?: {
    id: number;
    name: string;
    email: string;
  };
};

type EventResponse = {
  success: boolean;
  data: EventDetail;
};

type BookingResponse = {
  success: boolean;
  message: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<EventResponse>(`/events/${eventId}`, {
        auth: false,
      });

      setEvent(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getUser());
    loadEvent();
  }, []);

  const handleBooking = async () => {
    if (!user) {
      setError("You must login before booking a ticket.");
      return;
    }

    if (user.role !== "ATTENDEE") {
      setError("Only attendees can book tickets.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");
      setSuccessMessage("");

      const data = await apiRequest<BookingResponse>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          eventId: Number(eventId),
        }),
      });

      setSuccessMessage(data.message || "Ticket booked successfully.");
      await loadEvent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-600">Loading event details...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-600">Event not found.</p>
      </main>
    );
  }

  const eventDate = new Date(event.dateTime).toLocaleString();

  const isSoldOut =
    event.remainingCapacity !== undefined && event.remainingCapacity <= 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/events" className="text-blue-600 hover:underline">
        ← Back to events
      </Link>

      <div className="bg-white rounded-2xl shadow p-8 mt-6">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

        <p className="text-gray-600 text-lg mb-6">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Date:</span> {eventDate}
          </p>

          <p>
            <span className="font-semibold">Capacity:</span> {event.capacity}
          </p>

          <p>
            <span className="font-semibold">Tickets sold:</span>{" "}
            {event.ticketsSold ?? 0}
          </p>

          <p>
            <span className="font-semibold">Remaining capacity:</span>{" "}
            {event.remainingCapacity ?? event.capacity}
          </p>

          {event.organiser && (
            <p>
              <span className="font-semibold">Organiser:</span>{" "}
              {event.organiser.name}
            </p>
          )}
        </div>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {successMessage}
          </p>
        )}

        {user?.role === "ATTENDEE" && (
          <button
            onClick={handleBooking}
            disabled={bookingLoading || isSoldOut}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {bookingLoading
              ? "Booking..."
              : isSoldOut
              ? "Sold Out"
              : "Book Ticket"}
          </button>
        )}

        {!user && (
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Login to Book
          </Link>
        )}

        {user?.role === "ORGANISER" && event.organiser?.id === user.id && (
  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
    <p className="text-gray-600">
      You can manage it from the edit page.
    </p>

    <Link
      href={`/organiser/events/${event.id}/edit`}
      className="bg-blue-600 text-white px-5 py-3 rounded-lg"
    >
      Edit Event
    </Link>
  </div>
)}

{user?.role === "ORGANISER" && event.organiser?.id !== user.id && (
  <p className="text-gray-600">
    This event belongs to another organiser. You are not authorized to
    edit it.
  </p>
)}
      </div>
    </main>
  );
}