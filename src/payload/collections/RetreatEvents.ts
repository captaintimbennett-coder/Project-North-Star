import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

export const RetreatEvents: CollectionConfig = {
  slug: "retreat-events",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["title", "lifecycleStatus", "startDate", "locationName"],
    group: "Lone Star Retreat",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "lifecycleStatus",
      type: "select",
      defaultValue: "draft",
      label: "Lifecycle status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Prototype", value: "prototype" },
        { label: "Published", value: "published" },
        { label: "Registration closed", value: "closed" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
    {
      name: "summary",
      type: "textarea",
      maxLength: 400,
      required: true,
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "startDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "timeZone",
      type: "text",
      defaultValue: "America/Chicago",
      label: "Event time zone",
      required: true,
      admin: {
        description:
          "IANA time zone used for availability and booking calculations, for example America/Chicago.",
      },
    },
    {
      name: "locationName",
      type: "text",
      label: "Public location name",
    },
    {
      name: "locationDetails",
      type: "textarea",
      label: "Private location notes",
    },
    {
      name: "capacity",
      type: "number",
      min: 1,
    },
    {
      name: "registrationStatus",
      type: "select",
      defaultValue: "coming-soon",
      options: [
        { label: "Coming soon", value: "coming-soon" },
        { label: "Applications open", value: "applications-open" },
        { label: "Registration open", value: "registration-open" },
        { label: "Waitlist", value: "waitlist" },
        { label: "Closed", value: "closed" },
      ],
      required: true,
    },
    {
      name: "participatingArtists",
      dbName: "event_artists",
      type: "array",
      label: "Participating artists",
      admin: {
        description:
          "Event-specific artist assignments. Only approved assignments whose master profiles and media are also published and approved may appear publicly.",
      },
      fields: [
        {
          name: "artist",
          type: "relationship",
          relationTo: "model-profiles",
          required: true,
        },
        {
          name: "participationStatus",
          dbName: "event_artist_status",
          type: "select",
          defaultValue: "invited",
          options: [
            { label: "Invited", value: "invited" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Approved for public display", value: "approved" },
            { label: "Withdrawn", value: "withdrawn" },
          ],
          required: true,
        },
        {
          name: "displayOrder",
          type: "number",
          defaultValue: 100,
          min: 0,
        },
        {
          name: "minimumBookingHours",
          type: "select",
          defaultValue: "1",
          label: "Minimum booking duration",
          options: [
            { label: "1 hour", value: "1" },
            { label: "2 hours", value: "2" },
            { label: "3 hours", value: "3" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "participatingPhotographers",
      dbName: "event_photographers",
      type: "array",
      label: "Participating photographers",
      admin: {
        description:
          "Event-specific photographer access. Only approved participants are eligible for confirmed bookings.",
      },
      fields: [
        {
          name: "photographer",
          type: "relationship",
          relationTo: "photographer-profiles",
          required: true,
        },
        {
          name: "participationStatus",
          dbName: "event_photographer_status",
          type: "select",
          defaultValue: "invited",
          options: [
            { label: "Invited", value: "invited" },
            { label: "Registered", value: "registered" },
            { label: "Approved for booking", value: "approved" },
            { label: "Withdrawn", value: "withdrawn" },
          ],
          required: true,
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
};
