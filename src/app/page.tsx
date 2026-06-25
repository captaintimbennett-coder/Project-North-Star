import Image from "next/image";
import { ActionLink, TextLink } from "@/components/buttons";
import { PillarCard } from "@/components/cards";
import { HomeHero } from "@/components/hero";
import { Container, Eyebrow } from "@/components/layout";
import { homeContent } from "@/data/home";

export default function HomePage() {
  return (
    <main id="main-content">
      <HomeHero content={homeContent.hero} />

      <Container as="section" className="manifesto">
        <div>
          <Eyebrow>{homeContent.manifesto.eyebrow}</Eyebrow>
          <h2>{homeContent.manifesto.headline[0]}<br />{homeContent.manifesto.headline[1]}</h2>
        </div>
        <div className="manifesto-copy">
          {homeContent.manifesto.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <TextLink href={homeContent.manifesto.action.href}>
            {homeContent.manifesto.action.label}
          </TextLink>
        </div>
      </Container>

      <section className="pillars-section">
        <div className="section-heading section-shell">
          <Eyebrow>{homeContent.foundation.eyebrow}</Eyebrow>
          <h2>{homeContent.foundation.headline[0]}<br />{homeContent.foundation.headline[1]}</h2>
        </div>
        <div className="pillar-grid section-shell">
          {homeContent.foundation.pillars.map((pillar) => (
            <PillarCard key={pillar.title} {...pillar} />
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div className="quote-image-wrap">
          <Image
            src={homeContent.perspective.image}
            alt={homeContent.perspective.alt}
            fill
            sizes="(max-width: 820px) 100vw, 50vw"
          />
        </div>
        <div className="quote-copy">
          <Eyebrow>{homeContent.perspective.eyebrow}</Eyebrow>
          <blockquote>
            “{homeContent.perspective.quote}”
          </blockquote>
          <p>{homeContent.perspective.body}</p>
          <ActionLink href={homeContent.perspective.action.href} variant="dark">
            {homeContent.perspective.action.label}
          </ActionLink>
        </div>
      </section>

      <section className="closing section-shell">
        <Eyebrow>{homeContent.closing.eyebrow}</Eyebrow>
        <h2>{homeContent.closing.headline[0]}<br />{homeContent.closing.headline[1]}</h2>
        <TextLink
          className="text-link-large"
          href={homeContent.closing.action.href}
        >
          {homeContent.closing.action.label}
        </TextLink>
      </section>
    </main>
  );
}
