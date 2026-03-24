import { Timestamp } from "firebase/firestore";

/**
 * Represents a user document stored in the `users` collection.
 * Created automatically on first Google Sign-In.
 */
export interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
}

/**
 * A social platform link with a typed platform identifier.
 */
export interface SocialLink {
  platform:
    | "instagram"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "twitter"
    | "facebook"
    | "github"
    | "snapchat"
    | "pinterest"
    | "website";
  url: string;
}

/**
 * A custom link with a free-form label and URL.
 */
export interface CustomLink {
  label: string;
  url: string;
}

/**
 * A work experience entry.
 */
export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  companyLogo?: string;
}

/**
 * Represents the business card document stored in
 * `users/{userId}/profile/card`.
 */
export interface BusinessCard {
  displayName: string;
  title: string;
  bio?: string;
  location?: string;
  phone: string;
  email: string;
  profileImage: string;
  bannerImage?: string;
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
  experience?: Experience[];
  slug?: string;
  cardTheme?: {
    backgroundColor: string;
    accentColor: string;
    bannerColor?: string;
  };
  updatedAt: Timestamp | string;
}
