import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistsIndex } from "@/components/retreat/FeaturedArtistsIndex";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { getPublicRetreatEvent } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Participating Artists | Lone Star Retreat — Founders Edition",
  description: "Meet the approved participating artists for the May 2027 Lone Star Retreat Founders Edition.",
  alternates: { canonical: currentRetreatEdition.artistsPath },
};

export default async function FoundersEditionArtistsPage() {
  const event = await getPublicRetreatEvent(currentRetreatEdition.publicSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page featured-artists-page"><FeaturedArtistsIndex event={event} /></main>;
}
