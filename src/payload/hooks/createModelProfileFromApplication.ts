import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook } from "payload";
import { currentRetreatEdition } from "@/data/retreat-editions";
import type { Media, RetreatEvent } from "@/payload-types";

type ModelProfileCategory =
  | "glamour"
  | "boudoir"
  | "fashion"
  | "editorial"
  | "fine-art"
  | "lifestyle"
  | "commercial";

type ModelProfileSeed = {
  adminNotes: string;
  approvalStatus: "draft" | "approved";
  artistStatement?: string;
  biography?: string;
  bookingPreferences: {
    email?: string;
    mobilePhone?: string;
    notifyByEmail: boolean;
    notifyBySms: boolean;
    notifyInDashboard: boolean;
    shareEmail: boolean;
    shareInstagram: boolean;
    shareMobilePhone: boolean;
    shareWebsite: boolean;
  };
  city?: string;
  displayName: string;
  featuredImage?: number | Media | null;
  instagram?: string;
  modelingCategories: ModelProfileCategory[];
  portfolioImages: (number | Media)[];
  publicDisplay: {
    artistStatement: boolean;
    biography: boolean;
    categories: boolean;
    instagram: boolean;
    location: boolean;
    website: boolean;
  };
  publicIntroduction?: string;
  slug?: string;
  state?: string;
  usagePermissionConfirmed: boolean;
  website?: string;
  _status: "draft" | "published";
};

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
  const approveForFoundersEdition = data.approveForFoundersEdition === true;
  const createProfileFromApplication =
    data.createProfileFromApplication === true || approveForFoundersEdition;

  if (!createProfileFromApplication) return data;

  const nextStatus = data.applicationStatus ?? originalDoc?.applicationStatus;
  const linkedProfile = data.linkedModelProfile ?? originalDoc?.linkedModelProfile;

  if (operation !== "update") {
    throw new APIError("Save the application before creating a model profile from it.", 400);
  }

  if (nextStatus !== "accepted") {
    throw new APIError("Accept the application before creating a draft model profile.", 400);
  }

  if (!approveForFoundersEdition && relationshipID(linkedProfile)) {
    throw new APIError("This application is already linked to a model profile.", 400);
  }

  req.context.createModelProfileFromApplication = originalDoc?.id;
  req.context.createModelProfileFromApplicationName = originalDoc?.stageName;
  req.context.approveModelApplicationForFoundersEdition = approveForFoundersEdition;
  delete data.createProfileFromApplication;
  delete data.approveForFoundersEdition;

  return data;
};

async function approveApplicationMediaForPublicUse(
  req: Parameters<CollectionAfterChangeHook>[0]["req"],
  mediaIDs: number[],
) {
  await Promise.all(
    Array.from(new Set(mediaIDs)).map((id) =>
      req.payload.update({
        collection: "media",
        data: { usageApproved: true },
        id,
        overrideAccess: true,
        req,
      }),
    ),
  );
}

async function addProfileToCurrentRetreat(
  req: Parameters<CollectionAfterChangeHook>[0]["req"],
  profileID: number,
) {
  const eventResult = await req.payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      slug: {
        in: [currentRetreatEdition.publicSlug, currentRetreatEdition.legacySlug],
      },
    },
  });

  const event = eventResult.docs[0];
  if (!event) {
    throw new APIError("The Founders Edition retreat event could not be found.", 400);
  }

  type RetreatArtistAssignment = NonNullable<RetreatEvent["participatingArtists"]>[number];
  const existingArtists: RetreatArtistAssignment[] = Array.isArray(event.participatingArtists)
    ? event.participatingArtists
    : [];
  const existingIndex = existingArtists.findIndex((assignment) => relationshipID(assignment.artist) === profileID);
  const nextArtists = existingArtists.map((assignment) => ({ ...assignment }));
  const assignment: RetreatArtistAssignment = {
    artist: profileID,
    displayOrder: existingIndex >= 0 ? nextArtists[existingIndex]?.displayOrder || 100 : 100,
    minimumBookingHours:
      existingIndex >= 0 ? nextArtists[existingIndex]?.minimumBookingHours || "1" : "1",
    participationStatus: "approved",
  };

  if (existingIndex >= 0) {
    nextArtists[existingIndex] = { ...nextArtists[existingIndex], ...assignment };
  } else {
    nextArtists.push(assignment);
  }

  await req.payload.update({
    collection: "retreat-events",
    data: {
      participatingArtists: nextArtists,
      _status: "published",
    },
    id: event.id,
    overrideAccess: true,
    req,
  });
}

