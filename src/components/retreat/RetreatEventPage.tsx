import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/buttons";
import { Container } from "@/components/layout";
import { images } from "@/data/assets";
import type { PublicRetreatEvent } from "@/lib/featured-artists";

export function RetreatEventPage({ event }: { event: PublicRetreatEvent }) {
  const basePath = `/lone-star-retreat/${event.slug}`;
  return <>
    <section className="event-detail-hero">
      <Image src={images.retreat.texasHillCountryHero} alt="Retreat landscape at sunset" fill priority sizes="100vw" />
      <div className="event-detail-hero__shade" />
      <Container className="event-detail-hero__content">
        <p className="ds-eyebrow">A Lone Star Retreat experience</p>
        <h1>{event.title}</h1>
        <span className="retreat-rule" aria-hidden="true" />
        <div><p>{event.dateLabel}</p><p>{event.location}</p></div>
      </Container>
    </section>

    <section className="event-detail-overview">
      <Container>
        <div><p className="ds-eyebrow">The Retreat</p><h2>A destination for purposeful creative work.</h2></div>
        <div><p>{event.summary}</p><dl><div><dt>Date</dt><dd>{event.dateLabel}</dd></div><div><dt>Location</dt><dd>{event.location}</dd></div><div><dt>Access</dt><dd>{event.registrationStatus === "applications-open" ? "Applications open" : "By application · Details forthcoming"}</dd></div></dl></div>
      </Container>
    </section>

    <section className="retreat-artists event-detail-artists">
      <Container>
        <div className="retreat-section-heading"><div><p className="ds-eyebrow">Participating Artists</p><h2>Creative voices for this edition.</h2></div><p>Every artist shown here is specifically approved to participate in {event.title}.</p></div>
        {event.artists.length > 0 ? <div className="retreat-artists__grid">{event.artists.slice(0, 3).map((artist) => <Link className="retreat-artist-preview" href={`${basePath}/artists/${artist.slug}`} key={artist.slug}><div className="retreat-artist-preview__image"><Image src={artist.featuredImage.src} alt={artist.featuredImage.alt} fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized /></div><p>{artist.displayName}</p><span>{artist.location || artist.categories.slice(0, 3).join(" · ") || "Participating Artist"}</span></Link>)}</div> : <div className="event-detail-artists__empty"><p>Participating artists will be announced as event approvals are completed.</p></div>}
        <div className="retreat-artists__action"><Link href={`${basePath}/artists`}><span>Explore All Participating Artists</span><ArrowIcon /></Link></div>
      </Container>
    </section>

    <section className="event-detail-planning"><Container><div className="event-detail-planning__heading"><p className="ds-eyebrow">The Experience</p><h2>Thoughtfully planned. Intentionally paced.</h2></div><div className="event-detail-planning__grid"><article><span>01</span><h3>Schedule</h3><p>The Founders Edition runs May 14–16, 2027. Creative sessions, shared meals, and daily pacing will be published as planning is finalized.</p></article><article><span>02</span><h3>Travel & Logistics</h3><p>Participating featured models should plan for an evening arrival on May 13. Venue guidance, nearby lodging, airports, and packing information are forthcoming.</p></article><article><span>03</span><h3>Professional Standards</h3><p>Every participant is expected to uphold the Lone Star Retreat Professional Standards &amp; Code of Conduct.</p></article></div></Container></section>

    <section className="event-detail-pathways"><Container><p className="ds-eyebrow">Join the Founders Edition</p><h2>Choose your application path.</h2><div><Link href="/lone-star-retreat/photographers/apply"><span>For Photographers</span><strong>Apply as Photographer <ArrowIcon /></strong></Link><Link href="/lone-star-retreat/models/apply"><span>For Models</span><strong>Apply as Featured Model <ArrowIcon /></strong></Link></div></Container></section>

    <section className="event-detail-policies"><Container><div><p className="ds-eyebrow">FAQ & Policies</p><h2>Clear expectations create better experiences.</h2></div><div><article><h3>When is the retreat?</h3><p>The Founders Edition takes place May 14–16, 2027. The current planning assumption is that participating featured models will arrive during the evening of May 13.</p></article><article><h3>Does applying guarantee access?</h3><p>No. Photographer and featured model participation is reviewed to protect the quality, professionalism, and safety of the retreat.</p></article><article><h3>Where can I read the standards?</h3><p>The Professional Standards &amp; Code of Conduct is presented during both application flows and applies to every participant.</p></article></div></Container></section>
  </>;
}
