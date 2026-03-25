import type { User } from "firebase/auth";

// ─────────────────────────────────────────────
// Admin constants
// ─────────────────────────────────────────────

/** The single super-admin email. */
export const ADMIN_EMAIL = "kian@flosuites.ca";

/** Returns `true` when the signed-in user is the super-admin. */
export function isAdmin(user: User | null): boolean {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
}
