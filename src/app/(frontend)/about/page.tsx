import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/layout";
import { EditorialBlocks, EditorialCta, EditorialHero } from "@/components/marketing";
import { aboutContent } from "@/data/pages";

export const metadata: Metadata = {
  title: "About Tim",
  description: aboutContent.hero.introduction,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <EditorialHero content={aboutContent.hero} />

      <EditorialBlocks {...aboutContent.overview} />

      <section className="about-story" id="about-overview">
        <Container className="about-story-grid">
          <Eyebrow>{aboutContent.story.eyebrow}</Eyebrow>
          <div>
            {aboutContent.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Eyebrow>{aboutContent.story.location}</Eyebrow>
          </div>
        </Container>
      </section>
      <EditorialCta content={aboutContent.cta} />
    </main>
  );
}
