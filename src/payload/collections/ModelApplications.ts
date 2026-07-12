import type { CollectionConfig } from "payload";
import { ownerOnly, ownerOrEditorOnly, staffOnly } from "../access/account";
import {
  createModelProfileFromApplication,
  validateModelProfileCreationRequest,
} from "../hooks/createModelProfileFromApplication";

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
    create: ownerOrEditorOnly,
    delete: ownerOnly,
    read: staffOnly,
    update: staffOnly,
  },
  admin: {
    defaultColumns: ["stageName", "email", "applicationStatus", "submittedAt"],
    description:
      "Private review inbox. Review the application, accept/decline it, then create a private draft Featured Model profile when you are ready. Nothing publishes automatically.",
    group: "Lone Star Retreat",
    useAsTitle: "stageName",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Review Decision",
          fields: [
            {
              name: "modelApplicationReviewGuide",
              type: "ui",
              admin: {
                components: {
                  Field: "/payload/admin/ApplicationReviewGuide#ModelApplicationReviewGuide",
                },
              },
            },
            {
              name: "applicationStatus",
              type: "select",
              defaultValue: "new",
              label: "Step 1 — Review decision",
              admin: {
                description:
                  "Choose where this application stands: New, Reviewing, Accepted, Declined, or Waitlist. This only updates your private review status; it does not publish anything.",
              },
              options: applicationStatusOptions,
              required: true,
            },
            {
              name: "createProfileFromApplication",
              type: "checkbox",
              defaultValue: false,
              label: "Step 2 — Create draft profile from this application",
              virtual: true,
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.applicationStatus === "accepted" && !siblingData?.linkedModelProfile,
                description:
                  "Use this only after Step 1 is set to Accepted. Check the box, save, and the system will copy the application details into a private draft Featured Model profile. This option disappears after the draft profile is created.",
                readOnly: false,
              },
            },
            {
              name: "linkedModelProfile",
              type: "relationship",
              label: "Step 3 — Draft profile status",
              relationTo: "model-profiles",
              admin: {
                description:
                  "If this says “Select a value,” no draft profile has been made for this application yet. Check Step 2 and save. If this shows a model name, go to Models / Featured Artists in the left menu and open that same name.",
              },
            },
            { name: "privateAdminNotes", type: "textarea", label: "Private administrator notes" },
            {
              name: "preferredHeroImage",
              type: "upload",
              label: "Preferred profile / hero image",
              relationTo: "media",
              admin: {
                description:
                  "Private review image submitted by the applicant. Nothing is published unless a media item is explicitly approved for platform use later.",
              },
            },
            {
              name: "additionalPortfolioImages",
              type: "upload",
              hasMany: true,
              label: "Additional portfolio images (optional)",
              maxRows: 4,
              relationTo: "media",
              admin: {
                description:
                  "Private review images submitted by the applicant. Nothing is published automatically.",
              },
            },
          ],
        },
        {
          label: "Basic Information",
          fields: [
            {
              name: "legalName",
              type: "text",
              label: "Legal name (optional)",
              admin: {
                description:
                  "Private administrative information. Never display publicly. It may be collected later for contracts, payment, or tax documentation.",
              },
            },
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
            {
              name: "marketingSource",
              type: "select",
              label: "How did you hear about Lone Star Retreat?",
              options: [
                { label: "Instagram", value: "instagram" },
                { label: "Facebook", value: "facebook" },
                { label: "Friend", value: "friend" },
                { label: "Photographer", value: "photographer" },
                { label: "Model", value: "model" },
                { label: "Workshop", value: "workshop" },
                { label: "Magazine", value: "magazine" },
                { label: "Google Search", value: "google-search" },
                { label: "Other", value: "other" },
              ],
              required: true,
            },
            {
              name: "otherMarketingSource",
              type: "text",
              label: "Other referral source",
              admin: {
                condition: (_, siblingData) => siblingData?.marketingSource === "other",
              },
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
              admin: {
                description:
                  "Legacy storage field. The public application records the applicant-facing Travel Commitment answer in Travel / availability notes.",
              },
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
              label: "Travel / availability notes",
            },
          ],
        },
        {
          label: "Session Availability",
          fields: [
            {
              name: "creativeInterests",
              type: "select",
              hasMany: true,
              label: "Which types of sessions are they available to participate in?",
              required: true,
              admin: {
                description:
                  "Version 1 availability overview. Detailed boundaries and session-specific consent are confirmed later if accepted.",
              },
              options: [
                { label: "Fashion", value: "fashion" },
                { label: "Editorial", value: "editorial" },
                { label: "Glamour", value: "glamour" },
                { label: "Swimwear", value: "swimwear" },
                { label: "Lingerie", value: "lingerie" },
                { label: "Boudoir", value: "boudoir" },
                { label: "Artistic nude", value: "artistic-nude" },
                { label: "Fine art nude", value: "fine-art-nude" },
                { label: "Beauty", value: "beauty" },
                { label: "Conceptual / creative", value: "conceptual-creative" },
                { label: "Lifestyle", value: "lifestyle" },
                { label: "Other", value: "other" },
              ],
            },
            { name: "otherCreativeInterest", type: "text", label: "Other creative interest" },
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
            { name: "shortBiography", type: "textarea", label: "Short biography", required: true },
            { name: "artistStatement", type: "textarea", label: "Artist statement (optional)" },
          ],
        },
        {
          label: "Confirmations",
          fields: [
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
              label:
                "I have read and agree to follow the Lone Star Retreat Professional Standards & Code of Conduct.",
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
  hooks: {
    beforeChange: [validateModelProfileCreationRequest],
    afterChange: [createModelProfileFromApplication],
  },
  versions: { maxPerDoc: 50 },
};
