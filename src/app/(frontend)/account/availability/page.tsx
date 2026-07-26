import type { Metadata } from "next";
import { ModelAvailabilityForm } from "@/components/retreat/ModelAvailabilityForm";
import { requireAccountRole } from "@/lib/auth/current-account";
import { getModelAvailabilityDays } from "@/lib/scheduling/availability-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Retreat Availability", robots: { index: false, follow: false, nocache: true } };

export default async function ModelAvailabilityPage() {
  const account = await requireAccountRole("model", "/account/availability");
  const days = await getModelAvailabilityDays(account);
  return <ModelAvailabilityForm accountName={account.name} days={days} />;
}
