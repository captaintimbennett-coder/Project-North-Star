"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRangeOption } from "@/lib/scheduling/booking-service";
import {
  bookingOptionID,
  formatBookingRange,
  getBookingArtists,
  getBookingDays,
  getBookingDurations,
  getBookingHourChoices,
  getBookingStartChoices,
} from "@/lib/scheduling/photographer-booking-presentation";
import calendarStyles from "./PersonalScheduleCalendar.module.css";
import styles from "./PhotographerBookingForm.module.css";

type BookingStage = "select" | "review" | "confirmed";
type SubmissionState = "idle" | "submitting" | "success" | "error";

function artistInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function durationLabel(hours: number) {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

function ArtistPortrait({
  option,
  sizes,
}: {
  option: BookingRangeOption;
  sizes: string;
}) {
  if (!option.artistImage) {
    return <div className={styles.artistPlaceholder} aria-hidden="true">
      <span>{artistInitials(option.artistName)}</span>
    </div>;
  }
  return <Image
    src={option.artistImage.src}
    alt={option.artistImage.alt}
    fill
    sizes={sizes}
  />;
}

export function PhotographerBookingForm({
  accountName,
  options,
}: {
  accountName: string;
  options: BookingRangeOption[];
}) {
  const router = useRouter();
  const days = useMemo(() => getBookingDays(options), [options]);
  const [selectedDayID, setSelectedDayID] = useState(days[0]?.id ?? "");
  const initialStarts = getBookingStartChoices(options, selectedDayID);
  const [selectedStartAt, setSelectedStartAt] = useState(initialStarts[0]?.startAt ?? "");
  const initialDurations = getBookingDurations(options, selectedDayID, selectedStartAt);
  const [selectedDuration, setSelectedDuration] = useState(initialDurations[0] ?? 0);
  const [selectedOptionID, setSelectedOptionID] = useState("");
  const [stage, setStage] = useState<BookingStage>("select");
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const day = days.find((item) => item.id === selectedDayID) ?? days[0];
  const dayID = day?.id ?? "";
  const starts = useMemo(
    () => getBookingStartChoices(options, dayID),
    [dayID, options],
  );
  const selectedStart = starts.find((item) => item.startAt === selectedStartAt) ?? starts[0];
  const durations = useMemo(
    () => getBookingDurations(options, dayID, selectedStart?.startAt ?? ""),
    [dayID, options, selectedStart?.startAt],
  );
  const duration = durations.includes(selectedDuration) ? selectedDuration : durations[0] ?? 0;
  const availableArtists = useMemo(
    () => getBookingArtists(options, dayID, selectedStart?.startAt ?? "", duration),
    [dayID, duration, options, selectedStart?.startAt],
  );
  const selectedOption = availableArtists.find((option) =>
    bookingOptionID(option) === selectedOptionID);
  const hours = useMemo(() => getBookingHourChoices(options, dayID), [dayID, options]);
  const representativeOption = availableArtists[0];

  if (!day || !selectedStart || !representativeOption) {
    return <main className={calendarStyles.schedule} id="main-content">
      <section className={calendarStyles.empty}>
        <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={52} height={56} />
        <p className="ds-eyebrow">Lone Star Retreat · Private booking</p>
        <h1>Your creative windows will appear here.</h1>
        <p>No bookable Featured Artist ranges are currently available for your approved retreat.</p>
        <small>Photographer view · Private</small>
        <Link className={styles.emptyLink} href="/account/my-schedule">Open My Protected Schedule →</Link>
      </section>
    </main>;
  }

  function resetSubmission() {
    setSelectedOptionID("");
    setStage("select");
    setSubmissionState("idle");
    setMessage("");
    setIdempotencyKey(crypto.randomUUID());
  }

  function chooseDay(nextDayID: string) {
    const nextStarts = getBookingStartChoices(options, nextDayID);
    const nextStartAt = nextStarts[0]?.startAt ?? "";
    const nextDurations = getBookingDurations(options, nextDayID, nextStartAt);
    setSelectedDayID(nextDayID);
    setSelectedStartAt(nextStartAt);
    setSelectedDuration(nextDurations[0] ?? 0);
    resetSubmission();
  }

  function chooseStart(startAt: string) {
    const nextDurations = getBookingDurations(options, dayID, startAt);
    setSelectedStartAt(startAt);
    setSelectedDuration(nextDurations[0] ?? 0);
    resetSubmission();
  }

  function chooseDuration(hoursCount: number) {
    setSelectedDuration(hoursCount);
    resetSubmission();
  }

  async function confirm() {
    if (!selectedOption || submissionState === "submitting") return;
    setSubmissionState("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/scheduling/bookings", {
        body: JSON.stringify({
          artistId: selectedOption.artistId,
          endAt: selectedOption.endAt,
          eventId: selectedOption.eventId,
          idempotencyKey,
          startAt: selectedOption.startAt,
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSubmissionState("error");
        setMessage(result?.error || "The reservation could not be confirmed.");
        if (response.status === 409) {
          setStage("select");
          setSelectedOptionID("");
          setIdempotencyKey(crypto.randomUUID());
          router.refresh();
        }
        return;
      }
      setSubmissionState("success");
      setMessage("Reservation confirmed. Both participant schedules now protect this creative window.");
      setStage("confirmed");
    } catch {
      setSubmissionState("error");
      setMessage("The reservation could not be confirmed. Check your connection and try again.");
    }
  }

  if (stage === "confirmed" && selectedOption) {
    return <main className={calendarStyles.schedule} id="main-content">
      <section className={styles.confirmation} aria-live="polite">
        <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={52} height={56} />
        <p className="ds-eyebrow">Lone Star Retreat · Protected reservation</p>
        <h1>Reservation Confirmed</h1>
        <div className={styles.confirmationPortrait}>
          <ArtistPortrait option={selectedOption} sizes="220px" />
          <span />
        </div>
        <h2>{selectedOption.artistName}</h2>
        <p>{day.dateLabel}<br />{formatBookingRange(selectedOption)} · {day.timeZone}</p>
        <strong>{durationLabel(selectedOption.durationHours)} · Confirmed and protected</strong>
        <p className={styles.confirmationMessage} role="status">{message}</p>
        <div className={styles.confirmationLinks}>
          <Link href="/account/my-schedule">Open My Protected Schedule</Link>
          <button onClick={() => {
            resetSubmission();
            router.refresh();
          }} type="button">Schedule another session</button>
        </div>
      </section>
    </main>;
  }

  if (stage === "review" && selectedOption) {
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
          <p className="ds-eyebrow">{day.eventTitle}</p>
          <h1>Create with<br /><em>intention.</em></h1>
          <p>{day.dateLabel} · {day.timeZone}</p>
        </div>
      </section>

      <div className={calendarStyles.shell}>
        <header className={calendarStyles.privateHeader}>
          <div>
            <span>Schedule a Shoot</span>
            <strong>Photographer · Private booking</strong>
          </div>
          <p>Review before confirming</p>
        </header>

        <section className={`${calendarStyles.view} ${styles.review}`} aria-labelledby="booking-review-title">
          <button className={styles.back} onClick={() => {
            setStage("select");
            setSubmissionState("idle");
            setMessage("");
          }} type="button">← Back to selection</button>
          <div className={styles.reviewGrid}>
            <div className={styles.reviewImage}>
              <ArtistPortrait option={selectedOption} sizes="(max-width: 760px) 100vw, 45vw" />
            </div>
            <div className={styles.reviewDetails}>
              <p className="ds-eyebrow">Review your creative window</p>
              <h1 id="booking-review-title">Create with<br />{selectedOption.artistName}.</h1>
              <dl>
                <div><dt>Date</dt><dd>{day.dateLabel}</dd></div>
                <div><dt>Time</dt><dd>{formatBookingRange(selectedOption)}</dd></div>
                <div><dt>Duration</dt><dd>{durationLabel(selectedOption.durationHours)}</dd></div>
                <div><dt>Status</dt><dd>Instant confirmation</dd></div>
              </dl>
              <p className={styles.reviewNote}>By confirming, both participants agree to coordinate privately and uphold the Lone Star Retreat Professional Standards.</p>
              <button
                className={styles.primaryAction}
                disabled={submissionState === "submitting"}
                onClick={confirm}
                type="button"
              >
                {submissionState === "submitting" ? "Confirming reservation…" : "Confirm Reservation"}
                <span aria-hidden="true">→</span>
              </button>
              {message && <p className={styles.liveMessage} role="status">{message}</p>}
              <small>Rates, concepts, wardrobe, and payment remain private arrangements between participants.</small>
            </div>
          </div>
        </section>
      </div>
    </main>;
  }

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
        <p className="ds-eyebrow">{day.eventTitle}</p>
        <h1>Create with<br /><em>intention.</em></h1>
        <p>{day.dateLabel} · {day.timeZone}</p>
      </div>
    </section>

    <div className={calendarStyles.shell}>
      <header className={calendarStyles.privateHeader}>
        <div>
          <span>Schedule a Shoot</span>
          <strong>Photographer · Private booking</strong>
        </div>
        <p>{accountName} · Instant confirmation</p>
      </header>

      <div className={calendarStyles.context}>
        <div className={calendarStyles.days} aria-label="Retreat day">
          {days.map((item) => <button
            aria-pressed={day.id === item.id}
            key={item.id}
            onClick={() => chooseDay(item.id)}
            type="button"
          >
            <span>{item.shortLabel}</span>
            <strong>{item.eventTitle}</strong>
          </button>)}
        </div>
      </div>

      <section className={`${calendarStyles.view} ${styles.view}`} aria-labelledby="artist-selection-title">
        <div className={styles.heading}>
          <div>
            <p className="ds-eyebrow">Who do you want to create with?</p>
            <h2 id="artist-selection-title">Choose your creative window.</h2>
          </div>
          <p>Select one uninterrupted span. Then meet the Featured Artists whose day aligns with yours.</p>
        </div>

        <div className={styles.timeSelection}>
          <div className={styles.timeSummary}>
            <span>Selected creative window</span>
            <strong>{formatBookingRange(representativeOption)}</strong>
            <p>{durationLabel(duration)} · Continuous reservation</p>
          </div>
          <div className={styles.timeRibbon} aria-label="Select a creative-window start time">
            {hours.map((hour) => <button
              aria-label={hour.available ? `Start at ${hour.label}` : `${hour.label} unavailable`}
              aria-pressed={hour.startAt === selectedStart.startAt}
              className={`${hour.startAt === selectedStart.startAt ? styles.selected : ""}${hour.available ? "" : ` ${styles.unavailable}`}`}
              disabled={!hour.startAt}
              key={hour.clock}
              onClick={() => hour.startAt && chooseStart(hour.startAt)}
              type="button"
            >
              <span>{hour.label}</span>
              <i aria-hidden="true" />
            </button>)}
          </div>
        </div>

        <div className={styles.durationPicker}>
          <div>
            <span>Session length</span>
            <p>Only durations available at this start time are shown.</p>
          </div>
          <div className={styles.durationButtons}>
            {durations.map((hoursCount) => <button
              aria-pressed={duration === hoursCount}
              key={hoursCount}
              onClick={() => chooseDuration(hoursCount)}
              type="button"
            >{durationLabel(hoursCount)}</button>)}
          </div>
        </div>

        <div className={styles.availableArtists}>
          <div className={styles.subheading}>
            <span>Featured Artists available for your creative window</span>
            <p>{formatBookingRange(representativeOption)}</p>
          </div>
          <div className={styles.artistCards}>
            {availableArtists.map((option) => {
              const selected = selectedOptionID === bookingOptionID(option);
              return <button
                aria-pressed={selected}
                className={selected ? styles.artistSelected : undefined}
                key={bookingOptionID(option)}
                onClick={() => {
                  setSelectedOptionID(bookingOptionID(option));
                  setSubmissionState("idle");
                  setMessage("");
                  setIdempotencyKey(crypto.randomUUID());
                }}
                type="button"
              >
                <div className={styles.artistImage}>
                  <ArtistPortrait option={option} sizes="(max-width: 760px) 100vw, 50vw" />
                  <span />
                </div>
                <p>Available to create with you</p>
                <h3>{option.artistName}</h3>
                <small>{option.artistMinimumHours}-hour minimum · Your window is a beautiful fit</small>
                <i>{selected ? "Creating together" : "Choose this Featured Artist"}</i>
              </button>;
            })}
          </div>
        </div>

        <div className={styles.selectionFooter}>
          <div>
            <span>Selected</span>
            <strong>{selectedOption?.artistName ?? "Choose a Featured Artist"}</strong>
            <p>{formatBookingRange(representativeOption)}</p>
          </div>
          <button
            className={styles.primaryAction}
            disabled={!selectedOption}
            onClick={() => {
              setStage("review");
              setSubmissionState("idle");
              setMessage("");
            }}
            type="button"
          >Review Creative Window <span aria-hidden="true">→</span></button>
        </div>

        {message && <p className={styles.liveMessage} role="status">{message}</p>}
        <p className={styles.privacyNote}><span aria-hidden="true">◇</span> Only eligible Featured Artists and open scheduling windows are shown. Contact details remain private until confirmation.</p>
        <Link className={styles.scheduleLink} href="/account/my-schedule">Open My Protected Schedule →</Link>
      </section>
    </div>
  </main>;
}
