"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PersonalItineraryItem } from "@/lib/auth/schedule-projection";
import {
  buildPersonalScheduleDays,
  formatScheduleDuration,
  formatScheduleHour,
  formatScheduleRange,
  scheduleHour,
} from "@/lib/scheduling/personal-calendar";
import styles from "./PersonalScheduleCalendar.module.css";

type PersonalScheduleCalendarProps = {
  accountName: string;
  currentTime: string;
  participantKind: "Featured Artist" | "Photographer";
  schedule: PersonalItineraryItem[];
};

const agendaHours = Array.from({ length: 15 }, (_, index) => index + 6);

const statusLabels: Record<PersonalItineraryItem["bookingStatus"], string> = {
  "admin-review": "Administrator review",
  cancelled: "Cancelled",
  confirmed: "Confirmed · Protected",
  rescheduled: "Rescheduled",
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function ScheduleContactMethods({ item }: { item: PersonalItineraryItem }) {
  if (!item.contactMethods.length) {
    return <small className={styles.contactNote}>Contact details are shared only for active confirmed bookings when approved.</small>;
  }

  return <div className={styles.contacts} aria-label={`Approved contact methods for ${item.partnerName}`}>
    {item.contactMethods.map((contact) => contact.href
      ? <a href={contact.href} key={contact.label} rel={contact.label === "Website" || contact.label === "Instagram" ? "noreferrer" : undefined}>{contact.label}: {contact.value}</a>
      : <span key={contact.label}>{contact.label}: {contact.value}</span>)}
  </div>;
}

export function PersonalScheduleCalendar({
  accountName,
  currentTime,
  participantKind,
  schedule,
}: PersonalScheduleCalendarProps) {
  const days = useMemo(() => buildPersonalScheduleDays(schedule), [schedule]);
  const [selectedDayID, setSelectedDayID] = useState(days[0]?.id ?? "");
  const selectedDay = days.find((day) => day.id === selectedDayID) ?? days[0];

  if (!selectedDay) {
    return <main className={styles.schedule} id="main-content">
      <section className={styles.empty}>
        <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={52} height={56} />
        <p className="ds-eyebrow">Lone Star Retreat · Private schedule</p>
        <h1>Your schedule is ready for what comes next.</h1>
        <p>No confirmed sessions are connected to this account yet. When a reservation is confirmed, it will appear here in event-local time.</p>
        <small>{participantKind} view · Read only</small>
      </section>
    </main>;
  }

  const activeItems = selectedDay.items.filter((item) =>
    item.bookingStatus === "confirmed" || item.bookingStatus === "admin-review");
  const scheduleUpdates = selectedDay.items.filter((item) =>
    item.bookingStatus === "cancelled" || item.bookingStatus === "rescheduled");
  const now = new Date(currentTime).getTime();
  const nextSession = activeItems.find((item) => new Date(item.endAt).getTime() > now)
    ?? activeItems.at(-1);
  const sessionPhase = nextSession
    ? new Date(nextSession.endAt).getTime() <= now
      ? "past"
      : new Date(nextSession.startAt).getTime() <= now
        ? "current"
        : "next"
    : null;
  const totalMinutes = activeItems.reduce((total, item) => total + item.durationMinutes, 0);

  return <main className={styles.schedule} id="main-content">
    <section className={styles.hero}>
      <div className={styles.heroImage}>
        <Image
          src="/images/lone-star-retreat/texas-hill-country-hero-v1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <span />
      </div>
      <div className={styles.heroContent}>
        <p className="ds-eyebrow">{selectedDay.eventTitle}</p>
        <h1>A day shaped<br />with <em>intention.</em></h1>
        <p>{selectedDay.dateLabel} · {selectedDay.eventTimeZone}</p>
      </div>
    </section>

    <div className={styles.shell}>
      <header className={styles.privateHeader}>
        <div>
          <span>My Schedule</span>
          <strong>{participantKind} · Read only</strong>
        </div>
        <p>Your private bookings only</p>
      </header>

      <div className={styles.context}>
        <div className={styles.days} aria-label="Retreat day">
          {days.map((day) => <button
            aria-pressed={selectedDay.id === day.id}
            key={day.id}
            onClick={() => setSelectedDayID(day.id)}
            type="button"
          >
            <span>{day.shortLabel}</span>
            <strong>{day.dateLabel}</strong>
          </button>)}
        </div>
      </div>

      <section className={styles.view} aria-labelledby="my-schedule-title">
        <div className={styles.personalIntro}>
          <p className="ds-eyebrow">{selectedDay.shortLabel} · Your retreat itinerary</p>
          <h2 id="my-schedule-title">Welcome back, {firstName(accountName)}.</h2>
          <p>Everything connected to this day, quietly in one place.</p>
        </div>

        {nextSession
          ? <div className={styles.nextSession}>
              <div>
                <span>{sessionPhase === "current" ? "Your current creative session" : sessionPhase === "past" ? "Your most recent creative session" : "Your next creative session"}</span>
                <h3>{sessionPhase === "past" ? "You created with" : "You’re creating with"}<br /><em>{nextSession.partnerName}.</em></h3>
                <p>{formatScheduleRange(nextSession)} · {statusLabels[nextSession.bookingStatus]}</p>
              </div>
              <aside>
                <span>Session length</span>
                <strong>{nextSession.durationMinutes / 60}</strong>
                <small>{nextSession.durationMinutes === 60 ? "hour" : "hours"}</small>
              </aside>
            </div>
          : <div className={styles.dayEmpty}>
              <span>Your selected day</span>
              <h3>No active creative sessions.</h3>
              <p>Schedule updates remain visible below for your records.</p>
            </div>}

        <div className={styles.daySummary} aria-label="Your day summary">
          <p><strong>{activeItems.length}</strong><span>Active sessions</span></p>
          <p><strong>{formatScheduleDuration(totalMinutes)}</strong><span>Creative time</span></p>
          <p><strong>{scheduleUpdates.length}</strong><span>Schedule updates</span></p>
        </div>

        <div className={styles.agenda}>
          <div className={styles.agendaLine} aria-hidden="true" />
          {agendaHours.map((hour) => {
            const booking = activeItems.find((item) => scheduleHour(item.startAt, item.eventTimeZone) === hour);
            const insideBooking = activeItems.some((item) => {
              const start = scheduleHour(item.startAt, item.eventTimeZone);
              const end = scheduleHour(item.endAt, item.eventTimeZone);
              return hour > start && hour < end;
            });
            if (insideBooking) return null;

            return <div
              className={styles.agendaRow}
              key={hour}
              style={booking ? { minHeight: `${Math.max(92, booking.durationMinutes / 60 * 92)}px` } : undefined}
            >
              <time>{formatScheduleHour(hour)}</time>
              {booking
                ? <article className={`${styles.bookingCard} ${booking.bookingStatus === "admin-review" ? styles.bookingReview : ""}`}>
                    <span>Your creative session</span>
                    <h3>Creating with {booking.partnerName}</h3>
                    <p>{formatScheduleRange(booking)} · {booking.eventLocation}</p>
                    <i>{statusLabels[booking.bookingStatus]}{booking.administratorChanged ? " · Administrator change" : ""}</i>
                    <ScheduleContactMethods item={booking} />
                  </article>
                : <p className={styles.openTime}>Open in your itinerary</p>}
            </div>;
          })}
        </div>

        {scheduleUpdates.length > 0 && <section className={styles.updates} aria-labelledby="schedule-updates-title">
          <div>
            <p className="ds-eyebrow">Record of change</p>
            <h3 id="schedule-updates-title">Schedule updates</h3>
          </div>
          <div>
            {scheduleUpdates.map((item) => <article key={item.id}>
              <span>{statusLabels[item.bookingStatus]}</span>
              <h4>{item.partnerName}</h4>
              <p>{formatScheduleRange(item)} · {item.eventLocation}</p>
            </article>)}
          </div>
        </section>}

        <p className={styles.privacyNote}><span aria-hidden="true">◇</span> This private view is limited to bookings connected to your authenticated account.</p>
      </section>
    </div>
  </main>;
}
