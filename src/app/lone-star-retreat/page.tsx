import type { Metadata } from "next";
import { SectionIntro } from "@/components/layout";
import { loneStarRetreatContent } from "@/data/experiences";

export const metadata: Metadata = { title: "Lone Star Retreat" };

export default function RetreatPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro"
        eyebrow={loneStarRetreatContent.eyebrow}
        title={<>{loneStarRetreatContent.title[0]}<br />{loneStarRetreatContent.title[1]}</>}
      >
        {loneStarRetreatContent.body}
      </SectionIntro>
    </main>
  );
}
