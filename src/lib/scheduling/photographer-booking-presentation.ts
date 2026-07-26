import type { BookingRangeOption } from "@/lib/scheduling/booking-service";

export type BookingDayChoice = {
  dateLabel: string;
  day: string;
  eventId: number;
  eventTitle: string;
  id: string;
  shortLabel: string;
  timeZone: string;
};

export type BookingStartChoice = {
  clock: string;
  label: string;
  startAt: string;
};

export type BookingHourChoice = {
  available: boolean;
  clock: string;
  label: string;
  startAt?: string;
};

export function bookingDayID(option: Pick<BookingRangeOption, "day" | "eventId">) {
  return `${option.eventId}|${option.day}`;
}

export function bookingOptionID(
  option: Pick<BookingRangeOption, "artistId" | "endAt" | "eventId" | "startAt">,
) {
  return `${option.eventId}|${option.artistId}|${option.startAt}|${option.endAt}`;
}

export function formatBookingDate(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function formatBookingShortDate(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function formatBookingTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function bookingClock(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || "";
  return `${part("hour")}:${part("minute")}`;
}

export function formatBookingRange(
  option: Pick<BookingRangeOption, "endAt" | "startAt" | "timeZone">,
) {
  return `${formatBookingTime(option.startAt, option.timeZone)}–${formatBookingTime(option.endAt, option.timeZone)}`;
}

export function getBookingDays(options: BookingRangeOption[]): BookingDayChoice[] {
  const days = new Map<string, BookingDayChoice>();
  for (const option of options) {
    const id = bookingDayID(option);
    if (!days.has(id)) {
      days.set(id, {
        dateLabel: formatBookingDate(option.day),
        day: option.day,
        eventId: option.eventId,
        eventTitle: option.eventTitle,
        id,
        shortLabel: formatBookingShortDate(option.day),
        timeZone: option.timeZone,
      });
    }
  }
  return [...days.values()].sort((a, b) =>
    a.day.localeCompare(b.day) || a.eventTitle.localeCompare(b.eventTitle));
}

export function getBookingStartChoices(
  options: BookingRangeOption[],
  dayId: string,
): BookingStartChoice[] {
  const starts = new Map<string, BookingStartChoice>();
  for (const option of options) {
    if (bookingDayID(option) !== dayId || starts.has(option.startAt)) continue;
    starts.set(option.startAt, {
      clock: bookingClock(option.startAt, option.timeZone),
      label: formatBookingTime(option.startAt, option.timeZone),
      startAt: option.startAt,
    });
  }
  return [...starts.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function getBookingDurations(
  options: BookingRangeOption[],
  dayId: string,
  startAt: string,
) {
  return [...new Set(options
    .filter((option) => bookingDayID(option) === dayId && option.startAt === startAt)
    .map((option) => option.durationHours))]
    .sort((a, b) => a - b);
}

export function getBookingArtists(
  options: BookingRangeOption[],
  dayId: string,
  startAt: string,
  durationHours: number,
) {
  return options
    .filter((option) =>
      bookingDayID(option) === dayId
      && option.startAt === startAt
      && option.durationHours === durationHours)
    .sort((a, b) => a.artistName.localeCompare(b.artistName));
}

export function getBookingHourChoices(
  options: BookingRangeOption[],
  dayId: string,
): BookingHourChoice[] {
  const dayOptions = options.filter((option) => bookingDayID(option) === dayId);
  if (!dayOptions.length) return [];
  const starts = getBookingStartChoices(options, dayId);
  const startByClock = new Map(starts.map((choice) => [choice.clock, choice]));
  const observedStartHours = starts.map((choice) => Number(choice.clock.slice(0, 2)));
  const observedEndHours = dayOptions.map((option) =>
    Number(bookingClock(option.endAt, option.timeZone).slice(0, 2)));
  const firstHour = Math.min(6, ...observedStartHours);
  const finalHour = Math.max(20, ...observedEndHours);

  return Array.from({ length: finalHour - firstHour }, (_, index) => {
    const hour = firstHour + index;
    const clock = `${String(hour).padStart(2, "0")}:00`;
    const start = startByClock.get(clock);
    const representative = dayOptions[0];
    const localDate = new Date(representative.startAt);
    localDate.setTime(localDate.getTime() + (hour - Number(
      bookingClock(representative.startAt, representative.timeZone).slice(0, 2),
    )) * 3_600_000);
    return {
      available: Boolean(start),
      clock,
      label: start?.label ?? formatBookingTime(localDate.toISOString(), representative.timeZone),
      startAt: start?.startAt,
    };
  });
}
