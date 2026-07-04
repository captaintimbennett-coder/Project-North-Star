import Image from "next/image";
import Link from "next/link";
import { ActionLink, ArrowIcon } from "@/components/buttons";
import { Container } from "@/components/layout";
import type { loneStarRetreatContent } from "@/data/experiences";

type LoneStarRetreatPageProps = {
  content: typeof loneStarRetreatContent;
};

export function LoneStarRetreatPage({ content }: LoneStarRetreatPageProps) {
  return (
    <>
      <section className="retreat-hero">
        <Image
          className="retreat-hero__image"
          src={content.hero.image}
          alt={content.hero.imageAlt}
          fill
          priority
          sizes="100vw"
        />
        <div className="retreat-hero__shade" />
        <Container className="retreat-hero__content">
          <p className="ds-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.hero.introduction}</p>
          <strong>{content.hero.supporting}</strong>
          <ActionLink href={content.hero.action.href} variant="light">
            {content.hero.action.label}
          </ActionLink>
        </Container>
      </section>

      <section className="retreat-paths" id="retreat-paths" aria-label="Lone Star Retreat pathways">
        <Container className="retreat-paths__grid">
          {content.paths.map((path) => (
            <Link className="retreat-path" href={path.href} key={path.title}>
              <span>{path.number}</span>
              <p className="ds-caption">{path.eyebrow}</p>
              <h2>{path.title}</h2>
              <i aria-hidden="true" />
              <p>{path.body}</p>
              <strong>{path.action}<ArrowIcon /></strong>
            </Link>
          ))}
        </Container>
      </section>

      <section className="retreat-philosophy">
        <div className="retreat-philosophy__image">
          <Image src={content.philosophy.image} alt={content.philosophy.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" />
        </div>
        <div className="retreat-philosophy__copy">
          <p className="ds-eyebrow">{content.philosophy.eyebrow}</p>
          <h2>{content.philosophy.title}</h2>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.philosophy.body}</p>
        </div>
      </section>

      <section className="retreat-experience">
        <Container>
          <div className="retreat-section-heading retreat-section-heading--experience">
            <div>
              <p className="ds-eyebrow">{content.experience.eyebrow}</p>
              <h2>{content.experience.title}</h2>
            </div>
          </div>
          <div className="retreat-experience__grid">
            {content.experience.items.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="retreat-prototype" id="upcoming-retreats">
        <Container>
          <p className="ds-eyebrow">{content.prototype.eyebrow}</p>
          <div className="retreat-prototype__card">
            <div className="retreat-prototype__image">
              <Image src={content.prototype.image} alt={content.prototype.imageAlt} fill sizes="(max-width: 760px) 100vw, 55vw" />
            </div>
            <div className="retreat-prototype__copy">
              <p className="ds-caption">{content.prototype.status}</p>
              <h2>{content.prototype.title}</h2>
              <span className="retreat-rule" aria-hidden="true" />
              <p>{content.prototype.body}</p>
              <ActionLink href={content.prototype.action.href} variant="light">
                {content.prototype.action.label}
              </ActionLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="retreat-closing">
        <Container>
          <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={58} height={62} />
          <p className="ds-eyebrow">{content.closing.eyebrow}</p>
          <h2>{content.closing.title}</h2>
          <p>{content.closing.body}</p>
          <ActionLink href={content.closing.action.href} variant="light">
            {content.closing.action.label}
          </ActionLink>
        </Container>
      </section>
    </>
  );
}
