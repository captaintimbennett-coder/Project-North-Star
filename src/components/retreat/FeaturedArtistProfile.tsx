import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout";
import type { PublicFeaturedArtist, PublicRetreatEvent } from "@/lib/featured-artists";

export function FeaturedArtistProfile({ artist, event }: { artist: PublicFeaturedArtist; event: PublicRetreatEvent }) {
  const basePath = `/lone-star-retreat/${event.slug}`;
  return <>
    <section className="artist-profile-hero">
      <Image src={artist.featuredImage.src} alt={artist.featuredImage.alt} fill priority sizes="100vw" unoptimized />
      <div className="artist-profile-hero__shade" />
      <Container className="artist-profile-hero__content">
        <p className="ds-eyebrow">{event.title} · Participating Artist</p>
        <h1>{artist.displayName}</h1>
        <span className="retreat-rule" aria-hidden="true" />
        {artist.location && <p>{artist.location}</p>}
      </Container>
    </section>

    <section className="artist-profile-story">
      <Container>
        <aside><p className="ds-eyebrow">The Artist</p>{artist.categories.length > 0 && <ul>{artist.categories.map((category) => <li key={category}>{category}</li>)}</ul>}</aside>
        <div className="artist-profile-story__copy">
          <h2>{artist.introduction || `Meet ${artist.displayName}.`}</h2>
          {artist.biography && <p>{artist.biography}</p>}
          {artist.artistStatement && <blockquote><span aria-hidden="true">“</span>{artist.artistStatement}</blockquote>}
          {(artist.instagram || artist.website) && <nav aria-label={`${artist.displayName} links`}>{artist.instagram && <a href={artist.instagram} target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>}{artist.website && <a href={artist.website} target="_blank" rel="noreferrer">Website <span aria-hidden="true">↗</span></a>}</nav>}
        </div>
      </Container>
    </section>

    {artist.portfolioImages.length > 0 && <section className="artist-profile-gallery" aria-labelledby="artist-gallery-title"><Container><div className="artist-profile-gallery__heading"><p className="ds-eyebrow">Selected Work</p><h2 id="artist-gallery-title">The portfolio</h2></div><div className="artist-profile-gallery__grid">{artist.portfolioImages.map((image, index) => <figure key={`${image.src}-${index}`}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /></figure>)}</div></Container></section>}

    <section className="artist-profile-appearances"><Container><p className="ds-eyebrow">Participating in</p><h2>{event.title}</h2><p>{event.dateLabel} · {event.location}</p></Container></section>

    <section className="artist-profile-cta"><Container><p className="ds-eyebrow">Create together</p><h2>Discover the artists shaping this retreat.</h2><div><Link className="ds-button ds-button--outline" href={`${basePath}/artists`}>Back to Participating Artists <span aria-hidden="true">←</span></Link><Link className="ds-button ds-button--primary" href="/lone-star-retreat/photographers/apply">Apply as Photographer <span aria-hidden="true">→</span></Link></div></Container></section>
  </>;
}
