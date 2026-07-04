import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

export const ModelProfiles: CollectionConfig = {
  slug: "model-profiles",
  labels: {
    plural: "Models / Featured Artists",
    singular: "Model / Featured Artist",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["displayName", "approvalStatus", "city", "state"],
    description:
      "Canonical model records. Event participation will reference these profiles rather than duplicate them.",
    group: "Lone Star Retreat",
    useAsTitle: "displayName",
  },
  fields: [
    {
      name: "displayName",
      type: "text",
      label: "Display name",
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
      name: "approvalStatus",
      type: "select",
      defaultValue: "draft",
      label: "Approval status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Under review", value: "review" },
        { label: "Approved", value: "approved" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
    {
      name: "publicIntroduction",
      type: "textarea",
      label: "Short public introduction",
      maxLength: 240,
    },
    {
      name: "biography",
      type: "textarea",
      label: "Biography",
    },
    {
      name: "featuredImage",
      type: "upload",
      label: "Featured profile image",
      relationTo: "media",
    },
    {
      name: "portfolioImages",
      type: "upload",
      hasMany: true,
      label: "Additional portfolio images",
      relationTo: "media",
    },
    {
      name: "modelingCategories",
      type: "select",
      hasMany: true,
      label: "Modeling categories",
      options: [
        { label: "Glamour", value: "glamour" },
        { label: "Boudoir", value: "boudoir" },
        { label: "Fashion", value: "fashion" },
        { label: "Editorial", value: "editorial" },
        { label: "Fine art", value: "fine-art" },
        { label: "Lifestyle", value: "lifestyle" },
        { label: "Commercial", value: "commercial" },
      ],
    },
    {
      name: "city",
      type: "text",
    },
    {
      name: "state",
      type: "text",
    },
    {
      name: "website",
      type: "text",
    },
    {
      name: "instagram",
      type: "text",
    },
    {
      name: "usagePermissionConfirmed",
      type: "checkbox",
      defaultValue: false,
      label: "Image usage permission confirmed",
    },
    {
      name: "adminNotes",
      type: "textarea",
      label: "Private administrator notes",
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
