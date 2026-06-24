"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
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

type UpdateEventResponse = {
  success: boolean;
  message: string;
  data: EventDetail;
};

type DeleteEventResponse = {
  success: boolean;
  message: string;
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [ticketsSold, setTicketsSold] = useState(0);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadEvent = async () => {
    try {
      setPageLoading(true);
      setError("");

      const user = getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "ORGANISER") {
        router.push("/events");
        return;
      }

      const data = await apiRequest<EventResponse>(`/events/${eventId}`, {
        auth: false,
      });

if (data.data.organiser?.id !== user.id) {
  setError("You can only edit your own events.");
  setTimeout(() => {
    router.push("/organiser/dashboard");
  }, 2000);
  return;
}


      setTitle(data.data.title);
      setDescription(data.data.description);
      setDateTime(toDateTimeLocal(data.data.dateTime));
      setCapacity(String(data.data.capacity));
      setTicketsSold(data.data.ticketsSold ?? 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }

    if (!dateTime) {
      setError("Date and time are required.");
      return;
    }

    if (Number(capacity) < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    if (Number(capacity) < ticketsSold) {
      setError(
        `Capacity cannot be lower than tickets already sold (${ticketsSold}).`
      );
      return;
    }

    try {
      setSaving(true);

      await apiRequest<UpdateEventResponse>(`/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          dateTime: new Date(dateTime).toISOString(),
          capacity: Number(capacity),
        }),
      });

      setSuccessMessage("Event updated successfully.");
      await loadEvent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await apiRequest<DeleteEventResponse>(`/events/${eventId}`, {
        method: "DELETE",
      });

      router.push("/organiser/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600">Loading event...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/organiser/dashboard"
        className="text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow p-8 mt-6">
        <h1 className="text-3xl font-bold mb-6">Edit Event</h1>

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

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Title</label>
            <input
              className="w-full border p-3 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              className="w-full border p-3 rounded-lg min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Date and Time</label>
            <input
              type="datetime-local"
              className="w-full border p-3 rounded-lg"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              className="w-full border p-3 rounded-lg"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <p className="text-sm text-gray-600 mt-1">
              Tickets already sold: {ticketsSold}
            </p>
          </div>

          <button
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="border-t mt-8 pt-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>

          <p className="text-gray-600 mb-4">
            Deleting an event will remove it from the system.
          </p>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-5 py-3 rounded-lg disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>
    </main>
  );
}