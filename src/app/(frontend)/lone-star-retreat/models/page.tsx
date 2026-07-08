import type { Metadata } from "next";
import { RetreatAudiencePage } from "@/components/retreat";
import { retreatAudienceContent } from "@/data/experiences";

const content = retreatAudienceContent.models;

export const metadata: Metadata = {
  title: "Featured Model Experience | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: "/lone-star-retreat/models" },
};

export default function FeaturedArtistExperiencePage() {
  return (
    <main id="main-content" className="retreat-page retreat-audience-page">
      <RetreatAudiencePage content={content} variant="models" />
    </main>
  );
}
