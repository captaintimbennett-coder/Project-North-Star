import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout";
import { ModelApplicationForm } from "@/components/retreat";
import { modelApplicationContent as content } from "@/data/applications";
import { images } from "@/data/assets";

export const metadata: Metadata = {
  title: "Featured Model Application | Lone Star Retreat",
  description: content.hero.introduction,
  alternates: { canonical: "/lone-star-retreat/models/apply" },
  robots: { index: false, follow: true },
};

export default function ModelApplicationPage() {
  return <main id="main-content" className="retreat-page application-page application-page--model">
    <section className="application-hero">
      <Image className="application-hero__image" src={images.portfolio.redEditorial} alt="Featured model in a warm cinematic portrait" fill priority sizes="100vw" />
      <div className="application-hero__shade" />
      <Container className="application-hero__content"><p className="ds-eyebrow">{content.hero.eyebrow}</p><h1>{content.hero.title}</h1><span className="retreat-rule" aria-hidden="true" /><p>{content.hero.introduction}</p></Container>
    </section>
    <section className="application-introduction"><Container><div><p className="ds-eyebrow">{content.introduction.eyebrow}</p><h2>{content.introduction.title}</h2></div><div><p>{content.introduction.body}</p><p>{content.introduction.note}</p></div></Container></section>
    <Container className="application-layout">
      <aside className="application-progress" aria-label="Application sections"><p className="ds-eyebrow">Your application</p><ol>{content.sections.map(s => <li key={s.number}><span>{s.number}</span>{s.title}</li>)}</ol><p>One application · Five sections</p></aside>
      <ModelApplicationForm />
    </Container>
  </main>;
}
