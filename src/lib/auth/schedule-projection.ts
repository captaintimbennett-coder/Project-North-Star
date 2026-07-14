import config from "@payload-config";
import { getPayload } from "payload";
import type { ModelProfile, PhotographerProfile, User } from "@/payload-types";
import { hasAccountRole, isStaff } from "@/payload/access/account";

type RelationshipValue = number | string | { id: number | string } | null | undefined;

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

export type ApprovedContactMethod = {
  href?: string;
  label: "Email" | "Instagram" | "Mobile" | "Website";
  value: string;
};

export type PersonalItineraryItem = {
  administratorChanged: boolean;
  bookingStatus: "admin-review" | "cancelled" | "confirmed" | "rescheduled";
  contactMethods: ApprovedContactMethod[];
  durationMinutes: number;
  endAt: string;
  eventLocation: string;
  eventTimeZone: string;
  eventTitle: string;
  id: number | string;
  partnerLabel: "Model / Featured Artist" | "Photographer";
  partnerName: string;
  startAt: string;
};

export type SharedRetreatScheduleItem = {
  artistName: string;
  endAt: string;
  id: number | string;
  startAt: string;
  status: "admin-review" | "confirmed";
};

function approvedContacts(profile: ModelProfile | PhotographerProfile): ApprovedContactMethod[] {
  const preferences = profile.bookingPreferences;
  if (!preferences) return [];
  const contacts: ApprovedContactMethod[] = [];
  if (preferences.shareEmail && preferences.email) {
    contacts.push({ href: `mailto:${preferences.email}`, label: "Email", value: preferences.email });
  }
  if (preferences.shareMobilePhone && preferences.mobilePhone) {
    contacts.push({ href: `tel:${preferences.mobilePhone}`, label: "Mobile", value: preferences.mobilePhone });
  }
  if (preferences.shareInstagram && profile.instagram) {
    const handle = profile.instagram.replace(/^@/, "");
    contacts.push({ href: `https://instagram.com/${handle}`, label: "Instagram", value: profile.instagram });
  }
  if (preferences.shareWebsite && profile.website) {
    const href = /^https?:\/\//.test(profile.website) ? profile.website : `https://${profile.website}`;
    contacts.push({ href, label: "Website", value: profile.website });
  }
  return contacts;
}

export async function getPersonalItinerary(account: User): Promise<PersonalItineraryItem[]> {
  const payload = await getPayload({ config });
  const participant = hasAccountRole(account, "model") || hasAccountRole(account, "photographer");
  if (!participant && !isStaff(account)) return [];

  const result = await payload.find({
    collection: "retreat-bookings",
    depth: 0,
    limit: 200,
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
    const viewingAsModel = relationshipID(artist?.account) === account.id && relationshipID(photographer?.account) !== account.id;
    const partner = viewingAsModel ? photographer : artist;
    const contacts = booking.status === "confirmed" && partner ? approvedContacts(partner) : [];

    return {
      administratorChanged: Boolean(booking.administratorChangedAt || booking.adminOverride || booking.status !== "confirmed"),
      bookingStatus: booking.status,
      contactMethods: contacts,
      durationMinutes: Math.round((new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) / 60000),
      endAt: booking.endAt,
      eventLocation: event?.locationName || "Location shared by the retreat organizer",
      eventTimeZone: event?.timeZone || "America/Chicago",
      eventTitle: event?.title || "Lone Star Retreat",
      id: booking.id,
      partnerLabel: viewingAsModel ? "Photographer" : "Model / Featured Artist",
      partnerName: partner?.displayName || (viewingAsModel ? "Participating photographer" : "Participating artist"),
      startAt: booking.startAt,
    } satisfies PersonalItineraryItem;
  }));
}

export async function getSharedRetreatSchedule(account: User, eventID: number): Promise<SharedRetreatScheduleItem[]> {
  const payload = await getPayload({ config });
  if (!hasAccountRole(account, "model") && !hasAccountRole(account, "photographer") && !isStaff(account)) return [];
  const event = await payload.findByID({ collection: "retreat-events", id: eventID, depth: 0, overrideAccess: true });
  if (!isStaff(account)) {
    const [models, photographers] = await Promise.all([
      hasAccountRole(account, "model") ? payload.find({ collection: "model-profiles", depth: 0, limit: 1, overrideAccess: true, where: { account: { equals: account.id } } }) : null,
      hasAccountRole(account, "photographer") ? payload.find({ collection: "photographer-profiles", depth: 0, limit: 1, overrideAccess: true, where: { account: { equals: account.id } } }) : null,
    ]);
    const modelID = models?.docs[0]?.id;
    const photographerID = photographers?.docs[0]?.id;
    const eligibleModel = modelID && event.participatingArtists?.some((entry) =>
      relationshipID(entry.artist) === modelID && ["confirmed", "approved"].includes(entry.participationStatus));
    const eligiblePhotographer = photographerID && event.participatingPhotographers?.some((entry) =>
      relationshipID(entry.photographer) === photographerID && entry.participationStatus === "approved");
    if (!eligibleModel && !eligiblePhotographer) return [];
  }
  const assigned = event.participatingArtists?.map((entry) => relationshipID(entry.artist)).filter(Boolean) ?? [];
  const result = await payload.find({
    collection: "retreat-bookings", depth: 0, limit: 500, overrideAccess: true, pagination: false, sort: "startAt",
    where: { and: [{ event: { equals: eventID } }, { status: { in: ["confirmed", "admin-review"] } }] },
  });
  return Promise.all(result.docs.filter((booking) => assigned.includes(relationshipID(booking.artist))).map(async (booking) => {
    const artistID = relationshipID(booking.artist);
    const artist = artistID
      ? await payload.findByID({ collection: "model-profiles", id: artistID, depth: 0, overrideAccess: true })
      : null;
    return {
      artistName: artist?.displayName || "Participating artist",
      endAt: booking.endAt,
      id: booking.id,
      startAt: booking.startAt,
      status: booking.status as "admin-review" | "confirmed",
    };
  }));
}
