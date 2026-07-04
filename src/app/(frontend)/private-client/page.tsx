import type { Metadata } from "next";
import { PrivateClientExperience } from "@/components/marketing";
import { privateClientContent } from "@/data/experiences";

export const metadata: Metadata = {
  title: "Private Client",
  description: privateClientContent.hero.introduction,
  alternates: { canonical: "/private-client" },
};

export default function PrivateClientPage() {
  return (
    <main id="main-content" className="private-client-page">
      <PrivateClientExperience content={privateClientContent} />
    </main>
  );
}
