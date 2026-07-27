import config from "@payload-config";
import { getPayload, type Payload, type PayloadRequest } from "payload";
import type { RetreatBooking, User } from "@/payload-types";
import { dispatchSchedulingEmailsForBooking } from "@/lib/email/scheduling-email";
import { hasStaffPermission } from "@/payload/access/account";
import {
  buildAdministratorRescheduleOptions,
  isActiveAdministratorBooking,
  type AdministratorRescheduleOption,
} from "@/lib/scheduling/administrator-master-calendar";

type AdminSchedulingContext = {
  dispatchEmails?: boolean;
  payload?: Payload;
  req?: PayloadRequest;
};

type RelationshipValue =
  | number
  | string
  | { id: number | string }
  | null
  | undefined;

export type AdministratorRescheduleOptionSet = {
  durationHours: number;
  options: AdministratorRescheduleOption[];
  timeZone: string;
};

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

function assertSchedulingAdministrator(account: User) {
  if (!hasStaffPermission(account, ["owner", "editor"])) {
    throw new Error("Administrator scheduling access is required.");
  }
}

function assertReason(reason: string) {
  const value = reason.trim();
  if (value.length < 3) {
    throw new Error("A private administrator reason is required.");
  }
  return value;
}

async function dispatchCommittedAdminEmails(
  payload: Payload,
  bookingID: number | string,
  context: AdminSchedulingContext,
) {
  if (context.dispatchEmails === false || context.req) return;
  try {
    await dispatchSchedulingEmailsForBooking(payload, bookingID);
  } catch (error) {
    payload.logger.error({
      booking: bookingID,
      error: error instanceof Error ? error.message : String(error),
    }, "Scheduling email dispatch could not start after an administrator booking change.");
  }
}

async function bookingByID(
  payload: Payload,
  bookingID: number | string,
  req?: PayloadRequest,
) {
  return payload.findByID({
    collection: "retreat-bookings",
    id: bookingID,
    depth: 0,
    overrideAccess: true,
    req,
  });
}

export async function getAdministratorRescheduleOptions(
  account: User,
  bookingID: number | string,
  context: AdminSchedulingContext = {},
): Promise<AdministratorRescheduleOptionSet> {
  assertSchedulingAdministrator(account);
  const payload = context.payload ?? await getPayload({ config });
  const current = await bookingByID(payload, bookingID, context.req);
  if (!isActiveAdministratorBooking(current)) {
    throw new Error("Only an active booking can be rescheduled.");
  }

  const eventID = relationshipID(current.event);
  const artistID = relationshipID(current.artist);
  const photographerID = relationshipID(current.photographer);
  if (eventID === null || artistID === null || photographerID === null) {
    throw new Error("The booking relationships could not be resolved.");
  }

  const durationMilliseconds =
    new Date(current.endAt).getTime() - new Date(current.startAt).getTime();
  const durationHours = durationMilliseconds / 3_600_000;
  if (!Number.isInteger(durationHours) || durationHours < 1) {
    throw new Error("The current booking duration cannot be rescheduled.");
  }

  const [event, availability, bookings] = await Promise.all([
    payload.findByID({
      collection: "retreat-events",
      id: eventID,
      depth: 0,
      overrideAccess: true,
      req: context.req,
    }),
    payload.find({
      collection: "artist-availability",
      depth: 0,
      limit: 50,
      overrideAccess: true,
      pagination: false,
      req: context.req,
      sort: "date",
      where: {
        and: [
          { event: { equals: eventID } },
          { artist: { equals: artistID } },
        ],
      },
    }),
    payload.find({
      collection: "retreat-bookings",
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      req: context.req,
      sort: "startAt",
      where: {
        and: [
          { status: { in: ["confirmed", "admin-review"] } },
          {
            or: [
              { artist: { equals: artistID } },
              { photographer: { equals: photographerID } },
            ],
          },
        ],
      },
    }),
  ]);
  const timeZone = event.timeZone || "America/Chicago";
  const options = buildAdministratorRescheduleOptions({
    artistId: artistID,
    availability: availability.docs.map((schedule) => ({
      availableFrom: schedule.availableFrom,
      availableUntil: schedule.availableUntil,
      blockedTimes: schedule.blockedTimes,
      date: schedule.date,
    })),
    bookings: bookings.docs.flatMap((booking) => {
      const bookingArtistID = relationshipID(booking.artist);
      const bookingPhotographerID = relationshipID(booking.photographer);
      if (
        bookingArtistID === null
        || bookingPhotographerID === null
      ) {
        return [];
      }
      return [{
        artistId: bookingArtistID,
        endAt: booking.endAt,
        id: booking.id,
        photographerId: bookingPhotographerID,
        startAt: booking.startAt,
        status: booking.status,
      }];
    }),
    currentBookingId: current.id,
    currentEndAt: current.endAt,
    currentStartAt: current.startAt,
    photographerId: photographerID,
    timeZone,
  });

  return { durationHours, options, timeZone };
}

export async function cancelRetreatBooking(
  account: User,
  bookingID: number | string,
  reason: string,
  context: AdminSchedulingContext = {},
): Promise<RetreatBooking & { replayed: boolean }> {
  assertSchedulingAdministrator(account);
  const exceptionReason = assertReason(reason);
  const payload = context.payload ?? await getPayload({ config });
  const current = await bookingByID(payload, bookingID, context.req);

  if (current.status === "cancelled") {
    await dispatchCommittedAdminEmails(payload, current.id, context);
    return { ...current, replayed: true };
  }

  const booking = await payload.update({
    collection: "retreat-bookings",
    id: current.id,
    data: {
      exceptionReason,
      status: "cancelled",
    },
    depth: 0,
    overrideAccess: false,
    req: context.req,
    user: account,
  });
  await dispatchCommittedAdminEmails(payload, booking.id, context);
  return { ...booking, replayed: false };
}

export async function rescheduleRetreatBooking(
  account: User,
  bookingID: number | string,
  input: { endAt: string; reason: string; startAt: string },
  context: AdminSchedulingContext = {},
): Promise<RetreatBooking & { replayed: boolean }> {
  assertSchedulingAdministrator(account);
  const exceptionReason = assertReason(input.reason);
  const payload = context.payload ?? await getPayload({ config });
  const current = await bookingByID(payload, bookingID, context.req);

  if (!isActiveAdministratorBooking(current)) {
    throw new Error("Only an active booking can be rescheduled.");
  }
  if (
    new Date(current.startAt).getTime() === new Date(input.startAt).getTime()
    && new Date(current.endAt).getTime() === new Date(input.endAt).getTime()
  ) {
    await dispatchCommittedAdminEmails(payload, current.id, context);
    return { ...current, replayed: true };
  }

  const booking = await payload.update({
    collection: "retreat-bookings",
    id: current.id,
    data: {
      endAt: input.endAt,
      exceptionReason,
      startAt: input.startAt,
      status: "confirmed",
    },
    depth: 0,
    overrideAccess: false,
    req: context.req,
    user: account,
  });
  await dispatchCommittedAdminEmails(payload, booking.id, context);
  return { ...booking, replayed: false };
}
