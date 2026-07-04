import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistProfile } from "@/components/retreat/FeaturedArtistProfile";
import { getPublicFeaturedArtistBySlug } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";

type ArtistProfilePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArtistProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getPublicFeaturedArtistBySlug(slug);
  if (!artist) return { title: "Featured Artist Not Found", robots: { index: false, follow: false } };
  return {
    title: `${artist.displayName} | Featured Artist`,
    description: artist.introduction || `Meet ${artist.displayName}, a Lone Star Retreat Featured Artist.`,
    alternates: { canonical: `/lone-star-retreat/featured-artists/${artist.slug}` },
    openGraph: { images: [{ url: artist.featuredImage.src, alt: artist.featuredImage.alt }] },
  };
}

export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
  const { slug } = await params;
  const artist = await getPublicFeaturedArtistBySlug(slug);
  if (!artist) notFound();
  return <main id="main-content" className="retreat-page featured-artist-profile-page"><FeaturedArtistProfile artist={artist} /></main>;
}
