import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/buttons/ArrowIcon";
import { SignatureMark } from "@/components/layout";
import type { homeContent } from "@/data/home";

type HomeHeroProps = {
  content: typeof homeContent.hero;
};

export function HomeHero({ content }: HomeHeroProps) {
  return (
    <section className="north-star-hero" aria-labelledby="north-star-hero-title">
      <div className="north-star-hero__stage">
        <div
          className="north-star-hero__portrait"
          style={{ "--north-star-hero-image": `url("${content.image}")` } as CSSProperties}
        >
          <Image
            src={content.image}
            alt={content.alt}
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="north-star-hero__compass" aria-hidden="true">
          <CompassMark />
        </div>
        <div className="north-star-hero__content">
          <h1 id="north-star-hero-title">
            <span>{content.headline[0]}</span>
            <strong>{content.headline[1]}</strong>
            <em>{content.headline[2]}</em>
          </h1>
          <div className="north-star-hero__rule" aria-hidden="true"><i /></div>
          <p className="north-star-hero__supporting">
            {content.supporting.map((line) => <span key={line}>{line}</span>)}
          </p>
          <SignatureMark
            className="north-star-hero__signature"
            src={content.signatureImage}
            label={content.signature}
          />
        </div>
      </div>
      <nav className="north-star-paths" aria-label="Explore Project North Star">
        {content.paths.map((path) => (
          <Link className="north-star-path" href={path.href} key={path.title}>
            <PathIcon name={path.icon} />
            <strong>{path.title}</strong>
            <span>{path.description}</span>
            <ArrowIcon />
          </Link>
        ))}
      </nav>
    </section>
  );
}

function CompassMark() {
  return (
    <svg viewBox="0 0 240 240" focusable="false">
      <circle cx="120" cy="120" r="86" />
      <circle cx="120" cy="120" r="58" />
      <path d="M120 8 137 103 232 120 137 137 120 232 103 137 8 120 103 103Z" />
      <path d="m120 42 10 68 68 10-68 10-10 68-10-68-68-10 68-10Z" />
    </svg>
  );
}

function PathIcon({ name }: { name: string }) {
  if (name === "camera") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M5 10h5l2-3h8l2 3h5v16H5Z"/><circle cx="16" cy="18" r="5"/></svg>;
  }
  if (name === "person") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><circle cx="16" cy="10" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>;
  }
  if (name === "education") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 7h8c2.2 0 4 1.8 4 4v16c0-2.2-1.8-4-4-4H4Z"/><path d="M28 7h-8c-2.2 0-4 1.8-4 4v16c0-2.2 1.8-4 4-4h8Z"/></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m16 3 3.6 8.2 8.9.9-6.7 5.9 2 8.7-7.8-4.5-7.8 4.5 2-8.7-6.7-5.9 8.9-.9Z"/></svg>;
}
