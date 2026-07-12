export type UserRole = "USER" | "CAMP_OWNER" | "SYSTEM_ADMIN" | "STAFF";

export type User = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
};

export function saveAuth(token: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    logout();
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  return Boolean(getToken() && getUser());
}
