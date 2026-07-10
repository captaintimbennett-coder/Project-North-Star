import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout";
import { PhotographerApplicationForm } from "@/components/retreat";
import { photographerApplicationContent as content } from "@/data/applications";
import { images } from "@/data/assets";
import { retreatDomainPath } from "@/lib/domain-routing";

export const metadata: Metadata = {
  title: "Photographer Application | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: retreatDomainPath("/lone-star-retreat/photographers/apply") },
  robots: { index: false, follow: true },
};

export default function PhotographerApplicationPage() {
  return (
    <main id="main-content" className="retreat-page application-page">
      <section className="application-hero">
        <Image
          className="application-hero__image"
          src={images.retreat.texasHillCountryHero}
          alt="Retreat landscape at sunset"
          fill
          priority
          sizes="100vw"
        />
        <div className="application-hero__shade" />
        <Container className="application-hero__content">
          <p className="ds-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <span className="retreat-rule" aria-hidden="true" />
          <p>{content.hero.introduction}</p>
        </Container>
      </section>

      <section className="application-introduction">
        <Container>
          <div>
            <p className="ds-eyebrow">{content.introduction.eyebrow}</p>
            <h2>{content.introduction.title}</h2>
          </div>
          <div>
            <p>{content.introduction.body}</p>
            <p>{content.introduction.note}</p>
          </div>
        </Container>
      </section>

      <Container className="application-layout">
        <aside className="application-progress" aria-label="Application sections">
          <p className="ds-eyebrow">Your application</p>
          <ol>
            {content.sections.map((section) => (
              <li key={section.number}>
                <span>{section.number}</span>
                {section.title}
              </li>
            ))}
          </ol>
          <p>One application · Four sections</p>
        </aside>
        <PhotographerApplicationForm />
      </Container>
    </main>
  );
}
