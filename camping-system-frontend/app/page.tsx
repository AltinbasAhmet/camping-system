"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const stats = [
  { icon: "🌲", value: "500+", label: "Kamp Alanı" },
  { icon: "👥", value: "20.000+", label: "Mutlu Kampçı" },
  { icon: "🗓️", value: "1.200+", label: "Etkinlik" },
];

const features = [
  {
    icon: "📍",
    title: "Kamp Alanlarını Keşfet",
    text: "Harita üzerinden size en uygun kamp alanlarını bulun, detaylarına göz atın ve yerinizi ayırtın.",
    tone: "green",
  },
  {
    icon: "🗓️",
    title: "Rezervasyon Yap",
    text: "İstediğiniz tarihleri seçin, plaka ve misafir bilgileriyle rezervasyonunuzu kolayca tamamlayın.",
    tone: "orange",
  },
  {
    icon: "🎉",
    title: "Etkinliklere Katıl",
    text: "Kamp alanlarında düzenlenen etkinlikleri inceleyin, filtreleyin ve size uygun etkinliklere katılın.",
    tone: "green",
  },
  {
    icon: "📊",
    title: "Kamp Sahibi Paneli",
    text: "Alanınızı yönetin, takvimlerinizi düzenleyin, rezervasyonları ve misafirlerinizi takip edin.",
    tone: "orange",
  },
  {
    icon: "✅",
    title: "Kolay Check-in",
    text: "Plaka bilgisiyle hızlı giriş yapın, kamp deneyiminize zaman kaybetmeden başlayın.",
    tone: "green",
  },
];

