import assert from "node:assert/strict";
import config from "@payload-config";
import { createPublicModelApplication } from "@/lib/application-submissions";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { getPayload, type Payload } from "payload";
import type { RetreatEvent } from "@/payload-types";

const VALIDATION_HOST = "ep-muddy-rain-ajcxgzld-pooler.c-3.us-east-2.aws.neon.tech";
const TEST_EMAIL = "tim@thelonestarretreat.com";
const TEST_NAME = `Mission 06 Validation Artist ${Date.now()}`;
const LEGACY_TEST_NAME = `${TEST_NAME} Legacy Consent`;

function relationshipID(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value && "id" in value && typeof value.id === "number") {
    return value.id;
  }
  return null;
}

function guardedDatabaseHost() {
  const target = new URL(process.env.DATABASE_URL || "");
  assert.equal(target.hostname, VALIDATION_HOST, `Refusing non-validation database: ${target.hostname}`);
  assert.doesNotMatch(target.hostname, /summer-truth/, "Production database guard failed.");
  return target.hostname;
}

function applicationForm() {
  const form = new FormData();
  const values: Record<string, string> = {
    stageName: TEST_NAME,
    email: TEST_EMAIL,
    phone: "214-555-0106",
    city: "Dallas",
    state: "Texas",
    country: "United States",
    marketingSource: "other",
    otherMarketingSource: "Mission 06 controlled validation",
    modelingExperienceLevel: "professional",
    travelAvailability: "yes",
    alternateModelList: "yes",
    creativeInterests: "editorial",
    retreatGoals: "professional-respectful-photographers",
    informationAccurateConfirmed: "true",
    noAcceptanceGuaranteeConfirmed: "true",
    consentImageUsageConfirmed: "true",
    publicProfilePermissionConfirmed: "true",
    codeOfConductConfirmed: "true",
    contactPermissionConfirmed: "true",
  };
  for (const [key, value] of Object.entries(values)) form.append(key, value);

  // Valid 1×1 PNG; biography and artist statement are intentionally omitted.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1XcAAAAASUVORK5CYII=",
    "base64",
  );
  form.append("preferredHeroImage", new File([png], "mission-06-validation.png", { type: "image/png" }));
  return form;
}

async function cleanup({
  applicationID,
  eventID,
  legacyApplicationID,
  mediaIDs,
  originalArtists,
  originalStatus,
  payload,
  profileID,
}: {
  applicationID?: number;
  eventID?: number;
  legacyApplicationID?: number;
  mediaIDs: number[];
  originalArtists?: NonNullable<RetreatEvent["participatingArtists"]>;
  originalStatus?: "draft" | "published";
  payload: Payload;
  profileID?: number;
}) {
  if (eventID && originalArtists && originalStatus) {
    await payload.update({
      collection: "retreat-events",
      data: { participatingArtists: originalArtists, _status: originalStatus },
      draft: true,
      id: eventID,
      overrideAccess: true,
    });
  }
  if (applicationID) {
    await payload.delete({ collection: "model-applications", id: applicationID, overrideAccess: true });
  }
  if (legacyApplicationID) {
    await payload.delete({ collection: "model-applications", id: legacyApplicationID, overrideAccess: true });
  }
  if (profileID) {
    await payload.delete({ collection: "model-profiles", id: profileID, overrideAccess: true });
  }
  for (const id of mediaIDs) {
    await payload.delete({ collection: "media", id, overrideAccess: true });
  }
}

