import config from "@payload-config";
import { getPayload, type Payload, type PayloadRequest } from "payload";
import type { Media, User } from "@/payload-types";
import { dispatchSchedulingEmailsForBooking } from "@/lib/email/scheduling-email";
import {
  buildAvailabilityRanges,
  eventLocalDateTimeToUTC,
  eventLocalParts,
} from "@/lib/scheduling/availability-ranges";

type RelationshipValue = number | string | { id: number | string } | null | undefined;
const ACTIVE_STATUSES = ["confirmed", "admin-review"] as const;
type SchedulingContext = {
  dispatchEmails?: boolean;
  payload?: Payload;
  req?: PayloadRequest;
};

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

async function dispatchCommittedBookingEmails(
  payload: Payload,
  bookingID: number | string,
  context: SchedulingContext,
) {
  if (context.dispatchEmails === false || context.req) return;
  try {
    await dispatchSchedulingEmailsForBooking(payload, bookingID);
  } catch (error) {
    payload.logger.error({
      booking: bookingID,
      error: error instanceof Error ? error.message : String(error),
    }, "Scheduling email dispatch could not start after booking confirmation.");
  }
}

export type BookingRangeOption = {
  artistId: number;
  artistImage: {
    alt: string;
    height: number;
    src: string;
    width: number;
  } | null;
  artistMinimumHours: number;
  artistName: string;
  day: string;
  durationHours: number;
  endAt: string;
  eventId: number;
  eventTitle: string;
  startAt: string;
  timeZone: string;
};

function approvedBookingImage(
  image: number | Media | null | undefined,
  usagePermissionConfirmed: boolean | null | undefined,
): BookingRangeOption["artistImage"] {
  if (
    !image
    || typeof image === "number"
    || image.usageApproved !== true
    || usagePermissionConfirmed !== true
    || !image.url
  ) {
    return null;
  }
  const rendition = image.sizes?.card;
  return {
    alt: image.alt,
    height: rendition?.height || image.height || 1125,
    src: rendition?.url || image.url,
    width: rendition?.width || image.width || 900,
  };
}

async function photographerProfile(payload: Payload, account: User, req?: PayloadRequest) {
  const result = await payload.find({
    collection: "photographer-profiles",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    user: account,
    where: { account: { equals: account.id } },
  });
  return result.docs[0] ?? null;
}

export async function getPhotographerBookingOptions(
  account: User,
  context: SchedulingContext = {},
): Promise<BookingRangeOption[]> {
  const payload = context.payload ?? await getPayload({ config });
  const photographer = await photographerProfile(payload, account, context.req);
  if (!photographer) return [];

  const events = await payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    req: context.req,
    where: { lifecycleStatus: { in: ["published", "closed"] } },
  });
  const eligibleEvents = events.docs.filter((event) => event.participatingPhotographers?.some((entry) =>
    relationshipID(entry.photographer) === photographer.id && entry.participationStatus === "approved"));
  const options: BookingRangeOption[] = [];

  for (const event of eligibleEvents) {
    const timeZone = event.timeZone || "America/Chicago";
    const existing = await payload.find({
      collection: "retreat-bookings", depth: 0, limit: 500, overrideAccess: true, pagination: false,
      req: context.req,
      where: { and: [{ event: { equals: event.id } }, { status: { in: [...ACTIVE_STATUSES] } }] },
    });
    for (const assignment of event.participatingArtists ?? []) {
      if (!["confirmed", "approved"].includes(assignment.participationStatus)) continue;
      const artistId = Number(relationshipID(assignment.artist));
      if (!Number.isInteger(artistId)) continue;
      const artist = await payload.findByID({
        collection: "model-profiles",
        id: artistId,
        depth: 1,
        overrideAccess: true,
        req: context.req,
      });
      if (artist.approvalStatus !== "approved") continue;
      const artistImage = approvedBookingImage(
        artist.featuredImage,
        artist.usagePermissionConfirmed,
      );
      const availability = await payload.find({
        collection: "artist-availability", depth: 0, limit: 20, overrideAccess: true, pagination: false,
        req: context.req,
        sort: "date", where: { and: [{ event: { equals: event.id } }, { artist: { equals: artistId } }] },
      });
      const minimum = Number(assignment.minimumBookingHours || 1);
      for (const schedule of availability.docs) {
        const day = new Date(schedule.date).toISOString().slice(0, 10);
        const busyRanges = existing.docs.flatMap((booking) => {
          if (relationshipID(booking.artist) !== artistId && relationshipID(booking.photographer) !== photographer.id) {
            return [];
          }
          const start = eventLocalParts(booking.startAt, timeZone);
          const end = eventLocalParts(booking.endAt, timeZone);
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
          minimumHours: minimum,
        });
        for (const range of ranges) {
          options.push({
            artistId,
            artistImage,
            artistMinimumHours: minimum,
            artistName: artist.displayName,
            day,
            durationHours: range.durationHours,
            endAt: eventLocalDateTimeToUTC(day, range.endClock, timeZone),
            eventId: event.id,
            eventTitle: event.title,
            startAt: eventLocalDateTimeToUTC(day, range.startClock, timeZone),
            timeZone,
          });
        }
      }
    }
  }
  return options;
}

