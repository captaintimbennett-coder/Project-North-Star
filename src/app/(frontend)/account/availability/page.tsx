import type { Metadata } from "next";
import Link from "next/link";
import { ModelAvailabilityForm } from "@/components/retreat/ModelAvailabilityForm";
import { requireAccountRole } from "@/lib/auth/current-account";
import { getModelAvailabilityDays } from "@/lib/scheduling/availability-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Retreat Availability", robots: { index: false, follow: false, nocache: true } };

export default async function ModelAvailabilityPage() {
  const account = await requireAccountRole("model", "/account/availability");
  const days = await getModelAvailabilityDays(account);
  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel account-access-panel--wide">
      <p className="ds-eyebrow">Lone Star Retreat · Protected availability</p>
      <h1>Set your creative rhythm.</h1>
      <p>Shape each retreat day around the hours you can be booked. Existing confirmed sessions cannot be hidden or blocked.</p>
      <ModelAvailabilityForm days={days} />
      <Link className="account-secondary-link" href="/account/my-schedule">Open My Protected Schedule</Link>
    </section>
  </main>;
}
