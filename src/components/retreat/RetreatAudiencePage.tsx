import Image from "next/image";
import { ActionLink } from "@/components/buttons";
import { Container } from "@/components/layout";
import type { retreatAudienceContent } from "@/data/experiences";

type RetreatAudienceContent =
  (typeof retreatAudienceContent)[keyof typeof retreatAudienceContent];

type RetreatAudiencePageProps = {
  content: RetreatAudienceContent;
  variant: "photographers" | "models";
};

export function RetreatAudiencePage({ content, variant }: RetreatAudiencePageProps) {
  return (
    <>
      <section className={`retreat-audience-hero retreat-audience-hero--${variant}`}>
        <Image
          className="retreat-audience-hero__image"
          src={content.hero.image}
          alt={content.hero.imageAlt}
          fill
          priority
          sizes="100vw"
        />
        <div className="retreat-audience-hero__shade" />
        <Container className="retreat-audience-hero__content">
          <p className="ds-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.hero.introduction}</p>
          <ActionLink href="#audience-purpose" variant="light">
            Discover the experience
          </ActionLink>
        </Container>
      </section>

      <section className="retreat-audience-purpose" id="audience-purpose">
        <div className="retreat-audience-purpose__image">
          <Image src={content.why.image} alt={content.why.imageAlt} fill sizes="(max-width: 980px) 100vw, 50vw" />
        </div>
        <div className="retreat-audience-purpose__copy">
          <p className="ds-eyebrow">{content.why.eyebrow}</p>
          <h2>{content.why.title}</h2>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.why.body}</p>
        </div>
      </section>

      <section className="retreat-audience-section">
        <Container>
          <div className="retreat-audience-heading">
            <p className="ds-eyebrow">{content.audience.eyebrow}</p>
            <h2>{content.audience.title}</h2>
          </div>
          <div className="retreat-audience-grid">
            {content.audience.items.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="retreat-audience-section retreat-audience-section--charcoal">
        <Container>
          <div className="retreat-audience-heading">
            <p className="ds-eyebrow">{content.expectations.eyebrow}</p>
            <h2>{content.expectations.title}</h2>
          </div>
          <div className="retreat-audience-expectations">
            {content.expectations.items.map((item) => (
              <article key={item.title}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="retreat-audience-standards">
        <Container>
          <p className="ds-eyebrow">{content.standards.eyebrow}</p>
          <h2>{content.standards.title}</h2>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.standards.body}</p>
        </Container>
      </section>

      <section className="retreat-audience-cta">
        <Container>
          <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={54} height={58} />
          <p className="ds-eyebrow">{content.cta.eyebrow}</p>
          <h2>{content.cta.title}</h2>
          <p>{content.cta.body}</p>
          <ActionLink href={content.cta.href} variant="light">
            {content.cta.label}
          </ActionLink>
        </Container>
      </section>
    </>
  );
}
