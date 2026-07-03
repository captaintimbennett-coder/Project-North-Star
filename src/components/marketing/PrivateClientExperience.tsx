import Image from "next/image";
import { ActionLink } from "@/components/buttons";
import { Container } from "@/components/layout/Container";
import { privateClientContent } from "@/data/experiences";

type PrivateClientContent = typeof privateClientContent;

export function PrivateClientExperience({ content }: { content: PrivateClientContent }) {
  return (
    <>
      <section className="private-client-hero">
        <Image className="private-client-hero__image" src={content.hero.image} alt={content.hero.imageAlt} fill priority sizes="100vw" />
        <div className="private-client-hero__shade" aria-hidden="true" />
        <Container className="private-client-hero__content">
          <p className="ds-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.introduction}</p>
          <ActionLink href={content.hero.action.href} variant="light">{content.hero.action.label}</ActionLink>
        </Container>
      </section>

      <section className="private-client-reassurance" id={content.reassurance.id}>
        <Container>
          <p className="ds-eyebrow">{content.reassurance.eyebrow}</p>
          <h2>{content.reassurance.title}</h2>
          <span aria-hidden="true" />
          <p>{content.reassurance.body}</p>
        </Container>
      </section>

      <section className="private-client-process">
        <Container>
          <header>
            <p className="ds-eyebrow">{content.process.eyebrow}</p>
            <h2>{content.process.title}</h2>
          </header>
          <div className="private-client-process__grid">
            {content.process.steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <i aria-hidden="true" />
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="private-client-confidence">
        <div className="private-client-confidence__image">
          <Image src={content.confidence.image} alt={content.confidence.imageAlt} fill sizes="(max-width: 760px) 100vw, 52vw" />
        </div>
        <div className="private-client-confidence__copy">
          <blockquote>“{content.confidence.quote}”</blockquote>
          <span aria-hidden="true" />
          <p>{content.confidence.body}</p>
        </div>
      </section>

      <section className="private-client-intention">
        <Container className="private-client-intention__layout">
          <div>
            <p className="ds-eyebrow">{content.intention.eyebrow}</p>
            <h2>{content.intention.title}</h2>
            <p>{content.intention.body}</p>
          </div>
          <div className="private-client-intention__benefits">
            <ul>
              {content.intention.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
            <ActionLink href={content.intention.action.href} variant="light">{content.intention.action.label}</ActionLink>
          </div>
        </Container>
      </section>

      <section className="private-client-closing">
        <Container>
          <Image
            className="private-client-closing__symbol"
            src={content.closing.symbol}
            alt=""
            width={54}
            height={58}
          />
          <div>
            {content.closing.lines.map((line) => <p key={line}>{line}</p>)}
          </div>
        </Container>
      </section>
    </>
  );
}
