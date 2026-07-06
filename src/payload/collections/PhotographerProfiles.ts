import type { CollectionConfig } from "payload";
import { ownerOnly, ownerOrEditorOnly, staffOrOwnProfile, staffFieldAccess } from "../access/account";
import { bookingPreferencesField } from "../fields/bookingPreferences";
import { validateProfileAccountRole } from "../hooks/validateProfileAccountRole";

export const PhotographerProfiles: CollectionConfig = {
  slug: "photographer-profiles",
  labels: {
    plural: "Photographers / Participants",
    singular: "Photographer / Participant",
  },
  access: {
    create: ownerOrEditorOnly,
    delete: ownerOnly,
    read: staffOrOwnProfile("photographer"),
    update: ownerOrEditorOnly,
  },
  admin: {
    defaultColumns: ["displayName", "approvalStatus", "experienceLevel", "city", "state"],
    description:
      "Canonical photographer records. Registrations and event participation will reference these profiles later.",
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
      name: "profileImage",
      type: "upload",
      label: "Profile image",
      relationTo: "media",
    },
    {
      name: "experienceLevel",
      type: "select",
      label: "Experience level",
      options: [
        { label: "Developing", value: "developing" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
        { label: "Professional", value: "professional" },
      ],
    },
    {
      name: "equipmentSummary",
      type: "textarea",
      label: "Equipment summary",
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
      name: "adminNotes",
      type: "textarea",
      label: "Private administrator notes",
      access: { read: staffFieldAccess },
    },
    bookingPreferencesField,
  ],
  hooks: {
    beforeChange: [validateProfileAccountRole("photographer")],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
};
