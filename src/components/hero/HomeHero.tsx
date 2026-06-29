import Image from "next/image";
import { ActionLink } from "@/components/buttons/Action";
import type { homeContent } from "@/data/home";

type HomeHeroProps = {
  content: typeof homeContent.hero;
};

export function HomeHero({ content }: HomeHeroProps) {
  return (
    <section className="hero">
      <Image
        className="hero-image"
        src={content.image}
        alt={content.alt}
        fill
        priority
        sizes="100vw"
      />
      <div className="hero-shade" />
      <div className="hero-content">
        <h1>{content.name}</h1>
        <p className="hero-roles">{content.roles}</p>
        <p className="hero-brand-statement">
          {content.statement.map((line) => <span key={line}>{line}</span>)}
        </p>
        <p className="hero-intro">{content.introduction}</p>
        <ActionLink href={content.action.href} variant="light">
          {content.action.label}
        </ActionLink>
      </div>
      <p className="hero-index" aria-hidden="true">01 / 03</p>
      <div className="scroll-cue" aria-hidden="true">
        <span>Explore</span><i />
      </div>
    </section>
  );
}
