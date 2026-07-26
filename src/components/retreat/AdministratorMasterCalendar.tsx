"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import type { AdministratorMasterCalendarEvent } from "@/lib/auth/administrator-master-calendar-projection";
import {
  administratorBookingStatusLabels,
  administratorMasterCalendarHour,
  administratorMasterCalendarHourRange,
  buildAdministratorMasterCalendarDays,
  formatAdministratorMasterCalendarHour,
  formatAdministratorMasterCalendarRange,
  groupAdministratorBookingsByArtist,
  isActiveAdministratorBooking,
} from "@/lib/scheduling/administrator-master-calendar";
import calendarStyles from "./PersonalScheduleCalendar.module.css";
import styles from "./AdministratorMasterCalendar.module.css";

type AdministratorMasterCalendarProps = {
  events: AdministratorMasterCalendarEvent[];
};

type TimelineStyle = CSSProperties & {
  "--timeline-span": number;
  "--timeline-start": number;
};

export function AdministratorMasterCalendar({
  events,
}: AdministratorMasterCalendarProps) {
  const days = useMemo(
    () => buildAdministratorMasterCalendarDays(events),
    [events],
  );
  const [selectedDayID, setSelectedDayID] = useState(days[0]?.id ?? "");
  const selectedDay = days.find((day) => day.id === selectedDayID) ?? days[0];

  if (!selectedDay) {
    return <main className={calendarStyles.schedule} id="main-content">
      <section className={calendarStyles.empty}>
        <Image
          src="/images/brand/north-star-symbol-v1.0.png"
          alt=""
          width={52}
          height={56}
        />
        <p className="ds-eyebrow">Lone Star Retreat · Operations</p>
        <h1>No operational retreat is available.</h1>
        <p>
          Published and registration-closed retreats with valid event dates
          will appear here automatically.
        </p>
        <small>Administrator view · Read only</small>
      </section>
    </main>;
  }

  const artists = groupAdministratorBookingsByArtist(selectedDay.items);
  const activeArtists = artists
    .map((artist) => ({
      ...artist,
      items: artist.items.filter(isActiveAdministratorBooking),
    }))
    .filter((artist) => artist.items.length);
  const history = selectedDay.items
    .filter((item) => !isActiveAdministratorBooking(item))
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
  const timeline = administratorMasterCalendarHourRange(selectedDay);
  const photographerCount = new Set(
    selectedDay.items.map((item) => item.photographerName),
  ).size;
  const exceptionCount = selectedDay.items.filter(
    (item) => item.status !== "confirmed",
  ).length;

  return <main className={calendarStyles.schedule} id="main-content">
    <section className={calendarStyles.hero}>
      <div className={calendarStyles.heroImage}>
        <Image
          src="/images/lone-star-retreat/texas-hill-country-hero-v1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <span />
      </div>
      <div className={calendarStyles.heroContent}>
        <p className="ds-eyebrow">{selectedDay.eventTitle}</p>
        <h1 className={styles.heroTitle}>
          The whole retreat<br />at <em>a glance.</em>
        </h1>
        <p>{selectedDay.dateLabel} · {selectedDay.timeZone}</p>
      </div>
    </section>

    <div className={calendarStyles.shell}>
      <header className={calendarStyles.privateHeader}>
        <div>
          <span>Administrator Master Calendar</span>
          <strong>Complete operational view · Read only</strong>
        </div>
        <Link className={styles.accountLink} href="/account/access">
          Return to Account
        </Link>
      </header>

      <div className={calendarStyles.context}>
        <div className={calendarStyles.days} aria-label="Retreat day">
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

      <section
        className={`${calendarStyles.view} ${styles.masterView}`}
        aria-labelledby="master-calendar-title"
      >
        <div className={styles.intro}>
          <div>
            <p className="ds-eyebrow">Operational control</p>
            <h2 id="master-calendar-title">Master Calendar</h2>
          </div>
          <p>
            Every photographer, Featured Artist, reservation, and exception for
            the selected retreat day—without editing controls.
          </p>
        </div>

        <div className={styles.summary} aria-label="Selected day summary">
          <span><strong>{selectedDay.items.length}</strong> bookings</span>
          <span><strong>{artists.length}</strong> Featured Artists</span>
          <span><strong>{photographerCount}</strong> photographers</span>
          <span><strong>{exceptionCount}</strong> exceptions</span>
        </div>

        <div className={styles.statusKey} aria-label="Booking status legend">
          <span><i className={styles.confirmedDot} /> Confirmed</span>
          <span><i className={styles.reviewDot} /> Administrator review</span>
          <span><i className={styles.historyDot} /> Cancelled or rescheduled</span>
        </div>

        {activeArtists.length
          ? <>
              <div
                className={styles.timeline}
                role="table"
                aria-label="Administrator schedule by Featured Artist"
                style={{ "--timeline-hours": timeline.span } as CSSProperties}
              >
                <div
                  className={`${styles.timelineRow} ${styles.timelineHead}`}
                  role="row"
                >
                  <span role="columnheader">Featured Artist</span>
                  <div className={styles.timelineHours} role="presentation">
                    {timeline.hours.map((hour) =>
                      <time role="columnheader" key={hour}>
                        {formatAdministratorMasterCalendarHour(hour)}
                      </time>)}
                  </div>
                </div>

                {activeArtists.map((artist) => <div
                  className={styles.timelineRow}
                  role="row"
                  key={artist.name}
                >
                  <strong role="rowheader">{artist.name}</strong>
                  <div className={styles.timelineTrack} role="cell">
                    {timeline.hours.map((hour) =>
                      <i aria-hidden="true" key={hour} />)}
                    {artist.items.map((item) => {
                      const start = administratorMasterCalendarHour(
                        item.startAt,
                        selectedDay.timeZone,
                      );
                      const end = administratorMasterCalendarHour(
                        item.endAt,
                        selectedDay.timeZone,
                      );
                      const label = `${artist.name} with ${item.photographerName}, ${administratorBookingStatusLabels[item.status]}, ${formatAdministratorMasterCalendarRange(item, selectedDay.timeZone)}`;

                      return <span
                        aria-label={label}
                        className={item.status === "admin-review"
                          ? styles.reviewBooking
                          : styles.confirmedBooking}
                        key={item.id}
                        style={{
                          "--timeline-span": end - start,
                          "--timeline-start": start - timeline.firstHour,
                        } as TimelineStyle}
                      >
                        <small>{administratorBookingStatusLabels[item.status]}</small>
                        <strong>{item.photographerName}</strong>
                        <b>
                          {formatAdministratorMasterCalendarRange(
                            item,
                            selectedDay.timeZone,
                          )}
                        </b>
                      </span>;
                    })}
                  </div>
                </div>)}
              </div>

              <div className={styles.mobileTimeline}>
                {activeArtists.map((artist) => <article key={artist.name}>
                  <h3>{artist.name}</h3>
                  {artist.items.map((item) => <div
                    className={item.status === "admin-review"
                      ? styles.mobileReview
                      : ""}
                    key={item.id}
                  >
                    <span>{administratorBookingStatusLabels[item.status]}</span>
                    <strong>{item.photographerName}</strong>
                    <p>
                      {formatAdministratorMasterCalendarRange(
                        item,
                        selectedDay.timeZone,
                      )}
                    </p>
                  </div>)}
                </article>)}
              </div>
            </>
          : <div className={styles.dayEmpty}>
              <span>Operational view</span>
              <h3>No active sessions are scheduled for this day.</h3>
              <p>Cancelled and rescheduled records remain visible below.</p>
            </div>}

        {history.length > 0 && <section
          className={styles.history}
          aria-labelledby="schedule-history-title"
        >
          <div>
            <p className="ds-eyebrow">Preserved operational record</p>
            <h3 id="schedule-history-title">Schedule history</h3>
          </div>
          <div className={styles.historyList}>
            {history.map((item) => <article key={item.id}>
              <span>{administratorBookingStatusLabels[item.status]}</span>
              <h4>{item.artistName}</h4>
              <p>{item.photographerName}</p>
              <time>
                {formatAdministratorMasterCalendarRange(
                  item,
                  selectedDay.timeZone,
                )}
              </time>
            </article>)}
          </div>
        </section>}

        <p className={`${calendarStyles.privacyNote} ${styles.readOnlyNote}`}>
          <span aria-hidden="true">◇</span>
          This milestone is intentionally read only. Cancellation,
          rescheduling, reassignment, override, and conflict controls are not
          available from this screen.
        </p>
      </section>
    </div>
  </main>;
}
