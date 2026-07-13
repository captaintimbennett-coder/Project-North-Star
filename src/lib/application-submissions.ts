import config from "@payload-config";
import { countryOptions, usStateOptions } from "@/data/location-options";
import {
  sendModelApplicationReceived,
  sendPhotographerApplicationReceived,
} from "@/lib/email/application-email";
import { getPayload, type File as PayloadFile } from "payload";
import {
  ACCEPTED_IMAGE_TYPES,
  ApplicationValidationError,
  MAX_IMAGE_BYTES,
  assertValid,
  getOptionalString,
  getRequiredString,
  getStringArray,
  getUploadedFiles,
  requireConfirmation,
  requireSelection,
  validateAllowedValues,
  validateEmail,
  validateModelImages,
  validateOptionalURL,
  type ValidationErrors,
} from "./application-protection";

const MODEL_EXPERIENCE = ["aspiring", "developing", "experienced", "professional"] as const;
const TRAVEL_AVAILABILITY = ["yes", "no", "possibly"] as const;
const ALTERNATE_MODEL_LIST = ["yes", "no"] as const;
type StoredTravelAvailability =
  | "local-only"
  | "regional"
  | "domestic"
  | "international"
  | "case-by-case";
type UploadedModelImageReference = {
  contentType: string;
  filename: string;
  pathname: string;
  size: number;
  url: string;
};
const MODEL_INTERESTS = [
  "fashion",
  "editorial",
  "glamour",
  "swimwear",
  "lingerie",
  "boudoir",
  "artistic-nude",
  "fine-art-nude",
  "beauty",
  "conceptual-creative",
  "lifestyle",
  "other",
] as const;
const MODEL_GOALS = [
  "network-with-photographers",
  "long-term-collaborations",
  "paid-shooting-opportunities",
  "expand-portfolio",
  "publication-opportunities",
  "professional-event-travel",
  "meet-professional-models",
  "professional-respectful-photographers",
  "other",
] as const;
const PHOTOGRAPHER_EXPERIENCE = ["developing", "intermediate", "advanced", "professional"] as const;
const PHOTOGRAPHER_INTERESTS = [
  "glamour",
  "boudoir",
  "editorial",
  "artistic-nude",
  "fashion",
  "swimwear",
  "beauty",
  "other",
] as const;
const MARKETING_SOURCES = [
  "instagram",
  "facebook",
  "friend",
  "photographer",
  "model",
  "workshop",
  "magazine",
  "google-search",
  "other",
] as const;

const COUNTRIES = countryOptions;
const US_STATES = usStateOptions;

function getTravelAvailabilityForStorage(
  value: (typeof TRAVEL_AVAILABILITY)[number],
): StoredTravelAvailability {
  if (value === "yes") return "domestic";
  if (value === "no") return "local-only";
  return "case-by-case";
}

function formatYesNo(value: string): string {
  return value === "yes" ? "Yes" : "No";
}

function formatTravelCommitment(value: (typeof TRAVEL_AVAILABILITY)[number]): string {
  if (value === "possibly") return "Possibly";
  return formatYesNo(value);
}

function normalizeBlobFilename(image: UploadedModelImageReference): string {
  const pathnameParts = image.pathname.split("/");
  const pathnameFilename = pathnameParts[pathnameParts.length - 1];
  return pathnameFilename || image.filename;
}

function validateCommon(
  formData: FormData,
  errors: ValidationErrors,
) {
  const legalName = getOptionalString(formData, "legalName");
  const email = getRequiredString(formData, "email", errors);
  const phone = getRequiredString(formData, "phone", errors);
  const city = getRequiredString(formData, "city", errors);
  const state = getRequiredString(formData, "state", errors);
  const country = getRequiredString(formData, "country", errors);
  const instagramURL = getOptionalString(formData, "instagramURL");
  const websiteURL = getOptionalString(formData, "websiteURL");
  const portfolioURL = getOptionalString(formData, "portfolioURL");
  const marketingSource = getRequiredString(formData, "marketingSource", errors);

  validateEmail(email, errors);
  validateOptionalURL(instagramURL, "instagramURL", errors);
  validateOptionalURL(websiteURL, "websiteURL", errors);
  validateOptionalURL(portfolioURL, "portfolioURL", errors);
  validateAllowedValues([marketingSource], MARKETING_SOURCES, "marketingSource", errors);
  validateAllowedValues([country], COUNTRIES, "country", errors);
  if (country === "United States") {
    validateAllowedValues([state], US_STATES, "state", errors);
  }
  const otherMarketingSource = getOptionalString(formData, "otherMarketingSource");
  if (marketingSource === "other" && !otherMarketingSource) {
    errors.otherMarketingSource = "Tell us how you heard about Lone Star Retreat.";
  }

  const consents = {
    informationAccurateConfirmed: requireConfirmation(
      formData,
      "informationAccurateConfirmed",
      errors,
    ),
    noAcceptanceGuaranteeConfirmed: requireConfirmation(
      formData,
      "noAcceptanceGuaranteeConfirmed",
      errors,
    ),
    codeOfConductConfirmed: requireConfirmation(formData, "codeOfConductConfirmed", errors),
    contactPermissionConfirmed: requireConfirmation(formData, "contactPermissionConfirmed", errors),
  };

  return {
    legalName,
    email,
    phone,
    city,
    state,
    country,
    instagramURL,
    websiteURL,
    portfolioURL,
    marketingSource: marketingSource as (typeof MARKETING_SOURCES)[number],
    otherMarketingSource,
    ...consents,
  };
}

