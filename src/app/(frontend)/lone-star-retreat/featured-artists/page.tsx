import type { Metadata } from "next";
import { FeaturedArtistsIndex } from "@/components/retreat/FeaturedArtistsIndex";
import { getPublicFeaturedArtists } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured Artists | Lone Star Retreat",
  description: "Meet the approved professional models and creative collaborators connected to Lone Star Retreat.",
  alternates: { canonical: "/lone-star-retreat/featured-artists" },
};

export default async function FeaturedArtistsPage() {
  const artists = await getPublicFeaturedArtists();
  return <main id="main-content" className="retreat-page featured-artists-page"><FeaturedArtistsIndex artists={artists} /></main>;
}
