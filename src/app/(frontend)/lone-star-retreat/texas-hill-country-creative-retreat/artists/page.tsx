import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedArtistsIndex } from "@/components/retreat/FeaturedArtistsIndex";
import { getPublicRetreatEvent } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";
const eventSlug = "texas-hill-country-creative-retreat";

export const metadata: Metadata = {
  title: "Participating Artists | Texas Hill Country Creative Retreat",
  description: "Meet the approved participating artists for the May 2027 Texas Hill Country Creative Retreat.",
  alternates: { canonical: `/lone-star-retreat/${eventSlug}/artists` },
};

export default async function EventArtistsPage() {
  const event = await getPublicRetreatEvent(eventSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page featured-artists-page"><FeaturedArtistsIndex event={event} /></main>;
}
