import { redirect } from "next/navigation";
import { currentRetreatEdition } from "@/data/retreat-editions";

export default function LegacyFeaturedArtistsPage() {
  redirect(currentRetreatEdition.artistsPath);
}
