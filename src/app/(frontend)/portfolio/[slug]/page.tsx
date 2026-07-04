import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { portfolioContent } from "@/data/portfolio";

type CollectionPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolioContent.collections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = portfolioContent.collections.find((item) => item.slug === slug);
  if (!collection) return {};

  return {
    title: `${collection.title} Portfolio`,
    description: collection.description,
    alternates: { canonical: `/portfolio/${collection.slug}` },
  };
}

export default async function PortfolioCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = portfolioContent.collections.find((item) => item.slug === slug);
  if (!collection) notFound();

  return (
    <main id="main-content" className="portfolio-collection-page">
      <Image src={collection.image} alt={collection.imageAlt} fill priority sizes="100vw" />
      <span aria-hidden="true" />
      <Container>
        <p className="ds-eyebrow">Portfolio collection</p>
        <h1>{collection.title}</h1>
        <p>{collection.description}</p>
        <Link href="/portfolio">Return to portfolio</Link>
      </Container>
    </main>
  );
}
