"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ModelAvailabilityDay } from "@/lib/scheduling/availability-service";
import {
  clockMinutes,
  formatAvailabilityRange,
  formatAvailabilityTime,
  shiftAvailabilityHour,
  validateAvailabilityDraft,
  type AvailabilityBlockInput,
  type AvailabilityDraft,
} from "@/lib/scheduling/model-availability-presentation";
import calendarStyles from "./PersonalScheduleCalendar.module.css";
import styles from "./ModelAvailabilityForm.module.css";

type Drafts = Record<string, AvailabilityDraft>;

function dayID(day: ModelAvailabilityDay) {
  return `${day.eventId}|${day.date}`;
}

function initialDrafts(days: ModelAvailabilityDay[]) {
  return Object.fromEntries(days.map((day) => [dayID(day), {
    availableFrom: day.availableFrom,
    availableUntil: day.availableUntil,
    blockedTimes: day.blockedTimes,
  }])) satisfies Drafts;
}

function dateLabel(day: ModelAvailabilityDay) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(new Date(`${day.date}T12:00:00Z`));
}

function shortDateLabel(day: ModelAvailabilityDay) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${day.date}T12:00:00Z`));
}

function rangeOverlapsHour(startTime: string, endTime: string, hour: number) {
  const start = hour * 60;
  const end = start + 60;
  return clockMinutes(startTime) < end && clockMinutes(endTime) > start;
}

function timelineHours(day: ModelAvailabilityDay, draft: AvailabilityDraft) {
  const clocks = [
    draft.availableFrom,
    draft.availableUntil,
    ...draft.blockedTimes.flatMap((block) => [block.startTime, block.endTime]),
    ...day.protectedBookings.flatMap((booking) => [booking.startTime, booking.endTime]),
  ];
  const start = Math.max(0, Math.min(6, ...clocks.map((clock) => Math.floor(clockMinutes(clock) / 60))));
  const end = Math.min(23, Math.max(20, ...clocks.map((clock) => Math.ceil(clockMinutes(clock) / 60))));
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function blockLabel(block: AvailabilityBlockInput) {
  if (block.reason === "lunch") return "Lunch · Unavailable";
  if (block.reason === "other") return "Personal time · Unavailable";
  return "Unavailable";
}

export function ModelAvailabilityForm({
  accountName,
  days,
}: {
  accountName: string;
  days: ModelAvailabilityDay[];
}) {
  const [selectedDayID, setSelectedDayID] = useState(days[0] ? dayID(days[0]) : "");
  const [drafts, setDrafts] = useState<Drafts>(() => initialDrafts(days));
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initialDrafts(days)).map(([key, draft]) => [key, JSON.stringify(draft)])));
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [savingDayID, setSavingDayID] = useState("");
  const day = days.find((item) => dayID(item) === selectedDayID) ?? days[0];

  if (!day) {
    return <main className={calendarStyles.schedule} id="main-content">
      <section className={calendarStyles.empty}>
        <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={52} height={56} />
        <p className="ds-eyebrow">Lone Star Retreat · Protected availability</p>
        <h1>Your retreat days will appear here.</h1>
        <p>No eligible retreat days are connected to this Featured Artist account yet.</p>
        <small>Featured Artist view · Private</small>
      </section>
    </main>;
  }

  const key = dayID(day);
  const draft = drafts[key];
  const dirty = savedSnapshots[key] !== JSON.stringify(draft);
  const hours = timelineHours(day, draft);
  const protectedTimes = day.protectedBookings.map((booking) => ({
    endTime: booking.endTime,
    startTime: booking.startTime,
  }));

  function updateDraft(patch: Partial<AvailabilityDraft>) {
    setDrafts((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    setMessages((current) => ({ ...current, [key]: "" }));
  }

  function updateBlock(index: number, patch: Partial<AvailabilityBlockInput>) {
    updateDraft({
      blockedTimes: draft.blockedTimes.map((block, position) =>
        position === index ? { ...block, ...patch } : block),
    });
  }

  function addBlock() {
    const startBoundary = Math.ceil(clockMinutes(draft.availableFrom) / 60);
    const endBoundary = Math.floor(clockMinutes(draft.availableUntil) / 60);

    for (let hour = startBoundary; hour < endBoundary; hour += 1) {
      const candidate: AvailabilityBlockInput = {
        endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        reason: hour === 12 ? "lunch" : "unavailable",
        startTime: `${String(hour).padStart(2, "0")}:00`,
      };
      const candidateDraft = { ...draft, blockedTimes: [...draft.blockedTimes, candidate] };
      if (!validateAvailabilityDraft(candidateDraft, protectedTimes)) {
        updateDraft({ blockedTimes: candidateDraft.blockedTimes });
        return;
      }
    }

    setMessages((current) => ({
      ...current,
      [key]: "No unprotected one-hour space remains for another unavailable block.",
    }));
  }

  async function save() {
    const validationMessage = validateAvailabilityDraft(draft, protectedTimes);
    if (validationMessage) {
      setMessages((current) => ({ ...current, [key]: validationMessage }));
      return;
    }

    setSavingDayID(key);
    setMessages((current) => ({ ...current, [key]: "" }));
    try {
      const response = await fetch("/api/scheduling/availability", {
        body: JSON.stringify({
          availableFrom: draft.availableFrom,
          availableUntil: draft.availableUntil,
          blockedTimes: draft.blockedTimes,
          date: day.date,
          eventId: day.eventId,
        }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setMessages((current) => ({
          ...current,
          [key]: result?.error || "Availability could not be saved.",
        }));
        return;
      }
      setSavedSnapshots((current) => ({ ...current, [key]: JSON.stringify(draft) }));
      setMessages((current) => ({
        ...current,
        [key]: "Availability saved. Confirmed reservations remain protected.",
      }));
    } catch {
      setMessages((current) => ({
        ...current,
        [key]: "Availability could not be saved. Check your connection and try again.",
      }));
    } finally {
      setSavingDayID("");
    }
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
        <h1>Shape your day<br />with <em>intention.</em></h1>
        <p>{dateLabel(day)} · {day.timeZone}</p>
      </div>
    </section>

    <div className={calendarStyles.shell}>
      <header className={calendarStyles.privateHeader}>
        <div>
          <span>Shape Your Day</span>
          <strong>Featured Artist · Private availability</strong>
        </div>
        <p>{dirty ? "Unsaved changes" : "Your availability is saved"}</p>
      </header>

      <div className={calendarStyles.context}>
        <div className={calendarStyles.days} aria-label="Retreat day">
          {days.map((item) => <button
            aria-pressed={dayID(day) === dayID(item)}
            key={dayID(item)}
            onClick={() => setSelectedDayID(dayID(item))}
            type="button"
          >
            <span>{shortDateLabel(item)}</span>
            <strong>{item.eventTitle}</strong>
          </button>)}
        </div>
      </div>

      <section className={`${calendarStyles.view} ${styles.view}`} aria-labelledby="shape-day-title">
        <div className={styles.heading}>
          <div>
            <p className="ds-eyebrow">{accountName} · Your working day</p>
            <h2 id="shape-day-title">Shape Your Day</h2>
          </div>
          <p>Open the day, protect personal time, and let the schedule breathe. Confirmed sessions stay locked.</p>
        </div>

        <div className={styles.summary}>
          <div>
            <span>{shortDateLabel(day)} · Your working day</span>
            <strong>{formatAvailabilityRange(draft.availableFrom, draft.availableUntil)}</strong>
          </div>
          <p>Changes apply only to this retreat day.</p>
        </div>

        <div className={styles.ribbon} aria-label={`Availability for ${dateLabel(day)}`}>
          {hours.map((hour) => {
            const protectedBooking = day.protectedBookings.find((booking) =>
              rangeOverlapsHour(booking.startTime, booking.endTime, hour));
            const block = draft.blockedTimes.find((item) =>
              rangeOverlapsHour(item.startTime, item.endTime, hour));
            const active = clockMinutes(draft.availableFrom) < (hour + 1) * 60
              && clockMinutes(draft.availableUntil) > hour * 60;
            const state = protectedBooking ? "protected" : block ? "blocked" : active ? "open" : "closed";
            const label = protectedBooking
              ? protectedBooking.status === "admin-review"
                ? "Administrator review · Protected"
                : "Confirmed session · Protected"
              : block
                ? blockLabel(block)
                : active
                  ? "Available"
                  : "Outside your working day";

            return <div className={styles[state]} key={hour}>
              <time>{formatAvailabilityTime(`${String(hour).padStart(2, "0")}:00`)}</time>
              <span>{label}</span>
            </div>;
          })}
        </div>

        <div className={styles.controls}>
          <div>
            <label htmlFor="availability-from">Start your day</label>
            <input
              id="availability-from"
              onChange={(event) => updateDraft({ availableFrom: event.target.value })}
              step="3600"
              type="time"
              value={draft.availableFrom}
            />
            <div>
              <button
                disabled={draft.availableFrom === "00:00"}
                onClick={() => updateDraft({ availableFrom: shiftAvailabilityHour(draft.availableFrom, -1) })}
                type="button"
              >Earlier</button>
              <button
                disabled={clockMinutes(draft.availableFrom) + 60 >= clockMinutes(draft.availableUntil)}
                onClick={() => updateDraft({ availableFrom: shiftAvailabilityHour(draft.availableFrom, 1) })}
                type="button"
              >Later</button>
            </div>
          </div>
          <div>
            <label htmlFor="availability-until">End your day</label>
            <input
              id="availability-until"
              onChange={(event) => updateDraft({ availableUntil: event.target.value })}
              step="3600"
              type="time"
              value={draft.availableUntil}
            />
            <div>
              <button
                disabled={clockMinutes(draft.availableUntil) - 60 <= clockMinutes(draft.availableFrom)}
                onClick={() => updateDraft({ availableUntil: shiftAvailabilityHour(draft.availableUntil, -1) })}
                type="button"
              >Earlier</button>
              <button
                disabled={draft.availableUntil === "23:00"}
                onClick={() => updateDraft({ availableUntil: shiftAvailabilityHour(draft.availableUntil, 1) })}
                type="button"
              >Later</button>
            </div>
          </div>
        </div>

        <section className={styles.blocks} aria-labelledby="unavailable-blocks-title">
          <header>
            <div>
              <p className="ds-eyebrow">Breaks and personal time</p>
              <h3 id="unavailable-blocks-title">Unavailable blocks</h3>
            </div>
            <button onClick={addBlock} type="button">+ Add block</button>
          </header>
          {draft.blockedTimes.length
            ? <div className={styles.blockList}>
                {draft.blockedTimes.map((block, index) => <fieldset key={`${index}-${block.startTime}`}>
                  <legend>Block {index + 1}</legend>
                  <label>
                    Starts
                    <input
                      aria-label={`Block ${index + 1} start`}
                      onChange={(event) => updateBlock(index, { startTime: event.target.value })}
                      step="3600"
                      type="time"
                      value={block.startTime}
                    />
                  </label>
                  <label>
                    Ends
                    <input
                      aria-label={`Block ${index + 1} end`}
                      onChange={(event) => updateBlock(index, { endTime: event.target.value })}
                      step="3600"
                      type="time"
                      value={block.endTime}
                    />
                  </label>
                  <label>
                    Purpose
                    <select
                      aria-label={`Block ${index + 1} reason`}
                      onChange={(event) => updateBlock(index, {
                        reason: event.target.value as AvailabilityBlockInput["reason"],
                      })}
                      value={block.reason}
                    >
                      <option value="lunch">Lunch</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="other">Personal time</option>
                    </select>
                  </label>
                  <button
                    aria-label={`Remove block ${index + 1}`}
                    onClick={() => updateDraft({
                      blockedTimes: draft.blockedTimes.filter((_, position) => position !== index),
                    })}
                    type="button"
                  >Remove</button>
                </fieldset>)}
              </div>
            : <p className={styles.noBlocks}>No breaks or unavailable periods are set for this day.</p>}
        </section>

        <div className={styles.saveBar}>
          <div>
            <span>{dirty ? "Changes ready to save" : "Your day is protected"}</span>
            <strong>{formatAvailabilityRange(draft.availableFrom, draft.availableUntil)}</strong>
          </div>
          <button disabled={!dirty || savingDayID === key} onClick={save} type="button">
            {savingDayID === key ? "Saving availability…" : dirty ? "Save this day" : "Availability saved"}
          </button>
        </div>

        <p className={styles.message} role="status">{messages[key]}</p>
        <p className={styles.protectionNote}><span aria-hidden="true">◇</span> Confirmed reservations and administrator-protected sessions cannot be removed or blocked from this screen.</p>
        <Link className={styles.scheduleLink} href="/account/my-schedule">Open My Protected Schedule →</Link>
      </section>
    </div>
  </main>;
}
