import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-emerald-50 via-white to-lime-100 px-5 py-20">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-emerald-100 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="px-8 py-16 text-center md:px-16 md:py-24">
          <div className="mb-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm">
            Caravan Camping & Event Platform
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Discover camps, reserve your stay, and join camp events.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
            CampGate helps travelers find caravan camps, view facilities and
            photos, make reservations, and attend activities hosted by camps.
          </p>

          <div className="mt-11 flex flex-wrap justify-center gap-4">
            <Link
              href="/camps"
              className="rounded-full bg-gradient-to-r from-emerald-700 to-lime-500 px-12 py-5 text-lg font-bold text-white shadow-lg shadow-emerald-200/70 transition hover:from-emerald-800 hover:to-lime-600 hover:shadow-xl"
            >
              Browse Camps
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-emerald-200 bg-white px-12 py-5 text-lg font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}