function getUploadedImageReferences(
  formData: FormData,
  errors: ValidationErrors,
): UploadedModelImageReference[] {
  const rawValue = getOptionalString(formData, "uploadedImages");
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Expected an array.");

    return parsed.flatMap((item): UploadedModelImageReference[] => {
      if (!item || typeof item !== "object") return [];
      const image = item as Partial<UploadedModelImageReference>;
      if (
        typeof image.contentType !== "string" ||
        typeof image.filename !== "string" ||
        typeof image.pathname !== "string" ||
        typeof image.size !== "number" ||
        typeof image.url !== "string"
      ) {
        return [];
      }

      return [{
        contentType: image.contentType,
        filename: image.filename,
        pathname: image.pathname,
        size: image.size,
        url: image.url,
      }];
    });
  } catch {
    errors.preferredHeroImage = "We could not read the uploaded image reference. Please upload the image again.";
    return [];
  }
}

function validateUploadedImageReferences(
  images: UploadedModelImageReference[],
  errors: ValidationErrors,
): void {
  if (images.length === 0) {
    errors.preferredHeroImage = "Upload at least one image for private review.";
    return;
  }

  if (images.length > 5) {
    errors.additionalImages = "Upload no more than five images in total.";
    return;
  }

  for (const image of images) {
    if (!image.pathname.startsWith("media/model-applications/")) {
      errors.preferredHeroImage = "The uploaded image reference is invalid. Please upload the image again.";
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.has(image.contentType)) {
      errors.preferredHeroImage = "Images must be JPG, JPEG, PNG, or WebP. Video files are not accepted.";
      return;
    }
    if (image.size > MAX_IMAGE_BYTES) {
      errors.preferredHeroImage = "Each image must be 10MB or smaller.";
      return;
    }
    try {
      const url = new URL(image.url);
      if (url.protocol !== "https:") throw new Error("Invalid URL protocol.");
    } catch {
      errors.preferredHeroImage = "The uploaded image URL is invalid. Please upload the image again.";
      return;
    }
  }
}

