import type { CollectionAfterChangeHook } from "payload";
import { writeSecurityAuditEvent } from "@/lib/security/audit";

export const auditRetreatBookingChange: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  const changedStatus = operation === "update" && previousDoc?.status !== doc.status;
  const changedTime = operation === "update" &&
    (previousDoc?.startAt !== doc.startAt || previousDoc?.endAt !== doc.endAt);
  const eventType = operation === "create"
    ? "booking.confirmed"
    : doc.status === "cancelled" && changedStatus
      ? "booking.cancelled"
      : doc.status === "rescheduled" && changedStatus
        ? "booking.rescheduled"
        : changedTime || doc.adminOverride
          ? "booking.admin_changed"
          : "booking.updated";

  await writeSecurityAuditEvent(req.payload, {
    actor: req.user?.id,
    eventType,
    metadata: {
      bookingId: doc.id,
      eventId: typeof doc.event === "object" ? doc.event?.id : doc.event,
      status: doc.status,
      adminOverride: Boolean(doc.adminOverride),
    },
    severity: doc.adminOverride ? "warning" : "info",
  });

  if (operation === "create" && doc.adminOverride) {
    await writeSecurityAuditEvent(req.payload, {
      actor: req.user?.id,
      eventType: "booking.admin_override",
      metadata: {
        actorId: req.user?.id ?? null,
        bookingId: doc.id,
        eventId: typeof doc.event === "object" ? doc.event?.id : doc.event,
        override: true,
        reason: doc.exceptionReason,
      },
      severity: "warning",
    });
  }
};

export const auditArtistAvailabilityChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  await writeSecurityAuditEvent(req.payload, {
    actor: req.user?.id,
    eventType: operation === "create" ? "availability.created" : "availability.updated",
    metadata: {
      availabilityId: doc.id,
      eventId: typeof doc.event === "object" ? doc.event?.id : doc.event,
      artistId: typeof doc.artist === "object" ? doc.artist?.id : doc.artist,
      date: doc.date,
    },
  });
};
