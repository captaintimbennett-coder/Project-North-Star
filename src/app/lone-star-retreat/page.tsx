import type { Metadata } from "next";
import { LoneStarRetreatPage } from "@/components/retreat";
import { loneStarRetreatContent } from "@/data/experiences";

export const metadata: Metadata = {
  title: "Lone Star Retreat",
  description: loneStarRetreatContent.hero.introduction,
  alternates: { canonical: "/lone-star-retreat" },
};

export default function RetreatPage() {
  return (
    <main id="main-content" className="retreat-page">
      <LoneStarRetreatPage content={loneStarRetreatContent} />
    </main>
  );
}
