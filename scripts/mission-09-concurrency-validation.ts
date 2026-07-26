import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import type { ModelProfile, PhotographerProfile, User } from "@/payload-types";
import {
  confirmPhotographerBooking,
  isBookingConflictError,
} from "@/lib/scheduling/booking-service";

type Result = { detail?: string; name: string; pass: boolean };
type RaceResult = {
  messages: string[];
  pass: boolean;
  safeFailures: boolean;
  winnerIDs: number[];
};
type Fixture = {
  availabilityIDs: number[];
  bookingIDs: Set<number>;
  eventID?: number;
  modelIDs: number[];
  models: ModelProfile[];
  owner?: User;
  photographerIDs: number[];
  photographers: PhotographerProfile[];
  userIDs: number[];
  users: User[];
};
type DatabaseProbe = {
  code?: string;
  constraint?: string;
  message: string;
  pass: boolean;
};

const results: Result[] = [];
const runID = `mission09-concurrency-${Date.now()}`;
const raceRounds = 5;

function record(name: string, pass: boolean, detail?: string) {
  results.push({ detail, name, pass });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function errorDescription(error: unknown) {
  const parts: string[] = [];
  let current = error;
  const visited = new Set<unknown>();
  while (current && !visited.has(current)) {
    visited.add(current);
    if (typeof current === "object") {
      const candidate = current as {
        cause?: unknown;
        code?: unknown;
        constraint?: unknown;
        message?: unknown;
      };
      if (candidate.message) parts.push(String(candidate.message));
      if (candidate.code) parts.push(`code ${String(candidate.code)}`);
      if (candidate.constraint) parts.push(`constraint ${String(candidate.constraint)}`);
      current = candidate.cause;
      continue;
    }
    parts.push(String(current));
    break;
  }
  return [...new Set(parts)].join(" · ");
}

function conflictDescription(error: unknown) {
  const description = errorDescription(error);
  const constraint = description.match(/constraint (retreat_bookings_[a-z_]+)/i)?.[1]
    ?? description.match(/constraint "(retreat_bookings_[a-z_]+)"/i)?.[1];
  const code = description.match(/code ([A-Z0-9]+)/i)?.[1];
  if (constraint) return `${code || "database conflict"} · ${constraint}`;
  return description.split("\n")[0]?.slice(0, 240) || "Booking conflict";
}

function metadataID(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || !(key in metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "number" || typeof value === "string" ? String(value) : null;
}

function bookingPreferences(email: string) {
  return {
    email,
    notifyByEmail: true,
    notifyBySms: false,
    notifyInDashboard: false,
    shareEmail: true,
    shareInstagram: false,
    shareMobilePhone: false,
    shareWebsite: false,
  };
}

async function createUser(
  payload: Payload,
  fixture: Fixture,
  suffix: string,
  role: "model" | "photographer",
) {
  const email = `${runID}-${suffix}@example.invalid`;
  const user = await payload.create({
    collection: "users",
    data: {
      accountStatus: "active",
      email,
      name: `${runID} ${suffix}`,
      password: `M09-${suffix}-Concurrency-42!`,
      role: null,
      roles: [role],
    },
    overrideAccess: true,
    user: fixture.owner,
  });
  fixture.userIDs.push(user.id);
  fixture.users.push(user);
  return user;
}

async function buildFixture(payload: Payload, fixture: Fixture) {
  for (let index = 1; index <= 2; index += 1) {
    const user = await createUser(payload, fixture, `model-${index}`, "model");
    const profile = await payload.create({
      collection: "model-profiles",
      data: {
        account: user.id,
        approvalStatus: "approved",
        bookingPreferences: bookingPreferences(user.email),
        displayName: `${runID} Model ${index}`,
        slug: `${runID}-model-${index}`,
      },
      overrideAccess: true,
      user: fixture.owner,
    });
    fixture.modelIDs.push(profile.id);
    fixture.models.push(profile);
  }

  for (let index = 1; index <= 2; index += 1) {
    const user = await createUser(payload, fixture, `photographer-${index}`, "photographer");
    const profile = await payload.create({
      collection: "photographer-profiles",
      data: {
        account: user.id,
        approvalStatus: "approved",
        bookingPreferences: bookingPreferences(user.email),
        displayName: `${runID} Photographer ${index}`,
        slug: `${runID}-photographer-${index}`,
      },
      overrideAccess: true,
      user: fixture.owner,
    });
    fixture.photographerIDs.push(profile.id);
    fixture.photographers.push(profile);
  }

  const event = await payload.create({
    collection: "retreat-events",
    data: {
      _status: "published",
      endDate: "2031-05-11T04:59:59.000Z",
      lifecycleStatus: "published",
      locationName: "Mission 09 Concurrency Validation",
      participatingArtists: fixture.models.map((model) => ({
        artist: model.id,
        displayOrder: 1,
        minimumBookingHours: "1",
        participationStatus: "approved",
      })),
      participatingPhotographers: fixture.photographers.map((photographer) => ({
        participationStatus: "approved",
        photographer: photographer.id,
      })),
      registrationStatus: "closed",
      slug: `${runID}-event`,
      startDate: "2031-05-10T05:00:00.000Z",
      summary: "Temporary isolated Mission 09 concurrency validation event.",
      timeZone: "America/Chicago",
      title: `${runID} Validation Event`,
    },
    draft: false,
    overrideAccess: true,
    user: fixture.owner,
  });
  fixture.eventID = event.id;

  for (const model of fixture.models) {
    const availability = await payload.create({
      collection: "artist-availability",
      data: {
        artist: model.id,
        availableFrom: "06:00",
        availableUntil: "18:00",
        blockedTimes: [],
        date: "2031-05-10T00:00:00.000Z",
        event: event.id,
      },
      overrideAccess: true,
      user: fixture.owner,
    });
    fixture.availabilityIDs.push(availability.id);
  }
}

async function runApplicationRace(
  payload: Payload,
  fixture: Fixture,
  attempts: Array<{
    account: User;
    artistId: number;
    endAt: string;
    startAt: string;
  }>,
): Promise<RaceResult> {
  if (!fixture.eventID) throw new Error("Concurrency fixture event is missing.");
  const settled = await Promise.allSettled(attempts.map((attempt) =>
    confirmPhotographerBooking(attempt.account, {
      artistId: attempt.artistId,
      endAt: attempt.endAt,
      eventId: fixture.eventID as number,
      idempotencyKey: crypto.randomUUID(),
      startAt: attempt.startAt,
    }, { dispatchEmails: false, payload })));
  const fulfilled = settled.filter((item) => item.status === "fulfilled");
  const rejected = settled.filter((item) => item.status === "rejected");
  const winnerIDs = fulfilled.map((item) => Number(item.value.id));
  winnerIDs.forEach((id) => fixture.bookingIDs.add(id));
  return {
    messages: rejected.map((item) => conflictDescription(item.reason)),
    pass: fulfilled.length === 1
      && rejected.length === 1,
    safeFailures: rejected.length === 1
      && rejected.every((item) => isBookingConflictError(item.reason)),
    winnerIDs,
  };
}

async function deleteRaceWinners(payload: Payload, fixture: Fixture, winnerIDs: number[]) {
  for (const id of winnerIDs) {
    await payload.delete({
      collection: "retreat-bookings",
      id,
      overrideAccess: true,
      user: fixture.owner,
    });
  }
}

async function probeDatabaseConstraint(
  payload: Payload,
  fixture: Fixture,
  input: {
    artistIDs: [number, number];
    constraint: string;
    endAt: string;
    photographerIDs: [number, number];
    startAt: string;
  },
): Promise<DatabaseProbe> {
  if (!fixture.eventID) throw new Error("Concurrency fixture event is missing.");
  const first = await payload.db.pool.connect();
  const second = await payload.db.pool.connect();
  const firstID = -Math.floor((Date.now() % 900_000_000) + Math.random() * 10_000);
  const secondID = firstID - 1;
  const insert = `
    INSERT INTO "retreat_bookings"
      ("id", "event_id", "artist_id", "photographer_id", "start_at", "end_at", "status", "created_at", "updated_at")
    VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', NOW(), NOW())
    RETURNING "id"
  `;
  let firstOpen = false;
  let secondOpen = false;

  try {
    await first.query("BEGIN");
    firstOpen = true;
    await second.query("BEGIN");
    secondOpen = true;
    await first.query(insert, [
      firstID,
      fixture.eventID,
      input.artistIDs[0],
      input.photographerIDs[0],
      input.startAt,
      input.endAt,
    ]);
    const secondInsert = second.query(insert, [
      secondID,
      fixture.eventID,
      input.artistIDs[1],
      input.photographerIDs[1],
      input.startAt,
      input.endAt,
    ]).then(
      () => ({ ok: true as const }),
      (error: unknown) => ({ error, ok: false as const }),
    );

    await new Promise((resolve) => setTimeout(resolve, 75));
    await first.query("COMMIT");
    firstOpen = false;
    const secondResult = await secondInsert;
    if (secondResult.ok) {
      return {
        message: "The competing raw database insert unexpectedly succeeded.",
        pass: false,
      };
    }
    const databaseError = secondResult.error as {
      code?: string;
      constraint?: string;
      message?: string;
    };
    return {
      code: databaseError.code,
      constraint: databaseError.constraint,
      message: databaseError.message || errorMessage(secondResult.error),
      pass: databaseError.code === "23P01" && databaseError.constraint === input.constraint,
    };
  } finally {
    if (firstOpen) await first.query("ROLLBACK").catch(() => undefined);
    if (secondOpen) await second.query("ROLLBACK").catch(() => undefined);
    first.release();
    second.release();
    await payload.db.pool.query(
      `DELETE FROM "retreat_bookings" WHERE "id" = ANY($1::int[])`,
      [[firstID, secondID]],
    ).catch(() => undefined);
  }
}

async function relatedAudits(payload: Payload, fixture: Fixture) {
  const audits = await payload.find({
    collection: "security-audit-events",
    depth: 0,
    limit: 2000,
    overrideAccess: true,
    pagination: false,
  });
  const userIDs = new Set(fixture.userIDs.map(String));
  const bookingIDs = new Set([...fixture.bookingIDs].map(String));
  const availabilityIDs = new Set(fixture.availabilityIDs.map(String));
  return audits.docs.filter((audit) => {
    const actor = typeof audit.actor === "object" ? audit.actor?.id : audit.actor;
    const target = typeof audit.targetAccount === "object"
      ? audit.targetAccount?.id
      : audit.targetAccount;
    return userIDs.has(String(actor))
      || userIDs.has(String(target))
      || userIDs.has(metadataID(audit.metadata, "createdAccountId") || "")
      || bookingIDs.has(metadataID(audit.metadata, "bookingId") || "")
      || availabilityIDs.has(metadataID(audit.metadata, "availabilityId") || "")
      || metadataID(audit.metadata, "eventId") === String(fixture.eventID);
  });
}

async function cleanup(payload: Payload, fixture: Fixture) {
  for (const id of [...fixture.bookingIDs].reverse()) {
    await payload.delete({
      collection: "retreat-bookings",
      id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  for (const id of [...fixture.availabilityIDs].reverse()) {
    await payload.delete({
      collection: "artist-availability",
      id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  if (fixture.eventID) {
    await payload.delete({
      collection: "retreat-events",
      id: fixture.eventID,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  for (const id of [...fixture.modelIDs].reverse()) {
    await payload.delete({
      collection: "model-profiles",
      id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  for (const id of [...fixture.photographerIDs].reverse()) {
    await payload.delete({
      collection: "photographer-profiles",
      id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  const audits = await relatedAudits(payload, fixture).catch(() => []);
  for (const audit of audits.reverse()) {
    await payload.delete({
      collection: "security-audit-events",
      id: audit.id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
  for (const id of [...fixture.userIDs].reverse()) {
    await payload.delete({
      collection: "users",
      id,
      overrideAccess: true,
      user: fixture.owner,
    }).catch(() => undefined);
  }
}

async function verifyCleanup(payload: Payload, fixture: Fixture) {
  const [users, models, photographers, events, availability, bookings, deliveries] = await Promise.all([
    payload.find({
      collection: "users",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { email: { contains: runID } },
    }),
    payload.find({
      collection: "model-profiles",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { slug: { contains: runID } },
    }),
    payload.find({
      collection: "photographer-profiles",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { slug: { contains: runID } },
    }),
    payload.find({
      collection: "retreat-events",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { slug: { contains: runID } },
    }),
    fixture.eventID ? payload.find({
      collection: "artist-availability",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { event: { equals: fixture.eventID } },
    }) : Promise.resolve({ totalDocs: 0 }),
    fixture.eventID ? payload.find({
      collection: "retreat-bookings",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { event: { equals: fixture.eventID } },
    }) : Promise.resolve({ totalDocs: 0 }),
    payload.find({
      collection: "scheduling-email-deliveries",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { recipientEmail: { contains: runID } },
    }),
  ]);
  const audits = await relatedAudits(payload, fixture);
  return users.totalDocs === 0
    && models.totalDocs === 0
    && photographers.totalDocs === 0
    && events.totalDocs === 0
    && availability.totalDocs === 0
    && bookings.totalDocs === 0
    && deliveries.totalDocs === 0
    && audits.length === 0;
}

async function validate() {
  const target = new URL(process.env.DATABASE_URL || "");
  if (!target.hostname.startsWith("ep-summer-truth-") || target.hostname.includes("ep-muddy-rain-")) {
    throw new Error("Validation refused: DATABASE_URL is not the approved development database.");
  }

  const payload = await getPayload({ config });
  const fixture: Fixture = {
    availabilityIDs: [],
    bookingIDs: new Set(),
    modelIDs: [],
    models: [],
    photographerIDs: [],
    photographers: [],
    userIDs: [],
    users: [],
  };

  try {
    const owners = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { accountStatus: { equals: "active" } },
          { role: { equals: "owner" } },
          { roles: { contains: "administrator" } },
        ],
      },
    });
    fixture.owner = owners.docs[0];
    if (!fixture.owner) throw new Error("No active owner account is available for concurrency validation.");

    const constraints = await payload.db.pool.query<{ conname: string }>(
      `
        SELECT "conname"
        FROM "pg_constraint"
        WHERE "conname" = ANY($1::text[])
      `,
      [[
        "retreat_bookings_artist_no_overlap",
        "retreat_bookings_photographer_no_overlap",
      ]],
    );
    const constraintNames = new Set(constraints.rows.map((row) => row.conname));
    record(
      "Both PostgreSQL overlap constraints are installed",
      constraintNames.has("retreat_bookings_artist_no_overlap")
      && constraintNames.has("retreat_bookings_photographer_no_overlap"),
    );
    if (constraintNames.size !== 2) {
      throw new Error("The required PostgreSQL overlap constraints are not installed.");
    }

    await buildFixture(payload, fixture);
    const [model1, model2] = fixture.models;
    const [photographer1, photographer2] = fixture.photographers;
    const modelAccounts = fixture.users.slice(0, 2);
    const photographerAccounts = fixture.users.slice(2, 4);
    if (!model1 || !model2 || !photographer1 || !photographer2
      || !modelAccounts[0] || !modelAccounts[1]
      || !photographerAccounts[0] || !photographerAccounts[1]) {
      throw new Error("The concurrency fixture is incomplete.");
    }

    let sameArtistPasses = 0;
    let sameArtistSafeFailures = 0;
    const sameArtistMessages: string[] = [];
    for (let round = 0; round < raceRounds; round += 1) {
      const race = await runApplicationRace(payload, fixture, [
        {
          account: photographerAccounts[0],
          artistId: model1.id,
          endAt: "2031-05-10T14:00:00.000Z",
          startAt: "2031-05-10T13:00:00.000Z",
        },
        {
          account: photographerAccounts[1],
          artistId: model1.id,
          endAt: "2031-05-10T14:00:00.000Z",
          startAt: "2031-05-10T13:00:00.000Z",
        },
      ]);
      if (race.pass) sameArtistPasses += 1;
      if (race.safeFailures) sameArtistSafeFailures += 1;
      sameArtistMessages.push(...race.messages);
      await deleteRaceWinners(payload, fixture, race.winnerIDs);
    }
    record(
      "Two photographers competing for one model produce exactly one booking",
      sameArtistPasses === raceRounds,
      `${sameArtistPasses}/${raceRounds} exactly-one-commit rounds`,
    );
    record(
      "Same-model race returns only conflict-safe failures",
      sameArtistSafeFailures === raceRounds,
      [...new Set(sameArtistMessages)].join(" | "),
    );

    let samePhotographerPasses = 0;
    let samePhotographerSafeFailures = 0;
    const samePhotographerMessages: string[] = [];
    for (let round = 0; round < raceRounds; round += 1) {
      const race = await runApplicationRace(payload, fixture, [
        {
          account: photographerAccounts[0],
          artistId: model1.id,
          endAt: "2031-05-10T16:00:00.000Z",
          startAt: "2031-05-10T15:00:00.000Z",
        },
        {
          account: photographerAccounts[0],
          artistId: model2.id,
          endAt: "2031-05-10T16:00:00.000Z",
          startAt: "2031-05-10T15:00:00.000Z",
        },
      ]);
      if (race.pass) samePhotographerPasses += 1;
      if (race.safeFailures) samePhotographerSafeFailures += 1;
      samePhotographerMessages.push(...race.messages);
      await deleteRaceWinners(payload, fixture, race.winnerIDs);
    }
    record(
      "One photographer competing across two models produces exactly one booking",
      samePhotographerPasses === raceRounds,
      `${samePhotographerPasses}/${raceRounds} exactly-one-commit rounds`,
    );
    record(
      "Same-photographer race returns only conflict-safe failures",
      samePhotographerSafeFailures === raceRounds,
      [...new Set(samePhotographerMessages)].join(" | "),
    );

    const artistConstraint = await probeDatabaseConstraint(payload, fixture, {
      artistIDs: [model1.id, model1.id],
      constraint: "retreat_bookings_artist_no_overlap",
      endAt: "2031-05-10T18:00:00.000Z",
      photographerIDs: [photographer1.id, photographer2.id],
      startAt: "2031-05-10T17:00:00.000Z",
    });
    record(
      "Database independently rejects overlapping bookings for one model",
      artistConstraint.pass,
      `${artistConstraint.code || "no code"} · ${artistConstraint.constraint || artistConstraint.message}`,
    );

    const photographerConstraint = await probeDatabaseConstraint(payload, fixture, {
      artistIDs: [model1.id, model2.id],
      constraint: "retreat_bookings_photographer_no_overlap",
      endAt: "2031-05-10T20:00:00.000Z",
      photographerIDs: [photographer1.id, photographer1.id],
      startAt: "2031-05-10T19:00:00.000Z",
    });
    record(
      "Database independently rejects overlapping bookings for one photographer",
      photographerConstraint.pass,
      `${photographerConstraint.code || "no code"} · ${
        photographerConstraint.constraint || photographerConstraint.message
      }`,
    );
  } catch (error) {
    record("Milestone 3 concurrency execution", false, errorMessage(error));
  } finally {
    await cleanup(payload, fixture);
    record(
      "Temporary concurrency fixture removed",
      await verifyCleanup(payload, fixture),
    );
    await payload.destroy();
  }

  const summary = {
    failed: results.filter((result) => !result.pass).length,
    passed: results.filter((result) => result.pass).length,
    total: results.length,
  };
  console.log(JSON.stringify({
    database: "approved development database",
    raceRounds,
    results,
    runID,
    summary,
  }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

await validate();
