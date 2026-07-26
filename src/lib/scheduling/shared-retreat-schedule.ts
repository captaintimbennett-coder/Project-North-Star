import type {
  SharedRetreatScheduleEvent,
  SharedRetreatScheduleItem,
} from "@/lib/auth/schedule-projection";
import {
  enumerateEventDays,
  eventLocalParts,
} from "@/lib/scheduling/availability-ranges";

export type SharedRetreatScheduleDay = {
  date: string;
  dateLabel: string;
  eventId: number;
  eventTitle: string;
  id: string;
  items: SharedRetreatScheduleItem[];
  shortLabel: string;
  timeZone: string;
};

export type SharedRetreatScheduleArtist = {
  items: SharedRetreatScheduleItem[];
  name: string;
};

function formatDay(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

export function buildSharedRetreatScheduleDays(
  events: SharedRetreatScheduleEvent[],
): SharedRetreatScheduleDay[] {
  return events.flatMap((event) => {
    const firstDay = eventLocalParts(event.startAt, event.timeZone).day;
    const finalDay = eventLocalParts(event.endAt, event.timeZone).day;

    return enumerateEventDays(firstDay, finalDay).map((date) => ({
      date,
      dateLabel: formatDay(date, {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric",
      }),
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      id: `${event.eventId}|${date}`,
      items: event.items.filter((item) =>
        eventLocalParts(item.startAt, event.timeZone).day === date),
      shortLabel: formatDay(date, {
        day: "numeric",
        month: "short",
        weekday: "short",
      }),
      timeZone: event.timeZone,
    }));
  });
}

export function groupSharedScheduleByArtist(
  items: SharedRetreatScheduleItem[],
): SharedRetreatScheduleArtist[] {
  const artists = new Map<string, SharedRetreatScheduleItem[]>();

  for (const item of [...items].sort((left, right) =>
    left.artistName.localeCompare(right.artistName)
    || left.startAt.localeCompare(right.startAt))) {
    const existing = artists.get(item.artistName) ?? [];
    existing.push(item);
    artists.set(item.artistName, existing);
  }

  return [...artists.entries()].map(([name, artistItems]) => ({
    items: artistItems,
    name,
  }));
}

export function sharedScheduleHour(value: string, timeZone: string) {
  const local = eventLocalParts(value, timeZone).clock;
  const [hour, minute] = local.split(":").map(Number);
  return hour + minute / 60;
}

export function sharedScheduleHourRange(day: SharedRetreatScheduleDay) {
  const starts = day.items.map((item) =>
    Math.floor(sharedScheduleHour(item.startAt, day.timeZone)));
  const ends = day.items.map((item) =>
    Math.ceil(sharedScheduleHour(item.endAt, day.timeZone)));
  const firstHour = Math.min(6, ...starts);
  const finalHour = Math.max(20, ...ends);

  return {
    firstHour,
    hours: Array.from(
      { length: Math.max(1, finalHour - firstHour) },
      (_, index) => firstHour + index,
    ),
    span: Math.max(1, finalHour - firstHour),
  };
}

export function formatSharedScheduleTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatSharedScheduleRange(
  item: SharedRetreatScheduleItem,
  timeZone: string,
) {
  return `${formatSharedScheduleTime(item.startAt, timeZone)}–${formatSharedScheduleTime(item.endAt, timeZone)}`;
}

export function formatSharedScheduleHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  return `${normalized % 12 || 12} ${suffix}`;
}
