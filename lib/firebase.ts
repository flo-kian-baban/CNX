import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration pulled from environment variables.
 * All values are prefixed with NEXT_PUBLIC_ so they are
 * available on the client side in Next.js.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

// Validate required env vars are present
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing Firebase config: ${envVar}`);
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase only once.
 * In Next.js dev mode, hot-reloading can re-execute this module,
 * so we guard against duplicate initializations.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firestore instance.
 * Uses in-memory cache. Default WebChannel transport (no
 * experimentalAutoDetectLongPolling — it adds 5-10 s probe delay).
 */
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  });
} catch {
  // Already initialized (hot-reload) — just get the existing instance
  db = getFirestore(app);
}
export { db };

/** Firebase Auth instance */
export const auth = getAuth(app);

/** Firebase Storage instance */
export const storage = getStorage(app);

export default app;
