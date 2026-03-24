# CNX — Comprehensive Project Audit

> **Audit Date:** 2026-03-23  
> **Auditor:** Automated deep review  
> **Scope:** Every file, function, decision, risk, and opportunity

---

## 1. Executive Summary

### Current State

CNX is an early-stage digital business card platform built with Next.js 16 (App Router), Firebase (Firestore + Auth), and Tailwind CSS v4. Users can create, edit, and share a public-facing business card via a direct link or vanity URL (`/c/{slug}`). A QR code and vCard download are provided for sharing.

### What Works End-to-End

| Feature | Status |
|---|---|
| Login page UI (Google Sign-In button) | ✅ Renders correctly |
| Dashboard with card tiles, share section, QR code | ✅ Functional |
| Card editor with validation, slug input, live preview | ✅ Functional |
| Public card via `/card/{uid}` | ✅ Functional |
| Vanity URL via `/c/{slug}` | ✅ Functional |
| Slug uniqueness enforcement | ✅ Functional |
| vCard download from public card | ✅ Functional |
| QR code generation + PNG download | ✅ Functional |
| Toast notification system | ✅ Functional |
| Onboarding checklist on dashboard | ✅ Functional |
| Completeness indicator in editor | ✅ Functional |
| Sticky save bar in editor | ✅ Functional |
| "Card not found" pages | ✅ Functional |

### What Is Incomplete or Broken

| Issue | Severity |
|---|---|
| **Authentication is completely bypassed** — mock user hardcoded | 🔴 Blocker |
| Login page's Google Sign-In is a no-op | 🔴 Blocker |
| ProtectedRoute is a passthrough — no auth enforcement | 🔴 Blocker |
| No server-side rendering or metadata on public card pages (SEO) | 🟡 Important |
| Firestore slug rules allow any authenticated user to overwrite any slug | 🔴 Critical security |
| No error boundaries anywhere | 🟡 Important |
| No tests (unit, integration, or e2e) | 🟡 Important |
| README.md is default create-next-app boilerplate | 🟢 Nice-to-have |

### Production Readiness Score

> **3 / 10**  
> The UI and data layer are well-built, but the auth bypass and security rule gaps make this completely unsuitable for production users.

---

## 2. Full File Tree

```
CNX/
├── .env.local                    (739 B)    Firebase env vars — gitignored
├── .gitignore                    (473 B)    Standard Next.js gitignore
├── AGENTS.md                 5L  (131 B)    Agent rules for Next.js docs
├── AUDIT.md                      (this file)
├── CLAUDE.md                 1L  (12 B)     Agent marker
├── README.md                36L  (925 B)    Default create-next-app readme
├── firestore.rules          34L  (1.1 KB)   Firestore security rules
├── next-env.d.ts             6L  (200 B)    Next.js type reference (auto-gen)
├── next.config.ts           17L  (275 B)    Next.js config — turbopack root, image domains
├── package-lock.json      7581L  (247 KB)   Lock file
├── package.json             28L  (583 B)    Dependencies + scripts
├── tsconfig.json            34L  (666 B)    TypeScript config — strict, bundler resolution
├── types/
│   └── user.ts              35L  (708 B)    UserProfile, CardLink, BusinessCard interfaces
├── lib/
│   ├── firebase.ts          33L  (1.2 KB)   Firebase app + Firestore + Auth init
│   └── firestore.ts        115L  (4.1 KB)   CRUD: user docs, card docs, slug docs
├── context/
│   └── AuthContext.tsx       90L  (3.3 KB)   Auth context — MOCK USER (auth bypassed)
├── components/
│   ├── AuthProvider.tsx      16L  (446 B)    Client wrapper for AuthContext in root layout
│   ├── ProtectedRoute.tsx    14L  (321 B)    Passthrough — auth disabled
│   └── Toast.tsx             93L  (2.7 KB)   Toast notification + useToast hook
├── app/
│   ├── globals.css           62L  (2.1 KB)   Design tokens, base styles, form inputs
│   ├── layout.tsx            23L  (630 B)    Root layout — metadata, AuthProvider wrapper
│   ├── page.tsx              25L  (706 B)    Root "/" — redirects to /dashboard
│   ├── login/
│   │   └── page.tsx         103L  (3.9 KB)   Google Sign-In page
│   ├── dashboard/
│   │   ├── page.tsx         380L  (14.3 KB)  Dashboard — tiles, share card, onboarding
│   │   └── edit/
│   │       └── page.tsx     612L  (23.9 KB)  Card editor — form, validation, live preview
│   ├── card/
│   │   └── [userId]/
│   │       ├── page.tsx      85L  (3.0 KB)   Public card page (by UID)
│   │       ├── PublicCard.tsx 308L (12.5 KB)  Public card component (shared)
│   │       └── loading.tsx   10L  (399 B)    Suspense fallback
│   └── c/
│       └── [slug]/
│           ├── page.tsx      85L  (3.0 KB)   Public card page (by slug)
│           └── loading.tsx   10L  (397 B)    Suspense fallback
```

**Total source files:** 20 (excluding lock, env, git, audit, readme)  
**Total source lines:** ~2,228

---

## 3. Technology Stack Review

### Production Dependencies

| Package | Version | Purpose | Assessment |
|---|---|---|---|
| `next` | 16.2.1 | App Router framework | ✅ Latest — very new, minor ecosystem risk |
| `react` | 19.2.4 | UI library | ✅ Latest stable |
| `react-dom` | 19.2.4 | React DOM renderer | ✅ Latest stable |
| `firebase` | ^12.11.0 | Auth + Firestore client SDK | ✅ Current |
| `qrcode.react` | ^4.2.0 | QR code SVG generation | ✅ Lightweight, well-maintained |