async function main() {
  const host = guardedDatabaseHost();
  process.env.APPLICATION_EMAIL_FROM = process.env.SENDGRID_FROM_EMAIL;
  process.env.APPLICATION_EMAIL_FROM_NAME = "Lone Star Retreat";
  process.env.APPLICATION_EMAIL_REPLY_TO = TEST_EMAIL;
  process.env.APPLICATION_EMAIL_ADMIN_TO = TEST_EMAIL;
  process.env.SENDGRID_SANDBOX_MODE = "false";

  const payload = await getPayload({ config });
  let applicationID: number | undefined;
  let legacyApplicationID: number | undefined;
  let profileID: number | undefined;
  const mediaIDs: number[] = [];
  let eventID: number | undefined;
  let originalArtists: NonNullable<RetreatEvent["participatingArtists"]> | undefined;
  let originalStatus: "draft" | "published" | undefined;

  try {
    const eventResult = await payload.find({
      collection: "retreat-events",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { in: [currentRetreatEdition.publicSlug, currentRetreatEdition.legacySlug] } },
    });
    const event = eventResult.docs[0];
    assert.ok(event, "Current retreat event is required for public approval.");
    eventID = event.id;
    originalArtists = structuredClone(event.participatingArtists || []);
    originalStatus = event._status || "draft";

    const legacy = await payload.create({
      collection: "model-applications",
      data: {
        stageName: LEGACY_TEST_NAME,
        email: TEST_EMAIL,
        phone: "214-555-0107",
        city: "Dallas",
        state: "Texas",
        country: "United States",
        marketingSource: "other",
        otherMarketingSource: "Mission 06 legacy validation",
        modelingExperienceLevel: "professional",
        travelAvailability: "domestic",
        informationAccurateConfirmed: true,
        noAcceptanceGuaranteeConfirmed: true,
        consentImageUsageConfirmed: true,
        publicProfilePermissionConfirmed: false,
        codeOfConductConfirmed: true,
        contactPermissionConfirmed: true,
        applicationStatus: "accepted",
        acceptanceEmailStatus: "pending",
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    legacyApplicationID = legacy.id;
    const legacyEdited = await payload.update({
      collection: "model-applications",
      data: { privateAdminNotes: "Controlled legacy edit with consent still false." },
      id: legacy.id,
      overrideAccess: true,
    });
    assert.equal(legacyEdited.publicProfilePermissionConfirmed, false);
    assert.equal(legacyEdited.publicProfilePermissionSource, null);
    await assert.rejects(
      payload.update({
        collection: "model-applications",
        data: { approveForFoundersEdition: true },
        id: legacy.id,
        overrideAccess: true,
      }),
      /Explicit public profile permission/,
    );
    const documented = await payload.update({
      collection: "model-applications",
      data: { recordDocumentedPublicProfilePermission: true },
      id: legacy.id,
      overrideAccess: true,
    });
    assert.equal(documented.publicProfilePermissionConfirmed, true);
    assert.equal(documented.publicProfilePermissionSource, "administrator-documented");
    assert.ok(documented.publicProfilePermissionConfirmedAt);

    const application = await createPublicModelApplication(applicationForm());
    applicationID = application.id;
    const preferredMediaID = relationshipID(application.preferredHeroImage);
    assert.ok(preferredMediaID, "Submission must create preferred media.");
    mediaIDs.push(preferredMediaID);
    assert.equal(application.shortBiography, null);
    assert.equal(application.artistStatement, null);
    assert.equal(application.publicProfilePermissionConfirmed, true);
    assert.equal(application.publicProfilePermissionSource, "applicant-application");
    assert.ok(application.publicProfilePermissionConfirmedAt);

    const approved = await payload.update({
      collection: "model-applications",
      data: { applicationStatus: "accepted", approveForFoundersEdition: true },
      id: application.id,
      overrideAccess: true,
    });
    profileID = relationshipID(approved.linkedModelProfile) || undefined;
    assert.ok(profileID, "Approval must create a linked Featured Artist profile.");

    const finalApplication = await payload.findByID({
      collection: "model-applications",
      depth: 0,
      id: application.id,
      overrideAccess: true,
    });
    assert.equal(finalApplication.acceptanceEmailStatus, "sent");
    assert.ok(finalApplication.acceptanceEmailSentAt);
    assert.ok(finalApplication.publicLineupApprovedAt);

    const firstSentAt = finalApplication.acceptanceEmailSentAt;
    await payload.update({
      collection: "model-applications",
      data: { privateAdminNotes: "Idempotency validation edit." },
      id: application.id,
      overrideAccess: true,
    });
    const afterEdit = await payload.findByID({
      collection: "model-applications",
      depth: 0,
      id: application.id,
      overrideAccess: true,
    });
    assert.equal(afterEdit.acceptanceEmailSentAt, firstSentAt);
    await assert.rejects(
      payload.update({
        collection: "model-applications",
        data: { retryAcceptanceEmail: true },
        id: application.id,
        overrideAccess: true,
      }),
      /Only a failed acceptance email/,
    );

    await payload.update({
      collection: "model-applications",
      data: {
        acceptanceEmailStatus: "failed",
        acceptanceEmailSentAt: null,
        acceptanceEmailLastError: "Controlled validation failure state.",
      },
      id: application.id,
      overrideAccess: true,
    });
    await payload.update({
      collection: "model-applications",
      data: { retryAcceptanceEmail: true },
      id: application.id,
      overrideAccess: true,
    });
    const afterRetry = await payload.findByID({
      collection: "model-applications",
      depth: 0,
      id: application.id,
      overrideAccess: true,
    });
    assert.equal(afterRetry.acceptanceEmailStatus, "sent");
    assert.ok(afterRetry.acceptanceEmailSentAt);
    assert.equal(afterRetry.acceptanceEmailLastError, null);

    const profile = await payload.findByID({
      collection: "model-profiles",
      depth: 1,
      id: profileID,
      overrideAccess: true,
    });
    assert.equal(profile.approvalStatus, "approved");
    assert.equal(profile._status, "published");
    assert.equal(profile.usagePermissionConfirmed, true);
    assert.equal(profile.biography, null);
    assert.equal(profile.artistStatement, null);
    assert.equal(typeof profile.featuredImage, "object");
    assert.equal(typeof profile.featuredImage === "object" && profile.featuredImage?.usageApproved, true);
    assert.match(
      typeof profile.featuredImage === "object" ? profile.featuredImage?.alt || "" : "",
      new RegExp(`^Portrait of ${TEST_NAME}`),
    );

    const publishedEvent = await payload.findByID({
      collection: "retreat-events",
      depth: 2,
      id: event.id,
      overrideAccess: true,
    });
    const publicAssignment = (publishedEvent.participatingArtists || []).find(
      (assignment) => relationshipID(assignment.artist) === profileID,
    );
    assert.equal(publicAssignment?.participationStatus, "approved");
    assert.equal(publishedEvent._status, "published");

    console.log(JSON.stringify({
      host,
      applicantReceiptAndAdminNotificationInvoked: true,
      applicationID,
      optionalBiographyAccepted: true,
      optionalArtistStatementAccepted: true,
      applicantConsentProvenance: application.publicProfilePermissionSource,
      legacyEditPreservedFalse: true,
      documentedLegacyPermissionSource: documented.publicProfilePermissionSource,
      imageUploaded: true,
      profileID,
      publicLineupPublished: true,
      acceptanceEmailStatus: finalApplication.acceptanceEmailStatus,
      acceptanceEmailIdempotent: true,
      invalidRetryRejected: true,
      failedDeliveryRetrySucceeded: true,
    }));
  } finally {
    await cleanup({
      applicationID,
      eventID,
      legacyApplicationID,
      mediaIDs,
      originalArtists,
      originalStatus,
      payload,
      profileID,
    });
    console.log(JSON.stringify({ cleanupComplete: true, testName: TEST_NAME }));
  }
}

await main();
