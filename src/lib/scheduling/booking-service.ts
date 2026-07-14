import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import type { User } from "@/payload-types";

type RelationshipValue = number | string | { id: number | string } | null | undefined;
const ACTIVE_STATUSES = ["confirmed", "admin-review"] as const;

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

function localParts(value: string | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone,
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return { day: `${part("year")}-${part("month")}-${part("day")}`, clock: `${part("hour")}:${part("minute")}` };
}

function localDateTimeToUTC(day: string, hour: number, timeZone: string) {
  const [year, month, date] = day.split("-").map(Number);
  const target = Date.UTC(year, month - 1, date, hour, 0);
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = localParts(new Date(candidate), timeZone);
    const [actualYear, actualMonth, actualDay] = parts.day.split("-").map(Number);
    const [actualHour, actualMinute] = parts.clock.split(":").map(Number);
    const represented = Date.UTC(actualYear, actualMonth - 1, actualDay, actualHour, actualMinute);
    candidate += target - represented;
  }
  const result = new Date(candidate);
  const roundTrip = localParts(result, timeZone);
  if (roundTrip.day !== day || roundTrip.clock !== `${String(hour).padStart(2, "0")}:00`) {
    throw new Error("This local event time does not exist in the event time zone.");
  }
  return result.toISOString();
}

export type BookingRangeOption = {
  artistId: number;
  artistName: string;
  day: string;
  durationHours: number;
  endAt: string;
  eventId: number;
  eventTitle: string;
  startAt: string;
  timeZone: string;
};

async function photographerProfile(payload: Payload, account: User) {
  const result = await payload.find({
    collection: "photographer-profiles",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { account: { equals: account.id } },
  });
  return result.docs[0] ?? null;
}

export async function getPhotographerBookingOptions(account: User): Promise<BookingRangeOption[]> {
  const payload = await getPayload({ config });
  const photographer = await photographerProfile(payload, account);
  if (!photographer) return [];

  const events = await payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    where: { lifecycleStatus: { in: ["published", "closed"] } },
  });
  const eligibleEvents = events.docs.filter((event) => event.participatingPhotographers?.some((entry) =>
    relationshipID(entry.photographer) === photographer.id && entry.participationStatus === "approved"));
  const options: BookingRangeOption[] = [];

  for (const event of eligibleEvents) {
    const timeZone = event.timeZone || "America/Chicago";
    const existing = await payload.find({
      collection: "retreat-bookings", depth: 0, limit: 500, overrideAccess: true, pagination: false,
      where: { and: [{ event: { equals: event.id } }, { status: { in: [...ACTIVE_STATUSES] } }] },
    });
    for (const assignment of event.participatingArtists ?? []) {
      if (!["confirmed", "approved"].includes(assignment.participationStatus)) continue;
      const artistId = Number(relationshipID(assignment.artist));
      if (!Number.isInteger(artistId)) continue;
      const artist = await payload.findByID({ collection: "model-profiles", id: artistId, depth: 0, overrideAccess: true });
      if (artist.approvalStatus !== "approved") continue;
      const availability = await payload.find({
        collection: "artist-availability", depth: 0, limit: 20, overrideAccess: true, pagination: false,
        sort: "date", where: { and: [{ event: { equals: event.id } }, { artist: { equals: artistId } }] },
      });
      const minimum = Number(assignment.minimumBookingHours || 1);
      for (const schedule of availability.docs) {
        const day = new Date(schedule.date).toISOString().slice(0, 10);
        const startHour = Number(schedule.availableFrom.split(":")[0]);
        const endHour = Number(schedule.availableUntil.split(":")[0]);
        for (let start = startHour; start + minimum <= endHour; start += 1) {
          for (let end = start + minimum; end <= endHour; end += 1) {
            const blocked = schedule.blockedTimes?.some((block) => {
              const blockStart = Number(block.startTime.split(":")[0]);
              const blockEnd = Number(block.endTime.split(":")[0]);
              return start < blockEnd && end > blockStart;
            });
            if (blocked) continue;
            const startAt = localDateTimeToUTC(day, start, timeZone);
            const endAt = localDateTimeToUTC(day, end, timeZone);
            const conflict = existing.docs.some((booking) =>
              new Date(startAt) < new Date(booking.endAt) && new Date(endAt) > new Date(booking.startAt) &&
              (relationshipID(booking.artist) === artistId || relationshipID(booking.photographer) === photographer.id));
            if (conflict) continue;
            options.push({
              artistId, artistName: artist.displayName, day, durationHours: end - start,
              endAt, eventId: event.id, eventTitle: event.title, startAt, timeZone,
            });
          }
        }
      }
    }
  }
  return options;
}

export async function confirmPhotographerBooking(account: User, input: {
  artistId: number;
  endAt: string;
  eventId: number;
  idempotencyKey: string;
  startAt: string;
}) {
  const payload = await getPayload({ config });
  const photographer = await photographerProfile(payload, account);
  if (!photographer) throw new Error("No photographer profile is linked to this account.");
  const existing = await payload.find({
    collection: "retreat-bookings", depth: 0, limit: 1, overrideAccess: true,
    where: { idempotencyKey: { equals: input.idempotencyKey } },
  });
  if (existing.docs[0]) {
    if (relationshipID(existing.docs[0].photographer) !== photographer.id) throw new Error("This booking request is invalid.");
    return existing.docs[0];
  }
  return payload.create({
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
    user: account,
  });
}
