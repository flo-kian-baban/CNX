import { NextRequest, NextResponse } from "next/server";

// ─── Types ───────────────────────────────────────────────
interface RapidAPIExperience {
  title?: string;
  company?: string;
  company_linkedin_profile_url?: string;
  location?: string;
  starts_at?: { day?: number; month?: number; year?: number };
  ends_at?: { day?: number; month?: number; year?: number } | null;
  description?: string;
  logo_url?: string;
}

interface RapidAPIProfile {
  full_name?: string;
  headline?: string;
  about?: string;
  city?: string;
  state?: string;
  country_full_name?: string;
  profile_pic_url?: string;
  experiences?: RapidAPIExperience[];
}

interface MappedExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  companyLogo?: string;
}

// ─── Helpers ─────────────────────────────────────────────

function formatDate(d?: { day?: number; month?: number; year?: number }): string {
  if (!d?.year) return "";
  const month = d.month ? String(d.month).padStart(2, "0") : "01";
  return `${d.year}-${month}`;
}

function buildLocation(city?: string, state?: string, country?: string): string {
  return [city, state, country].filter(Boolean).join(", ");
}

function mapExperiences(exps?: RapidAPIExperience[]): MappedExperience[] {
  if (!exps?.length) return [];
  return exps.map((exp, i) => ({
    id: `li-${Date.now()}-${i}`,
    company: exp.company ?? "",
    role: exp.title ?? "",
    startDate: formatDate(exp.starts_at),
    endDate: exp.ends_at ? formatDate(exp.ends_at) : undefined,
    current: !exp.ends_at,
    description: exp.description ?? undefined,
    companyLogo: exp.logo_url ?? undefined,
  }));
}

const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;

// ─── Handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string };

    if (!url || !LINKEDIN_URL_REGEX.test(url.trim())) {
      return NextResponse.json(
        { error: "Invalid LinkedIn profile URL. Expected format: https://www.linkedin.com/in/username" },
        { status: 400 },
      );
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LinkedIn import is not configured. Missing API key." },
        { status: 500 },
      );
    }

    // Call RapidAPI Fresh LinkedIn Profile Data
    const response = await fetch(
      `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=${encodeURIComponent(url.trim())}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("[LinkedIn API] Error:", response.status, text);

      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limit reached. Please try again later." }, { status: 429 });
      }
      return NextResponse.json(
        { error: "Failed to fetch LinkedIn profile. Please try again." },
        { status: response.status },
      );
    }

    const json = await response.json();
    const profile: RapidAPIProfile = json.data ?? json;

    // Map to our card fields
    const result = {
      displayName: profile.full_name ?? "",
      title: profile.headline ?? "",
      bio: profile.about ?? "",
      location: buildLocation(profile.city, profile.state, profile.country_full_name),
      profileImage: profile.profile_pic_url ?? "",
      experiences: mapExperiences(profile.experiences),
      linkedinUrl: url.trim(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[LinkedIn API] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
