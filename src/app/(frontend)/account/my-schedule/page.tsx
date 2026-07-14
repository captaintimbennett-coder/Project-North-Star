import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCurrentAccount } from "@/lib/auth/current-account";
import { getPersonalItinerary } from "@/lib/auth/schedule-projection";
import { hasAccountRole, isStaff } from "@/payload/access/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Retreat Schedule",
  robots: { index: false, follow: false, nocache: true },
};

function formatDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
    timeZone,
  }).format(new Date(value));
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(value));
}

function formatDuration(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hour" : "hours"}`;
}

export default async function MyScheduleAccessPage() {
  const account = await requireCurrentAccount("/account/my-schedule");
  const participant = hasAccountRole(account, "photographer") || hasAccountRole(account, "model");
  if (!participant && !isStaff(account)) redirect("/account/access-denied");
  const schedule = await getPersonalItinerary(account);
  const modelView = hasAccountRole(account, "model") && !hasAccountRole(account, "photographer");

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel account-access-panel--wide">
      <p className="ds-eyebrow">Lone Star Retreat · Personal itinerary</p>
      <h1>{modelView ? "Your protected schedule." : "Your retreat itinerary."}</h1>
      <p>{modelView
        ? "Every confirmed session and administrator change, organized in event-local time."
        : "Your confirmed creative sessions, partner details, and meeting information in one clear place."}</p>
      <div className="account-schedule-list">
        {schedule.length ? schedule.map((item) => <article key={item.id}>
          <span>{item.bookingStatus.replace("-", " ")}{item.administratorChanged ? " · Administrator change" : ""}</span>
          <h2>{item.partnerName}</h2>
          <p>{item.partnerLabel} · {item.eventTitle}</p>
          <time dateTime={item.startAt}>{formatDate(item.startAt, item.eventTimeZone)}<br />{formatTime(item.startAt, item.eventTimeZone)}–{formatTime(item.endAt, item.eventTimeZone)} · {formatDuration(item.durationMinutes)}</time>
          <small>Meet at: {item.eventLocation}</small>
          {item.contactMethods.length ? <div className="account-contact-methods" aria-label={`Approved contact methods for ${item.partnerName}`}>
            {item.contactMethods.map((contact) => contact.href
              ? <a href={contact.href} key={contact.label} rel={contact.label === "Website" || contact.label === "Instagram" ? "noreferrer" : undefined}>{contact.label}: {contact.value}</a>
              : <span key={contact.label}>{contact.label}: {contact.value}</span>)}</div>
            : <small>Partner contact details are shared only for active confirmed bookings when approved.</small>}
        </article>) : <p className="account-empty-state">No schedule records are connected to this account.</p>}
      </div>
    </section>
  </main>;
}
