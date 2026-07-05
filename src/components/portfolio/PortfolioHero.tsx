import Image from "next/image";
import { Container } from "@/components/layout/Container";
import type { portfolioContent } from "@/data/portfolio";

export function PortfolioHero({ content }: { content: typeof portfolioContent.hero }) {
  return (
    <section className="portfolio-hero">
      <Image
        className="portfolio-hero__image"
        src={content.image}
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
      />
      <div className="portfolio-hero__shade" aria-hidden="true" />
      <Container className="portfolio-hero__content">
        <p className="ds-eyebrow">{content.eyebrow}</p>
        <h1>
          <span>{content.titleLineOne}</span>
          <em>{content.titleLineTwo}</em>
        </h1>
        <i aria-hidden="true" />
        <p>{content.introduction}</p>
      </Container>
    </section>
  );
}
