import type { CollectionConfig } from "payload";
import { ownerOnly, ownerOrEditorOnly, staffOrOwnBooking, staffFieldAccess, staffOrPhotographer } from "../access/account";
import { validateRetreatBooking } from "../scheduling/rules";
import { auditRetreatBookingChange } from "../hooks/auditSchedulingChange";

export const RetreatBookings: CollectionConfig = {
  slug: "retreat-bookings",
  labels: {
    plural: "Retreat Bookings",
    singular: "Retreat Booking",
  },
  access: {
    create: staffOrPhotographer,
    delete: ownerOnly,
    read: staffOrOwnBooking,
    update: ownerOrEditorOnly,
  },
  admin: {
    defaultColumns: ["event", "artist", "photographer", "startAt", "endAt", "status"],
    description:
      "Private operational reservations. Public and participant schedule views must use a separate allowlisted projection.",
    group: "Lone Star Retreat Scheduling",
  },
  fields: [
    { name: "event", type: "relationship", relationTo: "retreat-events", required: true, index: true },
    { name: "artist", type: "relationship", relationTo: "model-profiles", required: true, index: true },
    {
      name: "photographer",
      type: "relationship",
      relationTo: "photographer-profiles",
      required: true,
      index: true,
    },
    {
      name: "startAt",
      type: "date",
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "endAt",
      type: "date",
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "confirmed",
      options: [
        { label: "Confirmed", value: "confirmed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Rescheduled", value: "rescheduled" },
        { label: "Administrator review / exception", value: "admin-review" },
      ],
      required: true,
      index: true,
    },
    {
      name: "idempotencyKey",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { read: staffFieldAccess },
    },
    {
      name: "administratorChangedAt",
      type: "date",
      label: "Last administrator schedule change",
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "rescheduledFrom",
      type: "relationship",
      relationTo: "retreat-bookings",
      label: "Rescheduled from booking",
    },
    {
      name: "adminOverride",
      type: "checkbox",
      defaultValue: false,
      label: "Administrator availability override",
      admin: {
        description:
          "Allows an authorized administrator to place a booking outside stated availability. It never permits double-booking.",
      },
      access: { read: staffFieldAccess },
    },
    {
      name: "exceptionReason",
      type: "textarea",
      label: "Private exception / cancellation reason",
      access: { read: staffFieldAccess },
      admin: {
        description: "Required for overrides, cancellations, reschedules, and administrator exceptions.",
      },
    },
    {
      name: "adminNotes",
      type: "textarea",
      label: "Private administrator notes",
      access: { read: staffFieldAccess },
    },
  ],
  hooks: {
    beforeChange: [validateRetreatBooking],
    afterChange: [auditRetreatBookingChange],
  },
  versions: {
    maxPerDoc: 50,
  },
};
