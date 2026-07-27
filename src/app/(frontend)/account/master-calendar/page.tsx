import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdministratorMasterCalendar } from "@/components/retreat/AdministratorMasterCalendar";
import {
  canCancelAdministratorMasterCalendarBookings,
  canRescheduleAdministratorMasterCalendarBookings,
  canViewAdministratorMasterCalendar,
  getAdministratorMasterCalendarEvents,
} from "@/lib/auth/administrator-master-calendar-projection";
import { requireCurrentAccount } from "@/lib/auth/current-account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrator Master Calendar",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdministratorMasterCalendarPage() {
  const account = await requireCurrentAccount("/account/master-calendar");
  if (!canViewAdministratorMasterCalendar(account)) {
    redirect("/account/access-denied");
  }

  const events = await getAdministratorMasterCalendarEvents(account);
  return <AdministratorMasterCalendar
    canCancelBookings={canCancelAdministratorMasterCalendarBookings(account)}
    canRescheduleBookings={
      canRescheduleAdministratorMasterCalendarBookings(account)
    }
    events={events}
  />;
}