### Dev Dependencies

| Package | Version | Purpose | Assessment |
|---|---|---|---|
| `tailwindcss` | ^4 | Utility-first CSS | ✅ Latest (v4) |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind | ✅ Required for v4 |
| `typescript` | ^5 | Type checking | ✅ Current |
| `@types/node` | ^20 | Node.js types | ✅ Current |
| `@types/react` | ^19 | React type definitions | ✅ Current |
| `@types/react-dom` | ^19 | ReactDOM type definitions | ✅ Current |
| `eslint` | ^9 | Linting | ✅ Current |
| `eslint-config-next` | 16.2.1 | Next.js ESLint preset | ✅ Matches Next.js version |

### Missing Packages (Recommended)

| Package | Why |
|---|---|
| `firebase-admin` | Server-side operations (SSR metadata, secure reads) |
| `@testing-library/react` + `jest` or `vitest` | No tests exist at all |
| `zod` or `valibot` | Schema validation is hand-rolled — fragile |
| `next-seo` or manual `<head>` tags | Public card pages have no dynamic SEO metadata |

### Unnecessary Packages

None — the dependency count is admirably lean (5 prod, 8 dev).

---

## 4. Architecture Review

### App Router Structure

```
app/
├── page.tsx             → "/" client redirect to /dashboard
├── login/page.tsx       → "/login" Google Sign-In
├── dashboard/page.tsx   → "/dashboard" main dashboard
├── dashboard/edit/page.tsx → "/dashboard/edit" card editor
├── card/[userId]/page.tsx  → "/card/{uid}" public card (by UID)
├── c/[slug]/page.tsx       → "/c/{slug}" public card (by vanity slug)
└── layout.tsx           → Root layout (metadata + AuthProvider)
```

**Assessment:** Clean and appropriate for a small app. Route nesting is logical. No unnecessary complexity.

### Server vs Client Component Boundaries

| File | Directive | Should Be |
|---|---|---|
| `layout.tsx` | Server (default) | ✅ Correct — wraps with `<AuthProvider>` client boundary |
| `page.tsx` (root) | `"use client"` | ⚠️ Could be Server — redirect via `redirect()` from `next/navigation` |
| `login/page.tsx` | `"use client"` | ✅ Correct — needs `useAuth()` |
| `dashboard/page.tsx` | `"use client"` | ✅ Correct — needs hooks, interactivity |
| `dashboard/edit/page.tsx` | `"use client"` | ✅ Correct — form state, refs |
| `card/[userId]/page.tsx` | `"use client"` | ⚠️ Could be Server for SEO — fetches data then renders |
| `card/[userId]/PublicCard.tsx` | `"use client"` | ⚠️ `downloadVCard` requires click handler, but the rest could be server |
| `card/[userId]/loading.tsx` | Server (default) | ✅ Correct — pure JSX |
| `c/[slug]/page.tsx` | `"use client"` | ⚠️ Same issue as `card/[userId]/page.tsx` |
| `c/[slug]/loading.tsx` | Server (default) | ✅ Correct |

**Key Issue:** Public card pages (`/card/[userId]`, `/c/[slug]`) are fully client-rendered. This means:
- No SSR HTML for crawlers (bad for SEO / link previews)
- No `<title>` or OpenGraph tags per card
- Extra round-trip: HTML ships → JS loads → Firestore fetch → render

**Recommendation:** Use `firebase-admin` in a Server Component wrapper to fetch card data server-side, then pass to a client `PublicCard` component for the interactive parts (vCard download).

### State Management

- **React context** (`AuthContext`) for auth state — ✅ appropriate at this scale.
- **Component-local state** (`useState`, `useRef`) for form data — ✅ appropriate.
- **No global state library** — not needed yet.
- **No data caching** — every navigation triggers a fresh Firestore read.

> ⚠️ If the dashboard and editor are visited in sequence, the card data is fetched twice. A lightweight cache (React context, SWR, or React Query) would help.

### Data Flow

```
Firestore                  → lib/firestore.ts         → Page component (useState)    → UI
users/{uid}/profile/card   → getBusinessCard(uid)      → setCard(data)                → <PublicCard>
slugs/{slug}               → getSlugOwner(slug)        → userId → getBusinessCard()   → <PublicCard>
```

**Assessment:** Simple, correct, and easy to follow. No over-engineering.

### Architectural Risks / Anti-Patterns

| Risk | Details |
|---|---|
| **No error boundaries** | A Firestore failure in any page component crashes the entire React tree. No `error.tsx` files exist. |
| **Client-side Firestore for public pages** | Exposes Firestore project config to all visitors; adds latency; no SSR. |
| **Duplicate data fetching** | Dashboard → Editor navigations trigger redundant `getBusinessCard()` calls. |
| **No loading states for navigation** | `loading.tsx` files exist but are Suspense fallbacks; actual client-side loading is manual. |

---

## 5. Page-by-Page Review

### 5.1 — Root Page (`app/page.tsx`, 25 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Redirects `"/"` → `"/dashboard"` |
| **Data fetching** | None |
| **Auth** | None (unconditional redirect) |
| **UI/UX** | Spinner while redirect fires |
| **Issues** | (1) Uses `"use client"` + `useEffect` for redirect — could use server-side `redirect()`. (2) No auth check — should redirect to `/login` if unauthenticated. |