export async function createPublicModelApplication(formData: FormData) {
  const errors: ValidationErrors = {};
  const common = validateCommon(formData, errors);
  const stageName = getRequiredString(formData, "stageName", errors);
  const modelingExperienceLevel = getRequiredString(formData, "modelingExperienceLevel", errors);
  const travelAvailability = getRequiredString(formData, "travelAvailability", errors);
  const alternateModelList = getRequiredString(formData, "alternateModelList", errors);
  const creativeInterests = getStringArray(formData, "creativeInterests");
  const retreatGoals = getStringArray(formData, "retreatGoals");
  const shortBiography = getRequiredString(formData, "shortBiography", errors);
  const consentImageUsageConfirmed = requireConfirmation(
    formData,
    "consentImageUsageConfirmed",
    errors,
  );
  const uploadedImageReferences = getUploadedImageReferences(formData, errors);
  const files = [
    ...getUploadedFiles(formData, "preferredHeroImage"),
    ...getUploadedFiles(formData, "additionalImages"),
    ...getUploadedFiles(formData),
  ];

  validateAllowedValues([modelingExperienceLevel], MODEL_EXPERIENCE, "modelingExperienceLevel", errors);
  validateAllowedValues([travelAvailability], TRAVEL_AVAILABILITY, "travelAvailability", errors);
  validateAllowedValues([alternateModelList], ALTERNATE_MODEL_LIST, "alternateModelList", errors);
  const availabilityNotes = getOptionalString(formData, "availabilityNotes");
  if (travelAvailability === "possibly" && !availabilityNotes) {
    errors.availabilityNotes = "Please tell us what would affect your ability to travel.";
  }
  requireSelection(creativeInterests, "creativeInterests", errors);
  validateAllowedValues(creativeInterests, MODEL_INTERESTS, "creativeInterests", errors);
  validateAllowedValues(retreatGoals, MODEL_GOALS, "retreatGoals", errors);
  if (uploadedImageReferences.length > 0) validateUploadedImageReferences(uploadedImageReferences, errors);
  else validateModelImages(files, errors);
  assertValid(errors);

  const payload = await getPayload({ config });
  const mediaIDs: number[] = [];
  const travelCommitment = travelAvailability as (typeof TRAVEL_AVAILABILITY)[number];
  const alternateList = alternateModelList as (typeof ALTERNATE_MODEL_LIST)[number];
  const combinedAvailabilityNotes = [
    `Travel commitment: ${formatTravelCommitment(travelCommitment)}.`,
    `Alternate model list: ${formatYesNo(alternateList)}.`,
    availabilityNotes ? `Applicant notes: ${availabilityNotes}` : undefined,
  ].filter(Boolean).join("\n");

  try {
    for (const image of uploadedImageReferences) {
      const media = await payload.create({
        collection: "media",
        data: {
          alt: `Private application image — ${stageName}`,
          filename: normalizeBlobFilename(image),
          filesize: image.size,
          mimeType: image.contentType,
          url: image.url,
          usageApproved: false,
        },
        overrideAccess: true,
      });
      mediaIDs.push(media.id);
    }

    for (const file of files) {
      const payloadFile: PayloadFile = {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      };
      const media = await payload.create({
        collection: "media",
        data: {
          alt: `Private application image — ${stageName}`,
          usageApproved: false,
        },
        file: payloadFile,
        overrideAccess: true,
      });
      mediaIDs.push(media.id);
    }

    const submittedAt = new Date().toISOString();
    const application = await payload.create({
      collection: "model-applications",
      data: {
        ...common,
        stageName,
        modelingExperienceLevel: modelingExperienceLevel as (typeof MODEL_EXPERIENCE)[number],
        travelAvailability: getTravelAvailabilityForStorage(travelCommitment),
        creativeInterests: creativeInterests as (typeof MODEL_INTERESTS)[number][],
        retreatGoals: retreatGoals as (typeof MODEL_GOALS)[number][],
        shortBiography,
        agencyRepresentation: getOptionalString(formData, "agencyRepresentation"),
        homeAirport: getOptionalString(formData, "homeAirport"),
        availabilityNotes: combinedAvailabilityNotes,
        otherCreativeInterest: getOptionalString(formData, "otherCreativeInterest"),
        otherRetreatGoal: getOptionalString(formData, "otherRetreatGoal"),
        artistStatement: getOptionalString(formData, "artistStatement"),
        preferredHeroImage: mediaIDs[0],
        additionalPortfolioImages: mediaIDs.slice(1),
        applicationStatus: "new",
        consentImageUsageConfirmed,
        submittedAt,
      },
      overrideAccess: true,
    });

    await sendModelApplicationReceived({
      applicantEmail: common.email,
      applicantName: stageName,
      applicationId: application.id,
      payload,
      submittedAt,
    });

    return application;
  } catch (error) {
    await Promise.allSettled(
      mediaIDs.map((id) =>
        payload.delete({ collection: "media", id, overrideAccess: true }),
      ),
    );
    throw error;
  }
}

export async function createPublicPhotographerApplication(formData: FormData) {
  const errors: ValidationErrors = {};
  const common = validateCommon(formData, errors);
  const legalName = getRequiredString(formData, "legalName", errors);
  const displayName = getOptionalString(formData, "displayName");
  const photographyExperienceLevel = getRequiredString(
    formData,
    "photographyExperienceLevel",
    errors,
  );
  const equipmentSummary = getOptionalString(formData, "equipmentSummary");
  const genresInterests = getStringArray(formData, "genresInterests");
  const whatTheyHopeToCreate = getOptionalString(formData, "whatTheyHopeToCreate");
  const retreatGoals = getOptionalString(formData, "retreatGoals");
  const internalImageReviewConfirmed = requireConfirmation(
    formData,
    "internalImageReviewConfirmed",
    errors,
  );

  validateAllowedValues(
    [photographyExperienceLevel],
    PHOTOGRAPHER_EXPERIENCE,
    "photographyExperienceLevel",
    errors,
  );
  requireSelection(genresInterests, "genresInterests", errors);
  validateAllowedValues(genresInterests, PHOTOGRAPHER_INTERESTS, "genresInterests", errors);
  assertValid(errors);

  const payload = await getPayload({ config });
  const submittedAt = new Date().toISOString();
  const application = await payload.create({
    collection: "photographer-applications",
    data: {
      ...common,
      legalName,
      displayName,
      photographyExperienceLevel:
        photographyExperienceLevel as (typeof PHOTOGRAPHER_EXPERIENCE)[number],
      equipmentSummary,
      genresInterests: genresInterests as (typeof PHOTOGRAPHER_INTERESTS)[number][],
      whatTheyHopeToCreate: whatTheyHopeToCreate || "",
      retreatGoals: retreatGoals || "",
      otherGenreInterest: getOptionalString(formData, "otherGenreInterest"),
      collaborationStyleNotes: getOptionalString(formData, "collaborationStyleNotes"),
      applicationStatus: "new",
      internalImageReviewConfirmed,
      submittedAt,
    },
    overrideAccess: true,
  });

  await sendPhotographerApplicationReceived({
    applicantEmail: common.email,
    applicantName: displayName || legalName,
    applicationId: application.id,
    payload,
    submittedAt,
  });

  return application;
}

export { ApplicationValidationError };
