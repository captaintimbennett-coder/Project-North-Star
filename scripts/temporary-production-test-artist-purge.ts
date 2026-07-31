import assert from "node:assert/strict";
import config from "@payload-config";
import { getPayload } from "payload";
import { currentRetreatEdition } from "@/data/retreat-editions";

type RelationshipValue =
  | number
  | string
  | { id: number | string }
  | null
  | undefined;

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

async function main() {
  if (process.env.VERCEL !== "1" || process.env.VERCEL_ENV !== "production") {
    console.log("Skipping temporary test-artist purge outside Vercel production.");
    return;
  }

  const targetNames = ["Lexi Anne", "Veve1"] as const;
  const payload = await getPayload({ config });

  try {
    const profiles = await payload.find({
      collection: "model-profiles",
      depth: 0,
      draft: true,
      limit: 10,
      overrideAccess: true,
      pagination: false,
      where: { displayName: { in: [...targetNames] } },
    });

    if (profiles.totalDocs === 0) {
      console.log("Temporary test-artist purge already complete.");
      return;
    }

    assert.equal(profiles.totalDocs, 2, "Expected exactly two target profiles.");
    assert.deepEqual(
      new Set(profiles.docs.map((profile) => profile.displayName)),
      new Set(targetNames),
      "Target names did not match the approved purge.",
    );
    assert.equal(
      profiles.docs.every((profile) => profile.account == null),
      true,
      "Purge refused: a target profile is linked to a user account.",
    );

    const profileIDs = profiles.docs.map((profile) => Number(profile.id));
    const events = await payload.find({
      collection: "retreat-events",
      depth: 0,
      draft: true,
      limit: 5,
      overrideAccess: true,
      pagination: false,
      where: {
        slug: {
          in: [
            currentRetreatEdition.publicSlug,
            currentRetreatEdition.legacySlug,
          ],
        },
      },
    });
    assert.equal(events.totalDocs, 1, "Expected exactly one Founders Edition.");
    const event = events.docs[0];
    assert.equal(event._status, "published", "Founders Edition must remain published.");

    const assignments = event.participatingArtists ?? [];
    const targetAssignments = assignments.filter((assignment) =>
      profileIDs.includes(Number(relationshipID(assignment.artist))),
    );
    assert.equal(
      targetAssignments.length,
      2,
      "Expected both test profiles in the Founders Edition lineup.",
    );
    const preservedAssignments = assignments.filter(
      (assignment) =>
        !profileIDs.includes(Number(relationshipID(assignment.artist))),
    );

    const [applications, bookings, availability, invitations] = await Promise.all([
      payload.find({
        collection: "model-applications",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: { linkedModelProfile: { in: profileIDs } },
      }),
      payload.find({
        collection: "retreat-bookings",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: { artist: { in: profileIDs } },
      }),
      payload.find({
        collection: "artist-availability",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: { artist: { in: profileIDs } },
      }),
      payload.find({
        collection: "account-invitations",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        pagination: false,
        where: { relatedModelProfile: { in: profileIDs } },
      }),
    ]);

    assert.equal(
      applications.docs.every((application) =>
        targetNames.includes(application.stageName as (typeof targetNames)[number]),
      ),
      true,
      "Purge refused: a linked application is not an approved test record.",
    );
    assert.equal(bookings.totalDocs, 0, "Purge refused: target bookings exist.");
    assert.equal(availability.totalDocs, 0, "Purge refused: target availability exists.");
    assert.equal(invitations.totalDocs, 0, "Purge refused: target invitations exist.");

    const mediaIDs = [
      ...profiles.docs.flatMap((profile) => [
        relationshipID(profile.featuredImage),
        ...(profile.portfolioImages ?? []).map((item) => relationshipID(item)),
      ]),
      ...applications.docs.flatMap((application) => [
        relationshipID(application.preferredHeroImage),
        ...(application.additionalPortfolioImages ?? []).map((item) =>
          relationshipID(item),
        ),
      ]),
    ]
      .filter((id): id is number | string => id !== null)
      .map(Number);
    const uniqueMediaIDs = [...new Set(mediaIDs)];

    if (uniqueMediaIDs.length > 0) {
      const [
        otherProfiles,
        otherApplications,
        photographerProfiles,
        mediaEvents,
      ] = await Promise.all([
        payload.find({
          collection: "model-profiles",
          depth: 0,
          draft: true,
          limit: 100,
          overrideAccess: true,
          pagination: false,
          where: {
            and: [
              { id: { not_in: profileIDs } },
              {
                or: [
                  { featuredImage: { in: uniqueMediaIDs } },
                  { portfolioImages: { in: uniqueMediaIDs } },
                ],
              },
            ],
          },
        }),
        payload.find({
          collection: "model-applications",
          depth: 0,
          limit: 100,
          overrideAccess: true,
          pagination: false,
          where: {
            and: [
              { id: { not_in: applications.docs.map((item) => item.id) } },
              {
                or: [
                  { preferredHeroImage: { in: uniqueMediaIDs } },
                  { additionalPortfolioImages: { in: uniqueMediaIDs } },
                ],
              },
            ],
          },
        }),
        payload.find({
          collection: "photographer-profiles",
          depth: 0,
          draft: true,
          limit: 100,
          overrideAccess: true,
          pagination: false,
          where: { profileImage: { in: uniqueMediaIDs } },
        }),
        payload.find({
          collection: "retreat-events",
          depth: 0,
          draft: true,
          limit: 100,
          overrideAccess: true,
          pagination: false,
          where: { heroImage: { in: uniqueMediaIDs } },
        }),
      ]);

      assert.equal(otherProfiles.totalDocs, 0, "Purge refused: model media is shared.");
      assert.equal(otherApplications.totalDocs, 0, "Purge refused: application media is shared.");
      assert.equal(photographerProfiles.totalDocs, 0, "Purge refused: photographer media is shared.");
      assert.equal(mediaEvents.totalDocs, 0, "Purge refused: event media is shared.");
    }

    await payload.update({
      collection: "retreat-events",
      data: {
        participatingArtists: preservedAssignments,
        _status: "published",
      },
      draft: false,
      id: event.id,
      overrideAccess: true,
    });

    for (const application of applications.docs) {
      await payload.delete({
        collection: "model-applications",
        id: application.id,
        overrideAccess: true,
      });
    }
    for (const profile of profiles.docs) {
      await payload.delete({
        collection: "model-profiles",
        id: profile.id,
        overrideAccess: true,
      });
    }
    for (const mediaID of uniqueMediaIDs) {
      await payload.delete({
        collection: "media",
        id: mediaID,
        overrideAccess: true,
      });
    }

    const [verifiedEvent, remainingProfiles, remainingApplications, remainingMedia] =
      await Promise.all([
        payload.findByID({
          collection: "retreat-events",
          depth: 0,
          draft: false,
          id: event.id,
          overrideAccess: true,
        }),
        payload.find({
          collection: "model-profiles",
          depth: 0,
          draft: true,
          limit: 10,
          overrideAccess: true,
          pagination: false,
          where: { id: { in: profileIDs } },
        }),
        payload.find({
          collection: "model-applications",
          depth: 0,
          limit: 10,
          overrideAccess: true,
          pagination: false,
          where: { id: { in: applications.docs.map((item) => item.id) } },
        }),
        payload.find({
          collection: "media",
          depth: 0,
          limit: 10,
          overrideAccess: true,
          pagination: false,
          where: { id: { in: uniqueMediaIDs } },
        }),
      ]);

    assert.equal(verifiedEvent._status, "published");
    assert.equal(
      (verifiedEvent.participatingArtists ?? []).some((assignment) =>
        profileIDs.includes(Number(relationshipID(assignment.artist))),
      ),
      false,
    );
    assert.equal(remainingProfiles.totalDocs, 0);
    assert.equal(remainingApplications.totalDocs, 0);
    assert.equal(remainingMedia.totalDocs, 0);

    console.log(
      `Purged ${profiles.docs.map((profile) => profile.displayName).join(" and ")} from production.`,
    );
  } finally {
    await payload.destroy();
  }
}

await main();