### 5.2 — Login Page (`app/login/page.tsx`, 103 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Google Sign-In |
| **Data fetching** | None |
| **Auth** | Redirects to `/dashboard` if already signed in |
| **UI/UX** | Premium dark design with gradient effects, Google brand button, legal footer |
| **Issues** | (1) `signInWithGoogle` is a no-op (mock). (2) Sign-in error only `console.error`s — no user-facing feedback. (3) Terms & Privacy links are `<span>` with `cursor-pointer` — not actual links, not accessible. |

### 5.3 — Dashboard (`app/dashboard/page.tsx`, 380 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Main hub — profile tile, card tile, share card, onboarding checklist |
| **Data fetching** | `getBusinessCard(user.uid)` via `useEffect` |
| **Auth** | Uses `useAuth()` but no redirect if `user` is null (works due to mock) |
| **UI/UX** | Dark theme, grid layout, premium feel, QR hero, onboarding checklist |
| **Issues** | (1) No `ProtectedRoute` wrapper — relies on mock auth. (2) If `user` is null (real auth), page would partially render with broken share links. (3) QR download uses `btoa(svgData)` — will break if SVG contains non-ASCII. (4) `handleCopy` fallback uses deprecated `document.execCommand("copy")` but that's acceptable as a polyfill. (5) No loading state while card is being fetched (brief flash of empty onboarding). |

### 5.4 — Card Editor (`app/dashboard/edit/page.tsx`, 612 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Create/edit business card with live preview |
| **Data fetching** | `getBusinessCard(user.uid)` via `useEffect` |
| **Auth** | Uses `useAuth()` — no protection |
| **UI/UX** | Excellent — section-based, sticky save bar, completeness indicator, live phone preview |
| **Issues** | (1) `calcCompleteness` is exported but only used internally + in dashboard (coupling). (2) `JSON.stringify` comparison for dirty tracking is O(n) on every render — functional but not ideal for very large forms. (3) No debounce on save button — rapid clicks could fire multiple simultaneous writes. (4) Profile image URL is saved as-is — no validation that it's a valid image or safe URL. (5) No image upload support — only URL input. |

### 5.5 — Public Card by UID (`app/card/[userId]/page.tsx`, 85 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Display a user's card publicly |
| **Data fetching** | `getBusinessCard(userId)` via `useEffect` |
| **Auth** | None (public) |
| **UI/UX** | Clean loading → card / not-found states |
| **Issues** | (1) No dynamic metadata (title, OG tags). (2) Client-side fetch means no SSR — link previews show blank. (3) Exposes raw Firebase UID in URL (mitigated by slug system). |

### 5.6 — Public Card by Slug (`app/c/[slug]/page.tsx`, 85 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Resolve slug → userId → card |
| **Data fetching** | `getSlugOwner(slug)` → `getBusinessCard(userId)` (2 reads) |
| **Auth** | None (public) |
| **UI/UX** | Identical to UID page |
| **Issues** | Same as 5.5 plus: (1) Two sequential Firestore reads (slug → card). Could be optimized with a denormalized approach. |

### 5.7 — PublicCard Component (`app/card/[userId]/PublicCard.tsx`, 308 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Renders the visual card — avatar, name, contact buttons, links, vCard download |
| **Props** | `{ card: BusinessCard }` |
| **Issues** | Covered in Component Review (§6). |

### 5.8 — Loading Pages

`card/[userId]/loading.tsx` (10 lines) and `c/[slug]/loading.tsx` (10 lines):  
Both are simple spinner Suspense fallbacks. ✅ Correct.

---

## 6. Component Review

### 6.1 — AuthProvider (`components/AuthProvider.tsx`, 16 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Client boundary wrapper for `<AuthProvider>` from context |
| **Props** | `{ children: React.ReactNode }` |
| **Issues** | None — clean delegation pattern for server-layout → client-context bridge. |

### 6.2 — ProtectedRoute (`components/ProtectedRoute.tsx`, 14 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Should guard authenticated routes — currently a passthrough |
| **Props** | `{ children: React.ReactNode }` |
| **Issues** | (1) **Not used anywhere.** No page wraps content in `<ProtectedRoute>`. Even when auth is restored, it has no consumers. (2) Must implement redirect-to-login logic when auth is re-enabled. |

