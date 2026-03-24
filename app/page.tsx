import { redirect } from "next/navigation";

/**
 * Root page — server-side redirect to /dashboard/edit.
 * ProtectedRoute on the dashboard handles unauthenticated users.
 * Zero JS, instant redirect.
 */
export default function RootPage() {
  redirect("/dashboard/edit");
}
