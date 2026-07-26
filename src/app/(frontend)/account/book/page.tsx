import type { Metadata } from "next";
import { PhotographerBookingForm } from "@/components/retreat/PhotographerBookingForm";
import { requireAccountRole } from "@/lib/auth/current-account";
import { getPhotographerBookingOptions } from "@/lib/scheduling/booking-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule a Retreat Shoot", robots: { index: false, follow: false, nocache: true } };

export default async function PhotographerBookingPage() {
  const account = await requireAccountRole("photographer", "/account/book");
  const options = await getPhotographerBookingOptions(account);
  return <PhotographerBookingForm
    accountName={account.name}
    options={options}
  />;
}
