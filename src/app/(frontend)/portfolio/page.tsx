import type { Metadata } from "next";
import { PortfolioCollectionGrid, PortfolioHero } from "@/components/portfolio";
import { portfolioContent } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: portfolioContent.hero.introduction,
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <main id="main-content" className="portfolio-page">
      <PortfolioHero content={portfolioContent.hero} />
      <PortfolioCollectionGrid
        collections={portfolioContent.collections}
        eyebrow={portfolioContent.collectionsEyebrow}
      />
    </main>
  );
}
