import type { CollectionConfig } from "payload";
import { ownerOnly, staffOnly } from "../access/account";

export const SchedulingEmailDeliveries: CollectionConfig = {
  slug: "scheduling-email-deliveries",
  labels: {
    plural: "Scheduling Email Deliveries",
    singular: "Scheduling Email Delivery",
  },
  access: {
    create: () => false,
    delete: ownerOnly,
    read: staffOnly,
    update: () => false,
  },
  admin: {
    defaultColumns: [
      "status",
      "notificationType",
      "recipientRole",
      "recipientEmail",
      "booking",
      "lastAttemptAt",
    ],
    description:
      "Private transactional-email history for booking confirmations, cancellations, and reschedules. Failed deliveries may be retried without changing the booking.",
    group: "Lone Star Retreat Scheduling",
  },
  fields: [
    {
      name: "booking",
      type: "relationship",
      relationTo: "retreat-bookings",
      required: true,
      index: true,
    },
    {
      name: "notificationType",
      type: "select",
      options: [
        { label: "Booking confirmed", value: "booking-confirmed" },
        { label: "Booking cancelled", value: "booking-cancelled" },
        { label: "Booking rescheduled", value: "booking-rescheduled" },
      ],
      required: true,
      index: true,
    },
    {
      name: "recipientRole",
      type: "select",
      options: [
        { label: "Photographer", value: "photographer" },
        { label: "Featured Artist", value: "model" },
      ],
      required: true,
      index: true,
    },
    {
      name: "recipientName",
      type: "text",
      required: true,
    },
    {
      name: "recipientEmail",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "deliveryKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
      required: true,
      index: true,
    },
    {
      name: "attempts",
      type: "number",
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: "lastAttemptAt",
      type: "date",
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" },
        readOnly: true,
      },
    },
    {
      name: "sentAt",
      type: "date",
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" },
        readOnly: true,
      },
    },
    {
      name: "lastError",
      type: "textarea",
      admin: {
        description: "Operational delivery error only. Participant and administrator private notes are never stored here.",
        readOnly: true,
      },
    },
    {
      name: "templateData",
      type: "json",
      required: true,
      admin: {
        description: "Private deterministic message snapshot used for delivery and safe retry.",
        readOnly: true,
      },
    },
  ],
};
