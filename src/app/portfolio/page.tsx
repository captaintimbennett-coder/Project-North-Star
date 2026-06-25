import type { Metadata } from "next";
import { SectionIntro } from "@/components/layout";
import { PortfolioCollectionGrid } from "@/components/portfolio";
import { portfolioContent } from "@/data/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro"
        eyebrow={portfolioContent.introduction.eyebrow}
        title={portfolioContent.introduction.title}
      >
        {portfolioContent.introduction.body}
      </SectionIntro>
      <PortfolioCollectionGrid
        collections={portfolioContent.collections}
        status={portfolioContent.collectionStatus}
      />
    </main>
  );
}
