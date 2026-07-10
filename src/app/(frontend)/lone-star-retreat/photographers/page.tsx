import type { Metadata } from "next";
import { RetreatAudiencePage } from "@/components/retreat";
import { images } from "@/data/assets";
import { retreatAudienceContent } from "@/data/experiences";
import { siteConfig } from "@/data/site";
import { retreatDomainPath } from "@/lib/domain-routing";

const content = retreatAudienceContent.photographers;

export const metadata: Metadata = {
  title: "Photographer Experience | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: retreatDomainPath("/lone-star-retreat/photographers") },
  openGraph: {
    title: "Photographer Experience | Lone Star Retreat",
    description: content.hero.introduction,
    url: retreatDomainPath("/lone-star-retreat/photographers"),
    siteName: siteConfig.loneStarRetreat.name,
    images: [{ url: images.retreat.texasHillCountryHero, alt: content.hero.imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photographer Experience | Lone Star Retreat",
    description: content.hero.introduction,
    images: [images.retreat.texasHillCountryHero],
  },
};

export default function PhotographerExperiencePage() {
  return (
    <main id="main-content" className="retreat-page retreat-audience-page">
      <RetreatAudiencePage content={content} variant="photographers" />
    </main>
  );
}
