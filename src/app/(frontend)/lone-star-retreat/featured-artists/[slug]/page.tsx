import { redirect } from "next/navigation";
import { currentRetreatEdition } from "@/data/retreat-editions";

type LegacyArtistPageProps = { params: Promise<{ slug: string }> };

export default async function LegacyFeaturedArtistPage({ params }: LegacyArtistPageProps) {
  const { slug } = await params;
  redirect(`${currentRetreatEdition.artistsPath}/${slug}`);
}
