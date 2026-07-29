import type { User } from "@/lib/types";

export function saveAuth(_token: string | null, _user: User): void {
  // Oturum bilgisi backend tarafından HttpOnly cookie içinde tutulur.
}

export function getToken(): string | null {
  return null;
}

export function getStoredUser(): User | null {
  return null;
}

export function clearAuth(): void {
  sessionStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}