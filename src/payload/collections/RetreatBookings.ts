import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { validateRetreatBooking } from "../scheduling/rules";

export const RetreatBookings: CollectionConfig = {
  slug: "retreat-bookings",
  labels: {
    plural: "Retreat Bookings",
    singular: "Retreat Booking",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
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
    },
    { name: "exceptionReason", type: "textarea", label: "Private exception / cancellation reason" },
    { name: "adminNotes", type: "textarea", label: "Private administrator notes" },
  ],
  hooks: {
    beforeChange: [validateRetreatBooking],
  },
  versions: {
    maxPerDoc: 50,
  },
};
