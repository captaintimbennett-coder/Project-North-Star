import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { EditorialBlocks, EditorialHero } from "@/components/marketing";
import { contactContent } from "@/data/pages";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: contactContent.hero.introduction,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <EditorialHero content={contactContent.hero} />
      <EditorialBlocks {...contactContent.overview} />

      <Container as="section" className="contact-layout">
        <div className="contact-details">
          <p className="ds-caption">{contactContent.detailsLabel}</p>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <p>{contactContent.location}</p>
        </div>
        <div className="contact-fallback" aria-labelledby="contact-fallback-title">
          <p className="ds-caption">Online inquiries</p>
          <h2 id="contact-fallback-title">{contactContent.formUnavailableTitle}</h2>
          <p>{contactContent.formUnavailableBody}</p>
          <a className="ds-button ds-button--primary" href={`mailto:${siteConfig.email}`}>
            {contactContent.emailActionLabel}
          </a>
        </div>
      </Container>
    </main>
  );
}
