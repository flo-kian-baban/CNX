import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP.`
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit.`
    );
  }
}

function getExtension(file: File): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[file.type] ?? "jpg";
}

// ─────────────────────────────────────────────
// Upload functions
// ─────────────────────────────────────────────

/**
 * Uploads a profile image to Firebase Storage.
 * Path: `profile-images/{userId}/profile.{ext}`
 * Returns the download URL.
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  validateFile(file);
  const ext = getExtension(file);
  const storageRef = ref(storage, `profile-images/${userId}/profile.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/**
 * Uploads a banner image to Firebase Storage.
 * Path: `profile-images/{userId}/banner.{ext}`
 * Returns the download URL.
 */
export async function uploadBannerImage(
  userId: string,
  file: File
): Promise<string> {
  validateFile(file);
  const ext = getExtension(file);
  const storageRef = ref(storage, `profile-images/${userId}/banner.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
