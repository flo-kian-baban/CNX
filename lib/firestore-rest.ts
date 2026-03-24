import type { BusinessCard } from "@/types/user";

/**
 * Fetches a business card directly via the Firestore REST API.
 * Bypasses the Firestore JS SDK entirely — no WebChannel,
 * no long-polling, no channel setup overhead.
 *
 * Use this for public reads (e.g. /card/[userId]) where
 * authentication is not needed and speed is critical.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/** Convert Firestore REST value format to plain JS value */
function parseValue(val: Record<string, unknown>): unknown {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values ?? []).map(parseValue);
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    return parseFields(map.fields ?? {});
  }
  return null;
}

/** Convert Firestore REST fields object to a plain JS object */
function parseFields(fields: Record<string, Record<string, unknown>>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseValue(val);
  }
  return result;
}

/**
 * Fetch a business card using the Firestore REST API.
 * Returns null if the document does not exist.
 */
export async function getBusinessCardRest(uid: string): Promise<BusinessCard | null> {
  if (!PROJECT_ID) {
    console.warn("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    return null;
  }

  const url = `${FIRESTORE_BASE}/users/${uid}/profile/card`;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error("Firestore REST error:", res.status, await res.text());
      return null;
    }

    const doc = await res.json();
    if (!doc.fields) return null;

    const data = parseFields(doc.fields) as Record<string, unknown>;
    if (typeof data.displayName !== "string") return null;

    return data as unknown as BusinessCard;
  } catch (err) {
    console.error("Firestore REST fetch failed:", err);
    return null;
  }
}

/**
 * Look up a slug via the Firestore REST API.
 * Returns the userId that owns the slug, or null.
 */
export async function getSlugOwnerRest(slug: string): Promise<string | null> {
  if (!PROJECT_ID) return null;

  const url = `${FIRESTORE_BASE}/slugs/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const doc = await res.json();
    if (!doc.fields) return null;

    const userId = doc.fields?.userId?.stringValue;
    return typeof userId === "string" ? userId : null;
  } catch {
    return null;
  }
}
