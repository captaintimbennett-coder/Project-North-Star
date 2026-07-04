import config from "@payload-config";
import { unstable_noStore as noStore } from "next/cache";
import { getPayload, type Where } from "payload";
import type { Media, ModelProfile } from "@/payload-types";

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

const publicationConditions: Where[] = [
  { approvalStatus: { equals: "approved" } },
  { _status: { equals: "published" } },
  { usagePermissionConfirmed: { equals: true } },
];

const publicationWhere: Where = { and: publicationConditions };

export async function getPublicFeaturedArtists(): Promise<PublicFeaturedArtist[]> {
  noStore();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "model-profiles",
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: true,
    sort: "displayName",
    where: publicationWhere,
  });
  return result.docs.map(mapPublicProfile).filter((artist): artist is PublicFeaturedArtist => artist !== null);
}

export async function getPublicFeaturedArtistBySlug(slug: string): Promise<PublicFeaturedArtist | null> {
  noStore();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "model-profiles",
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: true,
    where: { and: [...publicationConditions, { slug: { equals: slug } }] },
  });
  return result.docs[0] ? mapPublicProfile(result.docs[0]) : null;
}
