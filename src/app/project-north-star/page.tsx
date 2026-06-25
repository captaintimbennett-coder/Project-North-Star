import type { Metadata } from "next";
import { JournalCard } from "@/components/cards";
import { Container, Eyebrow, SectionIntro } from "@/components/layout";
import { northStarContent } from "@/data/north-star";

export const metadata: Metadata = { title: "Project North Star" };

export default function NorthStarPage() {
  return (
    <main id="main-content">
      <SectionIntro
        className="editorial-intro north-star-intro"
        eyebrow={northStarContent.introduction.eyebrow}
        title={<>{northStarContent.introduction.title[0]}<br />{northStarContent.introduction.title[1]}</>}
        footer={
          <Eyebrow className="journey-label">
            {northStarContent.introduction.continuation}
          </Eyebrow>
        }
      >
        {northStarContent.introduction.body}
      </SectionIntro>

      <section className="journal-section">
        <Container className="journal-heading">
          <Eyebrow>{northStarContent.journal.eyebrow}</Eyebrow>
          <h2>{northStarContent.journal.headline[0]}<br />{northStarContent.journal.headline[1]}</h2>
        </Container>
        <Container className="journal-grid">
          {northStarContent.journal.entries.map((entry) => (
            <JournalCard
              key={entry.title}
              {...entry}
              status={northStarContent.journal.status}
            />
          ))}
        </Container>
      </section>
    </main>
  );
}
