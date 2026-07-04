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
  ],
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
};
