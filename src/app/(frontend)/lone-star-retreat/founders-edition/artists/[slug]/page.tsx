import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistProfile } from "@/components/retreat/FeaturedArtistProfile";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { siteConfig } from "@/data/site";
import { getPublicEventArtist } from "@/lib/featured-artists";
import { retreatDomainPath } from "@/lib/domain-routing";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicEventArtist(currentRetreatEdition.publicSlug, slug);
  if (!result) return { title: "Participating Artist Not Found", robots: { index: false, follow: false } };
  return {
    title: `${result.artist.displayName} | ${result.event.title}`,
    description: result.artist.introduction || `Meet ${result.artist.displayName}, a participating artist for ${result.event.title}.`,
    alternates: { canonical: retreatDomainPath(`${currentRetreatEdition.artistsPath}/${slug}`) },
    openGraph: {
      title: `${result.artist.displayName} | ${siteConfig.loneStarRetreat.name}`,
      description:
        result.artist.introduction ||
        `Meet ${result.artist.displayName}, a participating artist for ${result.event.title}.`,
      url: retreatDomainPath(`${currentRetreatEdition.artistsPath}/${slug}`),
      siteName: siteConfig.loneStarRetreat.name,
      images: [{ url: result.artist.featuredImage.src, alt: result.artist.featuredImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${result.artist.displayName} | ${siteConfig.loneStarRetreat.name}`,
      description:
        result.artist.introduction ||
        `Meet ${result.artist.displayName}, a participating artist for ${result.event.title}.`,
      images: [result.artist.featuredImage.src],
    },
  };
}

export default async function FoundersEditionArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicEventArtist(currentRetreatEdition.publicSlug, slug);
  if (!result) notFound();
  return <main id="main-content" className="retreat-page featured-artist-profile-page"><FeaturedArtistProfile artist={result.artist} event={result.event} /></main>;
}
