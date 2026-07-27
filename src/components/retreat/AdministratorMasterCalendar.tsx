"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import type {
  AdministratorMasterCalendarBooking,
  AdministratorMasterCalendarEvent,
} from "@/lib/auth/administrator-master-calendar-projection";
import {
  administratorBookingStatusLabels,
  administratorMasterCalendarHour,
  administratorMasterCalendarHourRange,
  buildAdministratorMasterCalendarDays,
  formatAdministratorMasterCalendarHour,
  formatAdministratorMasterCalendarRange,
  formatAdministratorRescheduleDay,
  groupAdministratorBookingsByArtist,
  isActiveAdministratorBooking,
  isCancellableAdministratorBooking,
  isReschedulableAdministratorBooking,
  normalizedAdministratorChangeReason,
  type AdministratorRescheduleOption,
} from "@/lib/scheduling/administrator-master-calendar";
import calendarStyles from "./PersonalScheduleCalendar.module.css";
import styles from "./AdministratorMasterCalendar.module.css";

type AdministratorMasterCalendarProps = {
  canCancelBookings: boolean;
  canRescheduleBookings: boolean;
  events: AdministratorMasterCalendarEvent[];
};

type BookingReviewMode = "cancel" | "reschedule" | "review";

type TimelineStyle = CSSProperties & {
  "--timeline-span": number;
  "--timeline-start": number;
};