type BookingInput = {
  artistId: number;
  endAt: string;
  eventId: number;
  idempotencyKey: string;
  startAt: string;
};

export function isBookingConflictError(error: unknown) {
  let current = error;
  const visited = new Set<unknown>();
  while (current && !visited.has(current)) {
    visited.add(current);
    if (typeof current === "object") {
      const candidate = current as {
        cause?: unknown;
        code?: unknown;
        constraint?: unknown;
        message?: unknown;
      };
      if (candidate.code === "23P01" || candidate.code === "23505") return true;
      if (
        typeof candidate.constraint === "string"
        && /retreat_bookings_(artist|photographer)_no_overlap|idempotency/i.test(candidate.constraint)
      ) {
        return true;
      }
      if (
        typeof candidate.message === "string"
        && /conflict|overlap|exclude|exclusion constraint|unique|available/i.test(candidate.message)
      ) {
        return true;
      }
      current = candidate.cause;
      continue;
    }
    if (/conflict|overlap|exclude|unique|available/i.test(String(current))) return true;
    break;
  }
  return false;
}

function sameBookingRequest(
  booking: {
    artist: RelationshipValue;
    endAt: string;
    event: RelationshipValue;
    photographer: RelationshipValue;
    startAt: string;
  },
  photographerId: number | string,
  input: BookingInput,
) {
  return String(relationshipID(booking.photographer)) === String(photographerId)
    && String(relationshipID(booking.artist)) === String(input.artistId)
    && String(relationshipID(booking.event)) === String(input.eventId)
    && new Date(booking.startAt).getTime() === new Date(input.startAt).getTime()
    && new Date(booking.endAt).getTime() === new Date(input.endAt).getTime();
}

export async function confirmPhotographerBooking(
  account: User,
  input: BookingInput,
  context: SchedulingContext = {},
) {
  const payload = context.payload ?? await getPayload({ config });
  const photographer = await photographerProfile(payload, account, context.req);
  if (!photographer) throw new Error("No photographer profile is linked to this account.");
  const findExisting = () => payload.find({
    collection: "retreat-bookings", depth: 0, limit: 1, overrideAccess: true,
    req: context.req,
    user: account,
    where: { idempotencyKey: { equals: input.idempotencyKey } },
  });
  const existing = await findExisting();
  if (existing.docs[0]) {
    if (!sameBookingRequest(existing.docs[0], photographer.id, input)) {
      throw new Error("This idempotency key belongs to a different booking request.");
    }
    await dispatchCommittedBookingEmails(payload, existing.docs[0].id, context);
    return { ...existing.docs[0], replayed: true };
  }
  try {
    const booking = await payload.create({
      collection: "retreat-bookings",
      data: {
        artist: input.artistId,
        endAt: input.endAt,
        event: input.eventId,
        idempotencyKey: input.idempotencyKey,
        photographer: photographer.id,
        startAt: input.startAt,
        status: "confirmed",
      },
      overrideAccess: false,
      req: context.req,
      user: account,
    });
    await dispatchCommittedBookingEmails(payload, booking.id, context);
    return { ...booking, replayed: false };
  } catch (error) {
    if (!isBookingConflictError(error)) throw error;
    const retry = await findExisting();
    if (!retry.docs[0] || !sameBookingRequest(retry.docs[0], photographer.id, input)) throw error;
    await dispatchCommittedBookingEmails(payload, retry.docs[0].id, context);
    return { ...retry.docs[0], replayed: true };
  }
}
