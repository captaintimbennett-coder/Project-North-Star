const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type LocalTimeRange = {
  endClock: string;
  startClock: string;
};

export type AvailabilityRange = LocalTimeRange & {
  durationHours: number;
};

export function enumerateEventDays(startDay: string, endDay: string): string[] {
  const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!dayPattern.test(startDay) || !dayPattern.test(endDay) || endDay < startDay) {
    throw new Error("A valid event-local date range is required.");
  }

  const days: string[] = [];
  const start = new Date(`${startDay}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDay}T00:00:00.000Z`).getTime();
  for (let cursor = start; cursor <= end; cursor += 86_400_000) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return days;
}

function clockMinutes(clock: string): number {
  if (!CLOCK_PATTERN.test(clock)) {
    throw new Error("Scheduling times must use 24-hour HH:MM format.");
  }
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

function minuteClock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function overlaps(candidate: { end: number; start: number }, range: LocalTimeRange): boolean {
  return candidate.start < clockMinutes(range.endClock) && candidate.end > clockMinutes(range.startClock);
}

export function buildAvailabilityRanges(input: {
  availableFrom: string;
  availableUntil: string;
  blockedRanges?: LocalTimeRange[];
  busyRanges?: LocalTimeRange[];
  minimumHours: number;
}): AvailabilityRange[] {
  const availableFrom = clockMinutes(input.availableFrom);
  const availableUntil = clockMinutes(input.availableUntil);
  const minimumMinutes = input.minimumHours * 60;
  if (!Number.isInteger(input.minimumHours) || input.minimumHours < 1) {
    throw new Error("Minimum booking duration must be a positive whole number of hours.");
  }
  if (availableUntil <= availableFrom) {
    throw new Error("Availability must end after it begins.");
  }

  const blockedRanges = input.blockedRanges ?? [];
  const busyRanges = input.busyRanges ?? [];
  const firstWholeHour = Math.ceil(availableFrom / 60) * 60;
  const lastWholeHour = Math.floor(availableUntil / 60) * 60;
  const ranges: AvailabilityRange[] = [];

  for (let start = firstWholeHour; start + minimumMinutes <= lastWholeHour; start += 60) {
    for (let end = start + minimumMinutes; end <= lastWholeHour; end += 60) {
      const candidate = { end, start };
      if (blockedRanges.some((range) => overlaps(candidate, range))) continue;
      if (busyRanges.some((range) => overlaps(candidate, range))) continue;
      ranges.push({
        durationHours: (end - start) / 60,
        endClock: minuteClock(end),
        startClock: minuteClock(start),
      });
    }
  }

  return ranges;
}

export function eventLocalParts(value: string | Date, timeZone: string): { clock: string; day: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return {
    clock: `${part("hour")}:${part("minute")}`,
    day: `${part("year")}-${part("month")}-${part("day")}`,
  };
}

export function eventLocalDateTimeToUTC(day: string, clock: string, timeZone: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  if (!year || !month || !date || !CLOCK_PATTERN.test(clock)) {
    throw new Error("A valid event-local day and time are required.");
  }

  const target = Date.UTC(year, month - 1, date, hour, minute);
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = eventLocalParts(new Date(candidate), timeZone);
    const [actualYear, actualMonth, actualDay] = parts.day.split("-").map(Number);
    const [actualHour, actualMinute] = parts.clock.split(":").map(Number);
    const represented = Date.UTC(actualYear, actualMonth - 1, actualDay, actualHour, actualMinute);
    candidate += target - represented;
  }

  const result = new Date(candidate);
  const roundTrip = eventLocalParts(result, timeZone);
  if (roundTrip.day !== day || roundTrip.clock !== clock) {
    throw new Error("This local event time does not exist in the event time zone.");
  }
  return result.toISOString();
}
