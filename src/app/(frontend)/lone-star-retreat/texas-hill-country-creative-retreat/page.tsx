import { redirect } from "next/navigation";
import { currentRetreatEdition } from "@/data/retreat-editions";

export default function LegacyTexasHillCountryRetreatPage() {
  redirect(currentRetreatEdition.publicPath);
}
