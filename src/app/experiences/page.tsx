import type { Metadata } from "next";
import { ExperienceCard } from "@/components/cards";
import { SectionIntro } from "@/components/layout";
import { experiencesContent } from "@/data/experiences";

export const metadata: Metadata = { title: "Experiences" };

export default function ExperiencesPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro"
        eyebrow={experiencesContent.introduction.eyebrow}
        title={experiencesContent.introduction.title}
      >
        {experiencesContent.introduction.body}
      </SectionIntro>

      <section className="experience-list section-shell">
        {experiencesContent.items.map((experience, index) => (
          <ExperienceCard
            key={experience.title}
            index={index}
            {...experience}
          />
        ))}
      </section>
    </main>
  );
}
