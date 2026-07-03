import { ActionLink } from "@/components/buttons";
import { Container } from "@/components/layout/Container";

export type EditorialCtaContent = {
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; href: string };
};

export function EditorialCta({ content }: { content: EditorialCtaContent }) {
  return (
    <section className="editorial-cta">
      <Container>
        <p className="ds-eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
        <ActionLink href={content.action.href} variant="light">
          {content.action.label}
        </ActionLink>
      </Container>
    </section>
  );
}
