import { NextRequest, NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// ─── Types ───────────────────────────────────────────────

interface MappedExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

// ─── Helpers ─────────────────────────────────────────────

const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/([\w-]+)\/?.*$/i;

// ─── Browser Launch ──────────────────────────────────────

async function launchBrowser(): Promise<Browser> {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
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

  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

// ─── Route Handler ───────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body?.url as string | undefined;

  if (!url || !LINKEDIN_URL_REGEX.test(url.trim())) {
    return NextResponse.json(
      { error: "Invalid LinkedIn profile URL. Expected: https://www.linkedin.com/in/username" },
      { status: 400 },
    );
  }

  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // ── Stealth: pretend we're a real user coming from Google ──
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.google.com/",
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    // Navigate to the profile
    await page.goto(url.trim(), { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 3000));

    // Check if we landed on the auth wall
    const currentUrl = page.url();
    const isAuthWall = currentUrl.includes("/authwall") || currentUrl.includes("/login") || currentUrl.includes("/signup");

    if (isAuthWall) {
      // Auth wall blocked us — try navigating via Google referrer trick
      // Go back to the profile URL with a clean referrer chain
      await page.goto(`https://www.google.com/search?q=site:linkedin.com "${url.trim()}"`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      await new Promise((r) => setTimeout(r, 1000));
      await page.goto(url.trim(), { waitUntil: "domcontentloaded", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 3000));
    }

    // ── Extract data ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await page.evaluate(() => {
      const text = (sel: string) => document.querySelector(sel)?.textContent?.trim() ?? "";
      const metaContent = (prop: string) =>
        document.querySelector(`meta[property="${prop}"]`)?.getAttribute("content") ??
        document.querySelector(`meta[name="${prop}"]`)?.getAttribute("content") ?? "";

      // ── JSON-LD (most reliable for name, photo, current company) ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let ld: any = null;
      document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        if (!script.textContent) return;
        try {
          const parsed = JSON.parse(script.textContent);
          // Find the Person object (could be top-level or in @graph)
          if (parsed["@type"] === "Person") ld = parsed;
          if (Array.isArray(parsed["@graph"])) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const person = parsed["@graph"].find((item: any) => item["@type"] === "Person");
            if (person) ld = person;
          }
        } catch { /* noop */ }
      });

      // ── Name ──
      const name =
        text("h1.top-card-layout__title") ||
        text(".pv-top-card--list li:first-child") ||
        ld?.name ||
        metaContent("og:title")?.replace(/\s*[-–|].*$/g, "").trim() ||
        "";

      // ── Headline / Title ──
      let headline =
        text("h2.top-card-layout__headline") ||
        text(".top-card-layout__headline") ||
        ld?.jobTitle ||
        "";
      if (!headline) {
        // og:description often contains "Title at Company · Location"
        const desc = metaContent("og:description");
        if (desc) {
          const match = desc.match(/^(.+?)\s*[·|·]\s*/);
          headline = match ? match[1].trim() : (desc.split(".")[0]?.trim() ?? "");
        }
      }

      // ── About ──
      const about =
        text("section.summary .core-section-container__content p") ||
        text("section.summary p") ||
        text(".pv-about__summary-text") ||
        ld?.description ||
        "";

      // ── Location ──
      const location =
        text(".top-card__subline-item--bullet") ||
        text(".top-card-layout__first-subline .top-card__subline-item:last-child") ||
        (ld?.address
          ? [ld.address.addressLocality, ld.address.addressRegion, ld.address.addressCountry]
              .filter(Boolean).join(", ")
          : "") ||
        "";

      // ── Profile Photo ──
      // IMPORTANT: We must get the user's actual photo, NOT the LinkedIn logo
      const profilePhoto = (() => {
        // JSON-LD is the best source — it's always the user's photo
        if (ld?.image?.contentUrl) return ld.image.contentUrl;
        if (typeof ld?.image === "string" && !ld.image.includes("logo")) return ld.image;

        // DOM: select the specific profile image element
        const profileImg = document.querySelector("img.top-card-layout__entity-image") as HTMLImageElement | null;
        if (profileImg?.src && !profileImg.src.includes("logo") && !profileImg.src.includes("static")) {
          return profileImg.src;
        }

        // og:image — but filter out LinkedIn's generic images
        const ogImage = metaContent("og:image");
        if (ogImage && !ogImage.includes("static.licdn.com/sc/h/") && !ogImage.includes("logo")) {
          return ogImage;
        }
        return "";
      })();

      // ── Experiences from JSON-LD worksFor ──
      // LinkedIn's guest view only provides current employer(s) via JSON-LD worksFor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const experiences: { role: string; company: string }[] = [];
      if (ld?.worksFor) {
        const arr = Array.isArray(ld.worksFor) ? ld.worksFor : [ld.worksFor];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arr.forEach((w: any) => {
          const companyName = w?.name ?? "";
          // Skip redacted entries (LinkedIn masks with *******)
          if (companyName && !companyName.includes("*******")) {
            experiences.push({
              role: ld.jobTitle ?? "",
              company: companyName,
            });
          }
        });
      }

      // Also try DOM-based experience items (if the Discovery layout shows them)
      document.querySelectorAll("li.experience-item, section#experience li, .experience-group__positions li").forEach((item) => {
        const role = item.querySelector(".experience-item__title, h3")?.textContent?.trim() ?? "";
        const company = item.querySelector(".experience-item__subtitle, h4")?.textContent?.trim() ?? "";
        if ((role || company) && !role.includes("*******")) {
          experiences.push({ role, company });
        }
      });

      return { name, headline, about, location, profilePhoto, experiences };
    });

    // Safely coerce all values to strings
    const rawName = String(data.name ?? "");
    const rawHeadline = String(data.headline ?? "").replace(/[\*]{3,}/g, "").replace(/[,\s]+$/g, "").trim();
    const rawAbout = String(data.about ?? "").replace(/[\*]{3,}/g, "").trim();
    const rawLocation = String(data.location ?? "");
    const rawPhoto = String(data.profilePhoto ?? "");

    // Don't return data from the auth wall page
    const cleanName = rawName.replace(/^Join LinkedIn.*$/i, "").trim();
    const cleanHeadline = rawHeadline.replace(/^Sign in.*$/i, "").trim();

    const experiences: MappedExperience[] = (data.experiences ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((exp: any) => {
        const company = String(exp.company ?? "").replace(/[\*]{3,}/g, "").trim();
        const role = String(exp.role ?? "").replace(/[\*]{3,}/g, "").trim();
        return company || role; // skip if both redacted
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((exp: any, i: number) => ({
        id: `li-${Date.now()}-${i}`,
        company: String(exp.company ?? "").replace(/[\*]{3,}/g, "").trim(),
        role: String(exp.role ?? "").replace(/[\*]{3,}/g, "").replace(/[,\s]+$/g, "").trim(),
        startDate: "",
        current: true,
        description: undefined,
      }))
      .filter((exp: MappedExperience) => exp.company || exp.role);

    const result = {
      displayName: cleanName,
      title: cleanHeadline,
      bio: rawAbout.replace(/<[^>]*>/g, "\n").replace(/[\*]{4,}/g, "").trim(),
      location: rawLocation,
      profileImage: rawPhoto,
      experiences,
      linkedinUrl: url.trim(),
    };

    // Verify we actually got useful data
    if (!result.displayName && !result.title) {
      return NextResponse.json(
        { error: "Could not extract profile data. LinkedIn may have blocked the request. Please try again in a moment." },
        { status: 422 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[LinkedIn Scraper] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Scraper error: ${message}` },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close();
  }
}
