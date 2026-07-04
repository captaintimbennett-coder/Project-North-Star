import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

const applicationStatusOptions = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Waitlist", value: "waitlist" },
];

export const ModelApplications: CollectionConfig = {
  slug: "model-applications",
  labels: {
    plural: "Model Applications",
    singular: "Model Application",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["legalName", "stageName", "applicationStatus", "submittedAt"],
    description:
      "Private review records. Accepted applications may later be used to create or update a canonical model profile; nothing is published automatically.",
    group: "Lone Star Retreat",
    useAsTitle: "stageName",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Basic Information",
          fields: [
            { name: "legalName", type: "text", label: "Legal name", required: true },
            { name: "stageName", type: "text", label: "Display / stage name", required: true },
            { name: "email", type: "email", required: true },
            { name: "phone", type: "text", required: true },
            { name: "city", type: "text", required: true },
            { name: "state", type: "text", required: true },
            { name: "country", type: "text", required: true },
            { name: "instagramURL", type: "text", label: "Instagram URL" },
            { name: "websiteURL", type: "text", label: "Website URL" },
            { name: "portfolioURL", type: "text", label: "Portfolio URL" },
            {
              name: "agencyRepresentation",
              type: "text",
              label: "Agency representation (optional)",
            },
          ],
        },
        {
          label: "Professional Information",
          fields: [
            {
              name: "modelingExperienceLevel",
              dbName: "model_exp_level",
              type: "select",
              label: "Modeling experience level",
              options: [
                { label: "Aspiring", value: "aspiring" },
                { label: "Developing", value: "developing" },
                { label: "Experienced", value: "experienced" },
                { label: "Professional", value: "professional" },
              ],
              required: true,
            },
            {
              name: "travelAvailability",
              type: "select",
              label: "Travel availability",
              options: [
                { label: "Local only", value: "local-only" },
                { label: "Regional", value: "regional" },
                { label: "Domestic", value: "domestic" },
                { label: "International", value: "international" },
                { label: "Case by case", value: "case-by-case" },
              ],
              required: true,
            },
            { name: "homeAirport", type: "text", label: "Home airport (optional)" },
            {
              name: "availabilityNotes",
              type: "textarea",
              label: "City / state / country availability notes",
            },
          ],
        },
        {
          label: "Creative Interests",
          fields: [
            {
              name: "creativeInterests",
              type: "select",
              hasMany: true,
              required: true,
              options: [
                { label: "Fashion", value: "fashion" },
                { label: "Editorial", value: "editorial" },
                { label: "Glamour", value: "glamour" },
                { label: "Swimwear", value: "swimwear" },
                { label: "Lingerie", value: "lingerie" },
                { label: "Boudoir", value: "boudoir" },
                { label: "Artistic nude", value: "artistic-nude" },
                { label: "Fine art nude", value: "fine-art-nude" },
                { label: "Beauty / close-up", value: "beauty-close-up" },
                { label: "Conceptual / creative", value: "conceptual-creative" },
                { label: "Other", value: "other" },
              ],
            },
            { name: "otherCreativeInterest", type: "text", label: "Other creative interest" },
            {
              name: "comfortLevels",
              type: "select",
              hasMany: true,
              required: true,
              options: [
                { label: "Fully clothed", value: "fully-clothed" },
                { label: "Fashion", value: "fashion" },
                { label: "Swimwear", value: "swimwear" },
                { label: "Lingerie", value: "lingerie" },
                { label: "Implied nude", value: "implied-nude" },
                { label: "Artistic nude", value: "artistic-nude" },
                { label: "Fine art nude", value: "fine-art-nude" },
              ],
            },
            {
              name: "retreatGoals",
              type: "select",
              hasMany: true,
              label: "What they hope to gain",
              options: [
                { label: "Network with photographers", value: "network-with-photographers" },
                {
                  label: "Build long-term creative collaborations",
                  value: "long-term-collaborations",
                },
                { label: "Paid shooting opportunities", value: "paid-shooting-opportunities" },
                { label: "Expand professional portfolio", value: "expand-portfolio" },
                { label: "Publication opportunities", value: "publication-opportunities" },
                {
                  label: "Travel to a professionally organized event",
                  value: "professional-event-travel",
                },
                { label: "Meet other professional models", value: "meet-professional-models" },
                {
                  label: "Work with photographers who value professionalism and respect",
                  value: "professional-respectful-photographers",
                },
                { label: "Other", value: "other" },
              ],
            },
            { name: "otherRetreatGoal", type: "text", label: "Other retreat goal" },
          ],
        },
        {
          label: "Featured Artist Materials",
          fields: [
            {
              name: "preferredHeroImage",
              type: "upload",
              label: "Preferred profile / hero image",
              relationTo: "media",
              admin: {
                description:
                  "Upload the image you would prefer us to consider as your featured image. Final image selection remains subject to approval.",
              },
            },
            {
              name: "additionalPortfolioImages",
              type: "upload",
              hasMany: true,
              label: "Additional portfolio images (optional)",
              maxRows: 4,
              relationTo: "media",
            },
            { name: "shortBiography", type: "textarea", label: "Short biography", required: true },
            { name: "artistStatement", type: "textarea", label: "Artist statement (optional)" },
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
              name: "linkedModelProfile",
              type: "relationship",
              label: "Linked master profile (optional)",
              relationTo: "model-profiles",
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
              name: "consentImageUsageConfirmed",
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
