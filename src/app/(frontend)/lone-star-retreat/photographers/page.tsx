import type { Metadata } from "next";
import { RetreatAudiencePage } from "@/components/retreat";
import { retreatAudienceContent } from "@/data/experiences";

const content = retreatAudienceContent.photographers;

export const metadata: Metadata = {
  title: "Photographer Experience | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: "/lone-star-retreat/photographers" },
};

export default function PhotographerExperiencePage() {
  return (
    <main id="main-content" className="retreat-page retreat-audience-page">
      <RetreatAudiencePage content={content} variant="photographers" />
    </main>
  );
}
