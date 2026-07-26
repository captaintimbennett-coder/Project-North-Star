import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SharedRetreatSchedule } from "@/components/retreat/SharedRetreatSchedule";
import { requireCurrentAccount } from "@/lib/auth/current-account";
import {
  canViewSharedRetreatSchedule,
  getSharedRetreatScheduleEvents,
} from "@/lib/auth/schedule-projection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Retreat Schedule",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SharedRetreatSchedulePage() {
  const account = await requireCurrentAccount("/account/retreat-schedule");
  if (!canViewSharedRetreatSchedule(account)) redirect("/account/access-denied");

  const events = await getSharedRetreatScheduleEvents(account);
  return <SharedRetreatSchedule events={events} />;
}
