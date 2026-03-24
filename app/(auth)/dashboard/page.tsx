"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { BusinessCard } from "@/types/user";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg bg-white/5" style={{ width: 180, height: 180 }} />
    ),
  }
);

/**
 * /dashboard — Landing page shown after sign-in.
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

function DashboardContent() {
  const { user, logout, cardCache, cardLoading: authCardLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [cardLoaded, setCardLoaded] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  // Use cache for instant load, then background-refresh
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (cardCache) {
      setCard(cardCache);
      if (cardCache.slug) setSlug(cardCache.slug);
      setCardLoaded(true);
    } else if (!authCardLoading) {
      setCardLoaded(true);
    }
  }, [cardCache, authCardLoading]);

  // cardCache from AuthContext is the single source of truth.
  // No redundant background refresh needed.

  // Toast on redirect
  useEffect(() => {
    if (searchParams.get("saved") === "true") {
      showToast("Your card is live!", "success");
      router.replace("/dashboard");
    }
  }, [searchParams, showToast, router]);

  const sharePath = slug ? `/c/${slug}` : user ? `/card/${user.uid}` : "";
  const shareUrl = origin && sharePath ? `${origin}${sharePath}` : "";

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = "cnx-qr-code.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, []);

  const hasCard = cardLoaded && card !== null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-black tracking-widest text-white">CNX<span className="text-indigo-500">.</span></h1>
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? "User"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-indigo-500/50"
                referrerPolicy="no-referrer"
                unoptimized
              />
            )}
            <button
              onClick={logout}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="card-enter mx-auto max-w-7xl px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            <span className="ml-1 animate-wave">👋</span>
          </h2>
          <p className="mt-2 text-gray-400">
            Manage your digital business card and share it with the world.
          </p>
        </div>

        {/* ── Card status ── */}
        {cardLoaded && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
            {hasCard ? (
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Your card is live</p>
                  <div className="mt-0.5 flex gap-3 text-xs">
                    <Link href="/dashboard/edit" className="text-indigo-400 hover:text-indigo-300">Edit card</Link>
                    <a href={sharePath} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">View public card ↗</a>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-white">No card yet</p>
                <Link href="/dashboard/edit" className="mt-0.5 text-xs text-indigo-400 hover:text-indigo-300">Set up your card →</Link>
              </div>
            )}
          </div>
        )}

        {/* ── Dashboard grid ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Profile card */}
          <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/[0.07]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Your Profile</h3>
            <p className="mt-1 text-sm text-gray-400">{user?.email ?? "No email available"}</p>
          </div>

          {/* Business Card tile */}
          <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-violet-500/30 hover:bg-white/[0.07]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              {hasCard && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">Business Card</h3>
            <p className="mt-1 text-sm text-gray-400">
              {hasCard ? "Your card is set up." : "Create or edit your digital card."}
            </p>
            <Link
              href="/dashboard/edit"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              {hasCard ? "Edit Card" : "Set up Card"}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* ── Share hero card — spans full width on lg ── */}
          <div
            id="share"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-200 hover:border-emerald-500/30 hover:bg-white/[0.07] sm:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Share Your Card</h3>
            <p className="mt-1 text-sm text-gray-400">Link, QR code, or NFC.</p>

            {user && (
              <div className="mt-6 flex flex-col items-center gap-6">
                {/* QR Hero */}
                {shareUrl && (
                  <div ref={qrRef} className="rounded-2xl bg-white p-5 shadow-lg" aria-label="QR code for your public card">
                    <QRCodeSVG
                      value={shareUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#1e1b4b"
                      level="M"
                    />
                  </div>
                )}

                {/* URL pill */}
                <div className="flex w-full items-center gap-2">
                  <div className="min-w-0 flex-1 truncate rounded-full bg-white/[0.04] px-4 py-2.5 text-xs font-mono text-gray-400 ring-1 ring-white/[0.06]">
                    {sharePath}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid w-full grid-cols-2 gap-3">
                  <button
                    onClick={handleCopy}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      copied
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-indigo-600 text-white shadow-lg hover:bg-indigo-500"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all duration-200 hover:border-white/20 hover:text-white"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast}
    </div>
  );
}
