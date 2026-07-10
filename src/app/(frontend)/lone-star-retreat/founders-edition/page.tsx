import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RetreatEventPage } from "@/components/retreat/RetreatEventPage";
import { images } from "@/data/assets";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { siteConfig } from "@/data/site";
import { getPublicRetreatEvent } from "@/lib/featured-artists";
import { retreatDomainPath } from "@/lib/domain-routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founders Edition | Lone Star Retreat",
  description: siteConfig.loneStarRetreat.description,
  alternates: { canonical: retreatDomainPath("/") },
  openGraph: {
    title: siteConfig.loneStarRetreat.title,
    description: siteConfig.loneStarRetreat.description,
    url: retreatDomainPath("/"),
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
    title: siteConfig.loneStarRetreat.title,
    description: siteConfig.loneStarRetreat.description,
    images: [images.retreat.texasHillCountryHero],
  },
};

export default async function FoundersEditionPage() {
  const event = await getPublicRetreatEvent(currentRetreatEdition.publicSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page retreat-event-page"><RetreatEventPage event={event} /></main>;
}
