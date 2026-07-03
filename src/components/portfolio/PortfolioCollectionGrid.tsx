import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { MediaFrame } from "@/components/layout/MediaFrame";
import type { portfolioContent } from "@/data/portfolio";

type PortfolioCollectionGridProps = {
  collections: typeof portfolioContent.collections;
  status: string;
};

export function PortfolioCollectionGrid({
  collections,
  status,
}: PortfolioCollectionGridProps) {
  return (
    <Container
      as="section"
      className="collection-grid"
      id="collections"
      aria-label="Portfolio collections"
    >
      {collections.map((collection, index) => (
        <article className="collection-card" key={collection.title}>
          <MediaFrame className="collection-image" interactive>
            <Image
              src={collection.image}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <span>0{index + 1}</span>
          </MediaFrame>
          <div className="collection-copy">
            <h2>{collection.title}</h2>
            <p>{collection.description}</p>
            <span className="collection-status">{status}</span>
          </div>
        </article>
      ))}
    </Container>
  );
}
