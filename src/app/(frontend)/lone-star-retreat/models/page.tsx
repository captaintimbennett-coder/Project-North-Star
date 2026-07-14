import type { Metadata } from "next";
import { RetreatAudiencePage } from "@/components/retreat";
import { images } from "@/data/assets";
import { retreatAudienceContent } from "@/data/experiences";
import { siteConfig } from "@/data/site";
import { retreatDomainPath } from "@/lib/domain-routing";

const content = retreatAudienceContent.models;

export const metadata: Metadata = {
  title: "Featured Artist Experience | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: retreatDomainPath("/lone-star-retreat/models") },
  openGraph: {
    title: "Featured Artist Experience | Lone Star Retreat",
    description: content.hero.introduction,
    url: retreatDomainPath("/lone-star-retreat/models"),
    siteName: siteConfig.loneStarRetreat.name,
    images: [{ url: images.portfolio.redEditorial, alt: content.hero.imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Artist Experience | Lone Star Retreat",
    description: content.hero.introduction,
    images: [images.portfolio.redEditorial],
  },
};

export default function FeaturedArtistExperiencePage() {
  return (
    <main id="main-content" className="retreat-page retreat-audience-page">
      <RetreatAudiencePage content={content} variant="models" />
    </main>
  );
}
