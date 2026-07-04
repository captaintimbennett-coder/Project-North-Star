import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ArrowIcon } from "@/components/buttons";
import type { portfolioContent } from "@/data/portfolio";

type PortfolioCollectionGridProps = {
  collections: typeof portfolioContent.collections;
  eyebrow: string;
};

export function PortfolioCollectionGrid({
  collections,
  eyebrow,
}: PortfolioCollectionGridProps) {
  return (
    <section className="portfolio-collections" id="collections" aria-label="Portfolio collections">
      <Container>
        <p className="portfolio-collections__eyebrow">{eyebrow}</p>
        <div className="portfolio-collections__grid">
          {collections.map((collection) => (
            <article className="portfolio-collection-card" key={collection.title}>
              <Link href={`/portfolio/${collection.slug}`} aria-label={`View ${collection.title} collection`}>
                <Image src={collection.image} alt={collection.imageAlt} fill sizes="(max-width: 760px) 100vw, 33vw" />
                <span className="portfolio-collection-card__shade" aria-hidden="true" />
                <div>
                  <h2>{collection.title}</h2>
                  <i aria-hidden="true" />
                  <p>{collection.description}</p>
                  <span className="portfolio-collection-card__cta">View collection <ArrowIcon /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
