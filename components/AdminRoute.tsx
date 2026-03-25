"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/lib/admin";

/**
 * Wraps admin-only pages — redirects non-admin users to /dashboard/edit.
 */
export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!isAdmin(user)) {
        router.replace("/dashboard/edit");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#F15928]" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin(user)) return null;

  return <>{children}</>;
}
