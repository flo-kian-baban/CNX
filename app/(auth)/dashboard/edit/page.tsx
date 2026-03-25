"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import {
  getBusinessCard,
  updateBusinessCard,
  updateSlug,
  deleteSlug,
  SLUG_TAKEN_ERROR,
} from "@/lib/firestore";
import { uploadProfileImage, uploadBannerImage } from "@/lib/storage";
import type { BusinessCard, CustomLink, SocialLink, Experience, Education } from "@/types/user";
import PublicCard from "@/app/card/[userId]/PublicCard";
import { useToast } from "@/components/Toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg bg-white/5" style={{ width: 160, height: 160 }} />
    ),
  }
);

export default function EditCardPage() {
  return (
    <ProtectedRoute>
      <EditCardContent />
    </ProtectedRoute>
  );
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORMS: SocialLink["platform"][] = [
  "instagram","linkedin","youtube","tiktok","twitter",
  "facebook","github","snapchat","pinterest","website",
];

const PLATFORM_LABELS: Record<SocialLink["platform"], string> = {
  instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube",
  tiktok: "TikTok", twitter: "X / Twitter", facebook: "Facebook",
  github: "GitHub", snapchat: "Snapchat", pinterest: "Pinterest",
  website: "Website",
};

// ─────────────────────────────────────────────
// Form state & validation types
// ─────────────────────────────────────────────

interface FormState {
  displayName: string;
  title: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  profileImage: string;
  bannerImage: string;
  socialLinks: Record<SocialLink["platform"], string>;
  customLinks: CustomLink[];
  experience: Experience[];
  education?: Education;
  slug: string;
  backgroundColor: string;
  accentColor: string;
  bannerColor: string;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  phone?: string;
  slug?: string;
  customLinks?: Record<number, { label?: string; url?: string }>;
}

function emptySocialLinks(): Record<SocialLink["platform"], string> {
  return Object.fromEntries(PLATFORMS.map((p) => [p, ""])) as Record<SocialLink["platform"], string>;
}

const EMPTY_FORM: FormState = {
  displayName: "", title: "", bio: "", location: "",
  phone: "", email: "", profileImage: "", bannerImage: "",
  socialLinks: emptySocialLinks(), customLinks: [], experience: [], education: undefined, slug: "",
  backgroundColor: "#030712", accentColor: "#F15928", bannerColor: "#F15928",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,}$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;

// ─────────────────────────────────────────────
// Completeness (5 × 20%)
// ─────────────────────────────────────────────

function calcCompleteness(form: FormState): number {
  let pct = 0;
  if (form.displayName.trim()) pct += 20;
  if (form.title.trim()) pct += 20;
  if (form.profileImage) pct += 20;
  const hasAnyLink =
    Object.values(form.socialLinks).some((v) => v.trim()) ||
    form.customLinks.some((l) => l.url.trim());
  if (hasAnyLink) pct += 20;
  if (form.phone.trim() || form.email.trim()) pct += 20;
  return pct;
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.displayName.trim()) errors.displayName = "Display name is required.";
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim()))
    errors.email = "Enter a valid email address.";
  if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim()))
    errors.phone = "Enter a valid phone number.";
  if (form.slug.trim()) {
    const s = form.slug.trim();
    if (s.length < 3) errors.slug = "Slug must be at least 3 characters.";
    else if (s.length > 30) errors.slug = "Slug must be 30 characters or less.";
    else if (!SLUG_REGEX.test(s)) errors.slug = "Only lowercase letters, numbers, and hyphens allowed.";
  }
  const linkErrors: Record<number, { label?: string; url?: string }> = {};
  form.customLinks.forEach((link, i) => {
    const errs: { label?: string; url?: string } = {};
    if (link.url.trim() && !link.label.trim()) errs.label = "Label is required when a URL is provided.";
    if (link.url.trim() && !/^https?:\/\//i.test(link.url.trim())) errs.url = "URL must start with https:// or http://";
    if (Object.keys(errs).length > 0) linkErrors[i] = errs;
  });
  if (Object.keys(linkErrors).length > 0) errors.customLinks = linkErrors;
  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return !!errors.displayName || !!errors.email || !!errors.phone || !!errors.slug ||
    (!!errors.customLinks && Object.keys(errors.customLinks).length > 0);
}

// ─────────────────────────────────────────────
// formToCard helper
// ─────────────────────────────────────────────