export function AdministratorMasterCalendar({
  canCancelBookings,
  canRescheduleBookings,
  events,
}: AdministratorMasterCalendarProps) {
  const router = useRouter();
  const bookingDialogRef = useRef<HTMLDialogElement>(null);
  const days = useMemo(
    () => buildAdministratorMasterCalendarDays(events),
    [events],
  );
  const [selectedDayID, setSelectedDayID] = useState(days[0]?.id ?? "");
  const [bookingReview, setBookingReview] =
    useState<AdministratorMasterCalendarBooking | null>(null);
  const [bookingReviewMode, setBookingReviewMode] =
    useState<BookingReviewMode>("review");
  const [bookingError, setBookingError] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isLoadingRescheduleOptions, setIsLoadingRescheduleOptions] =
    useState(false);
  const [rescheduleOptions, setRescheduleOptions] = useState<
    AdministratorRescheduleOption[]
  >([]);
  const [rescheduleTimeZone, setRescheduleTimeZone] = useState("");
  const [selectedRescheduleOption, setSelectedRescheduleOption] = useState("");
  const selectedDay = days.find((day) => day.id === selectedDayID) ?? days[0];
  const canManageBookings = canCancelBookings || canRescheduleBookings;

  function rescheduleOptionID(option: AdministratorRescheduleOption) {
    return `${option.startAt}|${option.endAt}`;
  }

  function resetBookingReviewState() {
    setBookingError("");
    setBookingReason("");
    setBookingReviewMode("review");
    setIsLoadingRescheduleOptions(false);
    setRescheduleOptions([]);
    setRescheduleTimeZone("");
    setSelectedRescheduleOption("");
  }

  function closeBookingReview() {
    if (isSubmittingBooking) return;
    setBookingReview(null);
    resetBookingReviewState();
  }

  function openBookingReview(
    booking: AdministratorMasterCalendarBooking,
  ) {
    if (
      !canManageBookings
      || !isActiveAdministratorBooking(booking)
    ) return;
    setBookingReview(booking);
    resetBookingReviewState();
    setBookingSuccess("");
  }

  function openCancellationReview() {
    if (
      !bookingReview
      || !canCancelBookings
      || !isCancellableAdministratorBooking(bookingReview)
    ) return;
    setBookingReviewMode("cancel");
    setBookingError("");
    setBookingReason("");
  }

  async function loadRescheduleOptions() {
    if (
      !bookingReview
      || !canRescheduleBookings
      || !isReschedulableAdministratorBooking(bookingReview)
    ) return;

    setBookingReviewMode("reschedule");
    setBookingError("");
    setIsLoadingRescheduleOptions(true);
    setRescheduleOptions([]);
    setSelectedRescheduleOption("");
    try {
      const response = await fetch(
        `/api/scheduling/bookings/${bookingReview.id}/reschedule`,
        { method: "GET" },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok || !Array.isArray(result.options)) {
        throw new Error(
          result?.error || "Replacement times could not be loaded.",
        );
      }
      const options = result.options as AdministratorRescheduleOption[];
      setRescheduleOptions(options);
      setRescheduleTimeZone(
        typeof result.timeZone === "string"
          ? result.timeZone
          : selectedDay.timeZone,
      );
      setSelectedRescheduleOption(
        options[0] ? rescheduleOptionID(options[0]) : "",
      );
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Replacement times could not be loaded.",
      );
    } finally {
      setIsLoadingRescheduleOptions(false);
    }
  }

  function returnToBookingReview() {
    if (isSubmittingBooking) return;
    resetBookingReviewState();
  }

  async function cancelBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingReview) return;

    const reason = normalizedAdministratorChangeReason(bookingReason);
    if (!reason) {
      setBookingError(
        "Enter a private cancellation reason of at least three characters.",
      );
      return;
    }

    setBookingError("");
    setIsSubmittingBooking(true);
    try {
      const response = await fetch(
        `/api/scheduling/bookings/${bookingReview.id}/cancel`,
        {
          body: JSON.stringify({ reason }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "The booking could not be cancelled.",
        );
      }

      setBookingReview(null);
      resetBookingReviewState();
      setBookingSuccess(
        `${bookingReview.artistName} and ${bookingReview.photographerName}'s session was cancelled.`,
      );
      router.refresh();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "The booking could not be cancelled.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  async function rescheduleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingReview) return;

    const option = rescheduleOptions.find(
      (candidate) =>
        rescheduleOptionID(candidate) === selectedRescheduleOption,
    );
    if (!option) {
      setBookingError("Choose one available replacement time.");
      return;
    }
    const reason = normalizedAdministratorChangeReason(bookingReason);
    if (!reason) {
      setBookingError(
        "Enter a private rescheduling reason of at least three characters.",
      );
      return;
    }

    setBookingError("");
    setIsSubmittingBooking(true);
    try {
      const response = await fetch(
        `/api/scheduling/bookings/${bookingReview.id}/reschedule`,
        {
          body: JSON.stringify({
            endAt: option.endAt,
            reason,
            startAt: option.startAt,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "The booking could not be rescheduled.",
        );
      }

      const timeZone = rescheduleTimeZone || selectedDay.timeZone;
      setBookingReview(null);
      resetBookingReviewState();
      setBookingSuccess(
        `${bookingReview.artistName} and ${bookingReview.photographerName}'s session was moved to ${formatAdministratorRescheduleDay(option.day)}, ${formatAdministratorMasterCalendarRange(option, timeZone)}.`,
      );
      router.refresh();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "The booking could not be rescheduled.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  useEffect(() => {
    const dialog = bookingDialogRef.current;
    if (bookingReview && dialog && !dialog.open) dialog.showModal();
  }, [bookingReview]);

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
          <strong>
            Complete operational view · {canManageBookings
              ? "Booking management enabled"
              : "Read only"}
          </strong>
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
            the selected retreat day. {canManageBookings
              ? "Select an active reservation to reschedule or cancel it."
              : "This account has read-only access."}
          </p>
        </div>

        {bookingSuccess && <p
          className={styles.successNotice}
          role="status"
        >
          {bookingSuccess} The calendar has been refreshed from the
          authoritative schedule.
        </p>}

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

                      const bookingContent = <>
                        <small>
                          {administratorBookingStatusLabels[item.status]}
                        </small>
                        <strong>{item.photographerName}</strong>
                        <b>
                          {formatAdministratorMasterCalendarRange(
                            item,
                            selectedDay.timeZone,
                          )}
                        </b>
                      </>;
                      const className = `${styles.timelineBooking} ${
                        item.status === "admin-review"
                          ? styles.reviewBooking
                          : styles.confirmedBooking
                      }`;
                      const timelineStyle = {
                        "--timeline-span": end - start,
                        "--timeline-start": start - timeline.firstHour,
                      } as TimelineStyle;

                      return canManageBookings
                        ? <button
                            aria-label={`${label}. Manage booking.`}
                            className={className}
                            key={item.id}
                            onClick={() => openBookingReview(item)}
                            style={timelineStyle}
                            type="button"
                          >
                            {bookingContent}
                          </button>
                        : <span
                            aria-label={label}
                            className={className}
                            key={item.id}
                            style={timelineStyle}
                          >
                            {bookingContent}
                          </span>;
                    })}
                  </div>
                </div>)}
              </div>

              <div className={styles.mobileTimeline}>
                {activeArtists.map((artist) => <article key={artist.name}>
                  <h3>{artist.name}</h3>
                  {artist.items.map((item) => {
                    const bookingContent = <>
                      <span>
                        {administratorBookingStatusLabels[item.status]}
                      </span>
                      <strong>{item.photographerName}</strong>
                      <p>
                        {formatAdministratorMasterCalendarRange(
                          item,
                          selectedDay.timeZone,
                        )}
                      </p>
                      {canManageBookings && <small>Manage booking</small>}
                    </>;
                    const className = `${styles.mobileBooking} ${
                      item.status === "admin-review"
                        ? styles.mobileReview
                        : ""
                    }`;

                    return canManageBookings
                      ? <button
                          aria-label={`${artist.name} with ${item.photographerName}, ${administratorBookingStatusLabels[item.status]}, ${formatAdministratorMasterCalendarRange(item, selectedDay.timeZone)}. Manage booking.`}
                          className={className}
                          key={item.id}
                          onClick={() => openBookingReview(item)}
                          type="button"
                        >
                          {bookingContent}
                        </button>
                      : <div className={className} key={item.id}>
                          {bookingContent}
                        </div>;
                  })}
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
          {canManageBookings
            ? "This milestone can reschedule or cancel one active booking at a time. Reassignment, duration changes, overrides, and manual conflict controls remain unavailable."
            : "This account is intentionally read only. Cancellation, rescheduling, reassignment, override, and conflict controls are not available."}
        </p>
      </section>
    </div>

    {bookingReview && <dialog
        ref={bookingDialogRef}
        aria-describedby="booking-review-description"
        aria-labelledby="booking-review-title"
        className={styles.cancellationDialog}
        onCancel={(event) => {
          event.preventDefault();
          closeBookingReview();
        }}
      >
        <button
          aria-label="Close booking management"
          className={styles.dialogClose}
          disabled={isSubmittingBooking}
          onClick={closeBookingReview}
          type="button"
        >
          ×
        </button>
        <p className="ds-eyebrow">
          {bookingReviewMode === "cancel"
            ? "Cancellation review"
            : bookingReviewMode === "reschedule"
              ? "Rescheduling review"
              : "Booking management"}
        </p>
        <h2 id="booking-review-title">
          {bookingReviewMode === "cancel"
            ? "Cancel this session?"
            : bookingReviewMode === "reschedule"
              ? "Choose a new time."
              : "Manage this session."}
        </h2>
        <p id="booking-review-description">
          {bookingReviewMode === "cancel"
            ? "Review the reservation carefully. Cancellation changes both participant schedules and begins the required email delivery."
            : bookingReviewMode === "reschedule"
              ? "The session keeps the same retreat, participants, and duration. Only currently valid replacement times are offered."
              : "Review the reservation, then choose the one operational change you need to make."}
        </p>

        <dl className={styles.cancellationDetails}>
          <div>
            <dt>Featured Artist</dt>
            <dd>{bookingReview.artistName}</dd>
          </div>
          <div>
            <dt>Photographer</dt>
            <dd>{bookingReview.photographerName}</dd>
          </div>
          <div>
            <dt>Retreat day</dt>
            <dd>{selectedDay.dateLabel}</dd>
          </div>
          <div>
            <dt>Session time</dt>
            <dd>
              {formatAdministratorMasterCalendarRange(
                bookingReview,
                selectedDay.timeZone,
              )}
            </dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>
              {(new Date(bookingReview.endAt).getTime()
                - new Date(bookingReview.startAt).getTime()) / 3_600_000}
              {" "}
              {(new Date(bookingReview.endAt).getTime()
                - new Date(bookingReview.startAt).getTime()) / 3_600_000 === 1
                ? "hour"
                : "hours"}
            </dd>
          </div>
          <div>
            <dt>Current status</dt>
            <dd>
              {administratorBookingStatusLabels[bookingReview.status]}
            </dd>
          </div>
        </dl>

        {bookingReviewMode === "review" && <div
          className={`${styles.cancellationActions} ${styles.bookingActionChoices}`}
        >
          <button onClick={closeBookingReview} type="button">
            Keep booking
          </button>
          {canRescheduleBookings && <button
            className={styles.confirmReschedule}
            onClick={loadRescheduleOptions}
            type="button"
          >
            Choose a new time
          </button>}
          {canCancelBookings && <button
            className={styles.confirmCancellation}
            onClick={openCancellationReview}
            type="button"
          >
            Cancel booking
          </button>}
        </div>}

        {bookingReviewMode === "cancel" && <form onSubmit={cancelBooking}>
          <label htmlFor="booking-change-reason">
            Private administrator reason
          </label>
          <small>
            Required for the audit record. This reason is never shared with
            either participant.
          </small>
          <textarea
            autoFocus
            disabled={isSubmittingBooking}
            id="booking-change-reason"
            minLength={3}
            onChange={(event) => {
              setBookingReason(event.target.value);
              if (bookingError) setBookingError("");
            }}
            placeholder="Why is this booking being cancelled?"
            required
            rows={4}
            value={bookingReason}
          />
          {bookingError && <p
            className={styles.cancellationError}
            role="alert"
          >
            {bookingError}
          </p>}
          <div className={styles.cancellationActions}>
            <button
              disabled={isSubmittingBooking}
              onClick={returnToBookingReview}
              type="button"
            >
              Back
            </button>
            <button
              className={styles.confirmCancellation}
              disabled={isSubmittingBooking}
              type="submit"
            >
              {isSubmittingBooking
                ? "Cancelling…"
                : "Confirm cancellation"}
            </button>
          </div>
        </form>}

        {bookingReviewMode === "reschedule" && <form
          onSubmit={rescheduleBooking}
        >
          <fieldset
            className={styles.rescheduleFieldset}
            disabled={isLoadingRescheduleOptions || isSubmittingBooking}
          >
            <legend>Available replacement time</legend>
            <small>
              Same retreat, Featured Artist, photographer, and duration.
            </small>
            {isLoadingRescheduleOptions
              ? <p className={styles.rescheduleLoading} role="status">
                  Checking the authoritative schedule…
                </p>
              : rescheduleOptions.length
                ? <div className={styles.rescheduleOptions}>
                    {rescheduleOptions.map((option) => {
                      const optionID = rescheduleOptionID(option);
                      const timeZone =
                        rescheduleTimeZone || selectedDay.timeZone;
                      return <label key={optionID}>
                        <input
                          checked={selectedRescheduleOption === optionID}
                          name="replacement-time"
                          onChange={() => {
                            setSelectedRescheduleOption(optionID);
                            if (bookingError) setBookingError("");
                          }}
                          type="radio"
                          value={optionID}
                        />
                        <span>
                          <strong>
                            {formatAdministratorRescheduleDay(option.day)}
                          </strong>
                          <small>
                            {formatAdministratorMasterCalendarRange(
                              option,
                              timeZone,
                            )}
                          </small>
                        </span>
                      </label>;
                    })}
                  </div>
                : <div className={styles.rescheduleEmpty}>
                    <strong>No valid replacement time is available.</strong>
                    <p>
                      The booking has not changed. Keep it as scheduled or
                      return later when availability changes.
                    </p>
                  </div>}
            {!isLoadingRescheduleOptions && <button
              className={styles.reloadOptions}
              onClick={loadRescheduleOptions}
              type="button"
            >
              Reload valid times
            </button>}
          </fieldset>

          <label htmlFor="booking-change-reason">
            Private administrator reason
          </label>
          <small>
            Required for the audit record. This reason is never shared with
            either participant.
          </small>
          <textarea
            disabled={isLoadingRescheduleOptions || isSubmittingBooking}
            id="booking-change-reason"
            minLength={3}
            onChange={(event) => {
              setBookingReason(event.target.value);
              if (bookingError) setBookingError("");
            }}
            placeholder="Why is this booking being rescheduled?"
            required
            rows={3}
            value={bookingReason}
          />
          {bookingError && <p
            className={styles.cancellationError}
            role="alert"
          >
            {bookingError}
          </p>}
          <div className={styles.cancellationActions}>
            <button
              disabled={isSubmittingBooking}
              onClick={returnToBookingReview}
              type="button"
            >
              Back
            </button>
            <button
              className={styles.confirmReschedule}
              disabled={
                isLoadingRescheduleOptions
                || isSubmittingBooking
                || !selectedRescheduleOption
              }
              type="submit"
            >
              {isSubmittingBooking
                ? "Rescheduling…"
                : "Confirm new time"}
            </button>
          </div>
        </form>}
    </dialog>}
  </main>;
}
