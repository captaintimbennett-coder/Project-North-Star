import config from "@payload-config";
import { getPayload } from "payload";
import type { User } from "@/payload-types";

type RelationshipValue = number | string | { id: number | string } | null | undefined;
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
  timeZone: string;
};

export async function getModelAvailabilityDays(account: User): Promise<ModelAvailabilityDay[]> {
  const payload = await getPayload({ config });
  const profiles = await payload.find({
    collection: "model-profiles", depth: 0, limit: 1, overrideAccess: true,
    where: { account: { equals: account.id } },
  });
  const artist = profiles.docs[0];
  if (!artist) return [];
  const events = await payload.find({ collection: "retreat-events", depth: 0, limit: 20, overrideAccess: true, pagination: false });
  const days: ModelAvailabilityDay[] = [];
  for (const event of events.docs.filter((item) => item.participatingArtists?.some((entry) =>
    relationshipID(entry.artist) === artist.id && ["confirmed", "approved"].includes(entry.participationStatus)))) {
    if (!event.startDate || !event.endDate) continue;
    const existing = await payload.find({
      collection: "artist-availability", depth: 0, limit: 50, overrideAccess: true, pagination: false,
      where: { and: [{ event: { equals: event.id } }, { artist: { equals: artist.id } }] },
    });
    const startDay = new Date(event.startDate);
    const endDay = new Date(event.endDate);
    for (let cursor = Date.UTC(startDay.getUTCFullYear(), startDay.getUTCMonth(), startDay.getUTCDate());
      cursor <= Date.UTC(endDay.getUTCFullYear(), endDay.getUTCMonth(), endDay.getUTCDate());
      cursor += 86_400_000) {
      const date = new Date(cursor).toISOString().slice(0, 10);
      const record = existing.docs.find((item) => new Date(item.date).toISOString().slice(0, 10) === date);
      days.push({
        availableFrom: record?.availableFrom || "06:00",
        availableUntil: record?.availableUntil || "18:00",
        blockedTimes: record?.blockedTimes?.map((block) => ({
          endTime: block.endTime, reason: block.reason, startTime: block.startTime,
        })) || [],
        date, eventId: Number(event.id), eventTitle: event.title, timeZone: event.timeZone || "America/Chicago",
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
}) {
  const payload = await getPayload({ config });
  const profiles = await payload.find({
    collection: "model-profiles", depth: 0, limit: 1, overrideAccess: true,
    where: { account: { equals: account.id } },
  });
  const artist = profiles.docs[0];
  if (!artist) throw new Error("No model profile is linked to this account.");
  const storedDate = `${input.date}T00:00:00.000Z`;
  const existing = await payload.find({
    collection: "artist-availability", depth: 0, limit: 1, overrideAccess: true,
    where: { and: [
      { event: { equals: input.eventId } }, { artist: { equals: artist.id } }, { date: { equals: storedDate } },
    ] },
  });
  const data = {
    artist: artist.id, availableFrom: input.availableFrom, availableUntil: input.availableUntil,
    blockedTimes: input.blockedTimes, date: storedDate, event: input.eventId,
  };
  const saved = existing.docs[0]
    ? await payload.update({ collection: "artist-availability", id: existing.docs[0].id, data, overrideAccess: false, user: account })
    : await payload.create({ collection: "artist-availability", data, overrideAccess: false, user: account });
  return saved.id;
}
