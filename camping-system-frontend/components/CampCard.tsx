import Link from "next/link";
import type { Camp } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { resolveImageUrl } from "@/lib/api";

export default function CampCard({ camp }: { camp: Camp }) {
  const cover = camp.photos?.find((photo) => photo.isCover) || camp.photos?.[0];
  const features = [
    camp.hasToilet && "Tuvalet",
    camp.hasShower && "Duş",
    camp.hasHotWater && "Sıcak su",
    camp.hasElectricity && "Elektrik",
    camp.hasWifi && "Wi-Fi",
    camp.hasMarket && "Market",
    camp.petFriendly && "Pet friendly",
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-48 bg-orange-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(cover.imageUrl)} alt={camp.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🏕️</div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            {camp.city}{camp.district ? ` / ${camp.district}` : ""}
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{camp.name}</h2>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{camp.description}</p>
        <div className="flex flex-wrap gap-2">
          {features.slice(0, 4).map((feature) => (
            <span key={String(feature)} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {feature}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Per night</p>
            <p className="font-black text-slate-900">{formatPrice(camp.pricePerNight)}</p>
          </div>
          <Link href={`/camps/${camp.id}`} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-bold text-white hover:from-orange-600 hover:to-orange-700">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
