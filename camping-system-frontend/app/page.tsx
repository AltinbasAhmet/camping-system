import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-sky-100 px-5 py-20">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-blue-100 bg-white/80 shadow-2xl backdrop-blur-xl">
        <div className="px-8 py-16 text-center md:px-16 md:py-24">
          <div className="mb-6 inline-flex rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700 shadow-sm">
            Booking & Ticketing Platform
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Event Booking & Ticketing System
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
            Discover events, book tickets, and manage event registrations from
            one simple and modern platform.
          </p>

<div className="mt-11 flex justify-center">
  <Link
    href="/events"
    className="rounded-full bg-gradient-to-r from-blue-700 to-sky-500 px-16 py-5 text-lg font-bold text-white shadow-lg shadow-blue-200/70 transition hover:from-blue-800 hover:to-sky-600 hover:shadow-xl"
  >
    Browse Events
  </Link>
</div>
        </div>
      </section>
    </main>
  );
}