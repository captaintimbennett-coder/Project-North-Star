import config from "@payload-config";
import { getPayload, type Payload, type PayloadRequest } from "payload";
import type { User } from "@/payload-types";
import { enumerateEventDays, eventLocalParts } from "@/lib/scheduling/availability-ranges";
import { hasAccountRole } from "@/payload/access/account";

type RelationshipValue = number | string | { id: number | string } | null | undefined;
type AvailabilityContext = { payload?: Payload; req?: PayloadRequest };
function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

export type ModelAvailabilityDay = {
  availableFrom: string;
  availableUntil: string;
  blockedTimes: { endTime: string; reason: "lunch" | "other" | "unavailable"; startTime: string }[];
  date: string;
  eventId: number;
  eventTitle: string;
  protectedBookings: {
    endTime: string;
    id: number | string;
    startTime: string;
    status: "admin-review" | "confirmed";
  }[];
  timeZone: string;
};

export async function getModelAvailabilityDays(
  account: User,
  context: AvailabilityContext = {},
): Promise<ModelAvailabilityDay[]> {
  if (!hasAccountRole(account, "model")) return [];
  const payload = context.payload ?? await getPayload({ config });
  const profiles = await payload.find({
    collection: "model-profiles", depth: 0, limit: 1, overrideAccess: true,
    req: context.req,
    where: { account: { equals: account.id } },
  });
  const artist = profiles.docs[0];
  if (!artist) return [];
  const events = await payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    req: context.req,
  });
  const days: ModelAvailabilityDay[] = [];
  for (const event of events.docs.filter((item) => item.participatingArtists?.some((entry) =>
    relationshipID(entry.artist) === artist.id && ["confirmed", "approved"].includes(entry.participationStatus)))) {
    if (!event.startDate || !event.endDate) continue;
    const timeZone = event.timeZone || "America/Chicago";
    const [existing, protectedBookings] = await Promise.all([
      payload.find({
        collection: "artist-availability", depth: 0, limit: 50, overrideAccess: true, pagination: false,
        req: context.req,
        where: { and: [{ event: { equals: event.id } }, { artist: { equals: artist.id } }] },
      }),
      payload.find({
        collection: "retreat-bookings", depth: 0, limit: 200, overrideAccess: true, pagination: false,
        req: context.req,
        sort: "startAt",
        where: { and: [
          { event: { equals: event.id } },
          { artist: { equals: artist.id } },
          { status: { in: ["confirmed", "admin-review"] } },
        ] },
      }),
    ]);
    const eventDays = enumerateEventDays(
      eventLocalParts(event.startDate, timeZone).day,
      eventLocalParts(event.endDate, timeZone).day,
    );
    for (const date of eventDays) {
      const record = existing.docs.find((item) => new Date(item.date).toISOString().slice(0, 10) === date);
      days.push({
        availableFrom: record?.availableFrom || "06:00",
        availableUntil: record?.availableUntil || "18:00",
        blockedTimes: record?.blockedTimes?.map((block) => ({
          endTime: block.endTime, reason: block.reason, startTime: block.startTime,
        })) || [],
        date, eventId: Number(event.id), eventTitle: event.title, timeZone,
        protectedBookings: protectedBookings.docs
          .filter((booking) => eventLocalParts(booking.startAt, timeZone).day === date)
          .map((booking) => ({
            endTime: eventLocalParts(booking.endAt, timeZone).clock,
            id: booking.id,
            startTime: eventLocalParts(booking.startAt, timeZone).clock,
            status: booking.status as "admin-review" | "confirmed",
          })),
      });
    }
  }
  return days;
}

export async function saveModelAvailability(account: User, input: {
  availableFrom: string;
  availableUntil: string;
  blockedTimes: { endTime: string; reason: "lunch" | "other" | "unavailable"; startTime: string }[];
  date: string;
  eventId: number;
}, context: AvailabilityContext = {}) {
  if (!hasAccountRole(account, "model")) {
    throw new Error("Model access is required.");
  }
  const payload = context.payload ?? await getPayload({ config });
  const profiles = await payload.find({
    collection: "model-profiles", depth: 0, limit: 1, overrideAccess: true,
    req: context.req,
    where: { account: { equals: account.id } },
  });
  const artist = profiles.docs[0];
  if (!artist) throw new Error("No model profile is linked to this account.");
  const storedDate = `${input.date}T00:00:00.000Z`;
  const existing = await payload.find({
    collection: "artist-availability", depth: 0, limit: 1, overrideAccess: true,
    req: context.req,
    where: { and: [
      { event: { equals: input.eventId } }, { artist: { equals: artist.id } }, { date: { equals: storedDate } },
    ] },
  });
  const data = {
    artist: artist.id, availableFrom: input.availableFrom, availableUntil: input.availableUntil,
    blockedTimes: input.blockedTimes, date: storedDate, event: input.eventId,
  };
  const saved = existing.docs[0]
    ? await payload.update({
        collection: "artist-availability",
        id: existing.docs[0].id,
        data,
        overrideAccess: false,
        req: context.req,
        user: account,
      })
    : await payload.create({
        collection: "artist-availability",
        data,
        overrideAccess: false,
        req: context.req,
        user: account,
      });
  return saved.id;
}
