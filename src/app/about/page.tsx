import type { Metadata } from "next";
import { Container, Eyebrow, SectionIntro } from "@/components/layout";
import { aboutContent } from "@/data/pages";

export const metadata: Metadata = { title: "About Tim" };

export default function AboutPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro about-intro"
        eyebrow={aboutContent.introduction.eyebrow}
        title={aboutContent.introduction.title}
      >
        {aboutContent.introduction.body}
      </SectionIntro>

      <section className="about-story">
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
    </main>
  );
}
