import type { Metadata } from "next";
import { AboutExperience } from "@/components/marketing";
import { aboutContent } from "@/data/pages";

export const metadata: Metadata = {
  title: "About Tim",
  description: aboutContent.hero.body,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <AboutExperience />
    </main>
  );
}
