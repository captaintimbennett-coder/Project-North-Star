import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistProfile } from "@/components/retreat/FeaturedArtistProfile";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { getPublicEventArtist } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicEventArtist(currentRetreatEdition.publicSlug, slug);
  if (!result) return { title: "Participating Artist Not Found", robots: { index: false, follow: false } };
  return {
    title: `${result.artist.displayName} | ${result.event.title}`,
    description: result.artist.introduction || `Meet ${result.artist.displayName}, a participating artist for ${result.event.title}.`,
    alternates: { canonical: `${currentRetreatEdition.artistsPath}/${slug}` },
    openGraph: { images: [{ url: result.artist.featuredImage.src, alt: result.artist.featuredImage.alt }] },
  };
}

export default async function FoundersEditionArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicEventArtist(currentRetreatEdition.publicSlug, slug);
  if (!result) notFound();
  return <main id="main-content" className="retreat-page featured-artist-profile-page"><FeaturedArtistProfile artist={result.artist} event={result.event} /></main>;
}
