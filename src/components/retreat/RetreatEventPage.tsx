/* eslint-disable @next/next/no-img-element -- Approved Payload media should load directly from its stored CMS URL. */
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/buttons";
import { Container } from "@/components/layout";
import { foundersEditionLandingContent as content } from "@/data/experiences";
import { images } from "@/data/assets";
import type { PublicRetreatEvent } from "@/lib/featured-artists";
import { ProfessionalStandardsContent } from "./ProfessionalStandardsDisclosure";

const featuredArtistApplication = "/lone-star-retreat/models/apply";
const photographerApplication = "/lone-star-retreat/photographers/apply";

export function RetreatEventPage({ event }: { event: PublicRetreatEvent }) {
  const basePath = `/lone-star-retreat/${event.slug}`;

  return (
    <>
      <section className="event-detail-hero" id="event-overview">
        <Image
          src={images.retreat.texasHillCountryHero}
          alt="A private retreat setting at sunset"
          fill
          priority
          sizes="100vw"
        />
        <div className="event-detail-hero__shade" />
        <Container className="event-detail-hero__content">
          <div className="event-detail-hero__message">
            <div className="event-detail-hero__identity" aria-label="Lone Star Retreat">
              <Image
                src={images.brand.loneStarRetreatLogo}
                alt="Lone Star Retreat — Texas. Light. Art."
                width={200}
                height={200}
                priority
              />
            </div>
            <p className="ds-eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.titleLines.map((line) => <span key={line}>{line}</span>)}</h1>
            <span className="retreat-rule" aria-hidden="true" />
            <p className="event-detail-hero__supporting">{content.hero.supportingLines.map((line) => <span key={line}>{line}</span>)}</p>
            <Link className="event-detail-hero__mobile-apply" href={featuredArtistApplication}>
              Apply as Featured Artist <ArrowIcon />
            </Link>
          </div>

          <aside className="event-apply-card" aria-label="Founders Edition applications">
            <dl>
              <div><dt>Date</dt><dd>{content.hero.date}</dd></div>
              <div><dt>Venue</dt><dd>{content.hero.venue}<br />{content.hero.location}</dd></div>
            </dl>
            <Link className="event-apply-card__primary" href={featuredArtistApplication}>
              Apply as Featured Artist <ArrowIcon />
            </Link>
            <Link className="event-apply-card__secondary" href={photographerApplication}>
              Photographer application <ArrowIcon />
            </Link>
            <p>{content.hero.reviewNote}</p>
          </aside>
        </Container>
      </section>

      <section className="event-welcome" id="founder">
        <Container>
          <div className="event-welcome__founder">
            <Image src={images.people.loneStarRetreatFounder} alt="Tim Bennett, founder of Lone Star Retreat" width={220} height={220} />
            <div>
              <p className="ds-eyebrow">{content.founder.eyebrow}</p>
              <h2>{content.founder.title}</h2>
              {content.founder.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <Image className="event-welcome__signature" src={images.brand.signature} alt="Tim Bennett" width={132} height={54} />
            </div>
          </div>
          <div className="event-values" aria-label="Lone Star Retreat values">
            {content.founder.values.map((value) => (
              <article key={value.title}>
                <EventIcon name={value.icon} />
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="event-experience" id="experience">
        <Container>
          <header>
            <p className="ds-eyebrow">{content.experience.eyebrow}</p>
            <h2>{content.experience.title}</h2>
          </header>
          <div className="event-experience__grid">
            {content.experience.items.map((item) => (
              <article key={item.title}>
                <EventIcon name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="event-application" id="application">
        <Container>
          <header>
            <p className="ds-eyebrow">{content.application.eyebrow}</p>
            <h2>{content.application.title}</h2>
            <p>{content.application.introduction}</p>
          </header>
          <ol>
            {content.application.steps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="event-application__action">
            <Link className="event-application__button" href={featuredArtistApplication}>Preview the Application <ArrowIcon /></Link>
            <p>{content.application.privacy}</p>
          </div>
        </Container>
      </section>

      <section className="event-artists" id="artists">
        <Container>
          <div className="event-artists__heading">
            <h2>Featured Artists Attending</h2>
          </div>
          {event.artists.length > 0 ? (
            <div className="event-artists__composition">
              <div className="event-artists__strip">
                {event.artists.slice(0, 5).map((artist) => (
                  <Link href={`${basePath}/artists/${artist.slug}`} key={artist.slug}>
                    <span><img src={artist.cardImage.src} alt={artist.cardImage.alt} /></span>
                    <strong>{artist.displayName}</strong>
                  </Link>
                ))}
              </div>
              <aside className="event-artists__invitation">
                <p>Meet the artists helping shape the Founders Edition.</p>
                <Link className="event-artists__link" href={`${basePath}/artists`}>View Full Artist Lineup <ArrowIcon /></Link>
              </aside>
            </div>
          ) : (
            <p className="event-artists__empty">The Founders Edition community is being selected with care.</p>
          )}
          <div className="event-details" id="details">
            {content.essentials.map((item) => (
              <article key={item.title}>
                <EventIcon name={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
            <article>
              <EventIcon name="shield" />
              <h3>Code of Conduct</h3>
              <p>Our shared standards create a safe, respectful environment for everyone.</p>
            </article>
          </div>
          <details className="event-conduct__disclosure">
            <summary><span>Read the complete Professional Standards &amp; Code of Conduct</span><span aria-hidden="true">+</span></summary>
            <div className="professional-standards-disclosure__content"><ProfessionalStandardsContent /></div>
          </details>
        </Container>
      </section>

      <section className="event-closing">
        <Container>
          <h2>{content.closing.title}</h2>
          <Link className="event-closing__button" href="/lone-star-retreat#retreat-paths">Apply</Link>
          <p>{content.closing.body}</p>
        </Container>
      </section>
    </>
  );
}

type EventIconName = "people" | "star" | "shield" | "handshake" | "camera" | "compass" | "payment" | "travel" | "home" | "lock";

function EventIcon({ name }: { name: EventIconName }) {
  const paths: Record<EventIconName, React.ReactNode> = {
    people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="8" r="3" /><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M15 13h1a5 5 0 0 1 5 5v2" /></>,
    star: <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17.2 5.7 20.5 7 13.7 2 8.9 9 8z" />,
    shield: <><path d="M12 2 4.5 5v6c0 5 3 8.5 7.5 11 4.5-2.5 7.5-6 7.5-11V5z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    handshake: <><path d="m8 12 3-3a2 2 0 0 1 3 0l2 2M3 8l5-4 3 3M21 8l-5-4-2 2" /><path d="m5 10 6 7a2 2 0 0 0 3 0l5-6M8 14l-2 2M11 17l-2 2" /></>,
    camera: <><path d="M3 7h4l2-3h6l2 3h4v13H3z" /><circle cx="12" cy="13" r="4" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
    payment: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.8-.7-1.8-1-3-1-1.7 0-3 1-3 2.3 0 3.5 6 1.7 6 5.2 0 1.4-1.3 2.5-3.2 2.5-1.2 0-2.4-.4-3.3-1.2M12 5.5v13" /></>,
    travel: <><path d="m3 14 8-3 3-8 2 1-1 7 5 3-1 2-6-1-3 5-2-1 1-6-6 3z" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  };

  return <svg className="event-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
