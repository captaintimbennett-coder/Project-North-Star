import { redirect } from "next/navigation";
import { currentRetreatEdition } from "@/data/retreat-editions";

type PageProps = { params: Promise<{ slug: string }> };

export default async function LegacyTexasHillCountryArtistPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`${currentRetreatEdition.artistsPath}/${slug}`);
}
