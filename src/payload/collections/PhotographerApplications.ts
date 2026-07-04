import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

const applicationStatusOptions = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Waitlist", value: "waitlist" },
];

export const PhotographerApplications: CollectionConfig = {
  slug: "photographer-applications",
  labels: {
    plural: "Photographer Applications",
    singular: "Photographer Application",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["legalName", "displayName", "applicationStatus", "submittedAt"],
    description:
      "Private review records. Accepted applications may later be used to create or update a canonical photographer profile; nothing is published automatically.",
    group: "Lone Star Retreat",
    useAsTitle: "displayName",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Basic Information",
          fields: [
            { name: "legalName", type: "text", label: "Legal name", required: true },
            { name: "displayName", type: "text", label: "Display name", required: true },
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text", required: true },
            { name: "city", type: "text", required: true },
            { name: "state", type: "text", required: true },
            { name: "country", type: "text", required: true },
            { name: "instagramURL", type: "text", label: "Instagram URL" },
            { name: "websiteURL", type: "text", label: "Website URL" },
            { name: "portfolioURL", type: "text", label: "Portfolio URL" },
          ],
        },
        {
          label: "Professional Information",
          fields: [
            {
              name: "photographyExperienceLevel",
              dbName: "photo_exp_level",
              type: "select",
              label: "Photography experience level",
              options: [
                { label: "Developing", value: "developing" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" },
                { label: "Professional", value: "professional" },
              ],
              required: true,
            },
            { name: "equipmentSummary", type: "textarea", label: "Equipment summary", required: true },
            {
              name: "genresInterests",
              type: "select",
              hasMany: true,
              label: "Genres / interests",
              required: true,
              options: [
                { label: "Glamour", value: "glamour" },
                { label: "Boudoir", value: "boudoir" },
                { label: "Editorial", value: "editorial" },
                { label: "Artistic nude", value: "artistic-nude" },
                { label: "Fashion", value: "fashion" },
                { label: "Swimwear", value: "swimwear" },
                { label: "Beauty", value: "beauty" },
                { label: "Other", value: "other" },
              ],
            },
            { name: "otherGenreInterest", type: "text", label: "Other genre / interest" },
            {
              name: "whatTheyHopeToCreate",
              type: "textarea",
              label: "What they hope to create",
              required: true,
            },
            { name: "retreatGoals", type: "textarea", label: "Retreat goals", required: true },
            {
              name: "collaborationStyleNotes",
              type: "textarea",
              label: "Collaboration style / notes",
            },
          ],
        },
        {
          label: "Administrative",
          fields: [
            {
              name: "applicationStatus",
              type: "select",
              defaultValue: "new",
              label: "Application status",
              options: applicationStatusOptions,
              required: true,
            },
            {
              name: "linkedPhotographerProfile",
              type: "relationship",
              label: "Linked master profile (optional)",
              relationTo: "photographer-profiles",
              admin: {
                description:
                  "Set only after review when this application has been used to create or update a canonical profile.",
              },
            },
            { name: "privateAdminNotes", type: "textarea", label: "Private administrator notes" },
            {
              name: "informationAccurateConfirmed",
              type: "checkbox",
              defaultValue: false,
              label: "I confirm the information submitted is accurate.",
              required: true,
            },
            {
              name: "noAcceptanceGuaranteeConfirmed",
              type: "checkbox",
              defaultValue: false,
              label: "I understand submitting an application does not guarantee acceptance.",
              required: true,
            },
            {
              name: "internalImageReviewConfirmed",
              type: "checkbox",
              defaultValue: false,
              label:
                "I understand my uploaded images are for internal review only and will not be published without approval.",
              required: true,
            },
            {
              name: "codeOfConductConfirmed",
              type: "checkbox",
              defaultValue: false,
              label: "I agree to follow the Lone Star Retreat code of conduct.",
              required: true,
            },
            {
              name: "contactPermissionConfirmed",
              type: "checkbox",
              defaultValue: false,
              label: "I understand Lone Star Retreat may contact me using the information provided.",
              required: true,
            },
            {
              name: "submittedAt",
              type: "date",
              defaultValue: () => new Date().toISOString(),
              label: "Submitted at",
              required: true,
              admin: { date: { pickerAppearance: "dayAndTime" }, readOnly: true },
            },
          ],
        },
      ],
    },
  ],
  versions: { maxPerDoc: 50 },
};
