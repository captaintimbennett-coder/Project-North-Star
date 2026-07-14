import type { CollectionConfig } from "payload";
import { currentRetreatEdition } from "@/data/retreat-editions";
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
      "Private review inbox. Review the application, accept/decline it, then create a private draft Featured Artist profile when you are ready. Nothing publishes automatically.",
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
              label: "Step 2A — Private draft only",
              virtual: true,
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.applicationStatus === "accepted" && !siblingData?.linkedModelProfile,
                description:
                  "Use this if the applicant is accepted, but Tim still needs to review the profile before anything appears publicly. Check this box and save once. Nothing is added to the public lineup.",
                readOnly: false,
              },
            },
            {
              name: "approveForFoundersEdition",
              type: "checkbox",
              defaultValue: false,
              label: `Step 2B — Approve publicly for ${currentRetreatEdition.shortTitle}`,
              virtual: true,
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.applicationStatus === "accepted" && !siblingData?.publicLineupApprovedAt,
                description:
                  `Recommended when the applicant is accepted, has granted publication permission, and is ready to show on the site. Check this box and save once. The system creates or updates the Featured Artist profile, approves the image, publishes the profile, adds the artist to ${currentRetreatEdition.shortTitle}, approves the public lineup assignment, and sends the acceptance email.`,
                readOnly: false,
              },
            },
            {
              name: "publicLineupApprovedAt",
              type: "date",
              label: `Step 2B complete — Publicly approved for ${currentRetreatEdition.shortTitle}`,
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.publicLineupApprovedAt),
                date: { pickerAppearance: "dayAndTime" },
                description:
                  `Done. This application has already created or updated the profile, approved the image, and added the artist to the ${currentRetreatEdition.shortTitle} public lineup.`,
                readOnly: true,
              },
            },
            {
              name: "acceptanceEmailStatus",
              type: "select",
              defaultValue: "pending",
              label: "Acceptance email",
              options: [
                { label: "Pending public approval", value: "pending" },
                { label: "Sending", value: "sending" },
                { label: "Sent", value: "sent" },
                { label: "Failed — retry available", value: "failed" },
              ],
              required: true,
              admin: { readOnly: true },
            },
            {
              name: "acceptanceEmailSentAt",
              type: "date",
              label: "Acceptance email sent at",
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.acceptanceEmailSentAt),
                date: { pickerAppearance: "dayAndTime" },
                readOnly: true,
              },
            },
            {
              name: "acceptanceEmailLastError",
              type: "text",
              label: "Acceptance email delivery note",
              admin: {
                condition: (_, siblingData) => siblingData?.acceptanceEmailStatus === "failed",
                description: "Non-sensitive delivery status. Retry after correcting email configuration or the applicant address.",
                readOnly: true,
              },
            },
            {
              name: "retryAcceptanceEmail",
              type: "checkbox",
              defaultValue: false,
              label: "Retry acceptance email",
              virtual: true,
              admin: {
                condition: (_, siblingData) =>
                  Boolean(siblingData?.publicLineupApprovedAt) &&
                  siblingData?.acceptanceEmailStatus === "failed",
                description: "Check and save once after correcting the delivery problem. A successfully sent acceptance email is never sent again automatically.",
              },
            },
            {
              name: "linkedModelProfile",
              type: "relationship",
              label: "Step 3 — Profile status receipt",
              relationTo: "model-profiles",
              admin: {
                description:
                  `No action needed here. This shows the Featured Artist profile created or updated by Step 2. If you chose Step 2B, the public profile and ${currentRetreatEdition.shortTitle} lineup assignment were handled automatically.`,
                readOnly: true,
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
                  "Private review image submitted by the applicant. Step 2B approves this image for platform use automatically.",
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
              admin: {
                description:
                  "Version 1 availability overview. The public form requires this on new applications. Older verification records may be blank; if so, do not let this block review.",
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
            {
              name: "shortBiography",
              type: "textarea",
              label: "Short biography (optional)",
              admin: { description: "May be completed or refined after acceptance and before publication." },
            },
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
                "I give Lone Star Retreat permission to use my submitted images only to evaluate this application. This review permission does not authorize public publication.",
              required: true,
            },
            {
              name: "publicProfilePermissionConfirmed",
              type: "checkbox",
              defaultValue: false,
              label: "Public profile permission is on file",
              admin: {
                description:
                  "Historical fact only. False is expected for legacy applications and never blocks ordinary review edits. Use the documented-permission action below to record permission received after application.",
                readOnly: true,
              },
            },
            {
              name: "publicProfilePermissionSource",
              dbName: "pub_perm_source",
              type: "select",
              label: "Public profile permission source",
              options: [
                { label: "Applicant granted permission in the application", value: "applicant-application" },
                { label: "Administrator documented permission received later", value: "administrator-documented" },
              ],
              admin: { readOnly: true },
            },
            {
              name: "publicProfilePermissionConfirmedAt",
              type: "date",
              label: "Public profile permission recorded at",
              admin: {
                date: { pickerAppearance: "dayAndTime" },
                readOnly: true,
              },
            },
            {
              name: "recordDocumentedPublicProfilePermission",
              type: "checkbox",
              defaultValue: false,
              label: "Record documented public profile permission received after application",
              virtual: true,
              admin: {
                condition: (_, siblingData) => siblingData?.publicProfilePermissionConfirmed !== true,
                description:
                  "Use only after the applicant has explicitly authorized public use of their approved profile information and images in a documented communication. This records administrator-documented permission; it does not represent that the applicant checked the original application box.",
              },
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
