"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CreateEventResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
  };
};

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ORGANISER") {
      router.push("/events");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

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

    try {
      setLoading(true);

      const data = await apiRequest<CreateEventResponse>("/events", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          dateTime: new Date(dateTime).toISOString(),
          capacity: Number(capacity),
        }),
      });

      router.push(`/events/${data.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
  "w-full rounded-2xl border border-blue-100 bg-blue-50/30 px-6 py-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100";

const labelClass = "mb-3 block text-lg font-bold text-slate-800";

  return (
  <main className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-sky-100 px-5 py-10">
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 rounded-[32px] border border-blue-100 bg-white/80 p-7 shadow-xl shadow-blue-100/60 backdrop-blur">
        <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
          Organiser Panel
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
          Create New Event
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Add event details and publish it for attendees.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-blue-100 bg-white/85 p-8 shadow-xl shadow-blue-100/60 backdrop-blur"
      >
        {error && (
          <p className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Title</label>
            <input
              placeholder="Example: Web Development Workshop"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              placeholder="Describe your event"
              className={`${inputClass} min-h-44 resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Date and Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Capacity</label>
            <input
              type="number"
              placeholder="50"
              className={inputClass}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 py-5 text-lg font-bold text-white shadow-lg shadow-blue-200/70 transition hover:from-blue-800 hover:to-sky-600 hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Creating event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  </main>
);
}