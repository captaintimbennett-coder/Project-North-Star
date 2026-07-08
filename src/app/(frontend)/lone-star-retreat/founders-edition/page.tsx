import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RetreatEventPage } from "@/components/retreat/RetreatEventPage";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { getPublicRetreatEvent } from "@/lib/featured-artists";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lone Star Retreat — Founders Edition | May 2027",
  description: "Explore the Founders Edition of Lone Star Retreat, May 14–16, 2027.",
  alternates: { canonical: currentRetreatEdition.publicPath },
};

export default async function FoundersEditionPage() {
  const event = await getPublicRetreatEvent(currentRetreatEdition.publicSlug);
  if (!event) notFound();
  return <main id="main-content" className="retreat-page retreat-event-page"><RetreatEventPage event={event} /></main>;
}
