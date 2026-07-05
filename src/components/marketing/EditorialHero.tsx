import Image from "next/image";
import { ActionLink } from "@/components/buttons";
import { Container } from "@/components/layout/Container";

export type EditorialHeroContent = {
  eyebrow: string;
  title: string;
  introduction: string;
  image: string;
  imageAlt: string;
  action?: { label: string; href: string };
};

export function EditorialHero({ content }: { content: EditorialHeroContent }) {
  return (
    <section className="editorial-hero">
      <Container className="editorial-hero__layout">
        <div className="editorial-hero__copy">
          <p className="ds-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.introduction}</p>
          {content.action && (
            <ActionLink href={content.action.href} variant="light">
              {content.action.label}
            </ActionLink>
          )}
        </div>
        <div className="editorial-hero__media">
          <Image
            src={content.image}
            alt={content.imageAlt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
          />
        </div>
      </Container>
    </section>
  );
}
