"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getUser, User } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AttendeeInfo = {
  bookingId: number;
  bookedAt: string;
  attendee: {
    id: number;
    name: string;
    email: string;
  };
};

type DashboardEvent = {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  capacity: number;
  ticketsSold: number;
  remainingCapacity: number;
  attendees: AttendeeInfo[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardEvent[];
};

export default function OrganiserDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getUser();
      setUser(currentUser);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "ORGANISER") {
        setError("Only organisers can view this dashboard.");
        return;
      }

      const data = await apiRequest<DashboardResponse>(
        "/events/dashboard/organiser"
      );

      setEvents(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalTicketsSold = events.reduce(
    (sum, event) => sum + event.ticketsSold,
    0
  );

  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);

  return (
  <main className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-sky-100 px-5 py-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-5 rounded-[32px] border border-blue-100 bg-white/80 p-7 shadow-xl shadow-blue-100/60 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
            Organiser Panel
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Organiser Dashboard
          </h1>

          <p className="mt-3 text-lg text-slate-500">
            Manage your events and view attendee information.
          </p>
        </div>

        <Link
          href="/organiser/events/new"
          className="rounded-full bg-gradient-to-r from-blue-700 to-sky-500 px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-blue-200/70 transition hover:from-blue-800 hover:to-sky-600 hover:shadow-xl"
        >
          Create New Event
        </Link>
      </div>

      {loading && (
        <p className="rounded-2xl border border-blue-100 bg-white/80 p-5 text-slate-500 shadow-sm">
          Loading dashboard...
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-blue-100 bg-white/85 p-7 shadow-lg shadow-blue-100/50 backdrop-blur">
              <p className="text-lg font-semibold text-slate-500">
                Total Events
              </p>
              <p className="mt-3 text-4xl font-extrabold text-blue-800">
                {events.length}
              </p>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-white/85 p-7 shadow-lg shadow-blue-100/50 backdrop-blur">
              <p className="text-lg font-semibold text-slate-500">
                Total Tickets Sold
              </p>
              <p className="mt-3 text-4xl font-extrabold text-blue-800">
                {totalTicketsSold}
              </p>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-white/85 p-7 shadow-lg shadow-blue-100/50 backdrop-blur">
              <p className="text-lg font-semibold text-slate-500">
                Total Capacity
              </p>
              <p className="mt-3 text-4xl font-extrabold text-blue-800">
                {totalCapacity}
              </p>
            </div>
          </div>

          {events.length === 0 && (
            <p className="rounded-2xl border border-blue-100 bg-white/80 p-5 text-slate-500 shadow-sm">
              You have not created any events yet.
            </p>
          )}

          <div className="space-y-6">
            {events.map((event) => {
              const eventDate = new Date(event.dateTime).toLocaleString();

              return (
                <div
                  key={event.id}
                  className="rounded-[28px] border border-blue-100 bg-white/85 p-6 shadow-lg shadow-blue-100/50 backdrop-blur"
                >
                  <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-950">
                        {event.title}
                      </h2>

                      <p className="mt-2 text-slate-500">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/events/${event.id}`}
                        className="rounded-full border border-blue-100 bg-blue-50 px-5 py-3 font-bold text-blue-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
                      >
                        View
                      </Link>

                      <Link
                        href={`/organiser/events/${event.id}/edit`}
                        className="rounded-full bg-gradient-to-r from-blue-700 to-sky-500 px-5 py-3 font-bold text-white shadow-md transition hover:from-blue-800 hover:to-sky-600"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                    <p className="rounded-2xl bg-blue-50/60 p-4 text-slate-600">
                      <span className="font-bold text-blue-800">Date:</span>{" "}
                      {eventDate}
                    </p>

                    <p className="rounded-2xl bg-blue-50/60 p-4 text-slate-600">
                      <span className="font-bold text-blue-800">Capacity:</span>{" "}
                      {event.capacity}
                    </p>

                    <p className="rounded-2xl bg-blue-50/60 p-4 text-slate-600">
                      <span className="font-bold text-blue-800">
                        Tickets sold:
                      </span>{" "}
                      {event.ticketsSold}
                    </p>

                    <p className="rounded-2xl bg-blue-50/60 p-4 text-slate-600">
                      <span className="font-bold text-blue-800">
                        Remaining:
                      </span>{" "}
                      {event.remainingCapacity}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-extrabold text-slate-900">
                      Attendee List
                    </h3>

                    {event.attendees.length === 0 ? (
                      <p className="rounded-2xl bg-blue-50/60 p-4 text-sm text-slate-500">
                        No attendees have booked this event yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-blue-100">
                        <table className="w-full text-sm">
                          <thead className="bg-blue-50 text-blue-900">
                            <tr>
                              <th className="border-b border-blue-100 p-3 text-left">
                                Name
                              </th>
                              <th className="border-b border-blue-100 p-3 text-left">
                                Email
                              </th>
                              <th className="border-b border-blue-100 p-3 text-left">
                                Booked At
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {event.attendees.map((item) => (
                              <tr
                                key={item.bookingId}
                                className="transition hover:bg-blue-50/50"
                              >
                                <td className="border-b border-blue-50 p-3 text-slate-700">
                                  {item.attendee.name}
                                </td>
                                <td className="border-b border-blue-50 p-3 text-slate-700">
                                  {item.attendee.email}
                                </td>
                                <td className="border-b border-blue-50 p-3 text-slate-700">
                                  {new Date(item.bookedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  </main>
);
}