const trustItems = [
  { icon: "🛡️", title: "Güvenli Rezervasyon", text: "Onaylı kamp alanları" },
  { icon: "🎧", title: "7/24 Destek", text: "Her zaman yanınızdayız" },
  { icon: "👨‍👩‍👧‍👦", title: "Topluluk", text: "Büyük bir kamp ailesi" },
  { icon: "🍃", title: "Doğaya Saygı", text: "Sürdürülebilir kampçılık" },
];

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="overflow-hidden rounded-[2rem] bg-[#fffdf8] shadow-[0_22px_80px_rgba(9,63,42,0.10)] ring-1 ring-emerald-900/10">
      <section className="relative grid min-h-[620px] gap-10 px-6 pb-12 pt-10 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute -left-24 bottom-0 hidden text-[10rem] leading-none text-emerald-900/10 lg:block">
          ♣
        </div>

        <div className="pointer-events-none absolute bottom-6 left-[47%] hidden h-36 w-72 rounded-[50%] border-t-2 border-dashed border-orange-200 lg:block" />

        <div className="relative z-10 max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f5df] px-5 py-2 text-sm font-black text-[#0b4b31]">
            <span>🍃</span>
            {t("Kamp yapmayı sevenler için her şey burada!")}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-[#063f2a] sm:text-6xl xl:text-7xl">
              {t("Kamp alanlarını keşfet,")}
              <span className="block text-[#f26a0b]">
                {t("etkinliklere katıl,")}
              </span>
              <span className="block">{t("doğayla bağ kur.")}</span>
            </h1>

            <p className="max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg">
              {t("CampPal ile kamp alanlarını kolayca keşfedebilir, yerinizi rezerve edebilir, etkinliklere katılabilir veya alanınızı diğer kampseverlerle paylaşabilirsiniz. Doğa tutkunları için tek adres.")}
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((item, index) => (
              <div key={t(item.label)} className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                    index === 1 ? "bg-orange-100" : "bg-emerald-100"
                  }`}
                >
                  {item.icon}
                </span>

                <div>
                  <p className="text-2xl font-black leading-none text-[#063f2a]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {t(item.label)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/camps"
              className="inline-flex items-center gap-3 rounded-full bg-[#075b39] px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-900/20 transition hover:-translate-y-1 hover:bg-[#06472e]"
            >
              <span>🔍</span>
              {t("Kamp Yerlerini Keşfet")}
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-3 rounded-full border border-[#075b39]/30 bg-white px-7 py-4 text-sm font-black text-[#075b39] shadow-sm transition hover:-translate-y-1 hover:bg-emerald-50"
            >
              <span>🗓️</span>
              {t("Etkinlikleri Gör")}
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl lg:max-w-none">
          <div className="relative min-h-[470px] overflow-hidden rounded-[45%_0_0_45%] shadow-2xl shadow-orange-900/20">
            <img
              src="/camp-area.jpg"
              alt="CampPal kamp alanı"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#063f2a]/65 via-transparent to-orange-200/20" />

            
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 sm:px-10 lg:px-12 xl:px-16">
        <h2 className="mb-7 text-center text-3xl font-black text-[#063f2a]">
          {t("CampPal ile Neler Yapabilirsiniz?")}
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <article
              key={t(feature.title)}
              className="group relative min-h-[215px] rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,82,55,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,82,55,0.14)]"
            >
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl ${
                  feature.tone === "orange"
                    ? "bg-orange-100 text-[#f26a0b]"
                    : "bg-emerald-100 text-[#075b39]"
                }`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-black text-[#063f2a]">
                {t(feature.title)}
              </h3>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                {t(feature.text)}
              </p>

              <span
                className={`absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full text-xl font-black transition group-hover:translate-x-1 ${
                  feature.tone === "orange"
                    ? "bg-orange-100 text-[#f26a0b]"
                    : "bg-emerald-100 text-[#075b39]"
                }`}
              >
                ›
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="grid gap-5 rounded-[2rem] bg-[#075b39] p-6 text-white shadow-2xl shadow-emerald-900/20 md:grid-cols-4">
          {trustItems.map((item) => (
            <div key={t(item.title)} className="flex items-center gap-4">
              <span className="text-4xl">{item.icon}</span>
              <div>
                <p className="font-black">{t(item.title)}</p>
                <p className="text-sm font-medium text-emerald-50/85">
                  {t(item.text)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="nasil-calisir"
        className="scroll-mt-28 px-6 pb-10 sm:px-10 lg:px-12 xl:px-16"
      >
        <div className="grid gap-5 rounded-[2rem] border border-orange-100 bg-[#fff7eb] p-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#f26a0b]">
              {t("1. Adım")}
            </p>
            <h3 className="mt-2 text-xl font-black text-[#063f2a]">
              {t("Kamp alanını veya etkinliği bul")}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              {t("Şehir, kamp adı veya etkinlik bilgisine göre arama yapıp uygun seçenekleri filtreleyebilirsin.")}
            </p>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#f26a0b]">
              {t("2. Adım")}
            </p>
            <h3 className="mt-2 text-xl font-black text-[#063f2a]">
              {t("Rezervasyonunu tamamla")}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              {t("Tarih, kişi sayısı ve plaka bilgilerini girerek kamp yerini veya etkinlik biletini oluşturabilirsin.")}
            </p>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#f26a0b]">
              {t("3. Adım")}
            </p>
            <h3 className="mt-2 text-xl font-black text-[#063f2a]">
              {t("Kampa hızlı giriş yap")}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              {t("Kamp sahibi panelinden rezervasyon, misafir listesi ve check-in süreci kolayca takip edilir.")}
            </p>
          </div>
        </div>
      </section>

      <section
        id="hakkimizda"
        className="scroll-mt-28 px-6 pb-12 sm:px-10 lg:px-12 xl:px-16"
      >
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,82,55,0.08)]">
          <p className="text-sm font-black uppercase tracking-wide text-[#f26a0b]">
            {t("Hakkımızda")}
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#063f2a]">
            {t("CampPal kampçıları ve kamp işletmelerini tek platformda buluşturur.")}
          </h2>

          <p className="mt-4 max-w-4xl text-base font-medium leading-8 text-slate-600">
            {t("Amacımız kamp alanlarını keşfetmeyi, rezervasyon yapmayı, etkinliklere katılmayı ve kamp sahiplerinin alanlarını yönetmesini daha kolay hale getirmek. CampPal; kullanıcı, kamp sahibi ve yönetici deneyimini sade, güvenli ve anlaşılır bir akışta toplar.")}
          </p>
        </div>
      </section>
    </div>
  );
}