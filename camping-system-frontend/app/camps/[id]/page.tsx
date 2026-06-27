"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Camp, CampEvent } from "@/lib/types";

export default function CampDetailPage() {
  const params = useParams();
  const campId = params.id as string;

  const [camp, setCamp] = useState<Camp | null>(null);
  const [events, setEvents] = useState<CampEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCampDetail() {
    try {
      setLoading(true);
      setError("");

      const campResponse = await apiRequest<{ success: boolean; data: Camp }>(
        `/camps/${campId}`,
        { auth: false }
      );

      const eventsResponse = await apiRequest<{
        success: boolean;
        data: CampEvent[];
      }>(`/camp-events/camp/${campId}`, { auth: false });

      setCamp(campResponse.data);
      setEvents(eventsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load camp");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (campId) {
      fetchCampDetail();
    }
  }, [campId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <p className="text-slate-500">Loading camp detail...</p>
      </main>
    );
  }

  if (error || !camp) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "Camp not found"}
        </div>
      </main>
    );
  }

  const coverPhoto =
    camp.photos?.find((photo) => photo.isCover) || camp.photos?.[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/camps"
          className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
        >
          ← Back to camps
        </Link>

        <section className="overflow-hidden rounded-[36px] border border-emerald-100 bg-white shadow-xl">
          <div className="h-[360px] w-full bg-emerald-50">
            {coverPhoto ? (
              <img
                src={coverPhoto.imageUrl}
                alt={camp.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-emerald-400">
                No photo
              </div>
            )}
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-950">
                  {camp.name}
                </h1>

                <p className="mt-2 text-lg font-medium text-slate-500">
                  {camp.city}
                  {camp.district ? ` / ${camp.district}` : ""} —{" "}
                  {camp.address}
                </p>
              </div>

              <p className="text-lg leading-8 text-slate-600">
                {camp.description}
              </p>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Facilities
                </h2>

                <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-emerald-800">
                  {camp.hasToilet && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Toilet
                    </span>
                  )}
                  {camp.hasShower && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Shower
                    </span>
                  )}
                  {camp.hasHotWater && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Hot Water
                    </span>
                  )}
                  {camp.hasElectricity && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Electricity
                    </span>
                  )}
                  {camp.hasWifi && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Wi-Fi
                    </span>
                  )}
                  {camp.hasMarket && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Market
                    </span>
                  )}
                  {camp.petFriendly && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2">
                      Pet Friendly
                    </span>
                  )}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">Price</p>
                  <p className="text-3xl font-extrabold text-slate-950">
                    {camp.pricePerNight
                      ? `₺${camp.pricePerNight}/night`
                      : "Not set"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-bold text-slate-500">Total Capacity</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-950">
                      {camp.totalCapacity}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="font-bold text-slate-500">Caravan</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-950">
                      {camp.caravanCapacity}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/camps/${camp.id}/reserve`}
                  className="block rounded-2xl bg-emerald-700 px-6 py-4 text-center font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800"
                >
                  Reserve This Camp
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {camp.photos && camp.photos.length > 1 && (
          <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Camp Photos
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {camp.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt={camp.name}
                  className="h-56 w-full rounded-3xl object-cover"
                />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Camp Events
              </h2>
              <p className="mt-1 text-slate-500">
                Activities hosted by this camp.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <p className="mt-5 text-slate-500">No events yet.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5"
                >
                  <h3 className="text-xl font-extrabold text-slate-950">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {event.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-emerald-800">
                    <span className="rounded-full bg-white px-3 py-1">
                      {new Date(event.dateTime).toLocaleString()}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1">
                      Capacity: {event.capacity}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1">
                      ₺{event.price}
                    </span>
                  </div>

                  <Link
                    href={`/camp-events/${event.id}`}
                    className="mt-5 block rounded-2xl bg-emerald-700 px-5 py-3 text-center font-extrabold text-white hover:bg-emerald-800"
                  >
                    View Event
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}