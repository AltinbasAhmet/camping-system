"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Camp, CampPhoto } from "@/lib/types";

export default function OwnerCampPhotosPage() {
  const params = useParams();
  const router = useRouter();

  const campId = params.id as string;

  const [camp, setCamp] = useState<Camp | null>(null);
  const [photos, setPhotos] = useState<CampPhoto[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isCover, setIsCover] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "CAMP_OWNER") {
      router.push("/camps");
      return;
    }

    fetchData();
  }, [campId]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [campResponse, photosResponse] = await Promise.all([
        apiRequest<{ success: boolean; data: Camp }>(`/camps/${campId}`, {
          auth: false,
        }),
        apiRequest<{ success: boolean; data: CampPhoto[] }>(
          `/camps/${campId}/photos`,
          { auth: false }
        ),
      ]);

      setCamp(campResponse.data);
      setPhotos(photosResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!imageUrl.trim()) {
        throw new Error("Image URL is required.");
      }

      await apiRequest(`/camps/${campId}/photos`, {
        method: "POST",
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          isCover,
        }),
      });

      setImageUrl("");
      setIsCover(false);
      setSuccess("Photo added successfully.");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add photo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto(photoId: number) {
    const confirmed = window.confirm("Are you sure you want to delete this photo?");

    if (!confirmed) return;

    try {
      setDeletingId(photoId);
      setError("");
      setSuccess("");

      await apiRequest(`/camps/photos/${photoId}`, {
        method: "DELETE",
      });

      setSuccess("Photo deleted successfully.");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-6 py-10">
        <p className="text-slate-500">Loading photos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Camp Photos
            </h1>

            <p className="mt-2 text-slate-500">
              {camp ? camp.name : "Manage camp photos"}
            </p>
          </div>

          <Link
            href="/camp-owner/dashboard"
            className="rounded-full border border-emerald-200 bg-white px-5 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Back to dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
            {success}
          </div>
        )}

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Add Photo
          </h2>

          <p className="mt-2 text-slate-500">
            For now, add photo by image URL. Later we can convert this to real
            file upload.
          </p>

          <form onSubmit={handleAddPhoto} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Image URL
              </label>

              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isCover}
                onChange={(event) => setIsCover(event.target.checked)}
              />
              Set as cover photo
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-emerald-700 px-8 py-4 font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Adding photo..." : "Add Photo"}
            </button>
          </form>
        </section>

        <section className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Existing Photos
          </h2>

          {photos.length === 0 ? (
            <p className="mt-5 text-slate-500">No photos added yet.</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/60 shadow-sm"
                >
                  <div className="h-56 w-full bg-emerald-100">
                    <img
                      src={photo.imageUrl}
                      alt="Camp photo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-emerald-800">
                        {photo.isCover ? "Cover Photo" : "Photo"}
                      </span>

                      <span className="text-xs font-bold text-slate-400">
                        ID: {photo.id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingId === photo.id}
                      className="w-full rounded-2xl bg-red-500 px-5 py-3 font-extrabold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {deletingId === photo.id ? "Deleting..." : "Delete Photo"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}