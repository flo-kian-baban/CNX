"use client";

import { useState } from "react";
import Image from "next/image";
import type { BusinessCard, SocialLink } from "@/types/user";

// ─────────────────────────────────────────────
// URL safety
// ─────────────────────────────────────────────

function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

// ─────────────────────────────────────────────
// Platform icons — 18px
// ─────────────────────────────────────────────

function getSocialIcon(platform: SocialLink["platform"]): React.ReactNode {
  const cls = "h-[22px] w-[22px]";
  switch (platform) {
    case "linkedin": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "github": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
    case "twitter": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "instagram": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>;
    case "facebook": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "youtube": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    case "tiktok": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
    case "snapchat": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.254.065-.044.16-.071.263-.071.232 0 .497.128.56.365.07.279-.144.502-.396.641-.488.288-1.077.48-1.417.551-.113.024-.227.074-.278.14-.064.072-.072.17-.048.283l.002.005c.238 1.045.57 1.78.893 2.283.11.175.225.339.335.49.328.457.575.833.575 1.185 0 .188-.098.375-.249.55-.264.304-.686.514-1.17.64-.456.121-.973.19-1.332.24-.085.011-.161.023-.238.037-.116.017-.24.047-.368.085-.286.086-.555.234-.78.419-.395.33-.68.704-1.11.945-.438.24-.928.363-1.418.363-.2 0-.395-.025-.588-.067-.426-.095-.816-.31-1.127-.605-.218-.211-.398-.454-.575-.7-.237-.332-.454-.683-.83-.936-.22-.149-.445-.258-.667-.342-.155-.059-.313-.105-.481-.145-.108-.026-.216-.048-.328-.063-.069-.01-.137-.018-.203-.03-.468-.073-1.07-.159-1.618-.301-.498-.13-.93-.359-1.206-.674-.155-.179-.25-.368-.25-.554 0-.339.234-.714.562-1.171.115-.157.231-.324.343-.505.34-.522.685-1.274.929-2.343l.002-.008c.023-.107.017-.201-.049-.279-.048-.062-.156-.11-.267-.133-.349-.074-.942-.275-1.432-.565-.249-.147-.475-.37-.405-.664.064-.245.339-.381.564-.381.117 0 .231.035.308.087.282.145.66.249.963.257.193 0 .32-.043.401-.093a57 57 0 0 1-.03-.498l-.004-.07c-.104-1.627-.23-3.654.3-4.847C7.85 1.069 11.216.793 12.206.793"/></svg>;
    case "pinterest": return <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/></svg>;
    case "website": return <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"/></svg>;
  }
}

// ─────────────────────────────────────────────
// vCard
// ─────────────────────────────────────────────

