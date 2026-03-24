import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";

export const maxDuration = 30; // Vercel hobby allows up to 60s
export const dynamic = "force-dynamic";

// ─── Types ───────────────────────────────────────────────

interface ScrapedExperience {
  role: string;
  company: string;
  dateRange: string;
  description: string;
  logo: string;
}

interface ScrapedProfile {
  name: string;
  headline: string;
  about: string;
  location: string;
  profilePhoto: string;
  experiences: ScrapedExperience[];
}

// ─── Helpers ─────────────────────────────────────────────

const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/([\w-]+)\/?.*$/i;

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseLinkedInDate(raw: string): string {
  const parts = raw.trim().split(/\s+/);
  if (parts.length >= 2) {
    const m = MONTH_MAP[parts[0].toLowerCase().slice(0, 3)] ?? "01";
    return `${parts[parts.length - 1]}-${m}`;
  }
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return `${parts[0]}-01`;
  return "";
}

// ─── Browser Launch ──────────────────────────────────────

async function launchBrowser(): Promise<Browser> {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Local dev — use installed Chrome
    const paths: Record<string, string> = {
      darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      linux: "/usr/bin/google-chrome",
    };
    return puppeteer.launch({
      headless: true,
      executablePath: paths[process.platform] ?? paths.linux,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  // Production (Vercel) — use @sparticuz/chromium
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

// ─── Page Scraping ───────────────────────────────────────

async function scrapeProfile(url: string): Promise<ScrapedProfile> {
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Stealth: realistic browser fingerprint
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    );
    await page.setViewport({ width: 1280, height: 900 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    // Give LinkedIn a moment to render
    await new Promise((r) => setTimeout(r, 2500));

    // ── Strategy 1: JSON-LD structured data (most reliable) ──
    // ── Strategy 2: DOM selectors (public profile layout) ──
    // ── Strategy 3: Meta tags (fallback — always present) ──
    const data = await page.evaluate(() => {
      // Helper
      const text = (sel: string) => document.querySelector(sel)?.textContent?.trim() ?? "";
      const attr = (sel: string, a: string) => document.querySelector(sel)?.getAttribute(a) ?? "";
      const metaContent = (prop: string) =>
        document.querySelector(`meta[property="${prop}"]`)?.getAttribute("content") ??
        document.querySelector(`meta[name="${prop}"]`)?.getAttribute("content") ?? "";

      // ── JSON-LD ──
      /* eslint-disable @typescript-eslint/no-explicit-any */
      let ld: any = null;
      const ldScript = document.querySelector('script[type="application/ld+json"]');
      if (ldScript?.textContent) {
        try { ld = JSON.parse(ldScript.textContent); } catch { /* noop */ }
      }

      // ── Name ──
      const name =
        text(".top-card-layout__title") ||
        text("h1") ||
        ld?.name ||
        metaContent("og:title")?.replace(/ [-–|].*/g, "").trim() ||
        "";

      // ── Headline ──
      const headline =
        text(".top-card-layout__headline") ||
        text(".top-card__subline-item") ||
        ld?.jobTitle ||
        metaContent("og:description")?.split(" - ")?.[0]?.trim() ||
        "";

      // ── About ──
      const about =
        text(".summary .core-section-container__content p") ||
        text("section.summary p") ||
        ld?.description ||
        "";

      // ── Location ──
      const location =
        text(".top-card__subline-item--bullet") ||
        (ld?.address
          ? [ld.address.addressLocality, ld.address.addressRegion, ld.address.addressCountry]
              .filter(Boolean)
              .join(", ")
          : "") ||
        "";

      // ── Profile photo ──
      const profilePhoto =
        attr(".top-card-layout__entity-image", "src") ||
        attr("img.profile-photo", "src") ||
        attr(".top-card__profile-image", "src") ||
        ld?.image?.contentUrl ||
        metaContent("og:image") ||
        "";

      // ── Experiences ──
      const experiences: { role: string; company: string; dateRange: string; description: string; logo: string }[] = [];

      // Try standard public-profile selectors
      document.querySelectorAll(".experience-item, .experience-group li, section#experience li").forEach((item) => {
        const role =
          item.querySelector(".experience-item__title, h3")?.textContent?.trim() ?? "";
        const company =
          item.querySelector(".experience-item__subtitle, h4, .experience-group-header__company")?.textContent?.trim() ?? "";
        const dateRange =
          item.querySelector(".experience-item__duration, .date-range, span.date-range")?.textContent?.trim() ?? "";
        const desc =
          item.querySelector(".experience-item__description, .show-more-less-text")?.textContent?.trim() ?? "";
        const logo = item.querySelector("img")?.getAttribute("src") ?? "";

        if (role || company) {
          experiences.push({ role, company, dateRange, description: desc, logo });
        }
      });

      // Fallback: JSON-LD worksFor
      if (experiences.length === 0 && ld?.worksFor) {
        const arr = Array.isArray(ld.worksFor) ? ld.worksFor : [ld.worksFor];
        arr.forEach((w: any) => {
          experiences.push({
            role: ld.jobTitle ?? "",
            company: w?.name ?? "",
            dateRange: "",
            description: "",
            logo: "",
          });
        });
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */

      return { name, headline, about, location, profilePhoto, experiences };
    });

    return data;
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Route Handler ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url as string | undefined;

    if (!url || !LINKEDIN_URL_REGEX.test(url.trim())) {
      return NextResponse.json(
        { error: "Invalid LinkedIn profile URL. Expected: https://www.linkedin.com/in/username" },
        { status: 400 },
      );
    }

    const profile = await scrapeProfile(url.trim());

    // Map experiences to our card format
    const experiences = profile.experiences.map((exp, i) => {
      let startDate = "";
      let endDate: string | undefined;
      let current = false;

      if (exp.dateRange) {
        const halves = exp.dateRange.split(/\s*[-–]\s*/);
        if (halves[0]) startDate = parseLinkedInDate(halves[0]);
        if (halves[1]) {
          if (halves[1].toLowerCase().includes("present")) {
            current = true;
          } else {
            endDate = parseLinkedInDate(halves[1]);
          }
        }
      }

      return {
        id: `li-${Date.now()}-${i}`,
        company: exp.company,
        role: exp.role,
        startDate,
        endDate,
        current,
        description: exp.description || undefined,
        companyLogo: exp.logo || undefined,
      };
    });

    return NextResponse.json({
      displayName: profile.name,
      title: profile.headline,
      bio: profile.about,
      location: profile.location,
      profileImage: profile.profilePhoto,
      experiences,
      linkedinUrl: url.trim(),
    });
  } catch (err) {
    console.error("[LinkedIn Scraper] Error:", err);
    return NextResponse.json(
      { error: "Failed to scrape LinkedIn profile. The page may be restricted or loading slowly. Please try again." },
      { status: 500 },
    );
  }
}
