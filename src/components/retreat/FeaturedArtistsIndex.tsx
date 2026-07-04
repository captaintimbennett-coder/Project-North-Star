import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout";
import { images } from "@/data/assets";
import type { PublicFeaturedArtist } from "@/lib/featured-artists";

export function FeaturedArtistsIndex({ artists }: { artists: PublicFeaturedArtist[] }) {
  return <>
    <section className="artists-index-hero">
      <Image src={images.retreat.texasHillCountryHero} alt="Texas Hill Country at sunset" fill priority sizes="100vw" />
      <div className="artists-index-hero__shade" />
      <Container className="artists-index-hero__content">
        <p className="ds-eyebrow">Lone Star Retreat · Featured Artists</p>
        <h1>Artists with a point of view.</h1>
        <span className="retreat-rule" aria-hidden="true" />
        <p>Meet the professional models whose presence, experience, and creative voice help define every Lone Star Retreat.</p>
      </Container>
    </section>

    <section className="artists-index-introduction">
      <Container>
        <div><p className="ds-eyebrow">Meet the Artists</p><h2>More than a roster.<br />A creative community.</h2></div>
        <p>Every Featured Artist is selected for professionalism, character, communication, and the perspective they bring to the work. Explore the artists currently approved for public presentation.</p>
      </Container>
    </section>

    <section className="artists-index-listing" aria-labelledby="artist-list-title">
      <Container>
        <div className="artists-index-listing__heading"><p className="ds-eyebrow">The current lineup</p><h2 id="artist-list-title">Featured Artists</h2><p>{artists.length ? `${artists.length} approved ${artists.length === 1 ? "artist" : "artists"}` : "Roster forthcoming"}</p></div>
        {artists.length ? <div className="artists-grid">{artists.map((artist) => <Link className="artist-card" href={`/lone-star-retreat/featured-artists/${artist.slug}`} key={artist.slug}>
          <div className="artist-card__image"><Image src={artist.featuredImage.src} alt={artist.featuredImage.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" /></div>
          <div className="artist-card__content"><div><p>{artist.location || "Lone Star Retreat"}</p><h3>{artist.displayName}</h3>{artist.categories.length > 0 && <p>{artist.categories.slice(0, 3).join(" · ")}</p>}</div><span>View Artist <b aria-hidden="true">→</b></span></div>
        </Link>)}</div> : <div className="artists-empty-state"><Image src={images.brand.northStarSymbol} alt="" width={58} height={62} /><p className="ds-eyebrow">The roster is being curated</p><h3>Featured Artists will appear here once approved.</h3><p>Every profile is reviewed carefully before publication. Please return soon to meet the artists joining the next Lone Star Retreat.</p><Link className="ds-button ds-button--outline" href="/lone-star-retreat">Return to Lone Star Retreat <span aria-hidden="true">→</span></Link></div>}
      </Container>
    </section>
  </>;
}
