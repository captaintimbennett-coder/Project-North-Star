import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistsIndex } from "@/components/retreat/FeaturedArtistsIndex";
import { images } from "@/data/assets";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { siteConfig } from "@/data/site";
import { getPublicRetreatEvent } from "@/lib/featured-artists";
import { retreatDomainPath } from "@/lib/domain-routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Participating Artists | Lone Star Retreat — Founders Edition",
  description: "Meet the approved participating artists for the May 2027 Lone Star Retreat Founders Edition.",
  alternates: { canonical: retreatDomainPath(currentRetreatEdition.artistsPath) },
  openGraph: {
    title: "Participating Artists | Lone Star Retreat — Founders Edition",
    description:
      "Meet the approved participating artists for the May 2027 Lone Star Retreat Founders Edition.",
    url: retreatDomainPath(currentRetreatEdition.artistsPath),
    siteName: siteConfig.loneStarRetreat.name,
    images: [
      {
        url: images.retreat.texasHillCountryHero,
        alt: "A contemporary retreat glowing at sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Participating Artists | Lone Star Retreat — Founders Edition",
    description:
      "Meet the approved participating artists for the May 2027 Lone Star Retreat Founders Edition.",
    images: [images.retreat.texasHillCountryHero],
  },
};

export default async function FoundersEditionArtistsPage() {
  const event = await getPublicRetreatEvent(currentRetreatEdition.publicSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page featured-artists-page"><FeaturedArtistsIndex event={event} /></main>;
}
