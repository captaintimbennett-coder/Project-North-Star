import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook } from "payload";

type ModelProfileCategory =
  | "glamour"
  | "boudoir"
  | "fashion"
  | "editorial"
  | "fine-art"
  | "lifestyle"
  | "commercial";

function numericID(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function relationshipID(value: unknown): number | null {
  const directID = numericID(value);
  if (directID) return directID;

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    const nestedID = numericID(id);
    if (nestedID) return nestedID;
  }

  if (value && typeof value === "object" && "value" in value) {
    const id = (value as { value?: unknown }).value;
    const nestedID = numericID(id);
    if (nestedID) return nestedID;
  }

  return null;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed || undefined;
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
    typeof doc.country === "string" ? `Applicant country: ${doc.country}` : undefined,
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

async function getFullModelApplication(
  req: Parameters<CollectionAfterChangeHook>[0]["req"],
  id: number,
) {
  const fullApplication = await req.payload.findByID({
    collection: "model-applications",
    depth: 0,
    id,
    overrideAccess: true,
    req,
  });

  return fullApplication as unknown as Record<string, unknown>;
}

export const validateModelProfileCreationRequest: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
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

  req.context.createModelProfileFromApplication = originalDoc?.id;
  req.context.createModelProfileFromApplicationName = originalDoc?.stageName;
  delete data.createProfileFromApplication;

  return data;
};

export const createModelProfileFromApplication: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;
  if (doc.applicationStatus !== "accepted") return doc;

  const fullApplication = await getFullModelApplication(req, doc.id);
  const sourceDoc = { ...doc, ...fullApplication };
  const existingLinkedProfileID = relationshipID(sourceDoc.linkedModelProfile);

  if (req.context.createModelProfileFromApplication !== doc.id) return doc;
  if (existingLinkedProfileID) return doc;

  const profileDisplayName =
    cleanString(sourceDoc.stageName) ??
    cleanString(req.context.createModelProfileFromApplicationName) ??
    `Model application #${doc.id}`;

  if (!cleanString(sourceDoc.stageName) && !cleanString(req.context.createModelProfileFromApplicationName)) {
    throw new APIError("Add a display / stage name before creating a draft model profile.", 400);
  }

  const slug = await createUniqueModelSlug(req, profileDisplayName);
  const preferredHeroImage = relationshipID(sourceDoc.preferredHeroImage);
  const additionalPortfolioImages = Array.isArray(sourceDoc.additionalPortfolioImages)
    ? sourceDoc.additionalPortfolioImages.map(relationshipID).filter(Boolean)
    : [];

  const profile = await req.payload.create({
    collection: "model-profiles",
    data: {
      adminNotes: buildAdminNotes(sourceDoc),
      approvalStatus: "draft",
      artistStatement: sourceDoc.artistStatement,
      biography: sourceDoc.shortBiography,
      city: sourceDoc.city,
      displayName: profileDisplayName,
      featuredImage: preferredHeroImage,
      instagram: sourceDoc.instagramURL,
      modelingCategories: mapCreativeInterestsToProfileCategories(sourceDoc.creativeInterests),
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
        typeof sourceDoc.shortBiography === "string" ? sourceDoc.shortBiography.slice(0, 240) : undefined,
      slug,
      state: sourceDoc.state,
      usagePermissionConfirmed: false,
      website: sourceDoc.websiteURL || sourceDoc.portfolioURL,
      _status: "draft",
    },
    overrideAccess: true,
    req,
  });

  req.context.createModelProfileFromApplication = null;
  req.context.createModelProfileFromApplicationName = null;

  await req.payload.update({
    collection: "model-applications",
    data: {
      linkedModelProfile: profile.id,
    },
    id: doc.id,
    overrideAccess: true,
    req,
  });

  return {
    ...doc,
    linkedModelProfile: profile.id,
  };
};