function formToCard(form: FormState): BusinessCard {
  const socialLinks = PLATFORMS
    .filter((p) => form.socialLinks[p].trim())
    .map((p) => ({ platform: p, url: form.socialLinks[p] }));
  return {
    displayName: form.displayName, title: form.title,
    bio: form.bio || undefined, location: form.location || undefined,
    phone: form.phone, email: form.email,
    profileImage: form.profileImage,
    bannerImage: form.bannerImage || undefined,
    socialLinks, customLinks: form.customLinks,
    experience: form.experience.length > 0 ? form.experience : undefined,
    education: form.education?.institution ? form.education : undefined,
    slug: form.slug || undefined,
    cardTheme: { backgroundColor: form.backgroundColor, accentColor: form.accentColor, bannerColor: form.bannerColor },
    updatedAt: null as unknown as BusinessCard["updatedAt"],
  };
}

// ─────────────────────────────────────────────
// Platform icon (condensed)
// ─────────────────────────────────────────────

function PlatformIcon({ platform }: { platform: SocialLink["platform"] }) {
  const c = "h-[22px] w-[22px]";
  const icons: Record<string, React.ReactNode> = {
    instagram: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z"/></svg>,
    linkedin: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    youtube: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    tiktok: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    twitter: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    facebook: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    github: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
    snapchat: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.254.065-.044.16-.071.263-.071.232 0 .497.128.56.365.07.279-.144.502-.396.641-.488.288-1.077.48-1.417.551-.113.024-.227.074-.278.14-.064.072-.072.17-.048.283l.002.005c.238 1.045.57 1.78.893 2.283.11.175.225.339.335.49.328.457.575.833.575 1.185 0 .188-.098.375-.249.55-.264.304-.686.514-1.17.64-.456.121-.973.19-1.332.24-.085.011-.161.023-.238.037-.116.017-.24.047-.368.085-.286.086-.555.234-.78.419-.395.33-.68.704-1.11.945-.438.24-.928.363-1.418.363-.2 0-.395-.025-.588-.067-.426-.095-.816-.31-1.127-.605-.218-.211-.398-.454-.575-.7-.237-.332-.454-.683-.83-.936-.22-.149-.445-.258-.667-.342-.155-.059-.313-.105-.481-.145-.108-.026-.216-.048-.328-.063-.069-.01-.137-.018-.203-.03-.468-.073-1.07-.159-1.618-.301-.498-.13-.93-.359-1.206-.674-.155-.179-.25-.368-.25-.554 0-.339.234-.714.562-1.171.115-.157.231-.324.343-.505.34-.522.685-1.274.929-2.343l.002-.008c.023-.107.017-.201-.049-.279-.048-.062-.156-.11-.267-.133-.349-.074-.942-.275-1.432-.565-.249-.147-.475-.37-.405-.664.064-.245.339-.381.564-.381.117 0 .231.035.308.087.282.145.66.249.963.257.193 0 .32-.043.401-.093a57 57 0 0 1-.03-.498l-.004-.07c-.104-1.627-.23-3.654.3-4.847C7.85 1.069 11.216.793 12.206.793"/></svg>,
    pinterest: <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12"/></svg>,
    website: <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"/></svg>,
  };
  return <>{icons[platform]}</>;
}

// ─────────────────────────────────────────────
// Editor content
// ─────────────────────────────────────────────