function generateVCard(card: BusinessCard): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0", `FN:${card.displayName || ""}`];
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (card.phone) lines.push(`TEL:${card.phone}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  card.customLinks?.forEach((l) => { if (l.url && isSafeUrl(l.url)) lines.push(`URL:${l.url}`); });
  card.socialLinks?.forEach((l) => { if (l.url && isSafeUrl(l.url)) lines.push(`URL:${l.url}`); });
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function downloadVCard(card: BusinessCard) {
  const vcf = generateVCard(card);
  const fileName = (card.displayName || "contact").replace(/\s+/g, "_");

  // Use a hidden form submission to navigate the browser to the server response.
  // The server returns Content-Type: text/vcard which triggers native contact import
  // on iOS Safari, Android Chrome, and desktop browsers — no popups, no Blob URLs.
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/vcard";
  form.style.display = "none";

  const vcfInput = document.createElement("input");
  vcfInput.type = "hidden";
  vcfInput.name = "vcf";
  vcfInput.value = vcf;
  form.appendChild(vcfInput);

  const nameInput = document.createElement("input");
  nameInput.type = "hidden";
  nameInput.name = "fileName";
  nameInput.value = fileName;
  form.appendChild(nameInput);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface PublicCardProps {
  card: BusinessCard;
  userId: string;
  isPreview?: boolean;
}

// ─────────────────────────────────────────────
// Public Card — Premium Dark Profile
// ─────────────────────────────────────────────

export default function PublicCard({ card, isPreview }: PublicCardProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expandedExp, setExpandedExp] = useState<Set<string>>(new Set());
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const backgroundColor = card.cardTheme?.backgroundColor ?? "#030712";
  const accentColor = card.cardTheme?.accentColor ?? "#F15928";
  const bannerColor = card.cardTheme?.bannerColor ?? "#F15928";

  const hasPhone = !!card.phone?.trim();
  const hasEmail = !!card.email?.trim();
  const activeSocials = (card.socialLinks ?? []).filter((s) => s.url.trim());
  const activeCustomLinks = (card.customLinks ?? []).filter((l) => l.url.trim() && isSafeUrl(l.url));
  const experiences = card.experience ?? [];

  return (
    <div
      className={`${isPreview ? "" : "min-h-screen"} relative mx-auto max-w-md overflow-x-hidden`}
      style={{
        backgroundColor,
        animation: isPreview ? undefined : "cardFadeIn 300ms ease-out both",
      }}
    >
      {/* Ambient radial glow */}
      {!isPreview && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-64"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accentColor}15 0%, transparent 70%)`,
          }}
        />
      )}

      {/* All content above the glow */}
      <div className="relative z-[1]">

        {/* ── 1. Banner ── */}
        <div className="relative h-28 w-full overflow-hidden">
          {card.bannerImage ? (
            <>
              {!bannerLoaded && <div className="shimmer absolute inset-0" />}
              <img
                ref={(el) => { if (el?.complete) setBannerLoaded(true); }}
                src={card.bannerImage}
                alt=""
                className={`h-full w-full object-cover object-top transition-opacity duration-300 ${bannerLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setBannerLoaded(true)}
              />
            </>
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: bannerColor }}>
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)`,
                }}
              />
            </div>
          )}
        </div>

        {/* ── 2. Profile Photo ── */}
        <div className="relative z-10 -mt-[53px] flex justify-center">
          {card.profileImage ? (
            <div className="relative h-28 w-28">
              {!avatarLoaded && <div className="shimmer absolute inset-0 rounded-full" />}
              <Image
                ref={(el) => { if ((el as unknown as HTMLImageElement)?.complete) setAvatarLoaded(true); }}
                src={card.profileImage}
                alt={card.displayName || "Profile"}
                width={112}
                height={112}
                className={`h-28 w-28 rounded-full object-cover ring-4 transition-opacity duration-300 ${avatarLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ ["--tw-ring-color" as string]: backgroundColor } as React.CSSProperties}
                onLoad={() => setAvatarLoaded(true)}
                unoptimized
              />
            </div>
          ) : (
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full ring-4"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                ["--tw-ring-color" as string]: backgroundColor,
              } as React.CSSProperties}
            >
              {card.displayName ? (
                <span className="text-3xl font-bold text-white">{card.displayName[0].toUpperCase()}</span>
              ) : (
                <svg className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* ── 3. Identity ── */}
        <div className="px-5 pt-3 text-center">
          <h1 className="text-xl font-bold text-white">
            {card.displayName?.trim() || <span className="text-gray-600">Your Name</span>}
          </h1>

          {(card.title?.trim() || isPreview) && (
            <p className="mt-0.5 text-sm font-medium" style={{ color: accentColor, opacity: 0.85 }}>
              {card.title?.trim() || <span style={{ opacity: 0.4 }}>Your Title</span>}
            </p>
          )}

          {card.location?.trim() && (
            <p className="mt-0.5 text-xs text-gray-500">{card.location}</p>
          )}

          <div className="mx-auto mt-2 max-w-[280px]">
            {card.bio?.trim() ? (
              <>
                <p className={`text-xs leading-relaxed text-gray-400 ${!bioExpanded ? "line-clamp-2" : ""}`}>
                  {card.bio}
                </p>
                {card.bio.length > 80 && !bioExpanded && (
                  <button
                    onClick={() => setBioExpanded(true)}
                    className="mt-0.5 text-xs font-medium"
                    style={{ color: accentColor }}
                  >
                    more
                  </button>
                )}
              </>
            ) : isPreview ? (
              <p className="text-xs italic text-gray-700">Your bio will appear here</p>
            ) : null}
          </div>
        </div>

        {/* ── 4. Social Links ── */}
        <div className="mt-4 px-5">
          {activeSocials.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {activeSocials.map((s, i) => (
                <a
                  key={`${s.platform}-${i}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-300 transition-all duration-200 hover:text-white active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  aria-label={s.platform}
                >
                  {getSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          ) : isPreview ? (
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-700"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <svg className="h-[16px] w-[16px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── 5. Experience ── */}
        {experiences.length > 0 && (
          <div className="mt-5 px-5">
            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <p className="mb-3 mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Experience
            </p>
            {experiences.map((exp) => {
              const isOpen = expandedExp.has(exp.id);
              const hasDetails = !!exp.description;
              const dateStr = exp.startDate
                ? `${exp.startDate}${exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}`
                : exp.current ? "Present" : "";

              const content = (
                <>
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-semibold text-gray-400"
                    style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    {exp.companyLogo ? (
                      <img src={exp.companyLogo} alt={exp.company} className="h-full w-full object-contain p-1" />
                    ) : (
                      (exp.company || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{exp.role || exp.company}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="truncate">{exp.role ? exp.company : ""}</span>
                      {exp.role && exp.company && dateStr && <span className="text-gray-600">·</span>}
                      {dateStr && <span className="shrink-0 text-gray-500">{dateStr}</span>}
                    </p>
                  </div>
                  {hasDetails && (
                    <svg
                      className={`h-4 w-4 shrink-0 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </>
              );

              return (
                <div key={exp.id} className="mb-2">
                  {hasDetails ? (
                    <button
                      onClick={() =>
                        setExpandedExp((prev) => {
                          const next = new Set(prev);
                          next.has(exp.id) ? next.delete(exp.id) : next.add(exp.id);
                          return next;
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex w-full items-center gap-3 px-2 py-2">
                      {content}
                    </div>
                  )}

                  {isOpen && hasDetails && (
                    <div className="ml-[56px] mt-1 pb-2">
                      <p className="text-[11px] leading-relaxed text-gray-500">
                        {exp.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 6. Custom Links ── */}
        {(activeCustomLinks.length > 0 || isPreview) && (
          <div className="mt-4 px-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Links
            </p>
            {activeCustomLinks.length > 0 ? (
              <div className="space-y-2">
                {activeCustomLinks.map((link, i) => (
                  <a
                    key={`${link.label}-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-11 items-center justify-between rounded-xl px-4 text-sm text-gray-300 transition-all duration-150 hover:text-white active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span className="truncate">{link.label || link.url}</span>
                    <svg className="ml-2 h-3.5 w-3.5 shrink-0 text-gray-600 transition-colors group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div
                className="flex h-11 items-center justify-center rounded-xl text-[11px] text-gray-700"
                style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
              >
                Your links will appear here
              </div>
            )}
          </div>
        )}

        {/* Spacer for fixed bottom bar */}
        {!isPreview && <div className="h-24" />}

        {/* ── 8. Footer ── */}
        <p className={`text-center text-[10px] text-gray-700 ${isPreview ? "pb-2" : "pb-20"}`}>
          Powered by{" "}
          <a href="/" className="font-medium text-gray-500 transition-colors hover:text-[#F15928]">
            CNX
          </a>
        </p>
      </div>

      {/* ── 7. Action Buttons (fixed bottom) ── */}
      <div className={`${isPreview ? "" : "fixed bottom-0 left-0 right-0 z-50"}`}>
        <div className="mx-auto max-w-md">
          <div
            className="pointer-events-none h-6"
            style={{ background: `linear-gradient(to bottom, transparent, ${backgroundColor})` }}
          />
          <div
            className={`flex items-stretch gap-3 px-5 ${isPreview ? "pb-4 pt-1" : "pb-5 pt-1"}`}
            style={{ backgroundColor }}
          >
          {hasPhone && (
            <a
              href={`tel:${card.phone}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-gray-300 transition-all duration-200 hover:text-white active:scale-95"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              aria-label="Call"
            >
              <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </a>
          )}

          <button
            onClick={() => downloadVCard(card)}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            Save Contact
          </button>

          {hasEmail && (
            <a
              href={`mailto:${card.email}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-gray-300 transition-all duration-200 hover:text-white active:scale-95"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              aria-label="Email"
            >
              <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </a>
          )}
          </div>
        </div>
      </div>

      {/* Entrance + shimmer animation keyframes */}
      <style jsx>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04) 25%,
            rgba(255, 255, 255, 0.12) 50%,
            rgba(255, 255, 255, 0.04) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