function buildModelProfileSeed({
  additionalPortfolioImages,
  approveForPublicLineup,
  preferredHeroImage,
  profileDisplayName,
  slug,
  sourceDoc,
}: {
  additionalPortfolioImages: number[];
  approveForPublicLineup: boolean;
  preferredHeroImage: number | null;
  profileDisplayName: string;
  slug?: string;
  sourceDoc: Record<string, unknown>;
}): ModelProfileSeed {
  return {
    adminNotes: buildAdminNotes(sourceDoc),
    approvalStatus: approveForPublicLineup ? "approved" : "draft",
    artistStatement: cleanString(sourceDoc.artistStatement),
    biography: cleanString(sourceDoc.shortBiography),
    bookingPreferences: {
      email: cleanString(sourceDoc.email),
      mobilePhone: cleanString(sourceDoc.phone),
      notifyByEmail: true,
      notifyBySms: false,
      notifyInDashboard: false,
      shareEmail: true,
      shareInstagram: false,
      shareMobilePhone: false,
      shareWebsite: false,
    },
    city: cleanString(sourceDoc.city),
    displayName: profileDisplayName,
    featuredImage: preferredHeroImage,
    instagram: cleanString(sourceDoc.instagramURL),
    modelingCategories: mapCreativeInterestsToProfileCategories(sourceDoc.creativeInterests),
    portfolioImages: additionalPortfolioImages,
    publicDisplay: {
      artistStatement: approveForPublicLineup,
      biography: approveForPublicLineup,
      categories: approveForPublicLineup,
      instagram: approveForPublicLineup,
      location: approveForPublicLineup,
      website: approveForPublicLineup,
    },
    publicIntroduction:
      typeof sourceDoc.shortBiography === "string" ? sourceDoc.shortBiography.slice(0, 240) : undefined,
    slug,
    state: cleanString(sourceDoc.state),
    usagePermissionConfirmed: approveForPublicLineup,
    website: cleanString(sourceDoc.websiteURL) || cleanString(sourceDoc.portfolioURL),
    _status: approveForPublicLineup ? "published" : "draft",
  };
}

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

  const profileDisplayName =
    cleanString(sourceDoc.stageName) ??
    cleanString(req.context.createModelProfileFromApplicationName) ??
    `Model application #${doc.id}`;

  if (!cleanString(sourceDoc.stageName) && !cleanString(req.context.createModelProfileFromApplicationName)) {
    throw new APIError("Add a display / stage name before creating a draft model profile.", 400);
  }

  const preferredHeroImage = relationshipID(sourceDoc.preferredHeroImage);
  const additionalPortfolioImages = Array.isArray(sourceDoc.additionalPortfolioImages)
    ? sourceDoc.additionalPortfolioImages.map(relationshipID).filter(Boolean)
    : [];
  const approveForPublicLineup = req.context.approveModelApplicationForFoundersEdition === true;

  if (approveForPublicLineup && !preferredHeroImage) {
    throw new APIError("Add a preferred profile image before approving the public lineup.", 400);
  }

  if (approveForPublicLineup) {
    await approveApplicationMediaForPublicUse(req, [
      preferredHeroImage,
      ...additionalPortfolioImages,
    ].filter((id): id is number => typeof id === "number"));
  }

  const profileSeed = buildModelProfileSeed({
    additionalPortfolioImages,
    approveForPublicLineup,
    preferredHeroImage,
    profileDisplayName,
    sourceDoc,
    slug: existingLinkedProfileID ? undefined : await createUniqueModelSlug(req, profileDisplayName),
  });

  const profile = existingLinkedProfileID
    ? await req.payload.update({
        collection: "model-profiles",
        data: profileSeed,
        draft: true,
        id: existingLinkedProfileID,
        overrideAccess: true,
        req,
      })
    : await req.payload.create({
        collection: "model-profiles",
        data: profileSeed,
        draft: true,
        overrideAccess: true,
        req,
      });

  if (approveForPublicLineup) {
    await addProfileToCurrentRetreat(req, profile.id);
  }

  const linkedModelProfile = existingLinkedProfileID || profile.id;

  await req.payload.update({
    collection: "model-applications",
    data: {
      linkedModelProfile,
    },
    id: doc.id,
    overrideAccess: true,
    req,
  });

  req.context.createModelProfileFromApplication = null;
  req.context.createModelProfileFromApplicationName = null;
  req.context.approveModelApplicationForFoundersEdition = null;

  return {
    ...doc,
    linkedModelProfile,
  };
};
