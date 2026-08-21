import Link from "next/link";
import type { homeContent } from "@/data/home";

type HomeHeroProps = {
  content: typeof homeContent.hero;
};

export function HomeHero({ content }: HomeHeroProps) {
  return (
    <section className="north-star-hero" aria-labelledby="north-star-hero-title">
      <div className="north-star-hero__stage">
        <div className="north-star-hero__geometry" aria-hidden="true">
          <CoordinateMark />
        </div>
        <div className="north-star-hero__content">
          <h1 id="north-star-hero-title">
            <span>{content.headline[0]}</span>
            <strong>{content.headline[1]}</strong>
          </h1>
          <div className="north-star-hero__rule" aria-hidden="true"><i /></div>
          <p className="north-star-hero__supporting">
            {content.supporting.map((line) => <span key={line}>{line}</span>)}
          </p>
        </div>
      </div>
      <nav className="north-star-paths" aria-labelledby="north-star-paths-label">
        <p className="north-star-paths__label" id="north-star-paths-label">
          <span>Explore Project North Star</span>
        </p>
        <div className="north-star-paths__links">
          {content.paths.map((path) => (
            <Link className="north-star-path" href={path.href} key={path.title}>
              {path.title}
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}

function CoordinateMark() {
  return (
    <svg viewBox="0 0 600 600" focusable="false">
      <circle className="north-star-coordinate__outer" cx="300" cy="300" r="246" />
      <circle cx="300" cy="300" r="194" />
      <circle cx="300" cy="300" r="136" />
      <path d="M300 0V600M0 300H600" />
    </svg>
  );
}
