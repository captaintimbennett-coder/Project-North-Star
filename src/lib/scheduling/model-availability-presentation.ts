const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

export type AvailabilityBlockInput = {
  endTime: string;
  reason: "lunch" | "other" | "unavailable";
  startTime: string;
};

export type AvailabilityDraft = {
  availableFrom: string;
  availableUntil: string;
  blockedTimes: AvailabilityBlockInput[];
};

export type ProtectedAvailabilityTime = {
  endTime: string;
  startTime: string;
};

export function clockMinutes(clock: string) {
  if (!CLOCK.test(clock)) throw new Error("Availability times must use HH:MM format.");
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatAvailabilityTime(clock: string) {
  const minutes = clockMinutes(clock);
  const hour = Math.floor(minutes / 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${suffix}`;
}

export function formatAvailabilityRange(startTime: string, endTime: string) {
  return `${formatAvailabilityTime(startTime)}–${formatAvailabilityTime(endTime)}`;
}

export function shiftAvailabilityHour(clock: string, amount: number) {
  const next = Math.min(23 * 60, Math.max(0, clockMinutes(clock) + amount * 60));
  return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
}

function overlaps(
  left: { endTime: string; startTime: string },
  right: { endTime: string; startTime: string },
) {
  return clockMinutes(left.startTime) < clockMinutes(right.endTime)
    && clockMinutes(left.endTime) > clockMinutes(right.startTime);
}

export function validateAvailabilityDraft(
  draft: AvailabilityDraft,
  protectedTimes: ProtectedAvailabilityTime[],
) {
  try {
    const availableFrom = clockMinutes(draft.availableFrom);
    const availableUntil = clockMinutes(draft.availableUntil);
    if (availableUntil <= availableFrom) return "Your working day must end after it begins.";

    for (const protectedTime of protectedTimes) {
      if (
        clockMinutes(protectedTime.startTime) < availableFrom
        || clockMinutes(protectedTime.endTime) > availableUntil
      ) {
        return "Your working day must continue to include every protected session.";
      }
    }

    for (const [index, block] of draft.blockedTimes.entries()) {
      const start = clockMinutes(block.startTime);
      const end = clockMinutes(block.endTime);
      if (end <= start) return `Unavailable block ${index + 1} must end after it begins.`;
      if (start < availableFrom || end > availableUntil) {
        return `Unavailable block ${index + 1} must stay inside your working day.`;
      }
      if (protectedTimes.some((protectedTime) => overlaps(block, protectedTime))) {
        return "A confirmed or administrator-protected session cannot be marked unavailable.";
      }
      if (draft.blockedTimes.slice(0, index).some((prior) => overlaps(block, prior))) {
        return "Unavailable blocks cannot overlap each other.";
      }
    }
  } catch {
    return "Review the availability times and try again.";
  }

  return null;
}
