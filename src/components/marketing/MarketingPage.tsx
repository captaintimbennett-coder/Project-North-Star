import type { EditorialHeroContent } from "./EditorialHero";
import type { EditorialBlock } from "./EditorialBlocks";
import type { EditorialCtaContent } from "./EditorialCta";
import { EditorialBlocks } from "./EditorialBlocks";
import { EditorialCta } from "./EditorialCta";
import { EditorialHero } from "./EditorialHero";

export type MarketingPageContent = {
  hero: EditorialHeroContent;
  overview: {
    id?: string;
    eyebrow: string;
    title: string;
    introduction: string;
    blocks: readonly EditorialBlock[];
  };
  cta: EditorialCtaContent;
};

export function MarketingPage({ content }: { content: MarketingPageContent }) {
  return (
    <>
      <EditorialHero content={content.hero} />
      <EditorialBlocks {...content.overview} />
      <EditorialCta content={content.cta} />
    </>
  );
}
