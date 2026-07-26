import type { CollectionAfterChangeHook, PayloadRequest } from "payload";

type RelationshipValue = number | string | { id: number | string } | null | undefined;
type NotificationType = "booking-cancelled" | "booking-confirmed" | "booking-rescheduled";
type RecipientRole = "model" | "photographer";

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id;
}

function notificationForChange({
  doc,
  operation,
  previousDoc,
}: Parameters<CollectionAfterChangeHook>[0]): NotificationType | null {
  if (operation === "create" && doc.status === "confirmed") return "booking-confirmed";
  if (operation !== "update") return null;
  if (previousDoc?.status !== doc.status && doc.status === "cancelled") return "booking-cancelled";
  if (
    doc.status !== "cancelled"
    && (previousDoc?.startAt !== doc.startAt || previousDoc?.endAt !== doc.endAt)
  ) {
    return "booking-rescheduled";
  }
  return null;
}

async function createDeliveryIntent({
  bookingID,
  deliveryKey,
  notificationType,
  recipientEmail,
  recipientName,
  recipientRole,
  req,
  templateData,
}: {
  bookingID: number;
  deliveryKey: string;
  notificationType: NotificationType;
  recipientEmail: string;
  recipientName: string;
  recipientRole: RecipientRole;
  req: PayloadRequest;
  templateData: Record<string, unknown>;
}) {
  const existing = await req.payload.find({
    collection: "scheduling-email-deliveries",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { deliveryKey: { equals: deliveryKey } },
  });
  if (existing.totalDocs > 0) return;

  await req.payload.create({
    collection: "scheduling-email-deliveries",
    data: {
      attempts: 0,
      booking: bookingID,
      deliveryKey,
      notificationType,
      recipientEmail,
      recipientName,
      recipientRole,
      status: "pending",
      templateData,
    },
    overrideAccess: true,
    req,
  });
}

export const queueSchedulingEmailIntents: CollectionAfterChangeHook = async (args) => {
  const { doc, previousDoc, req } = args;
  const notificationType = notificationForChange(args);
  if (!notificationType) return doc;

  const eventID = relationshipID(doc.event);
  const artistID = relationshipID(doc.artist);
  const photographerID = relationshipID(doc.photographer);
  if (!eventID || !artistID || !photographerID) {
    throw new Error("Scheduling email intent could not resolve the booking relationships.");
  }

  const event = await req.payload.findByID({
    collection: "retreat-events",
    id: eventID,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const artist = await req.payload.findByID({
    collection: "model-profiles",
    id: artistID,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const photographer = await req.payload.findByID({
    collection: "photographer-profiles",
    id: photographerID,
    depth: 0,
    overrideAccess: true,
    req,
  });

  const artistEmail = artist.bookingPreferences?.email;
  const photographerEmail = photographer.bookingPreferences?.email;
  if (!artistEmail || !photographerEmail) {
    throw new Error("Both booking participants need a scheduling email before notifications can be queued.");
  }

  const changeID = notificationType === "booking-confirmed"
    ? "initial"
    : doc.administratorChangedAt || doc.updatedAt;
  const templateData = {
    artistName: artist.displayName,
    endAt: doc.endAt,
    eventLocation: event.locationName || "",
    eventTitle: event.title,
    photographerName: photographer.displayName,
    previousEndAt: notificationType === "booking-rescheduled" ? previousDoc?.endAt : undefined,
    previousStartAt: notificationType === "booking-rescheduled" ? previousDoc?.startAt : undefined,
    startAt: doc.startAt,
    timeZone: event.timeZone || "America/Chicago",
  };

  await createDeliveryIntent({
    bookingID: Number(doc.id),
    deliveryKey: `booking:${doc.id}:${notificationType}:${changeID}:model`,
    notificationType,
    recipientEmail: artistEmail,
    recipientName: artist.displayName,
    recipientRole: "model",
    req,
    templateData,
  });
  await createDeliveryIntent({
    bookingID: Number(doc.id),
    deliveryKey: `booking:${doc.id}:${notificationType}:${changeID}:photographer`,
    notificationType,
    recipientEmail: photographerEmail,
    recipientName: photographer.displayName,
    recipientRole: "photographer",
    req,
    templateData,
  });

  return doc;
};
