import type { Metadata } from "next";
import Link from "next/link";
import { PhotographerBookingForm } from "@/components/retreat/PhotographerBookingForm";
import { requireAccountRole } from "@/lib/auth/current-account";
import { getPhotographerBookingOptions } from "@/lib/scheduling/booking-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule a Retreat Shoot", robots: { index: false, follow: false, nocache: true } };

export default async function PhotographerBookingPage() {
  const account = await requireAccountRole("photographer", "/account/book");
  const options = await getPhotographerBookingOptions(account);
  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel account-access-panel--wide">
      <p className="ds-eyebrow">Lone Star Retreat · Schedule a shoot</p>
      <h1>Shape your retreat.</h1>
      <p>Choose one continuous creative window. Valid reservations confirm immediately and become protected on both schedules.</p>
      <PhotographerBookingForm options={options} />
      <Link className="account-secondary-link" href="/account/my-schedule">Return to My Retreat Schedule</Link>
    </section>
  </main>;
}
