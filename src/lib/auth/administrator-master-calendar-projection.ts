import config from "@payload-config";
import { getPayload, type Payload, type PayloadRequest } from "payload";
import type { User } from "@/payload-types";
import { hasStaffPermission, isStaff } from "@/payload/access/account";

type RelationshipValue =
  | number
  | string
  | { id: number | string }
  | null
  | undefined;

type ProjectionContext = {
  payload?: Payload;
  req?: PayloadRequest;
};

export type AdministratorMasterCalendarBooking = {
  artistName: string;
  endAt: string;
  id: number | string;
  photographerName: string;
  startAt: string;
  status: "admin-review" | "cancelled" | "confirmed" | "rescheduled";
};

export type AdministratorMasterCalendarEvent = {
  endAt: string;
  eventId: number;
  eventTitle: string;
  items: AdministratorMasterCalendarBooking[];
  startAt: string;
  timeZone: string;
};

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

export function canViewAdministratorMasterCalendar(account: User) {
  return isStaff(account);
}

export function canCancelAdministratorMasterCalendarBookings(account: User) {
  return hasStaffPermission(account, ["owner", "editor"]);
}

export async function getAdministratorMasterCalendarEvents(
  account: User,
  context: ProjectionContext = {},
): Promise<AdministratorMasterCalendarEvent[]> {
  if (!canViewAdministratorMasterCalendar(account)) return [];

  const payload = context.payload ?? await getPayload({ config });
  const events = await payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 50,
    overrideAccess: false,
    pagination: false,
    req: context.req,
    sort: "startDate",
    user: account,
    where: {
      lifecycleStatus: { in: ["published", "closed"] },
    },
  });

  return Promise.all(events.docs
    .filter((event) => event.startDate && event.endDate)
    .map(async (event) => {
      const bookings = await payload.find({
        collection: "retreat-bookings",
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        req: context.req,
        sort: "startAt",
        user: account,
        where: { event: { equals: event.id } },
      });

      const artistIDs = [...new Set(bookings.docs
        .map((booking) => relationshipID(booking.artist))
        .filter((id): id is number | string => id !== null))];
      const photographerIDs = [...new Set(bookings.docs
        .map((booking) => relationshipID(booking.photographer))
        .filter((id): id is number | string => id !== null))];

      const [artists, photographers] = await Promise.all([
        artistIDs.length
          ? payload.find({
              collection: "model-profiles",
              depth: 0,
              limit: artistIDs.length,
              overrideAccess: false,
              pagination: false,
              req: context.req,
              user: account,
              where: { id: { in: artistIDs } },
            })
          : null,
        photographerIDs.length
          ? payload.find({
              collection: "photographer-profiles",
              depth: 0,
              limit: photographerIDs.length,
              overrideAccess: false,
              pagination: false,
              req: context.req,
              user: account,
              where: { id: { in: photographerIDs } },
            })
          : null,
      ]);

      const artistNames = new Map(
        artists?.docs.map((artist) => [String(artist.id), artist.displayName])
        ?? [],
      );
      const photographerNames = new Map(
        photographers?.docs.map((photographer) => [
          String(photographer.id),
          photographer.displayName,
        ]) ?? [],
      );

      return {
        endAt: event.endDate as string,
        eventId: Number(event.id),
        eventTitle: event.title,
        items: bookings.docs.map((booking) => {
          const artistID = relationshipID(booking.artist);
          const photographerID = relationshipID(booking.photographer);

          return {
            artistName: artistID
              ? artistNames.get(String(artistID)) ?? "Participating artist"
              : "Participating artist",
            endAt: booking.endAt,
            id: booking.id,
            photographerName: photographerID
              ? photographerNames.get(String(photographerID))
                ?? "Participating photographer"
              : "Participating photographer",
            startAt: booking.startAt,
            status: booking.status,
          };
        }),
        startAt: event.startDate as string,
        timeZone: event.timeZone || "America/Chicago",
      } satisfies AdministratorMasterCalendarEvent;
    }));
}
