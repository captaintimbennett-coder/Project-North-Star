"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import type { SharedRetreatScheduleEvent } from "@/lib/auth/schedule-projection";
import {
  buildSharedRetreatScheduleDays,
  formatSharedScheduleHour,
  formatSharedScheduleRange,
  groupSharedScheduleByArtist,
  sharedScheduleHour,
  sharedScheduleHourRange,
} from "@/lib/scheduling/shared-retreat-schedule";
import calendarStyles from "./PersonalScheduleCalendar.module.css";
import styles from "./SharedRetreatSchedule.module.css";

type SharedRetreatScheduleProps = {
  events: SharedRetreatScheduleEvent[];
};

const statusLabels = {
  "admin-review": "Administrator review",
  confirmed: "Confirmed",
} as const;

type TimelineStyle = CSSProperties & {
  "--timeline-span": number;
  "--timeline-start": number;
};

export function SharedRetreatSchedule({ events }: SharedRetreatScheduleProps) {
  const days = useMemo(() => buildSharedRetreatScheduleDays(events), [events]);
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
        <p className="ds-eyebrow">Lone Star Retreat · Shared schedule</p>
        <h1>Your retreat schedule will appear here.</h1>
        <p>
          No eligible retreat is connected to this account. Access appears only
          after the organizer approves and assigns your participation.
        </p>
        <small>Participant view · Read only</small>
      </section>
    </main>;
  }

  const artists = groupSharedScheduleByArtist(selectedDay.items);
  const timeline = sharedScheduleHourRange(selectedDay);

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
        <h1 className={styles.heroTitle}>The retreat<br />in <em>motion.</em></h1>
        <p>{selectedDay.dateLabel} · {selectedDay.timeZone}</p>
      </div>
    </section>

    <div className={calendarStyles.shell}>
      <header className={calendarStyles.privateHeader}>
        <div>
          <span>Retreat Schedule</span>
          <strong>Approved participants · Read only</strong>
        </div>
        <Link className={styles.myScheduleLink} href="/account/my-schedule">
          Return to My Schedule
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
        className={`${calendarStyles.view} ${styles.sharedView}`}
        aria-labelledby="retreat-schedule-title"
      >
        <div className={styles.intro}>
          <div>
            <p className="ds-eyebrow">The retreat in motion</p>
            <h2 id="retreat-schedule-title">Retreat Schedule</h2>
          </div>
          <p>
            A privacy-safe view of confirmed creative sessions throughout the
            selected retreat day.
          </p>
        </div>

        <div className={styles.statusKey} aria-label="Schedule status legend">
          <span><i className={styles.confirmedDot} /> Confirmed</span>
          <span><i className={styles.reviewDot} /> Administrator review</span>
        </div>

        {artists.length
          ? <>
              <div
                className={styles.timeline}
                role="table"
                aria-label="Privacy-safe retreat schedule by Featured Artist"
                style={{ "--timeline-hours": timeline.span } as CSSProperties}
              >
                <div className={`${styles.timelineRow} ${styles.timelineHead}`} role="row">
                  <span role="columnheader">Featured Artist</span>
                  <div className={styles.timelineHours} role="presentation">
                    {timeline.hours.map((hour) =>
                      <time role="columnheader" key={hour}>
                        {formatSharedScheduleHour(hour)}
                      </time>)}
                  </div>
                </div>

                {artists.map((artist) => <div
                  className={styles.timelineRow}
                  role="row"
                  key={artist.name}
                >
                  <strong role="rowheader">{artist.name}</strong>
                  <div className={styles.timelineTrack} role="cell">
                    {timeline.hours.map((hour) => <i aria-hidden="true" key={hour} />)}
                    {artist.items.map((item) => {
                      const start = sharedScheduleHour(item.startAt, selectedDay.timeZone);
                      const end = sharedScheduleHour(item.endAt, selectedDay.timeZone);
                      const label = `${artist.name}, ${statusLabels[item.status]}, ${formatSharedScheduleRange(item, selectedDay.timeZone)}`;
                      return <span
                        aria-label={label}
                        className={item.status === "admin-review" ? styles.reviewBooking : styles.confirmedBooking}
                        key={item.id}
                        style={{
                          "--timeline-span": end - start,
                          "--timeline-start": start - timeline.firstHour,
                        } as TimelineStyle}
                      >
                        <small>{statusLabels[item.status]}</small>
                        <b>{formatSharedScheduleRange(item, selectedDay.timeZone)}</b>
                      </span>;
                    })}
                  </div>
                </div>)}
              </div>

              <div className={styles.mobileTimeline}>
                {artists.map((artist) => <article key={artist.name}>
                  <h3>{artist.name}</h3>
                  {artist.items.map((item) => <p
                    className={item.status === "admin-review" ? styles.mobileReview : ""}
                    key={item.id}
                  >
                    <span>{statusLabels[item.status]}</span>
                    {formatSharedScheduleRange(item, selectedDay.timeZone)}
                  </p>)}
                </article>)}
              </div>
            </>
          : <div className={styles.dayEmpty}>
              <span>Shared event view</span>
              <h3>No shared sessions are listed for this day.</h3>
              <p>Your private schedule remains available from My Schedule.</p>
            </div>}

        <p className={`${calendarStyles.privacyNote} ${styles.privacyNote}`}>
          <span aria-hidden="true">◇</span>
          Photographer identity, contact information, creative details, and
          financial arrangements remain private.
        </p>
      </section>
    </div>
  </main>;
}
