import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing";
import { workshopsContent } from "@/data/experiences";

export const metadata: Metadata = {
  title: "Workshops & Education",
  description: workshopsContent.hero.introduction,
  alternates: { canonical: "/workshops-education" },
};

export default function WorkshopsEducationPage() {
  return (
    <main id="main-content" className="marketing-page">
      <MarketingPage content={workshopsContent} />
    </main>
  );
}