### 6.3 — Toast (`components/Toast.tsx`, 93 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Lightweight toast notification + `useToast()` hook |
| **Props** | `{ message: string; type: "success" \| "error"; onDismiss?: () => void }` |
| **Issues** | (1) Only supports "success" and "error" — no "info" or "warning" variants. (2) No `role="alert"` or `aria-live="assertive"` — invisible to screen readers. (3) Fixed bottom-center placement may conflict with sticky save bar in editor (z-index 50 vs 40 avoids overlap but they're visually close). |

### 6.4 — PublicCard (`app/card/[userId]/PublicCard.tsx`, 308 lines)

| Aspect | Details |
|---|---|
| **Purpose** | Full card display — avatar, identity, contact, links, vCard |
| **Props** | `{ card: BusinessCard }` |
| **Exported helpers** | `getPlatformIcon(url)` — also used? Only internally. |
| **Issues** | (1) `isSafeUrl` only checks for `http://` or `https://` — could use `URL` constructor for stricter validation. (2) `downloadVCard` uses `Blob` + object URL — correct, but the vCard output has no photo field even when `profileImage` is set. (3) Links with unsafe URLs render as disabled divs — good defensive behavior. (4) `Image` component uses `unoptimized` — no Next.js image optimization for profile photos. (5) No lazy loading for platform icons — all 7 SVG components are bundled even if unused. (6) Ambient glow `div`s use `fixed` positioning — may bleed outside the card container in certain layouts (e.g., editor preview). |

---

## 7. Library Module Review

### 7.1 — `lib/firebase.ts` (33 lines)

| Function | Purpose | Issues |
|---|---|---|
| Module-level init | Initializes Firebase app, exports `db` and `auth` | (1) No validation that env vars exist — `undefined` values will cause silent misconfiguration. (2) Correct singleton guard with `getApps().length`. |

### 7.2 — `lib/firestore.ts` (115 lines)

| Function | Signature | Purpose | Issues |
|---|---|---|---|
| `createUserDocument` | `(user: User) → void` | Creates `users/{uid}` on first sign-in | (1) Race condition: two simultaneous sign-ins could both pass `!snapshot.exists()` check. Use `setDoc` with `merge: true` or a transaction. (2) No error handling — throws raw Firestore errors. |
| `getUserDocument` | `(uid: string) → UserProfile \| null` | Reads `users/{uid}` | (1) Type assertion `as UserProfile` — no runtime validation. Corrupted data would pass silently. |
| `updateBusinessCard` | `(uid: string, card: Omit<BusinessCard, "updatedAt">) → void` | Writes `users/{uid}/profile/card` | (1) Uses `setDoc` (overwrite) — correct for full updates. (2) No validation of card content server-side. |
| `getBusinessCard` | `(uid: string) → BusinessCard \| null` | Reads `users/{uid}/profile/card` | (1) Same type assertion issue. |
| `updateSlug` | `(slug: string, userId: string) → void` | Claims a slug in `slugs/{slug}` | (1) **Race condition:** Two users can simultaneously check `getSlugOwner` → both see `null` → both write. Should use a Firestore transaction with `runTransaction`. (2) No input sanitization — slug is written as-is. |
| `deleteSlug` | `(slug: string) → void` | Deletes `slugs/{slug}` | (1) No ownership check — deletes regardless of who owns the slug. Called from editor save, but could be called with wrong slug. |
| `getSlugOwner` | `(slug: string) → string \| null` | Reads `slugs/{slug}` → userId | (1) Type assertion `as { userId: string }` — no validation. |

### Key Gaps

- **No Firestore transactions** where needed (slug claiming, user creation).
- **No runtime type validation** on Firestore reads — `as` casts everywhere.
- **No retry logic** for transient network failures.
- **No offline support** configuration.

---

## 8. Type Safety Review

### 8.1 — `types/user.ts` (35 lines)

```ts
interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
}
```

| Issue | Details |
|---|---|
| All fields are required | `photoURL` and `email` can legitimately be `null` from Google Auth. Should be `string \| null` or optional. |
| `name` vs `displayName` | `UserProfile` uses `name`, but `BusinessCard` uses `displayName`. Inconsistent naming. |

```ts
interface CardLink {
  label: string;
  url: string;
}
```

✅ Clean and appropriate.

```ts
interface BusinessCard {
  displayName: string;
  title: string;
  phone: string;
  email: string;
  profileImage: string;
  links: CardLink[];
  slug?: string;
  updatedAt: Timestamp;
}
```

| Issue | Details |
|---|---|
| All fields required except `slug` | In Firestore, a new card may have empty strings rather than missing fields. The type should reflect optional fields or allow empty strings explicitly. |
| `updatedAt: Timestamp` | On create, this is actually `FieldValue` (from `serverTimestamp()`), not `Timestamp`. The type is technically incorrect at write time. This works because the type is only used for reads, but it's fragile. |
| Missing fields | No `createdAt`, no `cardStyle` or `theme` field for future customization. |

### Missing Types

| What | Where |
|---|---|
| Slug document type | `{ userId: string }` is asserted inline in `firestore.ts` — should be a named type. |
| Form state type | `FormState` in editor is local — could be shared if editor and dashboard diverge. |
| Toast type | `"success" \| "error"` is duplicated — could be a union type. |

---

## 9. Styling & Design System Review

### 9.1 — `globals.css` (62 lines)

**Design tokens defined:**
- `--background: #030712` (gray-950)
- `--foreground: #f9fafb` (gray-50)
- `--font-sans`: Inter + system fallback stack
- `--font-mono`: system monospace stack

**Focus ring:** `*:focus-visible` → 2px solid `#6366f1` (indigo-500) — ✅ good accessibility baseline.

**`.form-input` class:** Shared across all form inputs in the editor — ✅ consistent styling.

### 9.2 — Consistency Across Pages

| Check | Result |
|---|---|
| Background color | ✅ `bg-gray-950` everywhere |
| Font | ✅ Inter via `--font-sans` in root |
| Card/container styling | ✅ Consistent `rounded-2xl border border-white/10 bg-white/5` pattern |
| Button styles | ⚠️ Slightly inconsistent — dashboard uses `bg-indigo-600`, public card uses `bg-indigo-600` and `bg-violet-600`, editor uses `bg-indigo-600`. Violet for email only appears on public card. |
| Spacing | ✅ Consistent `px-6 py-4` for navs, `px-6 py-12` for main content |
| Typography | ✅ Consistent heading hierarchy |

### 9.3 — Hardcoded Values That Should Be Tokens

| Value | Where | Recommendation |
|---|---|---|
| `#6366f1` (indigo-500) | `globals.css` focus ring | Already a Tailwind color — fine |
| `rgba(255, 255, 255, 0.1)` | `.form-input` border | Could use Tailwind `border-white/10` equivalent |
| `#6b7280` | `.form-input::placeholder` | Could use `text-gray-500` |
| `#f9fafb` | `.form-input` color | Already `--foreground` token |
| QR `fgColor="#1e1b4b"` | Dashboard | Hardcoded indigo-950 — should be a token |

### 9.4 — Mobile Responsiveness

| Page | Assessment |
|---|---|
| Login | ✅ `max-w-md mx-4` — responsive |
| Dashboard | ✅ Grid `sm:grid-cols-2 lg:grid-cols-3` — responsive |
| Editor | ✅ `md:grid-cols-2` — form + preview stack on mobile |
| Public card | ✅ `max-w-md px-4` — mobile-first design |

**No breakpoints below `sm` (640px).** On very narrow screens (320px), the editor form may feel cramped. The QR code at 180px is fine on mobile.

### 9.5 — Font Loading

**Inter is declared in CSS** via `--font-sans` but is **NOT actually loaded** anywhere. There is no `@import` for Google Fonts and no `next/font` usage. The browser will fall back to `ui-sans-serif` → system font. The declared `"Inter"` in the font stack has no effect unless the user has Inter installed locally.

> 🔴 **Bug:** Inter font is referenced but never loaded.

---

## 10. Firebase & Backend Review

### 10.1 — Firestore Data Model

```
Firestore
├── users/{uid}                      ← UserProfile (name, email, photoURL, createdAt)
│   └── profile/
│       └── card                     ← BusinessCard (displayName, title, phone, email, ...)
└── slugs/{slug}                     ← { userId: string }
```

| Aspect | Assessment |
|---|---|
| Nesting depth | ✅ Shallow (max 3 levels). Appropriate. |
| `profile/card` as a subcollection doc | ⚠️ `profile` is a collection with a single document `card`. Could be simplified to `users/{uid}/card` (direct subcollection) or a flat field on the user doc. The extra nesting adds no value. |
| `slugs` collection | ✅ Correct pattern for reverse lookup. |
| Scalability | ✅ One document per user + one per card + one per slug. Firestore handles this well. |
| Missing collections | No analytics/views collection (for "how many times was my card viewed?"). No `contacts` collection (for "who saved my card?"). |

### 10.2 — Security Rules (Line-by-Line)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
```
✅ Standard boilerplate.

```
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
```
✅ Owner-only access to user documents. Correct.

```
      match /profile/card {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
```
✅ Public reads, owner-only writes for the card. Correct.

```
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
```
⚠️ **Issue:** This wildcard `{subcollection}/{document=**}` matches `profile/card` as well — but the more specific rule above takes precedence. This is correct but could be confusing. If a new subcollection is added under `profile/` (e.g., `profile/settings`), this rule would apply owner-only access, which may or may not be intended.

```
    match /slugs/{slug} {
      allow read: if true;
      allow write: if request.auth != null;
    }
```
🔴 **CRITICAL ISSUE:** Any authenticated user can write to **any** slug document. This means:
- User A claims slug "john" → User B can overwrite `slugs/john` with their own userId.
- There is **no server-side ownership check** in the security rules.
- The uniqueness check in `updateSlug()` is client-side only and trivially bypassable.

**Fix required:**
```
match /slugs/{slug} {
  allow read: if true;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
```

### 10.3 — Missing Indexes

No composite indexes are required for the current query patterns (all reads are single-document `getDoc()`). No `where()` or `orderBy()` queries exist. ✅

### 10.4 — Missing Collections / Schema Issues

| Missing | Impact |
|---|---|
| No card view analytics (`views/{cardId}`) | Can't track engagement |
| No contact exchange log | Can't tell who saved your contact |
| No `UserProfile.slug` cross-reference | Slug exists on `BusinessCard` but not on `UserProfile` — reading user profile doesn't tell you their slug |

---

## 11. Security Audit

### 11.1 — Threat Model

| Threat | Vector | Target |
|---|---|---|
| Account takeover | No auth enforcement | All user data |
| Slug hijacking | Firestore rules allow any-user writes | vanity URLs |
| XSS via link URLs | Links rendered as `<a href>` | Public card visitors |
| XSS via card fields | `displayName` rendered in HTML | Public card visitors |
| Data scraping | Public card data is readable by anyone | User PII |
| Firebase config exposure | Client-side env vars visible in JS bundle | Project ID, API key |

### 11.2 — Vulnerabilities

| ID | Vulnerability | Severity | Details |
|---|---|---|---|
| **S1** | Auth completely bypassed | 🔴 **Critical** | `AuthContext` returns a hardcoded mock user. Any visitor has full write access to the mock user's Firestore data. |
| **S2** | Slug write rules too permissive | 🔴 **Critical** | `slugs/{slug}` allows write by any authenticated user, not just the owner. A malicious user can overwrite any slug to redirect to their card. |
| **S3** | No slug ownership validation in delete | 🟠 **High** | `deleteSlug(slug)` deletes without checking if the caller owns the slug. In client code it's called correctly, but the function has no guard. |
| **S4** | Slug uniqueness race condition | 🟠 **High** | `updateSlug()` checks-then-writes without a transaction. Two simultaneous claims can both succeed. |
| **S5** | No XSS sanitization on card fields | 🟡 **Medium** | `displayName`, `title` etc. are rendered via React (auto-escaped), which mitigates direct XSS. However, `link.url` is used in `<a href>` — a `javascript:` URL could execute code if `isSafeUrl` check is bypassed. Current `isSafeUrl` check (requires `http://` or `https://`) is adequate **client-side** but has no Firestore rule equivalent. |
| **S6** | Profile image URL not validated | 🟡 **Medium** | Any URL can be set as `profileImage`. Could be used for SSRF if server-side rendering is added, or to display inappropriate content. |
| **S7** | Firebase API key in client bundle | 🟢 **Low** | Expected behavior for Firebase client SDK. API key is restricted by domain in Firebase console (should be verified). |
| **S8** | Terms/Privacy links are non-functional | 🟢 **Low** | Legal links on login page are `<span>` elements — not real pages. Could be a legal compliance issue. |

### 11.3 — Risk Ratings Summary

| Critical | High | Medium | Low |
|---|---|---|---|
| S1, S2 | S3, S4 | S5, S6 | S7, S8 |

---

## 12. Performance Review

### 12.1 — Bundle Size

| Concern | Impact |
|---|---|
| `firebase` SDK (~200KB gzipped) | Largest dependency by far. Could use modular imports to tree-shake unused features (Analytics, Storage, etc.). The current imports (`firebase/firestore`, `firebase/auth`) are modular ✅. |
| `qrcode.react` (~8KB) | Lightweight ✅ |
| SVG icons inline | ~50 icon SVGs are hardcoded in components. Could be extracted to a shared icon component or sprite, but the file sizes are trivial. ✅ |
| No dynamic imports | All page components are statically imported. `PublicCard` is co-located with its page — fine. |

### 12.2 — Unnecessary Re-renders

| Component | Issue |
|---|---|
| `EditCardContent` | `isDirty` memo uses `JSON.stringify` — recalculates on every change to `form` or `savedForm`. With 5-10 fields this is negligible. |
| `DashboardContent` | Re-renders when `searchParams` changes (for `?saved=true`). Expected behavior. |
| `PublicCard` | Stateless render of props — no re-render issues. |
| `Toast` | Uses `requestAnimationFrame` + `setTimeout`. Clean. |

**Assessment:** No significant re-render concerns at current scale.

### 12.3 — Missing Optimizations

| Optimization | Impact | Effort |
|---|---|---|
| `React.memo` on `PublicCard` | Prevents re-render in editor when only form (not preview) data changes. Medium benefit. | Small |
| Debounce on live preview | Currently re-renders preview on every keystroke. Could debounce by 200ms. | Small |
| Lazy load `QRCodeSVG` | Only needed on dashboard share card. Could `React.lazy()` it. | Small |
| `getBusinessCard` result caching | Dashboard and editor both fetch the same card. A shared context or SWR cache would eliminate one read. | Medium |
| Firebase persistence | `enableIndexedDbPersistence()` would allow offline access and reduce reads. | Small |
| Image optimization | `PublicCard` uses `unoptimized` on `<Image>`. Removing this would enable Next.js image optimization, but requires `remotePatterns` config for arbitrary user-provided URLs. | Medium |

### 12.4 — Firestore Read Efficiency

| Page | Reads Per Visit |
|---|---|
| Dashboard | 1 (`getBusinessCard`) |
| Editor | 1 (`getBusinessCard`) |
| Public card (UID) | 1 (`getBusinessCard`) |
| Public card (slug) | 2 (`getSlugOwner` + `getBusinessCard`) |
| Dashboard → Editor flow | 2 (same data fetched twice) |

**Assessment:** Read count is minimal and well within free tier limits. The slug→card double-read is inherent to the data model and acceptable.

---

## 13. Accessibility Review

### 13.1 — Missing ARIA Labels

| Element | Location | Issue |
|---|---|---|
| Save button (sticky bar) | Editor | No `aria-label` — button text "Save Card" is sufficient ✅ |
| Add Link button | Editor | No `aria-label` — text "Add Link" is sufficient ✅ |
| Remove link button | Editor | ✅ Has `aria-label={`Remove link ${index + 1}`}` |
| Copy link button | Dashboard | No `aria-label` — text "Copy link" is sufficient ✅ |
| QR code SVG | Dashboard | No `aria-label` or `role="img"` on QR container |
| Navigation back arrow | Editor | No `aria-label` — text "Back to Dashboard" is sufficient ✅ |
| **Toast** | All pages | 🔴 **Missing `role="alert"` and `aria-live="assertive"`** — screen readers won't announce toasts |
| Spinner loading states | Multiple | No `role="status"` or `aria-label="Loading"` — screen readers won't announce loading |

### 13.2 — Keyboard Navigation

| Check | Status |
|---|---|
| Tab order in editor | ✅ Follows DOM order (name → title → image → phone → email → slug → links → save) |
| Focus ring visible | ✅ `*:focus-visible` in `globals.css` with indigo ring |
| Sticky save bar reachable via Tab | ✅ It's in DOM order |
| Modal/dialog focus trapping | N/A — no modals in the app |
| Skip-to-content link | ❌ Missing — keyboard users must tab through nav on every page load |

### 13.3 — Color Contrast

| Element | Foreground | Background | Ratio | Pass? |
|---|---|---|---|---|
| Body text (gray-50 on gray-950) | `#f9fafb` | `#030712` | 19.6:1 | ✅ AAA |
| Muted text (`text-gray-400`) | `#9ca3af` | `#030712` | 8.5:1 | ✅ AAA |
| Subtle text (`text-gray-500`) | `#6b7280` | `#030712` | 5.2:1 | ✅ AA |
| Very muted (`text-gray-600`) | `#4b5563` | `#030712` | 3.3:1 | ❌ Fails AA |
| Error text (`text-red-400`) | `#f87171` | `#030712` | 8.1:1 | ✅ AAA |
| Success text (`text-emerald-400`) | `#34d399` | `#030712` | 9.4:1 | ✅ AAA |
| Amber indicator (`text-amber-400/80`) | `#fbbf24cc` | `#030712` | ~10:1 | ✅ AAA |
| Indigo on card button text (white on indigo-600) | `#ffffff` | `#4f46e5` | 5.4:1 | ✅ AA |

**Issue:** `text-gray-600` on `bg-gray-950` fails WCAG AA (3.3:1 < 4.5:1). Used on checklist arrows, link arrows in public card. Low-priority but should be `gray-500` minimum.

### 13.4 — Focus Management

| Scenario | Status |
|---|---|
| After save → toast appears | No focus management — toast is not focused and not announced |
| After adding a new link | No auto-focus on new link's label input — user must manually tab to it |
| On page navigation | No focus reset — standard Next.js App Router behavior |
| Error state | Errors appear as inline text — no `aria-invalid` on inputs |

---

## 14. Full Opportunities List

| # | Opportunity | Why It Matters | Effort | Impact | Priority |
|---|---|---|---|---|---|
| O1 | **Restore Firebase Auth** | Core product gating — nothing works securely without it | Medium | 🔴 High | **P0** |
| O2 | **Fix slug security rules** (add ownership checks) | Prevents any user from hijacking any vanity URL | Small | 🔴 High | **P0** |
| O3 | **Use Firestore transaction for slug claims** | Prevents race condition where two users claim the same slug | Small | 🔴 High | **P0** |
| O4 | **Add OpenGraph / dynamic metadata on public card pages** | Link previews on iMessage, Slack, LinkedIn will show card name + title | Medium | 🟠 High | **P1** |
| O5 | **SSR for public card pages** (firebase-admin) | Faster first paint, SEO, link previews, reduced client JS | Medium | 🟠 High | **P1** |
| O6 | **Add error boundaries** (`error.tsx` files) | Prevent white screen of death on Firestore failures | Small | 🟠 High | **P1** |
| O7 | **Load Inter font** (via `next/font/google`) | The declared font is never actually loaded — visual inconsistency | Small | 🟡 Medium | **P1** |
| O8 | **Add `role="alert"` to Toast** component | Accessibility — screen readers will announce notifications | Small | 🟡 Medium | **P1** |
| O9 | **Image upload** (Firebase Storage) instead of URL input | Most users don't have a hosted profile photo URL | Large | 🟠 High | **P2** |
| O10 | **Card theming** — let users pick accent color or card style | Differentiator from Linktree, differentiated branding | Medium | 🟡 Medium | **P2** |
| O11 | **Card view analytics** — track visits with a counter | Users want to know if their card is being viewed | Medium | 🟡 Medium | **P2** |
| O12 | **Add tests** (unit + integration with Testing Library) | Prevents regressions, enables CI/CD | Large | 🟡 Medium | **P2** |
| O13 | **Shared data fetching layer** (SWR or context cache) | Eliminates duplicate Firestore reads across pages | Small | 🟢 Low | **P3** |
| O14 | **Debounce live preview** in editor | Reduces render work on fast typing | Small | 🟢 Low | **P3** |
| O15 | **Save button debounce / disable after click** | Prevents double-submits on rapid clicks | Small | 🟢 Low | **P3** |
| O16 | **vCard PHOTO field** for profile image | Saved contacts would include the photo | Small | 🟢 Low | **P3** |
| O17 | **NFC write instructions / hardware integration** | Core value prop of CNX — digital card sharing via NFC tap | Large | 🟠 High | **P2** |
| O18 | **Custom domain support** for cards | Let users use `card.mycompany.com` | Large | 🟡 Medium | **P3** |
| O19 | **PWA manifest** for "Add to Home Screen" | Mobile users can install CNX as a pseudo-app | Small | 🟡 Medium | **P3** |
| O20 | **Proper README** and documentation | Developer onboarding, open-source readiness | Small | 🟢 Low | **P3** |

---

## 15. Full Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Data breach via mock auth** — all data accessible without login | 🔴 High (guaranteed if deployed) | 🔴 High | Restore real Firebase Auth before any deployment |
| R2 | **Slug hijacking** via permissive Firestore rules | 🟠 Medium (requires auth + intent) | 🔴 High | Add ownership checks to `slugs/{slug}` write rules |
| R3 | **Slug race condition** — duplicate claims | 🟡 Low (requires simultaneous timing) | 🟠 Medium | Use `runTransaction` in `updateSlug()` |
| R4 | **No error handling for Firestore outages** | 🟡 Medium (Firestore is reliable but not infallible) | 🟠 Medium | Add `error.tsx` boundaries + retry logic |
| R5 | **SEO / link preview failure on public cards** | 🔴 High (guaranteed — client-side rendering) | 🟡 Medium | SSR public card pages with `firebase-admin` |
| R6 | **Inter font not loaded** — inconsistent typography | 🔴 High (guaranteed) | 🟢 Low | Add `next/font/google` import for Inter |
| R7 | **XSS via malicious link URL** | 🟢 Low (mitigated by `isSafeUrl`) | 🔴 High | Maintain `isSafeUrl` check; add server-side validation |
| R8 | **Profile image URL abuse** (inappropriate content, SSRF) | 🟡 Medium | 🟡 Medium | Validate image URLs against allowlist or use image proxy |
| R9 | **Next.js 16 breaking changes** — ecosystem immaturity | 🟡 Medium | 🟡 Medium | Pin exact versions; test before upgrading |
| R10 | **No backup/export for user data** | 🟡 Medium | 🟠 High | Set up Firestore automated backups |
| R11 | **No rate limiting on card creation** | 🟡 Medium | 🟡 Medium | Add rate limiting at Firestore rules or API level |
| R12 | **Legal compliance** — no real Terms/Privacy pages | 🟠 Medium (if collecting PII) | 🟡 Medium | Create actual terms and privacy policy pages |

---

## 16. Pre-Launch Checklist

### 🔴 Blockers (Must fix before any real user access)

- [ ] **Restore Firebase Authentication** in `AuthContext.tsx` — remove mock user, re-enable `onAuthStateChanged` + `signInWithPopup`
- [ ] **Restore ProtectedRoute** — add real auth checks and redirect to `/login`
- [ ] **Wire ProtectedRoute** into dashboard and editor pages
- [ ] **Fix Firestore rules for `slugs/{slug}`** — add ownership checks on write/update/delete
- [ ] **Use Firestore transaction** in `updateSlug()` for atomic check-and-set
- [ ] **Verify Firebase API key** domain restrictions in Firebase Console
- [ ] **Deploy Firestore rules** to production

### 🟡 Important (Should fix before launch)

- [ ] Add `error.tsx` boundary files for each route segment
- [ ] Load Inter font via `next/font/google`
- [ ] Add dynamic metadata (`<title>`, OpenGraph, Twitter card) to `/card/[userId]` and `/c/[slug]`
- [ ] Add `role="alert"` and `aria-live` to Toast component
- [ ] Add `aria-label` to QR code container
- [ ] Add `role="status"` to loading spinners
- [ ] Create real Terms of Service and Privacy Policy pages (or remove the links)
- [ ] Replace default README.md with actual project documentation
- [ ] Fix `text-gray-600` contrast on dark backgrounds (change to `gray-500`)
- [ ] Add ownership check to `deleteSlug()` function
- [ ] Handle `user === null` gracefully in dashboard/editor (redirect to login)

### 🟢 Nice to Have (Improve after launch)

- [ ] SSR public card pages for SEO + link previews
- [ ] Image upload via Firebase Storage
- [ ] Card view analytics
- [ ] Card theming / accent colors
- [ ] SWR or React Query for data caching
- [ ] Unit + integration tests
- [ ] Debounce live preview in editor
- [ ] PWA manifest
- [ ] NFC write instructions
- [ ] Add `PHOTO` field to vCard output

---

## 17. Summary Scorecard

| Dimension | Score | Commentary |
|---|---|---|
| **Project Structure** | 8/10 | Clean App Router layout, logical file organization, appropriate separation of concerns. Minor nit: `profile/card` nesting adds unnecessary depth. |
| **Code Quality** | 7/10 | Well-organized, consistent code style, good comments. Some large single-file components (editor at 612 lines could be split). |
| **Type Safety** | 6/10 | TypeScript strict mode enabled. But: Firestore reads use `as` casts with no runtime validation, `UserProfile` fields should be optional, slug doc type is inline. |
| **UI / Design** | 9/10 | Excellent dark theme, premium feel, consistent glassmorphism, good micro-interactions, mobile-responsive. Slight inconsistency in button color usage (indigo vs violet). Missing Inter font load is a bug. |
| **Authentication** | 1/10 | Completely bypassed. Mock user hardcoded. No route protection. No auth flow works. Must be fully restored. |
| **Data Layer** | 7/10 | Clean Firestore helpers, appropriate data model, correct CRUD operations. Missing: transactions for slug claims, runtime type validation, error handling. |
| **Security** | 2/10 | Two critical issues (auth bypass, slug rules). Client-side-only uniqueness checks. No rate limiting. No input validation in rules. |
| **Error Handling** | 3/10 | No error boundaries. `console.error` only in most catch blocks. Toast for save errors in editor — good. No handling for network failures, Firestore outages, or invalid data. |
| **Performance** | 7/10 | Lean dependency tree, efficient Firestore reads (single-doc), no unnecessary re-renders. Missing: font loading, lazy imports, data caching. |
| **Accessibility** | 4/10 | Good contrast ratios (mostly), visible focus rings, semantic HTML. Missing: ARIA roles on toast/spinners, skip-to-content, `aria-invalid`, color contrast failure on `gray-600`. |
| **Feature Completeness** | 6/10 | Core card CRUD + sharing + slug system works. Missing: real auth, image upload, analytics, theming, NFC. |
| **Production Readiness** | 3/10 | Cannot serve real users due to auth bypass and security rule gaps. All other aspects are within acceptable range for MVP launch. |

---

### Overall Assessment

CNX has a **strong UI foundation and clean architecture** — the design is premium, the code is well-organized, and the core feature loop (create → edit → share → view) works end-to-end. However, the project is **critically blocked on two issues**: the authentication bypass and the Firestore slug security rules. Fixing these two items (estimated effort: 1-2 hours) would elevate the production readiness score from 3/10 to approximately **7/10** — enough for a soft launch with trusted users.
