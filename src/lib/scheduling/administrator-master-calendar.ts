import type {
  AdministratorMasterCalendarBooking,
  AdministratorMasterCalendarEvent,
} from "@/lib/auth/administrator-master-calendar-projection";
import {
  enumerateEventDays,
  eventLocalParts,
} from "@/lib/scheduling/availability-ranges";

export type AdministratorMasterCalendarDay = {
  date: string;
  dateLabel: string;
  eventId: number;
  eventTitle: string;
  id: string;
  items: AdministratorMasterCalendarBooking[];
  shortLabel: string;
  timeZone: string;
};

export type AdministratorMasterCalendarArtist = {
  items: AdministratorMasterCalendarBooking[];
  name: string;
};

export const administratorBookingStatusLabels = {
  "admin-review": "Administrator review",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
} as const;

function formatDay(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

export function buildAdministratorMasterCalendarDays(
  events: AdministratorMasterCalendarEvent[],
): AdministratorMasterCalendarDay[] {
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

export function groupAdministratorBookingsByArtist(
  items: AdministratorMasterCalendarBooking[],
): AdministratorMasterCalendarArtist[] {
  const artists = new Map<string, AdministratorMasterCalendarBooking[]>();

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

export function isActiveAdministratorBooking(
  item: AdministratorMasterCalendarBooking,
) {
  return item.status === "confirmed" || item.status === "admin-review";
}

export function administratorMasterCalendarHour(
  value: string,
  timeZone: string,
) {
  const local = eventLocalParts(value, timeZone).clock;
  const [hour, minute] = local.split(":").map(Number);
  return hour + minute / 60;
}

export function administratorMasterCalendarHourRange(
  day: AdministratorMasterCalendarDay,
) {
  const activeItems = day.items.filter(isActiveAdministratorBooking);
  const starts = activeItems.map((item) =>
    Math.floor(administratorMasterCalendarHour(item.startAt, day.timeZone)));
  const ends = activeItems.map((item) =>
    Math.ceil(administratorMasterCalendarHour(item.endAt, day.timeZone)));
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

export function formatAdministratorMasterCalendarTime(
  value: string,
  timeZone: string,
) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatAdministratorMasterCalendarRange(
  item: AdministratorMasterCalendarBooking,
  timeZone: string,
) {
  return `${formatAdministratorMasterCalendarTime(item.startAt, timeZone)}–${formatAdministratorMasterCalendarTime(item.endAt, timeZone)}`;
}

export function formatAdministratorMasterCalendarHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  return `${normalized % 12 || 12} ${suffix}`;
}
