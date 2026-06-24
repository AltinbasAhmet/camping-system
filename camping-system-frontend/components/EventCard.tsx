import Link from "next/link";

export type EventItem = {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  capacity: number;
  ticketsSold: number;
  remainingCapacity: number;
  organiser?: {
    id: number;
    name: string;
    email: string;
  };
};

export default function EventCard({ event }: { event: EventItem }) {
  const eventDate = new Date(event.dateTime).toLocaleString();

  return (
  <div className="rounded-[26px] border border-blue-100 bg-white/85 p-6 shadow-lg shadow-blue-100/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70">
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
      {event.title}
    </h2>

    <p className="mt-3 text-base leading-7 text-slate-500">
      {event.description}
    </p>

    <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
      <p className="rounded-xl bg-blue-50/60 px-4 py-3 text-slate-600">
        <span className="font-bold text-blue-800">Date:</span>{" "}
        {eventDate}
      </p>

      <p className="rounded-xl bg-blue-50/60 px-4 py-3 text-slate-600">
        <span className="font-bold text-blue-800">Capacity:</span>{" "}
        {event.capacity}
      </p>

      <p className="rounded-xl bg-blue-50/60 px-4 py-3 text-slate-600">
        <span className="font-bold text-blue-800">Tickets sold:</span>{" "}
        {event.ticketsSold}
      </p>

      <p className="rounded-xl bg-blue-50/60 px-4 py-3 text-slate-600">
        <span className="font-bold text-blue-800">
          Remaining capacity:
        </span>{" "}
        {event.remainingCapacity}
      </p>

      {event.organiser && (
        <p className="rounded-xl bg-blue-50/60 px-4 py-3 text-slate-600">
          <span className="font-bold text-blue-800">Organiser:</span>{" "}
          {event.organiser.name}
        </p>
      )}
    </div>

    <Link
      href={`/events/${event.id}`}
      className="mt-5 inline-flex rounded-full bg-gradient-to-r from-blue-700 to-sky-500 px-6 py-3 text-base font-bold text-white shadow-md shadow-blue-200/60 transition hover:from-blue-800 hover:to-sky-600 hover:shadow-lg"
    >
      View Details
    </Link>
  </div>
);
}