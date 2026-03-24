"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument, getBusinessCard } from "@/lib/firestore";
import { getBusinessCardRest } from "@/lib/firestore-rest";
import type { BusinessCard } from "@/types/user";

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface AuthContextValue {
  /** The currently signed-in Firebase user, or `null`. */
  user: User | null;
  /** `true` while the auth state is being resolved on mount. */
  loading: boolean;
  /** Pre-fetched card data (available before editor mounts). */
  cardCache: BusinessCard | null;
  /** `true` while the card is being pre-fetched. */
  cardLoading: boolean;
  /** Opens the Google Sign-In popup and upserts the user doc. */
  signInWithGoogle: () => Promise<void>;
  /** Signs in with email and password. */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Creates a new account with email and password. */
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  /** Signs the current user out. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardCache, setCardCache] = useState<BusinessCard | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const fetchedForUid = useRef<string | null>(null);

  // Pre-fetch card data — tries REST API first (instant), falls back to SDK
  const prefetchCard = async (uid: string) => {
    if (fetchedForUid.current === uid) return;
    fetchedForUid.current = uid;
    setCardLoading(true);
    try {
      // REST API is instant (no SDK connection overhead)
      let card = await getBusinessCardRest(uid);
      // If REST returned null (API disabled or no doc), try SDK as fallback
      if (!card) {
        card = await getBusinessCard(uid);
      }
      setCardCache(card);
    } catch (err) {
      console.error("Card prefetch failed:", err);
    } finally {
      setCardLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        prefetchCard(firebaseUser.uid);
      } else {
        setCardCache(null);
        setCardLoading(false);
        fetchedForUid.current = null;
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    createUserDocument(result.user).catch(console.error);
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    createUserDocument(result.user).catch(console.error);
  };

  const handleSignUpWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    createUserDocument(result.user).catch(console.error);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cardCache,
        cardLoading,
        signInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

/**
 * Custom hook to consume the AuthContext.
 * Must be used inside an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
