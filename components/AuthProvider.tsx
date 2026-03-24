"use client";

import { AuthProvider as AuthContextProvider } from "@/context/AuthContext";

/**
 * Client-side wrapper that provides the Auth context to the entire app.
 * Used in the root layout since layouts are Server Components by default
 * and cannot use React context directly.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
