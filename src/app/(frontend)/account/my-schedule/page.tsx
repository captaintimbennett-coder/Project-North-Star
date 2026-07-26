import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCurrentAccount } from "@/lib/auth/current-account";
import { getPersonalItinerary } from "@/lib/auth/schedule-projection";
import { PersonalScheduleCalendar } from "@/components/retreat/PersonalScheduleCalendar";
import { hasAccountRole } from "@/payload/access/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Retreat Schedule",
  robots: { index: false, follow: false, nocache: true },
};

export default async function MyScheduleAccessPage() {
  const account = await requireCurrentAccount("/account/my-schedule");
  const participant = hasAccountRole(account, "photographer") || hasAccountRole(account, "model");
  if (!participant) redirect("/account/access-denied");
  const schedule = await getPersonalItinerary(account);
  const modelView = hasAccountRole(account, "model") && !hasAccountRole(account, "photographer");

  return <PersonalScheduleCalendar
    accountName={account.name}
    currentTime={new Date().toISOString()}
    participantKind={modelView ? "Featured Artist" : "Photographer"}
    schedule={schedule}
  />;
}
