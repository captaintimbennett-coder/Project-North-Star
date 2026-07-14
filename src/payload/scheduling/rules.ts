import type { CollectionBeforeChangeHook } from "payload";
import { hasAccountRole, isStaff } from "../access/account";
import { acquireSchedulingLock } from "./lock";

type RelationshipValue = number | string | { id: number | string } | null | undefined;

type TimeBlock = {
  endTime?: string | null;
  startTime?: string | null;
};

type AvailabilityInput = {
  artist?: RelationshipValue;
  availableFrom?: string | null;
  availableUntil?: string | null;
  blockedTimes?: TimeBlock[] | null;
  date?: string | null;
  event?: RelationshipValue;
};

type BookingInput = {
  adminOverride?: boolean | null;
  artist?: RelationshipValue;
  endAt?: string | null;
  event?: RelationshipValue;
  exceptionReason?: string | null;
  photographer?: RelationshipValue;
  startAt?: string | null;
  status?: string | null;
};

const ACTIVE_BOOKING_STATUSES = ["confirmed", "admin-review"];
const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function relationshipId(value: RelationshipValue): number | string | undefined {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id;
}

function minutes(clock: string): number {
  const [hours, mins] = clock.split(":").map(Number);
  return hours * 60 + mins;
}

function localParts(value: string, timeZone: string): { clock: string; day: string } {
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

function storedDay(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function assertClock(value: string | null | undefined, label: string): asserts value is string {
  if (!value || !CLOCK_PATTERN.test(value)) {
    throw new Error(`${label} must use 24-hour HH:MM format.`);
  }
}

function assertRequiredRelationship(value: RelationshipValue, label: string): number | string {
  const id = relationshipId(value);
  if (id === undefined) throw new Error(`${label} is required.`);
  return id;
}

async function eventArtistSchedulingContext(
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
  eventId: number | string,
  artistId: number | string,
): Promise<{ endDay?: string; minimumHours: number; startDay?: string; timeZone: string }> {
  const event = await req.payload.findByID({
    collection: "retreat-events",
    id: eventId,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const assignment = event.participatingArtists?.find((item) => relationshipId(item.artist) === artistId);
  if (!assignment || !["confirmed", "approved"].includes(assignment.participationStatus)) {
    throw new Error("The artist must be confirmed or approved for this retreat event.");
  }
  const timeZone = event.timeZone || "America/Chicago";
  return {
    endDay: event.endDate ? localParts(event.endDate, timeZone).day : undefined,
    minimumHours: Number(assignment.minimumBookingHours || 1),
    startDay: event.startDate ? localParts(event.startDate, timeZone).day : undefined,
    timeZone,
  };
}

async function assertOwnParticipantProfile(
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
  collection: "model-profiles" | "photographer-profiles",
  profileId: number | string,
  role: "model" | "photographer",
): Promise<void> {
  if (isStaff(req.user)) return;
  if (!hasAccountRole(req.user, role)) throw new Error("This account cannot manage this scheduling record.");
  const profile = await req.payload.findByID({ collection, id: profileId, depth: 0, overrideAccess: true, req });
  if (relationshipId(profile.account) !== req.user?.id) {
    throw new Error("This scheduling record must belong to the signed-in participant.");
  }
}

async function assertEventPhotographer(
  req: Parameters<CollectionBeforeChangeHook>[0]["req"],
  eventId: number | string,
  photographerId: number | string,
): Promise<void> {
  const event = await req.payload.findByID({
    collection: "retreat-events",
    id: eventId,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const participant = event.participatingPhotographers?.find(
    (item) => relationshipId(item.photographer) === photographerId,
  );
  if (!participant || participant.participationStatus !== "approved") {
    throw new Error("The photographer must be approved for this retreat event.");
  }
}

export const protectConfirmedBookingsFromAvailability: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const next = data as AvailabilityInput;
  const prior = (originalDoc || {}) as AvailabilityInput & { id?: number | string };
  const eventId = assertRequiredRelationship(next.event ?? prior.event, "Event");
  const artistId = assertRequiredRelationship(next.artist ?? prior.artist, "Artist");
  const date = next.date ?? prior.date;
  if (!date) throw new Error("Availability date is required.");
  await assertOwnParticipantProfile(req, "model-profiles", artistId, "model");

  const availableFrom = next.availableFrom ?? prior.availableFrom ?? "06:00";
  const availableUntil = next.availableUntil ?? prior.availableUntil ?? "18:00";
  assertClock(availableFrom, "Available from");
  assertClock(availableUntil, "Available until");
  if (minutes(availableUntil) <= minutes(availableFrom)) {
    throw new Error("Availability must end after it begins.");
  }

  const blocks = next.blockedTimes ?? prior.blockedTimes ?? [];
  for (const block of blocks) {
    assertClock(block.startTime, "Blocked time start");
    assertClock(block.endTime, "Blocked time end");
    if (minutes(block.endTime) <= minutes(block.startTime)) {
      throw new Error("Every blocked time must end after it begins.");
    }
  }

  const { endDay, startDay, timeZone } = await eventArtistSchedulingContext(req, eventId, artistId);
  const availabilityDay = storedDay(date);
  if ((startDay && availabilityDay < startDay) || (endDay && availabilityDay > endDay)) {
    throw new Error("Availability must fall on a retreat event day.");
  }
  await acquireSchedulingLock(req, eventId, artistId, availabilityDay);

  const duplicate = await req.payload.find({
    collection: "artist-availability",
    where: {
      and: [
        { event: { equals: eventId } },
        { artist: { equals: artistId } },
        { date: { equals: date } },
        ...(operation === "update" && prior.id ? [{ id: { not_equals: prior.id } }] : []),
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  });
  if (duplicate.totalDocs > 0) {
    throw new Error("Only one availability record is allowed per artist, event, and day.");
  }

  const bookings = await req.payload.find({
    collection: "retreat-bookings",
    where: {
      and: [
        { event: { equals: eventId } },
        { artist: { equals: artistId } },
        { status: { in: ACTIVE_BOOKING_STATUSES } },
      ],
    },
    depth: 0,
    limit: 200,
    overrideAccess: true,
    req,
  });

  for (const booking of bookings.docs.filter((item) => localParts(item.startAt, timeZone).day === storedDay(date))) {
    const bookingStart = minutes(localParts(booking.startAt, timeZone).clock);
    const bookingEnd = minutes(localParts(booking.endAt, timeZone).clock);
    if (bookingStart < minutes(availableFrom) || bookingEnd > minutes(availableUntil)) {
      throw new Error("Availability cannot exclude an existing confirmed booking.");
    }
    if (
      blocks.some((block) =>
        bookingStart < minutes(block.endTime as string) && bookingEnd > minutes(block.startTime as string),
      )
    ) {
      throw new Error("Blocked time cannot overlap an existing confirmed booking.");
    }
  }

  return data;
};

export const validateRetreatBooking: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const next = data as BookingInput;
  const prior = (originalDoc || {}) as BookingInput & { id?: number | string };
  const eventId = assertRequiredRelationship(next.event ?? prior.event, "Event");
  const artistId = assertRequiredRelationship(next.artist ?? prior.artist, "Artist");
  const photographerId = assertRequiredRelationship(
    next.photographer ?? prior.photographer,
    "Photographer",
  );
  const startAt = next.startAt ?? prior.startAt;
  const endAt = next.endAt ?? prior.endAt;
  const status = next.status ?? prior.status ?? "confirmed";
  const adminOverride = next.adminOverride ?? prior.adminOverride ?? false;
  const exceptionReason = next.exceptionReason ?? prior.exceptionReason;
  if (!startAt || !endAt) throw new Error("Booking start and end times are required.");
  await assertOwnParticipantProfile(req, "photographer-profiles", photographerId, "photographer");
  if (!isStaff(req.user) && (status !== "confirmed" || adminOverride)) {
    throw new Error("Participant bookings must be immediately confirmed without an administrator override.");
  }
  if (isStaff(req.user) && (adminOverride || ["cancelled", "rescheduled", "admin-review"].includes(status)) && !exceptionReason?.trim()) {
    throw new Error("An administrator reason is required for overrides, cancellations, reschedules, and exceptions.");
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;
  if (durationMinutes <= 0 || durationMinutes % 60 !== 0) {
    throw new Error("Bookings must use consecutive 60-minute blocks.");
  }
  const { endDay, minimumHours, startDay, timeZone } = await eventArtistSchedulingContext(req, eventId, artistId);
  const startLocal = localParts(startAt, timeZone);
  const endLocal = localParts(endAt, timeZone);
  if (!startLocal.clock.endsWith(":00") || !endLocal.clock.endsWith(":00")) {
    throw new Error("Bookings must begin and end on whole event-local hours.");
  }
  if (startLocal.day !== endLocal.day) {
    throw new Error("A Version 1 booking must begin and end on the same retreat day.");
  }
  if ((startDay && startLocal.day < startDay) || (endDay && startLocal.day > endDay)) {
    throw new Error("Bookings must fall on a retreat event day.");
  }
  await acquireSchedulingLock(req, eventId, artistId, startLocal.day);

  await assertEventPhotographer(req, eventId, photographerId);
  if (durationMinutes < minimumHours * 60) {
    throw new Error(`This artist requires a minimum booking of ${minimumHours} hour(s).`);
  }

  const [artist, photographer] = await Promise.all([
    req.payload.findByID({ collection: "model-profiles", id: artistId, depth: 0, overrideAccess: true, req }),
    req.payload.findByID({
      collection: "photographer-profiles",
      id: photographerId,
      depth: 0,
      overrideAccess: true,
      req,
    }),
  ]);
  for (const [label, profile] of [
    ["Artist", artist],
    ["Photographer", photographer],
  ] as const) {
    if (!profile.bookingPreferences?.email || !profile.bookingPreferences.shareEmail) {
      throw new Error(`${label} must approve a booking email before confirmation.`);
    }
    if (!profile.bookingPreferences.notifyByEmail) {
      throw new Error(`${label} must keep required email notifications enabled.`);
    }
  }

  if (ACTIVE_BOOKING_STATUSES.includes(status)) {
    const conflicts = await req.payload.find({
      collection: "retreat-bookings",
      where: {
        and: [
          { event: { equals: eventId } },
          { status: { in: ACTIVE_BOOKING_STATUSES } },
          { startAt: { less_than: endAt } },
          { endAt: { greater_than: startAt } },
          {
            or: [
              { artist: { equals: artistId } },
              { photographer: { equals: photographerId } },
            ],
          },
          ...(prior.id ? [{ id: { not_equals: prior.id } }] : []),
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    });
    if (conflicts.totalDocs > 0) {
      throw new Error("This time conflicts with an existing confirmed reservation.");
    }

    const availability = await req.payload.find({
      collection: "artist-availability",
      where: {
        and: [
          { event: { equals: eventId } },
          { artist: { equals: artistId } },
          { date: { equals: `${startLocal.day}T00:00:00.000Z` } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    });
    const schedule = availability.docs[0];
    if (!schedule && !adminOverride) {
      throw new Error("No artist availability exists for this retreat day.");
    }
    if (schedule && !adminOverride) {
      const bookingStart = minutes(startLocal.clock);
      const bookingEnd = minutes(endLocal.clock);
      if (bookingStart < minutes(schedule.availableFrom) || bookingEnd > minutes(schedule.availableUntil)) {
        throw new Error("The booking falls outside the artist's available hours.");
      }
      if (
        schedule.blockedTimes?.some(
          (block) =>
            bookingStart < minutes(block.endTime) && bookingEnd > minutes(block.startTime),
        )
      ) {
        throw new Error("The booking overlaps an unavailable time block.");
      }
    }
  }

  if (originalDoc && isStaff(req.user) && (
    startAt !== prior.startAt || endAt !== prior.endAt || status !== prior.status ||
    artistId !== relationshipId(prior.artist) || photographerId !== relationshipId(prior.photographer)
  )) {
    return { ...data, administratorChangedAt: new Date().toISOString() };
  }

  return data;
};
