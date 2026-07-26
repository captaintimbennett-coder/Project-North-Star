import type { PersonalItineraryItem } from "@/lib/auth/schedule-projection";

export type PersonalScheduleDay = {
  dateLabel: string;
  eventLocation: string;
  eventTimeZone: string;
  eventTitle: string;
  id: string;
  items: PersonalItineraryItem[];
  shortLabel: string;
};

function dateParts(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return {
    day: part("day"),
    month: part("month"),
    year: part("year"),
  };
}

export function scheduleDayKey(value: string, timeZone: string) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function scheduleHour(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
  }).formatToParts(new Date(value));
  const hour = Number(parts.find((item) => item.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((item) => item.type === "minute")?.value ?? 0);
  return hour + minute / 60;
}

export function formatScheduleTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatScheduleRange(item: PersonalItineraryItem) {
  return `${formatScheduleTime(item.startAt, item.eventTimeZone)}–${formatScheduleTime(item.endAt, item.eventTimeZone)}`;
}

export function formatScheduleHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  return `${normalized % 12 || 12}:00 ${suffix}`;
}

export function formatScheduleDuration(minutes: number) {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours.toFixed(1)} hours`;
}

export function buildPersonalScheduleDays(items: PersonalItineraryItem[]): PersonalScheduleDay[] {
  const days = new Map<string, PersonalScheduleDay>();

  for (const item of [...items].sort((left, right) => left.startAt.localeCompare(right.startAt))) {
    const localDay = scheduleDayKey(item.startAt, item.eventTimeZone);
    const id = `${item.eventTitle}|${item.eventTimeZone}|${localDay}`;
    const existing = days.get(id);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    days.set(id, {
      dateLabel: new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        timeZone: item.eventTimeZone,
        year: "numeric",
      }).format(new Date(item.startAt)),
      eventLocation: item.eventLocation,
      eventTimeZone: item.eventTimeZone,
      eventTitle: item.eventTitle,
      id,
      items: [item],
      shortLabel: new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        timeZone: item.eventTimeZone,
        weekday: "short",
      }).format(new Date(item.startAt)),
    });
  }

  return [...days.values()];
}
