import type { CollectionConfig } from "payload";
import { ownerOnly, ownerOrEditorOnly, staffOrOwnProfile, staffFieldAccess } from "../access/account";
import { bookingPreferencesField } from "../fields/bookingPreferences";
import { validateProfileAccountRole } from "../hooks/validateProfileAccountRole";

export const ModelProfiles: CollectionConfig = {
  slug: "model-profiles",
  labels: {
    plural: "Models / Featured Artists",
    singular: "Model / Featured Artist",
  },
  access: {
    create: ownerOrEditorOnly,
    delete: ownerOnly,
    read: staffOrOwnProfile("model"),
    update: ownerOrEditorOnly,
  },
  admin: {
    defaultColumns: ["displayName", "approvalStatus", "city", "state", "country"],
    description:
      "Canonical model records. Event participation will reference these profiles rather than duplicate them.",
    group: "Lone Star Retreat",
    useAsTitle: "displayName",
  },
  fields: [
    {
      name: "account",
      type: "relationship",
      relationTo: "users",
      unique: true,
      index: true,
      label: "Linked user account",
      access: { read: staffFieldAccess },
      admin: {
        description: "Optional one-to-one authentication owner. Applications never set this automatically.",
      },
    },
    {
      name: "sourceModelApplication",
      type: "relationship",
      relationTo: "model-applications",
      label: "Source model application",
      access: { read: staffFieldAccess },
      admin: {
        description:
          "Private traceability link. Set when a draft profile is created from an accepted application.",
        readOnly: true,
      },
    },
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
      name: "artistStatement",
      type: "textarea",
      label: "Artist statement",
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
      name: "country",
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
      type: "group",
      name: "publicDisplay",
      label: "Public display approvals",
      admin: {
        description:
          "Every option is private by default. Enable only after the artist has approved that information for public display.",
      },
      fields: [
        {
          name: "biography",
          type: "checkbox",
          defaultValue: false,
          label: "Biography approved for public display",
        },
        {
          name: "artistStatement",
          type: "checkbox",
          defaultValue: false,
          label: "Artist statement approved for public display",
        },
        {
          name: "location",
          type: "checkbox",
          defaultValue: false,
          label: "City and state approved for public display",
        },
        {
          name: "categories",
          type: "checkbox",
          defaultValue: false,
          label: "Modeling categories approved for public display",
        },
        {
          name: "instagram",
          type: "checkbox",
          defaultValue: false,
          label: "Instagram approved for public display",
        },
        {
          name: "website",
          type: "checkbox",
          defaultValue: false,
          label: "Website approved for public display",
        },
      ],
    },
    {
      name: "adminNotes",
      type: "textarea",
      label: "Private administrator notes",
      access: { read: staffFieldAccess },
    },
    bookingPreferencesField,
  ],
  hooks: {
    beforeChange: [validateProfileAccountRole("model")],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
};
