import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCurrentAccount } from "@/lib/auth/current-account";
import { getRoleFilteredSchedule } from "@/lib/auth/schedule-projection";
import { hasAccountRole, isStaff } from "@/payload/access/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Schedule Access",
  robots: { index: false, follow: false, nocache: true },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

export default async function MyScheduleAccessPage() {
  const account = await requireCurrentAccount("/account/my-schedule");
  const participant = hasAccountRole(account, "photographer") || hasAccountRole(account, "model");
  if (!participant && !isStaff(account)) redirect("/account/access-denied");
  const schedule = await getRoleFilteredSchedule(account);

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel account-access-panel--wide">
      <p className="ds-eyebrow">Read-only access verification</p>
      <h1>My Schedule</h1>
      <p>This minimal screen proves that schedule records are filtered by the signed-in account. It does not enable booking changes.</p>
      <div className="account-schedule-list">
        {schedule.length ? schedule.map((item) => <article key={item.id}>
          <span>{item.status}</span>
          <h2>{item.artistName}</h2>
          <p>{item.eventTitle}</p>
          <time>{formatDate(item.startAt)} – {formatDate(item.endAt)}</time>
          {(hasAccountRole(account, "model") || isStaff(account)) && <small>Photographer: {item.photographerName}</small>}
        </article>) : <p className="account-empty-state">No schedule records are connected to this account.</p>}
      </div>
    </section>
  </main>;
}
