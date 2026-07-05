import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { TextLink } from "@/components/buttons";
import { HomeHero } from "@/components/hero";
import { SignatureMark } from "@/components/layout";
import { homeContent } from "@/data/home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="home-proof" id="main-content">
      <HomeHero content={homeContent.hero} />

      <section className="north-star-experience" aria-labelledby="experience-title">
        <div className="north-star-experience__heading section-shell">
          <p>{homeContent.experience.eyebrow}</p>
          <h2 id="experience-title">{homeContent.experience.headline}</h2>
        </div>
        <div className="north-star-feature-grid section-shell">
          {homeContent.experience.features.map((feature) => (
            <article className="north-star-feature" key={feature.title}>
              <Link className="north-star-feature__image" href={feature.href}>
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
              </Link>
              <div className="north-star-feature__copy">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <TextLink href={feature.href}>Learn more</TextLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="north-star-closing-quote section-shell">
        <span aria-hidden="true">“</span>
        <blockquote>{homeContent.closingQuote.quote}</blockquote>
        <span aria-hidden="true">”</span>
        <SignatureMark
          className="north-star-closing-quote__signature"
          src={homeContent.hero.signatureImage}
          label={homeContent.closingQuote.signature}
        />
      </section>
    </main>
  );
}
