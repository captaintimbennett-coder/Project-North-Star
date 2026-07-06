import config from "@payload-config";
import { getPayload } from "payload";
import type { User } from "@/payload-types";
import { hasAccountRole, isStaff } from "@/payload/access/account";

type RelationshipValue = number | string | { id: number | string } | null | undefined;

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

export type ScheduleProjectionItem = {
  artistName: string;
  endAt: string;
  eventTitle: string;
  id: number | string;
  photographerName: string;
  startAt: string;
  status: "admin-review" | "cancelled" | "confirmed" | "rescheduled";
};

export async function getRoleFilteredSchedule(account: User): Promise<ScheduleProjectionItem[]> {
  const payload = await getPayload({ config });
  const participant = hasAccountRole(account, "model") || hasAccountRole(account, "photographer");
  if (!participant && !isStaff(account)) return [];

  const result = await payload.find({
    collection: "retreat-bookings",
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: "startAt",
    user: account,
    where: {},
  });

  return Promise.all(result.docs.map(async (booking) => {
    const eventID = relationshipID(booking.event);
    const artistID = relationshipID(booking.artist);
    const photographerID = relationshipID(booking.photographer);

    const [event, artist, photographer] = await Promise.all([
      eventID ? payload.findByID({ collection: "retreat-events", id: eventID, depth: 0, overrideAccess: true }) : null,
      artistID ? payload.findByID({ collection: "model-profiles", id: artistID, depth: 0, overrideAccess: true }) : null,
      photographerID ? payload.findByID({ collection: "photographer-profiles", id: photographerID, depth: 0, overrideAccess: true }) : null,
    ]);

    return {
      artistName: artist?.displayName ?? "Participating artist",
      endAt: booking.endAt,
      eventTitle: event?.title ?? "Lone Star Retreat",
      id: booking.id,
      photographerName: photographer?.displayName ?? "Participating photographer",
      startAt: booking.startAt,
      status: booking.status,
    };
  }));
}
