import { getBusinessCardRest } from "@/lib/firestore-rest";
import PublicCard from "./PublicCard";
import type { Metadata } from "next";

// ─────────────────────────────────────────────
// ISR — revalidate every 60 seconds
// ─────────────────────────────────────────────
export const revalidate = 60;

// ─────────────────────────────────────────────
// Dynamic metadata (OG tags, title)
// ─────────────────────────────────────────────

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const card = await getBusinessCardRest(userId);
  if (!card) return { title: "Card not found — CNX" };
  return {
    title: `${card.displayName} — CNX`,
    description: card.bio ?? `${card.displayName} · ${card.title}`,
    openGraph: {
      title: `${card.displayName} — CNX`,
      description: card.bio ?? `${card.displayName} · ${card.title}`,
      images: card.profileImage ? [{ url: card.profileImage }] : [],
    },
  };
}

// ─────────────────────────────────────────────
// Server Component — zero client JS for initial render
// ─────────────────────────────────────────────

export default async function PublicCardPage({ params }: Props) {
  const { userId } = await params;
  const card = await getBusinessCardRest(userId);

  if (!card) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <svg
              className="h-7 w-7 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Card not found</h1>
          <p className="mt-2 text-sm text-gray-400">
            This card doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
          >
            Go to CNX
          </a>
        </div>
      </div>
    );
  }

  return <PublicCard card={card} userId={userId} />;
}
