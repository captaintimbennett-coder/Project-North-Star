import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { protectConfirmedBookingsFromAvailability } from "../scheduling/rules";

export const ArtistAvailability: CollectionConfig = {
  slug: "artist-availability",
  labels: {
    plural: "Artist Availability",
    singular: "Artist Availability",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["event", "artist", "date", "availableFrom", "availableUntil"],
    description:
      "Private event-specific availability. Confirmed booking time cannot be blocked or removed.",
    group: "Lone Star Retreat Scheduling",
  },
  fields: [
    { name: "event", type: "relationship", relationTo: "retreat-events", required: true, index: true },
    { name: "artist", type: "relationship", relationTo: "model-profiles", required: true, index: true },
    {
      name: "date",
      type: "date",
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "availableFrom",
      type: "text",
      defaultValue: "06:00",
      label: "Available from (24-hour HH:MM)",
      required: true,
    },
    {
      name: "availableUntil",
      type: "text",
      defaultValue: "18:00",
      label: "Available until (24-hour HH:MM)",
      required: true,
    },
    {
      name: "blockedTimes",
      type: "array",
      label: "Unavailable time blocks",
      fields: [
        { name: "startTime", type: "text", label: "Start (24-hour HH:MM)", required: true },
        { name: "endTime", type: "text", label: "End (24-hour HH:MM)", required: true },
        {
          name: "reason",
          type: "select",
          defaultValue: "unavailable",
          options: [
            { label: "Unavailable", value: "unavailable" },
            { label: "Lunch", value: "lunch" },
            { label: "Other", value: "other" },
          ],
          required: true,
        },
        { name: "privateNote", type: "text", label: "Private note" },
      ],
    },
    { name: "adminNotes", type: "textarea", label: "Private administrator notes" },
  ],
  hooks: {
    beforeChange: [protectConfirmedBookingsFromAvailability],
  },
  timestamps: true,
};
