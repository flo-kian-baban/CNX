export default function PublicCardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#F15928]" />
        <p className="text-sm text-gray-400">Loading card…</p>
      </div>
    </div>
  );
}
