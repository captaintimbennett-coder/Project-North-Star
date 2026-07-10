import type { Metadata } from "next";
import { LoneStarRetreatPage } from "@/components/retreat";
import { images } from "@/data/assets";
import { loneStarRetreatContent } from "@/data/experiences";
import { siteConfig } from "@/data/site";
import { retreatDomainPath } from "@/lib/domain-routing";

export const metadata: Metadata = {
  title: siteConfig.loneStarRetreat.name,
  description: siteConfig.loneStarRetreat.description,
  alternates: { canonical: retreatDomainPath("/lone-star-retreat") },
  openGraph: {
    title: siteConfig.loneStarRetreat.title,
    description: siteConfig.loneStarRetreat.description,
    url: retreatDomainPath("/lone-star-retreat"),
    siteName: siteConfig.loneStarRetreat.name,
    images: [
      {
        url: images.retreat.texasHillCountryHero,
        alt: loneStarRetreatContent.hero.imageAlt,
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

export default function RetreatPage() {
  return (
    <main id="main-content" className="retreat-page">
      <LoneStarRetreatPage content={loneStarRetreatContent} />
    </main>
  );
}
