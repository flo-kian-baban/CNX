"use client";

/**
 * Error boundary for /dashboard/edit route.
 */
export default function EditCardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
          <svg
            className="h-7 w-7 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-[#F15928] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d94d22]"
          >
            Try again
          </button>
          <a
            href="/dashboard/edit"
            className="rounded-lg bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
          >
            Back to editor
          </a>
        </div>
      </div>
    </div>
  );
}
