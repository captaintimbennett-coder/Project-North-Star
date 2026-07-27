import type {
  AdministratorMasterCalendarBooking,
  AdministratorMasterCalendarEvent,
} from "@/lib/auth/administrator-master-calendar-projection";
import {
  buildAvailabilityRanges,
  enumerateEventDays,
  eventLocalDateTimeToUTC,
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

export type AdministratorRescheduleOption = {
  day: string;
  endAt: string;
  startAt: string;
};

type AdministratorRescheduleAvailability = {
  availableFrom: string;
  availableUntil: string;
  blockedTimes?: {
    endTime: string;
    startTime: string;
  }[] | null;
  date: string;
};

type AdministratorRescheduleBooking = {
  artistId: number | string;
  endAt: string;
  id: number | string;
  photographerId: number | string;
  startAt: string;
  status: AdministratorMasterCalendarBooking["status"];
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
  item: Pick<AdministratorMasterCalendarBooking, "status">,
) {
  return item.status === "confirmed" || item.status === "admin-review";
}

export function isCancellableAdministratorBooking(
  item: AdministratorMasterCalendarBooking,
) {
  return isActiveAdministratorBooking(item);
}

export function isReschedulableAdministratorBooking(
  item: AdministratorMasterCalendarBooking,
) {
  return isActiveAdministratorBooking(item);
}

export function normalizedAdministratorChangeReason(reason: string) {
  const value = reason.trim();
  return value.length >= 3 ? value : null;
}

export function normalizedAdministratorCancellationReason(reason: string) {
  return normalizedAdministratorChangeReason(reason);
}

export function buildAdministratorRescheduleOptions(input: {
  artistId: number | string;
  availability: AdministratorRescheduleAvailability[];
  bookings: AdministratorRescheduleBooking[];
  currentBookingId: number | string;
  currentEndAt: string;
  currentStartAt: string;
  photographerId: number | string;
  timeZone: string;
}): AdministratorRescheduleOption[] {
  const durationMilliseconds =
    new Date(input.currentEndAt).getTime()
    - new Date(input.currentStartAt).getTime();
  const durationHours = durationMilliseconds / 3_600_000;
  if (
    !Number.isInteger(durationHours)
    || durationHours < 1
  ) {
    throw new Error(
      "The current booking must use a positive whole-hour duration.",
    );
  }

  const options = new Map<string, AdministratorRescheduleOption>();
  const sameRelationship = (
    left: number | string,
    right: number | string,
  ) => String(left) === String(right);

  for (const schedule of [...input.availability].sort((left, right) =>
    left.date.localeCompare(right.date))) {
    const day = schedule.date.slice(0, 10);
    const busyRanges = input.bookings.flatMap((booking) => {
      if (
        sameRelationship(booking.id, input.currentBookingId)
        || !isActiveAdministratorBooking(booking)
        || (
          !sameRelationship(booking.artistId, input.artistId)
          && !sameRelationship(booking.photographerId, input.photographerId)
        )
      ) {
        return [];
      }

      const start = eventLocalParts(booking.startAt, input.timeZone);
      const end = eventLocalParts(booking.endAt, input.timeZone);
      if (start.day !== day || end.day !== day) return [];
      return [{ endClock: end.clock, startClock: start.clock }];
    });
    const ranges = buildAvailabilityRanges({
      availableFrom: schedule.availableFrom,
      availableUntil: schedule.availableUntil,
      blockedRanges: schedule.blockedTimes?.map((block) => ({
        endClock: block.endTime,
        startClock: block.startTime,
      })),
      busyRanges,
      minimumHours: durationHours,
    });

    for (const range of ranges) {
      if (range.durationHours !== durationHours) continue;
      const option = {
        day,
        endAt: eventLocalDateTimeToUTC(
          day,
          range.endClock,
          input.timeZone,
        ),
        startAt: eventLocalDateTimeToUTC(
          day,
          range.startClock,
          input.timeZone,
        ),
      };
      if (
        new Date(option.startAt).getTime()
          === new Date(input.currentStartAt).getTime()
        && new Date(option.endAt).getTime()
          === new Date(input.currentEndAt).getTime()
      ) {
        continue;
      }
      options.set(`${option.startAt}|${option.endAt}`, option);
    }
  }

  return [...options.values()].sort((left, right) =>
    left.startAt.localeCompare(right.startAt));
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
  item: Pick<AdministratorMasterCalendarBooking, "endAt" | "startAt">,
  timeZone: string,
) {
  return `${formatAdministratorMasterCalendarTime(item.startAt, timeZone)}–${formatAdministratorMasterCalendarTime(item.endAt, timeZone)}`;
}

export function formatAdministratorRescheduleDay(day: string) {
  return formatDay(day, {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

export function formatAdministratorMasterCalendarHour(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  return `${normalized % 12 || 12} ${suffix}`;
}
