export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type ApiDataResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// Backend'den gelen fotoğraf yolları /uploads/... gibi göreli olabilir
// (dosya yükleme ile eklenenler) ya da tam bir URL olabilir (eski link ile
// eklenenler). Göreli olanları API adresine göre tamamlar.
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {};
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: unknown = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid API response" };
  }

  if (!response.ok) {
    const errorData = data as { message?: string; error?: string; errors?: { field: string; message: string }[] };
    const validation = errorData.errors?.map((item) => `${item.field}: ${item.message}`).join(" · ");
    throw new Error(validation || errorData.message || errorData.error || "Something went wrong");
  }

  return data as T;
}
