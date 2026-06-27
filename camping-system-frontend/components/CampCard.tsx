import Link from "next/link";
import { Camp } from "@/lib/types";

type CampCardProps = {
  camp: Camp;
};

export default function CampCard({ camp }: CampCardProps) {
  const coverPhoto =
    camp.photos?.find((photo) => photo.isCover) || camp.photos?.[0];

  return (
    <Link
      href={`/camps/${camp.id}`}
      className="block overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="h-52 w-full bg-emerald-50">
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

      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">
            {camp.name}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {camp.city}
            {camp.district ? ` / ${camp.district}` : ""}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {camp.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
          {camp.hasToilet && (
            <span className="rounded-full bg-emerald-50 px-3 py-1">
              Toilet
            </span>
          )}
          {camp.hasShower && (
            <span className="rounded-full bg-emerald-50 px-3 py-1">
              Shower
            </span>
          )}
          {camp.hasHotWater && (
            <span className="rounded-full bg-emerald-50 px-3 py-1">
              Hot Water
            </span>
          )}
          {camp.hasElectricity && (
            <span className="rounded-full bg-emerald-50 px-3 py-1">
              Electricity
            </span>
          )}
          {camp.petFriendly && (
            <span className="rounded-full bg-emerald-50 px-3 py-1">
              Pet Friendly
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-slate-500">
            Capacity: {camp.totalCapacity}
          </span>

          {camp.pricePerNight ? (
            <span className="font-extrabold text-slate-950">
              ₺{camp.pricePerNight}/night
            </span>
          ) : (
            <span className="text-sm text-slate-400">Price not set</span>
          )}
        </div>
      </div>
    </Link>
  );
}