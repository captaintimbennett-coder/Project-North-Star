import { redirect } from "next/navigation";

type LegacyArtistPageProps = { params: Promise<{ slug: string }> };

export default async function LegacyFeaturedArtistPage({ params }: LegacyArtistPageProps) {
  const { slug } = await params;
  redirect(`/lone-star-retreat/texas-hill-country-creative-retreat/artists/${slug}`);
}
