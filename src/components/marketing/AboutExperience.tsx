import Image from "next/image";
import { Container } from "@/components/layout";
import { images } from "@/data/assets";
import { aboutContent as content } from "@/data/pages";

function ValueIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" {...common}>
      {name === "people" && <><circle cx="24" cy="15" r="6" /><path d="M13 39v-7c0-6 5-10 11-10s11 4 11 10v7M18 13c-5 0-8 3-8 8v6m20-14c5 0 8 3 8 8v6" /></>}
      {name === "camera" && <><rect x="7" y="14" width="34" height="25" rx="2" /><path d="M15 14l3-6h12l3 6" /><circle cx="24" cy="26" r="8" /></>}
      {name === "star" && <path d="M24 5l4.8 13.8H43l-11.3 8.4L36 41l-12-8.2L12 41l4.3-13.8L5 18.8h14.2L24 5z" />}
      {name === "heart" && <path d="M24 40S7 30 7 17c0-6 4-10 10-10 3.7 0 6 2 7 5 1-3 3.3-5 7-5 6 0 10 4 10 10 0 13-17 23-17 23z" />}
      {name === "compass" && <><circle cx="24" cy="24" r="18" /><path d="M30 17l-4 10-10 4 4-10 10-4z" /></>}
    </svg>
  );
}

export function AboutExperience() {
  return (
    <div className="about-experience">
      <section className="about-hero" aria-labelledby="about-title">
        <Image className="about-hero__image" src={content.hero.image} alt={content.hero.imageAlt} fill priority sizes="100vw" />
        <div className="about-hero__shade" />
        <Container className="about-hero__content">
          <p className="ds-eyebrow">{content.hero.eyebrow}</p>
          <h1 id="about-title">{content.hero.title}</h1>
          <span className="about-rule" />
          <p className="about-hero__roles">{content.hero.introduction}</p>
          <p>{content.hero.body}</p>
        </Container>
      </section>

      <section className="about-narrative" aria-labelledby="about-story-title">
        <Container className="about-narrative__grid">
          <div className="about-narrative__copy">
            <p className="ds-eyebrow">{content.story.eyebrow}</p>
            <h2 id="about-story-title">{content.story.title}</h2>
            <span className="about-rule" />
            {content.story.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <blockquote>{content.story.quote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</blockquote>
            {content.story.closing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="about-narrative__portrait">
            <div className="about-narrative__image">
              <Image src={content.story.image} alt={content.story.imageAlt} fill sizes="(max-width: 760px) 100vw, 52vw" />
            </div>
            <aside className="about-humility">
              <Image src={images.brand.northStarSymbol} alt="" width={54} height={54} />
              <p><strong>{content.story.humilityLabel}</strong>{content.story.humilityBody}</p>
            </aside>
          </div>
        </Container>
      </section>

      <section className="about-approach" aria-labelledby="about-approach-title">
        <Container>
          <div className="about-approach__heading"><span /><p className="ds-eyebrow" id="about-approach-title">{content.approach.eyebrow}</p><span /></div>
          <div className="about-approach__grid">
            {content.approach.values.map((value) => <article key={value.title}><ValueIcon name={value.icon} /><h3>{value.title}</h3><p>{value.body}</p></article>)}
          </div>
        </Container>
      </section>

      <section className="about-retreat" aria-labelledby="about-retreat-title">
        <Container className="about-retreat__grid">
          <div><p className="ds-eyebrow">{content.retreat.eyebrow}</p><h2 id="about-retreat-title">{content.retreat.title}</h2><span className="about-rule" /></div>
          <div>{content.retreat.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="about-texas" aria-hidden="true">
            <Image src={images.about.texasOutline} alt="" width={200} height={170} />
          </div>
        </Container>
      </section>

      <section className="about-closing">
        <div className="about-closing__image">
          <Image src={images.about.closing} alt="" fill sizes="(max-width: 760px) 100vw, 45vw" />
        </div>
        <div className="about-closing__shade" />
        <Container className="about-closing__content">
          <span className="about-closing__mark" aria-hidden="true">“</span>
          <div><p>{content.closing.body}</p><p className="about-closing__emphasis">{content.closing.emphasis.map((line) => <span key={line}>{line}</span>)}</p><span className="about-closing__signature" role="img" aria-label="Tim Bennett" /></div>
        </Container>
      </section>
    </div>
  );
}
