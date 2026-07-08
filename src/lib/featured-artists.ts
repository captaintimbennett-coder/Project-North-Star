import config from "@payload-config";
import { unstable_noStore as noStore } from "next/cache";
import { getPayload } from "payload";
import { currentRetreatEdition } from "@/data/retreat-editions";
import type { Media, ModelProfile, RetreatEvent } from "@/payload-types";

export type PublicArtistImage = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type PublicFeaturedArtist = {
  artistStatement?: string;
  biography?: string;
  categories: string[];
  displayName: string;
  featuredImage: PublicArtistImage;
  instagram?: string;
  introduction?: string;
  location?: string;
  portfolioImages: PublicArtistImage[];
  slug: string;
  website?: string;
};

export type PublicRetreatEvent = {
  artists: PublicFeaturedArtist[];
  dateLabel: string;
  location: string;
  registrationStatus: RetreatEvent["registrationStatus"];
  slug: string;
  summary: string;
  title: string;
};

const categoryLabels: Record<string, string> = {
  glamour: "Glamour",
  boudoir: "Boudoir",
  fashion: "Fashion",
  editorial: "Editorial",
  "fine-art": "Fine Art",
  lifestyle: "Lifestyle",
  commercial: "Commercial",
};

function publicURL(url: string): string {
  if (url.startsWith("/")) return url;
  try { return new URL(url).pathname; } catch { return url; }
}

function mapApprovedMedia(value: number | Media | null | undefined, size: "card" | "hero" = "card"): PublicArtistImage | null {
  if (!value || typeof value === "number" || value.usageApproved !== true || !value.url) return null;
  const rendition = value.sizes?.[size];
  return {
    alt: value.alt,
    src: publicURL(rendition?.url || value.url),
    width: rendition?.width || value.width || (size === "hero" ? 2000 : 900),
    height: rendition?.height || value.height || (size === "hero" ? 1200 : 1125),
  };
}

function cleanExternalURL(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch { return undefined; }
}

function mapPublicProfile(profile: ModelProfile): PublicFeaturedArtist | null {
  if (profile.approvalStatus !== "approved" || profile._status !== "published" || profile.usagePermissionConfirmed !== true) return null;
  const featuredImage = mapApprovedMedia(profile.featuredImage, "hero");
  if (!featuredImage) return null;
  const controls = profile.publicDisplay;
  const location = controls?.location
    ? [profile.city, profile.state].filter(Boolean).join(", ") || undefined
    : undefined;

  return {
    displayName: profile.displayName,
    slug: profile.slug,
    introduction: profile.publicIntroduction || undefined,
    biography: controls?.biography ? profile.biography || undefined : undefined,
    artistStatement: controls?.artistStatement ? profile.artistStatement || undefined : undefined,
    location,
    categories: controls?.categories
      ? (profile.modelingCategories || []).map((category) => categoryLabels[category] || category)
      : [],
    featuredImage,
    portfolioImages: (profile.portfolioImages || [])
      .map((image) => mapApprovedMedia(image, "hero"))
      .filter((image): image is PublicArtistImage => image !== null),
    instagram: controls?.instagram ? cleanExternalURL(profile.instagram) : undefined,
    website: controls?.website ? cleanExternalURL(profile.website) : undefined,
  };
}

function formatEventDate(startDate: string | null | undefined, endDate: string | null | undefined): string {
  if (!startDate) return "Dates forthcoming";
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : undefined;
  const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(start);
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" }).format(start);
  const startDay = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" }).format(start);
  const endDay = end ? new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" }).format(end) : undefined;
  return endDay && endDay !== startDay ? `${month} ${startDay}–${endDay}, ${year}` : `${month} ${startDay}, ${year}`;
}

function mapPublicEvent(event: RetreatEvent): PublicRetreatEvent | null {
  if (event._status !== "published" || !["prototype", "published"].includes(event.lifecycleStatus)) return null;
  const isCurrentEdition = event.slug === currentRetreatEdition.publicSlug || event.slug === currentRetreatEdition.legacySlug;
  const artists = (event.participatingArtists || [])
    .filter((assignment) => assignment.participationStatus === "approved" && typeof assignment.artist !== "number")
    .sort((a, b) => (a.displayOrder ?? 100) - (b.displayOrder ?? 100))
    .map((assignment) => mapPublicProfile(assignment.artist as ModelProfile))
    .filter((artist): artist is PublicFeaturedArtist => artist !== null);
  return {
    artists,
    dateLabel: isCurrentEdition ? currentRetreatEdition.dateLabel : formatEventDate(event.startDate, event.endDate),
    location: isCurrentEdition ? currentRetreatEdition.locationLabel : event.locationName || "Location forthcoming",
    registrationStatus: event.registrationStatus,
    slug: isCurrentEdition ? currentRetreatEdition.publicSlug : event.slug,
    summary: event.summary,
    title: isCurrentEdition ? currentRetreatEdition.title : event.title,
  };
}

export async function getPublicRetreatEvent(eventSlug: string): Promise<PublicRetreatEvent | null> {
  noStore();
  const payload = await getPayload({ config });
  const slugQuery = eventSlug === currentRetreatEdition.publicSlug
    ? [currentRetreatEdition.publicSlug, currentRetreatEdition.legacySlug]
    : [eventSlug];
  const result = await payload.find({
    collection: "retreat-events",
    depth: 3,
    draft: false,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { slug: { in: slugQuery } },
        { _status: { equals: "published" } },
        { lifecycleStatus: { in: ["prototype", "published"] } },
      ],
    },
  });
  return result.docs[0] ? mapPublicEvent(result.docs[0]) : null;
}

export async function getPublicEventArtist(eventSlug: string, artistSlug: string): Promise<{ artist: PublicFeaturedArtist; event: PublicRetreatEvent } | null> {
  const event = await getPublicRetreatEvent(eventSlug);
  const artist = event?.artists.find((candidate) => candidate.slug === artistSlug);
  return event && artist ? { artist, event } : null;
}
