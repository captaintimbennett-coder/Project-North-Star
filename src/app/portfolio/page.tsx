import type { Metadata } from "next";
import { EditorialBlocks, EditorialCta, EditorialHero } from "@/components/marketing";
import { PortfolioCollectionGrid } from "@/components/portfolio";
import { portfolioContent } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: portfolioContent.hero.introduction,
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <main id="main-content">
      <EditorialHero content={portfolioContent.hero} />
      <PortfolioCollectionGrid
        collections={portfolioContent.collections}
        status={portfolioContent.collectionStatus}
      />
      <EditorialBlocks {...portfolioContent.overview} />
      <EditorialCta content={portfolioContent.cta} />
    </main>
  );
}
