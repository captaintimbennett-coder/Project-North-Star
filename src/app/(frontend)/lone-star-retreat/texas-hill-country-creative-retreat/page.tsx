import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RetreatEventPage } from "@/components/retreat/RetreatEventPage";
import { getPublicRetreatEvent } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";
const eventSlug = "texas-hill-country-creative-retreat";

export const metadata: Metadata = {
  title: "Texas Hill Country Creative Retreat | May 2027",
  description: "Explore the May 2027 Lone Star Retreat in the Texas Hill Country.",
  alternates: { canonical: `/lone-star-retreat/${eventSlug}` },
};

export default async function TexasHillCountryRetreatPage() {
  const event = await getPublicRetreatEvent(eventSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page retreat-event-page"><RetreatEventPage event={event} /></main>;
}
