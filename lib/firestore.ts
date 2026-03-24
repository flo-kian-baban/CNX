import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./firebase";
import { BusinessCard, UserProfile } from "@/types/user";

// ─────────────────────────────────────────────
// User helpers
// ─────────────────────────────────────────────

/**
 * Creates a user document in `users/{uid}` on first sign-in.
 * If the document already exists it will NOT overwrite it,
 * preserving the original `createdAt` timestamp.
 */
export async function createUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const userData: Omit<UserProfile, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      name: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);
  }
}

/**
 * Fetches the user document from `users/{uid}`.
 * Returns `null` if the document does not exist or is malformed.
 */
export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (!data || typeof data.name !== "string") return null;
  return data as UserProfile;
}

// ─────────────────────────────────────────────
// Business card helpers
// ─────────────────────────────────────────────

/**
 * Creates or updates the business card document at
 * `cards/{uid}`.
 *
 * Schema:
 *   displayName, title, bio?, location?, phone, email,
 *   profileImage, bannerImage?, socialLinks[], customLinks[],
 *   experience?[], slug?, cardTheme?{ backgroundColor, accentColor },
 *   updatedAt (server timestamp)
 */
/** Recursively strip undefined values from an object/array tree. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepClean(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepClean);
  if (obj !== null && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = deepClean(v);
    }
    return out;
  }
  return obj;
}

export async function updateBusinessCard(
  uid: string,
  card: Omit<BusinessCard, "updatedAt">
): Promise<void> {
  const cardRef = doc(db, "cards", uid);
  const cleaned = deepClean(card);
  await setDoc(cardRef, {
    ...cleaned,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reads the business card document from
 * `cards/{uid}`.
 * Returns `null` if no card exists yet or is malformed.
 */
export async function getBusinessCard(uid: string): Promise<BusinessCard | null> {
  const snapshot = await getDoc(doc(db, "cards", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (!data || typeof data.displayName !== "string") return null;
  return data as BusinessCard;
}

// ─────────────────────────────────────────────
// Slug helpers (vanity URLs)
// ─────────────────────────────────────────────

/** Sentinel message thrown when a slug is already claimed by another user. */
export const SLUG_TAKEN_ERROR = "This URL is already taken. Please choose another.";

/**
 * Claims or re-claims a slug for a user using a Firestore transaction
 * to prevent race conditions.
 *
 * - If the slug is unclaimed, writes `slugs/{slug}` → { userId }.
 * - If the slug is already owned by the same userId, no-op.
 * - If owned by a different user, throws an Error with SLUG_TAKEN_ERROR.
 */
export async function updateSlug(slug: string, userId: string): Promise<void> {
  const slugRef = doc(db, "slugs", slug);

  await runTransaction(db, async (transaction) => {
    const slugDoc = await transaction.get(slugRef);

    if (slugDoc.exists()) {
      const existingOwner = slugDoc.data()?.userId;
      if (existingOwner && existingOwner !== userId) {
        throw new Error(SLUG_TAKEN_ERROR);
      }
      // Already owned by this user — no-op
      return;
    }

    // Unclaimed — claim it
    transaction.set(slugRef, { userId });
  });
}

/**
 * Deletes an existing slug mapping at `slugs/{slug}`.
 * Verifies ownership before deleting — throws if the slug
 * belongs to a different user.
 */
export async function deleteSlug(slug: string, userId?: string): Promise<void> {
  if (userId) {
    const slugRef = doc(db, "slugs", slug);
    const snapshot = await getDoc(slugRef);
    if (snapshot.exists()) {
      const owner = snapshot.data()?.userId;
      if (owner && owner !== userId) {
        throw new Error("Cannot delete a slug you do not own.");
      }
    }
  }
  await deleteDoc(doc(db, "slugs", slug));
}

/**
 * Looks up `slugs/{slug}` and returns the associated userId,
 * or `null` if the slug is not claimed.
 */
export async function getSlugOwner(slug: string): Promise<string | null> {
  const snapshot = await getDoc(doc(db, "slugs", slug));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return typeof data?.userId === "string" ? data.userId : null;
}
