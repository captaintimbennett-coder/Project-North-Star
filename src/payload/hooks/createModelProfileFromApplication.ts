import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook } from "payload";

type ModelProfileCategory =
  | "glamour"
  | "boudoir"
  | "fashion"
  | "editorial"
  | "fine-art"
  | "lifestyle"
  | "commercial";

function relationshipID(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "number") return id;
  }
  return null;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "model";
}

async function createUniqueModelSlug(req: Parameters<CollectionAfterChangeHook>[0]["req"], name: string) {
  const baseSlug = slugify(name);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await req.payload.find({
      collection: "model-profiles",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { slug: { equals: candidate } },
    });

    if (existing.totalDocs === 0) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function mapCreativeInterestsToProfileCategories(interests: unknown): ModelProfileCategory[] {
  if (!Array.isArray(interests)) return [];

  const categorySet = new Set<ModelProfileCategory>();

  for (const interest of interests) {
    if (interest === "fashion") categorySet.add("fashion");
    if (interest === "editorial") categorySet.add("editorial");
    if (interest === "glamour") categorySet.add("glamour");
    if (interest === "boudoir" || interest === "lingerie") categorySet.add("boudoir");
    if (
      interest === "artistic-nude" ||
      interest === "fine-art-nude" ||
      interest === "conceptual-creative"
    ) {
      categorySet.add("fine-art");
    }
    if (interest === "lifestyle") categorySet.add("lifestyle");
  }

  return Array.from(categorySet);
}

function buildAdminNotes(doc: Record<string, unknown>): string {
  const notes = [
    `Created from model application #${doc.id}.`,
    typeof doc.email === "string" ? `Applicant email: ${doc.email}` : undefined,
    typeof doc.phone === "string" ? `Applicant phone: ${doc.phone}` : undefined,
    typeof doc.portfolioURL === "string" && doc.portfolioURL
      ? `Portfolio URL: ${doc.portfolioURL}`
      : undefined,
    typeof doc.agencyRepresentation === "string" && doc.agencyRepresentation
      ? `Agency representation: ${doc.agencyRepresentation}`
      : undefined,
    typeof doc.availabilityNotes === "string" && doc.availabilityNotes
      ? `Availability notes:\n${doc.availabilityNotes}`
      : undefined,
    typeof doc.privateAdminNotes === "string" && doc.privateAdminNotes
      ? `Application review notes:\n${doc.privateAdminNotes}`
      : undefined,
  ];

  return notes.filter(Boolean).join("\n\n");
}

export const validateModelProfileCreationRequest: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data.createProfileFromApplication) return data;

  const nextStatus = data.applicationStatus ?? originalDoc?.applicationStatus;
  const linkedProfile = data.linkedModelProfile ?? originalDoc?.linkedModelProfile;

  if (operation !== "update") {
    throw new APIError("Save the application before creating a model profile from it.", 400);
  }

  if (nextStatus !== "accepted") {
    throw new APIError("Accept the application before creating a draft model profile.", 400);
  }

  if (relationshipID(linkedProfile)) {
    throw new APIError("This application is already linked to a model profile.", 400);
  }

  return data;
};

export const createModelProfileFromApplication: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;
  if (!doc.createProfileFromApplication) return doc;
  if (doc.applicationStatus !== "accepted") return doc;
  if (relationshipID(doc.linkedModelProfile)) return doc;

  const slug = await createUniqueModelSlug(req, doc.stageName);
  const preferredHeroImage = relationshipID(doc.preferredHeroImage);
  const additionalPortfolioImages = Array.isArray(doc.additionalPortfolioImages)
    ? doc.additionalPortfolioImages.map(relationshipID).filter(Boolean)
    : [];

  const profile = await req.payload.create({
    collection: "model-profiles",
    data: {
      adminNotes: buildAdminNotes(doc),
      approvalStatus: "draft",
      artistStatement: doc.artistStatement,
      biography: doc.shortBiography,
      city: doc.city,
      country: doc.country,
      displayName: doc.stageName,
      featuredImage: preferredHeroImage,
      instagram: doc.instagramURL,
      modelingCategories: mapCreativeInterestsToProfileCategories(doc.creativeInterests),
      portfolioImages: additionalPortfolioImages,
      publicDisplay: {
        artistStatement: false,
        biography: false,
        categories: false,
        instagram: false,
        location: false,
        website: false,
      },
      publicIntroduction:
        typeof doc.shortBiography === "string" ? doc.shortBiography.slice(0, 240) : undefined,
      slug,
      sourceModelApplication: doc.id,
      state: doc.state,
      usagePermissionConfirmed: false,
      website: doc.websiteURL || doc.portfolioURL,
      _status: "draft",
    },
    overrideAccess: true,
    req,
  });

  await req.payload.update({
    collection: "model-applications",
    data: {
      createProfileFromApplication: false,
      linkedModelProfile: profile.id,
    },
    id: doc.id,
    overrideAccess: true,
    req,
  });

  return doc;
};
