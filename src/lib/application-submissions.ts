import config from "@payload-config";
import { getPayload, type File as PayloadFile } from "payload";
import {
  ApplicationValidationError,
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
const TRAVEL_AVAILABILITY = [
  "local-only",
  "regional",
  "domestic",
  "international",
  "case-by-case",
] as const;
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

export async function createPublicModelApplication(formData: FormData) {
  const errors: ValidationErrors = {};
  const common = validateCommon(formData, errors);
  const stageName = getRequiredString(formData, "stageName", errors);
  const modelingExperienceLevel = getRequiredString(formData, "modelingExperienceLevel", errors);
  const travelAvailability = getRequiredString(formData, "travelAvailability", errors);
  const creativeInterests = getStringArray(formData, "creativeInterests");
  const retreatGoals = getStringArray(formData, "retreatGoals");
  const shortBiography = getRequiredString(formData, "shortBiography", errors);
  const consentImageUsageConfirmed = requireConfirmation(
    formData,
    "consentImageUsageConfirmed",
    errors,
  );
  const files = getUploadedFiles(formData);

  validateAllowedValues([modelingExperienceLevel], MODEL_EXPERIENCE, "modelingExperienceLevel", errors);
  validateAllowedValues([travelAvailability], TRAVEL_AVAILABILITY, "travelAvailability", errors);
  requireSelection(creativeInterests, "creativeInterests", errors);
  validateAllowedValues(creativeInterests, MODEL_INTERESTS, "creativeInterests", errors);
  validateAllowedValues(retreatGoals, MODEL_GOALS, "retreatGoals", errors);
  validateModelImages(files, errors);
  assertValid(errors);

  const payload = await getPayload({ config });
  const mediaIDs: number[] = [];

  try {
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

    return await payload.create({
      collection: "model-applications",
      data: {
        ...common,
        stageName,
        modelingExperienceLevel: modelingExperienceLevel as (typeof MODEL_EXPERIENCE)[number],
        travelAvailability: travelAvailability as (typeof TRAVEL_AVAILABILITY)[number],
        creativeInterests: creativeInterests as (typeof MODEL_INTERESTS)[number][],
        retreatGoals: retreatGoals as (typeof MODEL_GOALS)[number][],
        shortBiography,
        agencyRepresentation: getOptionalString(formData, "agencyRepresentation"),
        homeAirport: getOptionalString(formData, "homeAirport"),
        availabilityNotes: getOptionalString(formData, "availabilityNotes"),
        otherCreativeInterest: getOptionalString(formData, "otherCreativeInterest"),
        otherRetreatGoal: getOptionalString(formData, "otherRetreatGoal"),
        artistStatement: getOptionalString(formData, "artistStatement"),
        preferredHeroImage: mediaIDs[0],
        additionalPortfolioImages: mediaIDs.slice(1),
        applicationStatus: "new",
        consentImageUsageConfirmed,
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
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
  const whatTheyHopeToCreate = getRequiredString(formData, "whatTheyHopeToCreate", errors);
  const retreatGoals = getRequiredString(formData, "retreatGoals", errors);
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
  return payload.create({
    collection: "photographer-applications",
    data: {
      ...common,
      legalName,
      displayName,
      photographyExperienceLevel:
        photographyExperienceLevel as (typeof PHOTOGRAPHER_EXPERIENCE)[number],
      equipmentSummary,
      genresInterests: genresInterests as (typeof PHOTOGRAPHER_INTERESTS)[number][],
      whatTheyHopeToCreate,
      retreatGoals,
      otherGenreInterest: getOptionalString(formData, "otherGenreInterest"),
      collaborationStyleNotes: getOptionalString(formData, "collaborationStyleNotes"),
      applicationStatus: "new",
      internalImageReviewConfirmed,
      submittedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });
}

export { ApplicationValidationError };