function EditCardContent() {
  const { user, logout, cardCache, cardLoading: authCardLoading } = useAuth();
  const { toast, showToast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [showWelcome, setShowWelcome] = useState(false);
  const [origin, setOrigin] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinError, setLinkedinError] = useState("");

  const originalSlugRef = useRef<string>("");
  const isNewCardRef = useRef<boolean>(true);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const bgColorRef = useRef<HTMLInputElement>(null);
  const accentColorRef = useRef<HTMLInputElement>(null);
  const bannerColorRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);
  const completeness = useMemo(() => calcCompleteness(form), [form]);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  // Hydrate form from a BusinessCard
  const hydrateForm = useCallback((card: BusinessCard) => {
    isNewCardRef.current = false;
    const loadedSlug = card.slug ?? "";
    originalSlugRef.current = loadedSlug;
    const socials = emptySocialLinks();
    card.socialLinks?.forEach((s) => { socials[s.platform] = s.url; });
    const expanded = new Set<string>();
    PLATFORMS.forEach((p) => { if (socials[p]) expanded.add(p); });
    setExpandedPlatforms(expanded);
    const loaded: FormState = {
      displayName: card.displayName ?? "", title: card.title ?? "",
      bio: card.bio ?? "", location: card.location ?? "",
      phone: card.phone ?? "", email: card.email ?? "",
      profileImage: card.profileImage ?? "",
      bannerImage: card.bannerImage ?? "",
      socialLinks: socials, customLinks: card.customLinks ?? [],
      experience: card.experience ?? [],
      education: card.education ?? undefined,
      slug: loadedSlug,
      backgroundColor: card.cardTheme?.backgroundColor ?? "#030712",
      accentColor: card.cardTheme?.accentColor ?? "#F15928",
      bannerColor: card.cardTheme?.bannerColor ?? "#F15928",
    };
    setForm(loaded);
    setSavedForm(loaded);
  }, []);

  // Use cardCache for instant hydration if available
  const hydratedFromCache = useRef(false);
  useEffect(() => {
    if (cardCache && !hydratedFromCache.current) {
      hydratedFromCache.current = true;
      hydrateForm(cardCache);
      setLoading(false);
    } else if (!authCardLoading && !cardCache && !hydratedFromCache.current) {
      // No cache and auth finished loading → first-time user
      hydratedFromCache.current = true;
      const dismissed = localStorage.getItem("cnx-welcome-dismissed");
      if (!dismissed) setShowWelcome(true);
      setLoading(false);
    }
  }, [cardCache, authCardLoading, hydrateForm]);

  // Background fetch for freshness (only when cache missed)
  useEffect(() => {
    if (!user || hydratedFromCache.current) return;
    (async () => {
      try {
        const card = await getBusinessCard(user.uid);
        if (card) {
          hydrateForm(card);
        } else {
          const dismissed = localStorage.getItem("cnx-welcome-dismissed");
          if (!dismissed) setShowWelcome(true);
        }
      } catch (err) { console.error("Failed to load card:", err); }
      finally { setLoading(false); }
    })();
  }, [user, hydrateForm]);

  // Field helpers
  const updateField = useCallback((field: keyof Omit<FormState, "customLinks" | "socialLinks">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const updateSocial = useCallback((platform: SocialLink["platform"], url: string) => {
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: url } }));
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform); else next.add(platform);
      return next;
    });
  }, []);

  const addLink = useCallback(() => {
    setForm((prev) => ({ ...prev, customLinks: [...prev.customLinks, { label: "", url: "" }] }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setForm((prev) => ({ ...prev, customLinks: prev.customLinks.filter((_, i) => i !== index) }));
    setErrors((prev) => {
      if (!prev.customLinks) return prev;
      const updated = { ...prev.customLinks };
      delete updated[index];
      return { ...prev, customLinks: Object.keys(updated).length > 0 ? updated : undefined };
    });
  }, []);

  const updateLink = useCallback((index: number, field: keyof CustomLink, value: string) => {
    setForm((prev) => ({
      ...prev,
      customLinks: prev.customLinks.map((link, i) => i === index ? { ...link, [field]: value } : link),
    }));
    setErrors((prev) => {
      if (!prev.customLinks?.[index]) return prev;
      const updated = { ...prev.customLinks };
      const linkErr = { ...updated[index] };
      delete linkErr[field];
      if (Object.keys(linkErr).length === 0) delete updated[index];
      else updated[index] = linkErr;
      return { ...prev, customLinks: Object.keys(updated).length > 0 ? updated : undefined };
    });
  }, []);

  // Image uploads
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingProfile(true);
    try {
      const url = await uploadProfileImage(user.uid, file);
      setForm((prev) => ({ ...prev, profileImage: url }));
      showToast("Profile photo uploaded!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally { setUploadingProfile(false); }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    try {
      const url = await uploadBannerImage(user.uid, file);
      setForm((prev) => ({ ...prev, bannerImage: url }));
      showToast("Banner uploaded!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally { setUploadingBanner(false); }
  };

  // Save
  const handleSave = async () => {
    if (!user) return;
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    setSaving(true);
    try {
      const card = formToCard(form);
      const { updatedAt: _, ...cardData } = card;
      await updateBusinessCard(user.uid, cardData);
      const newSlug = form.slug.trim();
      const oldSlug = originalSlugRef.current;
      if (newSlug) {
        try {
          await updateSlug(newSlug, user.uid);
          if (oldSlug && oldSlug !== newSlug) await deleteSlug(oldSlug, user.uid);
          originalSlugRef.current = newSlug;
        } catch (slugErr) {
          if (slugErr instanceof Error && slugErr.message === SLUG_TAKEN_ERROR) {
            setErrors((prev) => ({ ...prev, slug: SLUG_TAKEN_ERROR }));
            showToast("Card saved, but the slug could not be claimed.", "error");
            setSaving(false);
            isNewCardRef.current = false;
            setSavedForm({ ...form, slug: savedForm.slug });
            return;
          }
          throw slugErr;
        }
      } else if (oldSlug) {
        await deleteSlug(oldSlug, user.uid);
        originalSlugRef.current = "";
      }
      isNewCardRef.current = false;
      setSavedForm(form);
      showToast("Card saved successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save. Please try again.", "error");
    } finally { setSaving(false); }
  };

  // QR download
  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
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

  const sharePath = form.slug.trim() ? `/c/${form.slug.trim()}` : user ? `/card/${user.uid}` : "";
  const shareUrl = origin && sharePath ? `${origin}${sharePath}` : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pb-20">
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-black tracking-widest text-white">CNX<span className="text-[#F15928]">.</span></h1>
            <div className="h-7 w-20 animate-pulse rounded-lg bg-white/5" />
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="max-w-lg space-y-8">
            {/* Skeleton: completeness bar */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
              <div className="mt-3 h-1.5 animate-pulse rounded-full bg-white/5" />
            </div>
            {/* Skeleton: banner */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-28 animate-pulse rounded-xl bg-white/5" />
              {/* Skeleton: profile photo */}
              <div className="h-24 w-24 animate-pulse rounded-full bg-white/5" />
              {/* Skeleton: fields */}
              <div className="h-10 animate-pulse rounded-lg bg-white/5" />
              <div className="h-10 animate-pulse rounded-lg bg-white/5" />
              <div className="h-10 animate-pulse rounded-lg bg-white/5" />
              <div className="h-20 animate-pulse rounded-xl bg-white/5" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-black tracking-widest text-white">CNX<span className="text-[#F15928]">.</span></h1>
          <div className="flex items-center gap-3">
            {sharePath && (
              <a href={sharePath} target="_blank" rel="noopener noreferrer"
                className="hidden text-sm font-medium text-gray-400 transition-colors hover:text-white sm:block">
                View Card ↗
              </a>
            )}
            <Link href="/dashboard" className="hidden text-sm font-medium text-gray-400 transition-colors hover:text-white sm:block">
              Dashboard
            </Link>
            {user?.photoURL && (
              <Image src={user.photoURL} alt={user.displayName ?? "User"} width={28} height={28}
                className="rounded-full ring-2 ring-[#F15928]/50" referrerPolicy="no-referrer" unoptimized />
            )}
            <button onClick={logout}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="card-enter mx-auto max-w-7xl px-6 py-10">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#F15928]/20 bg-[#F15928]/10 px-6 py-4">
            <p className="text-sm font-medium text-[#F15928]">Welcome to CNX — let&apos;s set up your card.</p>
            <button onClick={() => { setShowWelcome(false); localStorage.setItem("cnx-welcome-dismissed", "1"); }}
              className="text-[#F15928]/60 hover:text-[#F15928]"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* ── LEFT: Form ── */}
          <div className="max-w-lg space-y-8 pb-24">
            {/* Completeness */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">
                  Card <span className={completeness === 100 ? "text-emerald-400" : "text-[#F15928]"}>{completeness}%</span> complete
                  {completeness === 100 && <span className="ml-2 text-emerald-400">✓</span>}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full transition-all duration-500 ${completeness === 100 ? "bg-emerald-500" : "bg-[#F15928]"}`}
                  style={{ width: `${completeness}%` }}/>
              </div>
            </div>

            {/* ── Section: LinkedIn Import ── */}
            <section>
              <SectionHeading title="Quick Import" />
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A66C2]/15 text-[#0A66C2]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Import from LinkedIn</p>
                    <p className="text-xs text-gray-500">Paste your profile URL to auto-fill your card</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => { setLinkedinUrl(e.target.value); setLinkedinError(""); }}
                    placeholder="https://www.linkedin.com/in/your-name"
                    className="form-input flex-1 text-sm"
                    disabled={linkedinLoading}
                  />
                  <button
                    type="button"
                    disabled={linkedinLoading || !linkedinUrl.trim()}
                    onClick={async () => {
                      setLinkedinLoading(true);
                      setLinkedinError("");
                      try {
                        const res = await fetch("/api/linkedin", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: linkedinUrl.trim() }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Failed to import");

                        // Populate form fields
                        setForm((prev) => ({
                          ...prev,
                          displayName: data.displayName || prev.displayName,
                          title: data.title || prev.title,
                          bio: data.bio || prev.bio,
                          location: data.location || prev.location,
                          profileImage: data.profileImage || prev.profileImage,
                          bannerImage: data.bannerImage || prev.bannerImage,
                          experience: data.experiences?.length ? data.experiences : prev.experience,
                          education: data.education || prev.education,
                          socialLinks: {
                            ...prev.socialLinks,
                            linkedin: data.linkedinUrl || prev.socialLinks.linkedin,
                          },
                        }));

                        const imported: string[] = [];
                        if (data.displayName) imported.push("name");
                        if (data.title) imported.push("title");
                        if (data.bio) imported.push("bio");
                        if (data.location) imported.push("location");
                        if (data.bannerImage) imported.push("banner");
                        if (data.experiences?.length) imported.push(`${data.experiences.length} experiences`);
                        if (data.education?.institution) imported.push("education");
                        showToast(`Imported: ${imported.join(", ")}`, "success");
                      } catch (err) {
                        const msg = err instanceof Error ? err.message : "Import failed";
                        setLinkedinError(msg);
                        showToast(msg, "error");
                      } finally {
                        setLinkedinLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-[#0A66C2] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#004182] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {linkedinLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Importing…
                      </>
                    ) : (
                      "Import"
                    )}
                  </button>
                </div>
                {linkedinError && (
                  <p className="mt-2 text-xs text-red-400">{linkedinError}</p>
                )}
              </div>
            </section>

            {/* ── Section: Profile ── */}
            <section>
              <SectionHeading title="Profile" />
              <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                {/* Banner upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Banner Image</label>
                  <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload}/>
                  <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                    className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/20 transition-colors hover:border-[#F15928]/50"
                    style={form.bannerImage ? { backgroundImage: `url(${form.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
                    {uploadingBanner ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-[#F15928]"/>
                    ) : !form.bannerImage ? (
                      <div className="flex flex-col items-center gap-1 text-gray-500">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"/></svg>
                        <span className="text-xs">Upload banner</span>
                      </div>
                    ) : <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"><span className="text-xs font-medium text-white">Change banner</span></div>}
                  </button>
                </div>

                {/* Profile photo upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Profile Photo</label>
                  <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileUpload}/>
                  <button type="button" onClick={() => profileInputRef.current?.click()} disabled={uploadingProfile}
                    className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 transition-colors hover:border-[#F15928]/50">
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile" className="h-full w-full rounded-full object-cover"/>
                    ) : (
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/></svg>
                    )}
                    {uploadingProfile && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-[#F15928]"/></div>}
                  </button>
                </div>

                <FieldGroup label="Display Name" htmlFor="displayName" required error={errors.displayName}>
                  <input id="displayName" type="text" value={form.displayName} onChange={(e) => updateField("displayName", e.target.value)}
                    placeholder="Jane Smith" className={`form-input ${errors.displayName ? "ring-red-500/50" : ""}`}/>
                </FieldGroup>
                <FieldGroup label="Title / Role" htmlFor="title">
                  <input id="title" type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Co-Founder @ Company" className="form-input"/>
                </FieldGroup>
                <FieldGroup label="Location" htmlFor="location">
                  <input id="location" type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Toronto, ON" className="form-input"/>
                </FieldGroup>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="bio" className="text-sm font-medium text-gray-300">Bio</label>
                    <span className="text-xs text-gray-500">{form.bio.length} / 160</span>
                  </div>
                  <textarea id="bio" rows={3} value={form.bio} maxLength={160}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="A short description about you..." className="form-input resize-none"/>
                </div>
              </div>
            </section>

            {/* ── Section: Contact ── */}
            <section>
              <SectionHeading title="Contact" />
              <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                <FieldGroup label="Phone" htmlFor="phone" error={errors.phone}>
                  <input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000" className={`form-input ${errors.phone ? "ring-red-500/50" : ""}`}/>
                </FieldGroup>
                <FieldGroup label="Email" htmlFor="email" error={errors.email}>
                  <input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
                    placeholder="jane@company.com" className={`form-input ${errors.email ? "ring-red-500/50" : ""}`}/>
                </FieldGroup>
              </div>
            </section>

            {/* ── Section: Social Links ── */}
            <section>
              <SectionHeading title="Social Links" />
              <div className="mt-4 space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl">
                {PLATFORMS.map((p) => {
                  const isExpanded = expandedPlatforms.has(p);
                  const hasValue = !!form.socialLinks[p];
                  return (
                    <div key={p} className={`rounded-xl px-3 py-2.5 transition-colors ${isExpanded || hasValue ? "bg-[#F15928]/10" : ""}`}>
                      <button type="button" onClick={() => togglePlatform(p)}
                        className="flex w-full items-center gap-3 text-left">
                        <span className={`${hasValue ? "text-[#F15928]" : "text-gray-500"}`}><PlatformIcon platform={p}/></span>
                        <span className={`text-sm font-medium ${hasValue ? "text-white" : "text-gray-400"}`}>{PLATFORM_LABELS[p]}</span>
                        <svg className={`ml-auto h-3.5 w-3.5 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                        </svg>
                      </button>
                      {isExpanded && (
                        <input type="url" value={form.socialLinks[p]} onChange={(e) => updateSocial(p, e.target.value)}
                          placeholder={`https://${p === "website" ? "yoursite.com" : p + ".com/..."}`}
                          className="form-input mt-2 w-full text-sm"/>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Section: Links ── */}
            <section>
              <SectionHeading title="Links" />
              <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Custom Links</label>
                  <button type="button" onClick={addLink}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-[#F15928]/40 hover:text-[#F15928]">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    Add Link
                  </button>
                </div>
                {form.customLinks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-gray-500">No links yet.</p>
                )}
                <div className="space-y-3">
                  {form.customLinks.map((link, index) => {
                    const linkErr = errors.customLinks?.[index];
                    return (
                      <div key={index} className="group link-row-enter rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                            <div className="flex-1">
                              <input type="text" value={link.label} onChange={(e) => updateLink(index, "label", e.target.value)}
                                placeholder="Label" className={`form-input w-full ${linkErr?.label ? "ring-red-500/50" : ""}`}/>
                              {linkErr?.label && <p className="mt-1 text-xs text-red-400">{linkErr.label}</p>}
                            </div>
                            <div className="flex-1">
                              <input type="url" value={link.url} onChange={(e) => updateLink(index, "url", e.target.value)}
                                placeholder="https://..." className={`form-input w-full ${linkErr?.url ? "ring-red-500/50" : ""}`}/>
                              {linkErr?.url && <p className="mt-1 text-xs text-red-400">{linkErr.url}</p>}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeLink(index)}
                            className="mt-1.5 rounded-lg p-1.5 text-gray-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Section: Experience ── */}
            <section>
              <div className="flex items-center justify-between">
                <SectionHeading title="Experience" />
                <button type="button" onClick={() => {
                  setForm((prev) => ({ ...prev, experience: [...prev.experience, {
                    id: Date.now().toString(), company: "", role: "", startDate: "", current: false,
                  }] }));
                }} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-[#F15928]/40 hover:text-[#F15928]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Add Experience
                </button>
              </div>
              {form.experience.length > 0 && (
                <div className="mt-4 space-y-3">
                  {form.experience.map((exp, idx) => (
                    <div key={exp.id} className="link-row-enter relative rounded-2xl border border-white/[0.08] bg-white/5 p-4">
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))}
                        className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                      </button>
                      <div className="space-y-3 pr-8">
                        <input type="text" value={exp.role} placeholder="Co-Founder" className="form-input w-full"
                          onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, role: e.target.value } : x) }))} />
                        <input type="text" value={exp.company} placeholder="Acme Inc." className="form-input w-full"
                          onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, company: e.target.value } : x) }))} />
                        <div className="flex gap-3">
                          <input type="text" value={exp.startDate} placeholder="Jan 2022" className="form-input flex-1"
                            onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, startDate: e.target.value } : x) }))} />
                          <input type="text" value={exp.current ? "Present" : (exp.endDate ?? "")} placeholder="Dec 2023" disabled={exp.current}
                            className={`form-input flex-1 ${exp.current ? "opacity-50" : ""}`}
                            onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, endDate: e.target.value } : x) }))} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <input type="checkbox" checked={exp.current} className="rounded border-white/20 bg-white/5"
                            onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, current: e.target.checked, endDate: e.target.checked ? undefined : x.endDate } : x) }))} />
                          Currently working here
                        </label>
                        <textarea rows={2} value={exp.description ?? ""} placeholder="What did you do here..." className="form-input w-full resize-none"
                          onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, description: e.target.value } : x) }))} />
                        <input type="url" value={exp.companyLogo ?? ""} placeholder="https://logo.clearbit.com/..." className="form-input w-full text-sm"
                          onChange={(e) => setForm((prev) => ({ ...prev, experience: prev.experience.map((x, i) => i === idx ? { ...x, companyLogo: e.target.value } : x) }))} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Section: Education ── */}
            <section>
              <SectionHeading title="Education" />
              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/5 p-4 space-y-3">
                <input type="text" value={form.education?.institution ?? ""} placeholder="University or Institution"
                  className="form-input w-full"
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    education: { ...prev.education, institution: e.target.value, degree: prev.education?.degree, fieldOfStudy: prev.education?.fieldOfStudy, logo: prev.education?.logo },
                  }))} />
                <input type="text" value={form.education?.degree ?? ""} placeholder="Degree (e.g. Bachelor of Science)"
                  className="form-input w-full"
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    education: { ...prev.education, institution: prev.education?.institution ?? "", degree: e.target.value, fieldOfStudy: prev.education?.fieldOfStudy, logo: prev.education?.logo },
                  }))} />
                <input type="text" value={form.education?.fieldOfStudy ?? ""} placeholder="Field of Study (e.g. Computer Science)"
                  className="form-input w-full"
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    education: { ...prev.education, institution: prev.education?.institution ?? "", degree: prev.education?.degree, fieldOfStudy: e.target.value, logo: prev.education?.logo },
                  }))} />
                <input type="url" value={form.education?.logo ?? ""} placeholder="https://logo.clearbit.com/university.edu"
                  className="form-input w-full text-sm"
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    education: { ...prev.education, institution: prev.education?.institution ?? "", degree: prev.education?.degree, fieldOfStudy: prev.education?.fieldOfStudy, logo: e.target.value },
                  }))} />
                {form.education?.institution && (
                  <button type="button"
                    onClick={() => setForm((prev) => ({ ...prev, education: undefined }))}
                    className="text-xs text-red-400 transition-colors hover:text-red-300"
                  >
                    Remove education
                  </button>
                )}
              </div>
            </section>

            {/* ── Section: Appearance ── */}
            <section>
              <SectionHeading title="Appearance" />
              <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                {/* Background color */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Card background</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => bgColorRef.current?.click()}
                      className="h-10 w-10 rounded-xl border border-white/20 transition-transform hover:scale-105"
                      style={{ backgroundColor: form.backgroundColor }} />
                    <input ref={bgColorRef} type="color" className="sr-only"
                      value={form.backgroundColor} onChange={(e) => setForm((prev) => ({ ...prev, backgroundColor: e.target.value }))} />
                    <span className="font-mono text-sm text-gray-400">{form.backgroundColor}</span>
                  </div>
                </div>
                {/* Banner color */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Banner color</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => bannerColorRef.current?.click()}
                      className="h-10 w-10 rounded-xl border border-white/20 transition-transform hover:scale-105"
                      style={{ backgroundColor: form.bannerColor }} />
                    <input ref={bannerColorRef} type="color" className="sr-only"
                      value={form.bannerColor} onChange={(e) => setForm((prev) => ({ ...prev, bannerColor: e.target.value }))} />
                    <span className="font-mono text-sm text-gray-400">{form.bannerColor}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">Used when no banner image is set</p>
                </div>
                {/* Accent color */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Accent &amp; buttons</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => accentColorRef.current?.click()}
                      className="h-10 w-10 rounded-xl border border-white/20 transition-transform hover:scale-105"
                      style={{ backgroundColor: form.accentColor }} />
                    <input ref={accentColorRef} type="color" className="sr-only"
                      value={form.accentColor} onChange={(e) => setForm((prev) => ({ ...prev, accentColor: e.target.value }))} />
                    <span className="font-mono text-sm text-gray-400">{form.accentColor}</span>
                  </div>
                </div>
                {/* Preview pills */}
                <div>
                  <p className="mb-2 text-xs text-gray-500">Preview</p>
                  <div className="flex gap-2">
                    <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: form.accentColor }}>Save Contact</span>
                    <span className="rounded-full px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: form.accentColor, opacity: 0.7 }}>Follow</span>
                    <span className="rounded-full px-4 py-1.5 text-xs font-semibold" style={{ color: form.accentColor, border: `1px solid ${form.accentColor}` }}>Share</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section: Public URL ── */}
            <section>
              <SectionHeading title="Your Public URL" />
              <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
                <FieldGroup label="Slug" htmlFor="slug" error={errors.slug}>
                  <input id="slug" type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value.toLowerCase())}
                    placeholder="jane-smith" className={`form-input ${errors.slug ? "ring-red-500/50" : ""}`}/>
                  <p className="mt-1.5 text-xs text-gray-500">cnx.app/c/<span className="text-[#F15928]">{form.slug.trim() || "your-slug"}</span></p>
                </FieldGroup>
                {shareUrl && (
                  <button onClick={handleDownloadQR} type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-[#F15928]/30 hover:bg-[#F15928]/10 hover:text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625v2.25m0 3v.75m3-3h.75m-6 0h.75m5.25-3v.75m0 3.75v.75m-3-6h3" />
                    </svg>
                    Download QR Code
                  </button>
                )}
              </div>
            </section>

            {/* Hidden QR for download rendering */}
            {shareUrl && (
              <div ref={qrRef} className="absolute -left-[9999px]" aria-hidden="true">
                <div className="inline-block rounded-2xl bg-white p-4">
                  <QRCodeSVG value={shareUrl} size={160} bgColor="#ffffff" fgColor="#1e1b4b" level="M"/>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Live Preview ── */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              {/* iPhone frame — 375×812 native coordinates */}
              <div className="relative" style={{ width: 375, height: 812 }}>
                {/* Card content — extends slightly under the bezel so the SVG frame clips the edges */}
                <div
                  className="absolute z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                  style={{
                    top: 2, left: 2, right: 2, bottom: 2,
                    borderRadius: 54,
                    scrollbarWidth: "none",
                    backgroundColor: form.backgroundColor,
                  }}
                >
                  <PublicCard card={formToCard(form)} userId={user?.uid ?? "preview"} isPreview />
                </div>

                {/* iPhone SVG — native 375×812 */}
                <svg className="pointer-events-none absolute inset-0 z-20" width="375" height="812" viewBox="0 0 375 812" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bezelGrad" x1="0" y1="0" x2="375" y2="812" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#0d0d0f"/>
                      <stop offset="50%" stopColor="#080809"/>
                      <stop offset="100%" stopColor="#0d0d0f"/>
                    </linearGradient>
                    <linearGradient id="btnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1c"/>
                      <stop offset="100%" stopColor="#0a0a0c"/>
                    </linearGradient>
                    <radialGradient id="camLens" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#1a1a2e"/>
                      <stop offset="60%" stopColor="#0d0d18"/>
                      <stop offset="100%" stopColor="#000"/>
                    </radialGradient>
                  </defs>

                  {/* Phone body — outer shell (r=55) with screen cutout (r=45, 10px inset) */}
                  <path fillRule="evenodd" d={[
                    // Outer body clockwise
                    "M55,0 H320 A55,55 0 0 1 375,55 V757 A55,55 0 0 1 320,812 H55 A55,55 0 0 1 0,757 V55 A55,55 0 0 1 55,0 Z",
                    // Inner screen cutout counter-clockwise (10px inset, r=45)
                    "M55,10 A45,45 0 0 0 10,55 V757 A45,45 0 0 0 55,802 H320 A45,45 0 0 0 365,757 V55 A45,45 0 0 0 320,10 Z",
                  ].join(" ")} fill="url(#bezelGrad)"/>

                  {/* Outer edge — very subtle light catch */}
                  <rect x="0.5" y="0.5" width="374" height="811" rx="54.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>

                  {/* ── Side Buttons ── */}
                  <rect x="-2.5" y="140" width="3" height="28" rx="1.5" fill="url(#btnGrad)"/>
                  <rect x="-2.5" y="185" width="3" height="46" rx="1.5" fill="url(#btnGrad)"/>
                  <rect x="-2.5" y="245" width="3" height="46" rx="1.5" fill="url(#btnGrad)"/>
                  <rect x="374.5" y="215" width="3" height="70" rx="1.5" fill="url(#btnGrad)"/>

                  {/* ── Dynamic Island ── */}
                  <rect x="137" y="23" width="100" height="28" rx="14" fill="#000"/>
                  <circle cx="210" cy="37" r="4.5" fill="url(#camLens)"/>
                  <circle cx="210" cy="37" r="3" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
                  <circle cx="209" cy="35.8" r="0.8" fill="rgba(255,255,255,0.1)"/>
                  <circle cx="165" cy="37" r="2" fill="#060609"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-gray-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${isDirty ? "opacity-100" : "opacity-0"}`}>
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-dot"/><span className="text-amber-400/80">Unsaved changes</span>
          </div>
          <button type="button" onClick={handleSave} disabled={saving}
            className="rounded-xl bg-[#F15928] px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#d94d22] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Saving…" : "Save Card"}
          </button>
        </div>
      </div>
      {toast}
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return <h2 className="border-l-2 border-[#F15928] pl-3 text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h2>;
}

function FieldGroup({ label, htmlFor, required, error, children }: {
  label: string; htmlFor: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {error && <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
