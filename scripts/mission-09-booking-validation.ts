import config from "@payload-config";
import {
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from "payload";
import type {
  ModelProfile,
  PhotographerProfile,
  RetreatEvent,
  User,
} from "@/payload-types";
import { getPersonalItinerary } from "@/lib/auth/schedule-projection";
import {
  enumerateEventDays,
  eventLocalDateTimeToUTC,
  eventLocalParts,
} from "@/lib/scheduling/availability-ranges";
import {
  confirmPhotographerBooking,
  getPhotographerBookingOptions,
} from "@/lib/scheduling/booking-service";
import {
  getModelAvailabilityDays,
  saveModelAvailability,
} from "@/lib/scheduling/availability-service";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hasAccountRole } from "@/payload/access/account";

type Result = { detail?: string; name: string; pass: boolean };
type RelationshipValue = number | string | { id: number | string } | null | undefined;

const results: Result[] = [];
const runID = `mission09-booking-${Date.now()}`;
const photographerEmail = `${runID}-photographer@example.invalid`;
const modelEmail = `${runID}-model@example.invalid`;
const idempotencyKey = crypto.randomUUID();
const validateModelAvailability = process.env.MISSION_09_VALIDATE_MODEL_AVAILABILITY === "true";
const validatePhotographerBooking =
  process.env.MISSION_09_VALIDATE_PHOTOGRAPHER_BOOKING === "true";

function relationshipID(value: RelationshipValue) {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id ?? null;
}

function record(name: string, pass: boolean, detail?: string) {
  results.push({ detail, name, pass });
}

async function rejects(action: () => Promise<unknown>, pattern: RegExp) {
  try {
    await action();
    return false;
  } catch (error) {
    return pattern.test(error instanceof Error ? error.message : String(error));
  }
}

async function createParticipant(
  payload: Payload,
  req: PayloadRequest,
  role: "model" | "photographer",
  email: string,
) {
  return payload.create({
    collection: "users",
    data: {
      accountStatus: "active",
      email,
      name: `${runID} ${role}`,
      password: `M09-${role}-Validation-42!`,
      role: null,
      roles: [role],
    },
    overrideAccess: true,
    req,
  });
}

async function findFixture(payload: Payload, req: PayloadRequest) {
  const diagnostics: string[] = [];
  const events = await payload.find({
    collection: "retreat-events",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    req,
  });

  for (const event of events.docs) {
    if (!event.startDate || !event.endDate) {
      diagnostics.push(`event ${event.id}: missing dates`);
      continue;
    }
    const photographerAssignment = event.participatingPhotographers?.find(
      (entry) => entry.participationStatus === "approved" && relationshipID(entry.photographer),
    );
    const artistAssignment = event.participatingArtists?.find(
      (entry) =>
        ["confirmed", "approved"].includes(entry.participationStatus)
        && relationshipID(entry.artist),
    );
    if (!photographerAssignment || !artistAssignment) {
      diagnostics.push(
        `event ${event.id}: approved photographers ${event.participatingPhotographers?.filter((entry) =>
          entry.participationStatus === "approved").length ?? 0}, approved artists ${event.participatingArtists?.filter(
          (entry) => ["confirmed", "approved"].includes(entry.participationStatus),
        ).length ?? 0}`,
      );
      continue;
    }
    const photographerID = relationshipID(photographerAssignment?.photographer);
    const artistID = relationshipID(artistAssignment?.artist);
    if (!photographerID || !artistID) continue;

    const photographer = await payload.findByID({
      collection: "photographer-profiles",
      depth: 0,
      id: photographerID,
      overrideAccess: true,
      req,
    });
    const artist = await payload.findByID({
      collection: "model-profiles",
      depth: 0,
      id: artistID,
      overrideAccess: true,
      req,
    });
    if (artist.approvalStatus !== "approved") {
      diagnostics.push(`event ${event.id}: artist ${artist.id} status ${artist.approvalStatus}`);
      continue;
    }

    const timeZone = event.timeZone || "America/Chicago";
    const days = enumerateEventDays(
      eventLocalParts(event.startDate, timeZone).day,
      eventLocalParts(event.endDate, timeZone).day,
    );
    for (const day of days) {
      const availability = await payload.find({
        collection: "artist-availability",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        req,
        where: {
          and: [
            { event: { equals: event.id } },
            { artist: { equals: artist.id } },
            { date: { equals: `${day}T00:00:00.000Z` } },
          ],
        },
      });
      if (availability.totalDocs === 0) {
        return {
          artist,
          artistAssignment,
          day,
          event,
          photographer,
          timeZone,
        };
      }
      diagnostics.push(`event ${event.id}: artist ${artist.id} already has availability on ${day}`);
    }
  }

  throw new Error(
    `No approved development participant pair with a clean event day was found. ${diagnostics.join("; ")}`,
  );
}

async function validate() {
  const target = new URL(process.env.DATABASE_URL || "");
  if (!target.hostname.startsWith("ep-summer-truth-") || target.hostname.includes("ep-muddy-rain-")) {
    throw new Error("Validation refused: DATABASE_URL is not the approved development database.");
  }

  const payload = await getPayload({ config });
  let req: PayloadRequest | undefined;
  let photographerAccount: User | undefined;
  let modelAccount: User | undefined;
  let fixture:
    | {
      artist: ModelProfile;
      artistAssignment: NonNullable<RetreatEvent["participatingArtists"]>[number];
      day: string;
      event: RetreatEvent;
      photographer: PhotographerProfile;
      timeZone: string;
    }
    | undefined;

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
    const owner = owners.docs[0];
    if (!owner) throw new Error("No active owner account is available for the development proof.");

    req = await createLocalReq({ user: owner }, payload);
    const transactionStarted = await initTransaction(req);
    record("Isolated database transaction started", transactionStarted);
    if (!transactionStarted) throw new Error("The development proof could not start an isolated transaction.");

    const currentFixture = await findFixture(payload, req);
    fixture = currentFixture;
    photographerAccount = await createParticipant(payload, req, "photographer", photographerEmail);
    modelAccount = await createParticipant(payload, req, "model", modelEmail);

    const bookingPreferences = (email: string) => ({
      email,
      notifyByEmail: true,
      notifyBySms: false,
      notifyInDashboard: false,
      shareEmail: true,
      shareInstagram: false,
      shareMobilePhone: false,
      shareWebsite: false,
    });

    if (!["published", "closed"].includes(currentFixture.event.lifecycleStatus)) {
      await payload.update({
        collection: "retreat-events",
        data: { lifecycleStatus: "published" },
        id: currentFixture.event.id,
        overrideAccess: true,
        req,
      });
    }
    await payload.update({
      collection: "photographer-profiles",
      data: {
        account: photographerAccount.id,
        approvalStatus: "approved",
        bookingPreferences: bookingPreferences(photographerEmail),
      },
      id: currentFixture.photographer.id,
      overrideAccess: true,
      req,
    });
    await payload.update({
      collection: "model-profiles",
      data: {
        account: modelAccount.id,
        bookingPreferences: bookingPreferences(modelEmail),
      },
      id: currentFixture.artist.id,
      overrideAccess: true,
      req,
    });
    await payload.create({
      collection: "artist-availability",
      data: {
        artist: currentFixture.artist.id,
        availableFrom: "09:00",
        availableUntil: "15:00",
        blockedTimes: [{ endTime: "14:00", reason: "lunch", startTime: "13:00" }],
        date: `${currentFixture.day}T00:00:00.000Z`,
        event: currentFixture.event.id,
      },
      overrideAccess: true,
      req,
    });
    const photographerReq = await createLocalReq({
      req: { transactionID: req.transactionID },
      user: photographerAccount,
    }, payload);
    const modelReq = await createLocalReq({
      req: { transactionID: req.transactionID },
      user: modelAccount,
    }, payload);

    record(
      "Authenticated photographer role",
      hasAccountRole(photographerAccount, "photographer"),
    );
    record(
      "Local booking origin accepted",
      assertAllowedMutationOrigin(new Request("http://localhost:3000/api/scheduling/bookings", {
        headers: { origin: "http://localhost:3000" },
        method: "POST",
      })) === null,
    );
    record(
      "Untrusted booking origin rejected",
      assertAllowedMutationOrigin(new Request("http://localhost:3000/api/scheduling/bookings", {
        headers: { origin: "https://untrusted.example" },
        method: "POST",
      }))?.status === 403,
    );

    const options = await getPhotographerBookingOptions(
      photographerAccount,
      { payload, req: photographerReq },
    );
    const minimumHours = Number(currentFixture.artistAssignment.minimumBookingHours || 1);
    const option = options.find((item) =>
      item.artistId === currentFixture.artist.id
      && item.day === currentFixture.day
      && item.durationHours === minimumHours);
    record(
      "Approved event eligibility and server-derived availability",
      Boolean(option),
      option ? `${option.day} · ${option.durationHours} hour(s)` : "Expected range missing",
    );
    if (!option) throw new Error("The approved photographer did not receive the expected booking range.");

    if (validatePhotographerBooking) {
      const allowedKeys = new Set([
        "artistId",
        "artistImage",
        "artistMinimumHours",
        "artistName",
        "day",
        "durationHours",
        "endAt",
        "eventId",
        "eventTitle",
        "startAt",
        "timeZone",
      ]);
      const allowedImageKeys = new Set(["alt", "height", "src", "width"]);
      record(
        "Visual booking projection exposes only approved selection fields",
        options.every((item) =>
          Object.keys(item).every((key) => allowedKeys.has(key))
          && item.artistMinimumHours >= 1
          && (
            item.artistImage === null
            || Object.keys(item.artistImage).every((key) => allowedImageKeys.has(key))
          )),
      );
    }

    const optionStart = eventLocalParts(option.startAt, currentFixture.timeZone);
    const optionEnd = eventLocalParts(option.endAt, currentFixture.timeZone);
    record(
      "Exact duration, whole-hour, and availability option",
      option.durationHours === minimumHours
      && optionStart.clock.endsWith(":00")
      && optionEnd.clock.endsWith(":00")
      && optionStart.clock >= "09:00"
      && optionEnd.clock <= "15:00"
      && !(optionStart.clock < "14:00" && optionEnd.clock > "13:00"),
    );
    record(
      "Non-photographer account cannot create a booking",
      await rejects(
        () => confirmPhotographerBooking(modelAccount as User, {
          artistId: currentFixture.artist.id,
          endAt: option.endAt,
          eventId: currentFixture.event.id,
          idempotencyKey: crypto.randomUUID(),
          startAt: option.startAt,
        }, { payload, req: modelReq }),
        /No photographer profile|cannot manage/i,
      ),
    );

    const input = {
      artistId: currentFixture.artist.id,
      endAt: option.endAt,
      eventId: currentFixture.event.id,
      idempotencyKey,
      startAt: option.startAt,
    };
    const booking = await confirmPhotographerBooking(
      photographerAccount,
      input,
      { payload, req: photographerReq },
    );
    record(
      "One valid booking confirmed immediately",
      booking.status === "confirmed" && booking.replayed === false,
      `booking ${booking.id}`,
    );

    const photographerSchedule = await getPersonalItinerary(
      photographerAccount,
      { payload, req: photographerReq },
    );
    const modelSchedule = await getPersonalItinerary(modelAccount, { payload, req: modelReq });
    const photographerItem = photographerSchedule.find((item) => item.id === booking.id);
    const modelItem = modelSchedule.find((item) => item.id === booking.id);
    record(
      "Photographer private schedule updated",
      Boolean(
        photographerItem
        && photographerItem.partnerName === currentFixture.artist.displayName
        && photographerItem.bookingStatus === "confirmed"
      ),
    );
    record(
      "Model private schedule updated",
      Boolean(
        modelItem
        && modelItem.partnerName === currentFixture.photographer.displayName
        && modelItem.bookingStatus === "confirmed"
      ),
    );

    if (validateModelAvailability) {
      const modelAvailability = await getModelAvailabilityDays(
        modelAccount,
        { payload, req: modelReq },
      );
      const protectedDay = modelAvailability.find((day) =>
        day.eventId === currentFixture.event.id && day.date === currentFixture.day);
      const protectedBooking = protectedDay?.protectedBookings.find((item) => item.id === booking.id);
      record(
        "Featured Artist sees real retreat availability and protected booking time",
        Boolean(
          protectedDay
          && protectedBooking
          && protectedBooking.startTime === optionStart.clock
          && protectedBooking.endTime === optionEnd.clock
          && Object.keys(protectedBooking).every((key) =>
            ["endTime", "id", "startTime", "status"].includes(key))
        ),
      );
      const savedAvailabilityID = await saveModelAvailability(modelAccount, {
        availableFrom: "09:00",
        availableUntil: "16:00",
        blockedTimes: [{ endTime: "14:00", reason: "lunch", startTime: "13:00" }],
        date: currentFixture.day,
        eventId: currentFixture.event.id,
      }, { payload, req: modelReq });
      record(
        "Featured Artist saves one real retreat day",
        Boolean(savedAvailabilityID),
      );
      const updatedAvailability = (await getModelAvailabilityDays(
        modelAccount,
        { payload, req: modelReq },
      )).find((day) => day.eventId === currentFixture.event.id && day.date === currentFixture.day);
      record(
        "Saved working day and break return through the real projection",
        Boolean(
          updatedAvailability
          && updatedAvailability.availableFrom === "09:00"
          && updatedAvailability.availableUntil === "16:00"
          && updatedAvailability.blockedTimes.some((block) =>
            block.startTime === "13:00" && block.endTime === "14:00" && block.reason === "lunch")
        ),
      );
    }

    const replay = await confirmPhotographerBooking(
      photographerAccount,
      input,
      { payload, req: photographerReq },
    );
    record(
      "Exact idempotent retry replays the original booking",
      replay.id === booking.id && replay.replayed === true,
    );
    record(
      "Idempotency key cannot authorize a different request",
      await rejects(
        () => confirmPhotographerBooking(photographerAccount as User, {
          ...input,
          endAt: eventLocalDateTimeToUTC(
            currentFixture.day,
            `${String(10 + minimumHours).padStart(2, "0")}:00`,
            currentFixture.timeZone,
          ),
        }, { payload, req: photographerReq }),
        /different booking request/i,
      ),
    );

    const audits = await payload.find({
      collection: "security-audit-events",
      depth: 0,
      limit: 20,
      overrideAccess: true,
      pagination: false,
      req: photographerReq,
      where: {
        and: [
          { actor: { equals: photographerAccount.id } },
          { eventType: { equals: "booking.confirmed" } },
        ],
      },
    });
    record(
      "Booking confirmation audit joined the transaction",
      audits.docs.some((audit) =>
        (audit.metadata as Record<string, unknown> | undefined)?.bookingId === booking.id),
    );

    if (validateModelAvailability) {
      record(
        "Confirmed session cannot be hidden by a model availability change",
        await rejects(
          () => saveModelAvailability(modelAccount as User, {
            availableFrom: "09:00",
            availableUntil: "16:00",
            blockedTimes: [{
              endTime: optionEnd.clock,
              reason: "unavailable",
              startTime: optionStart.clock,
            }],
            date: currentFixture.day,
            eventId: currentFixture.event.id,
          }, { payload, req: modelReq }),
          /confirmed booking|overlap/i,
        ),
      );
    } else {
      const invalidStartAt = eventLocalDateTimeToUTC(
        currentFixture.day,
        "09:30",
        currentFixture.timeZone,
      );
      const invalidEndAt = eventLocalDateTimeToUTC(
        currentFixture.day,
        `${String(9 + minimumHours).padStart(2, "0")}:30`,
        currentFixture.timeZone,
      );
      record(
        "Server rejects a non-whole-hour booking and rolls back the proof",
        await rejects(
          () => confirmPhotographerBooking(photographerAccount as User, {
            artistId: currentFixture.artist.id,
            endAt: invalidEndAt,
            eventId: currentFixture.event.id,
            idempotencyKey: crypto.randomUUID(),
            startAt: invalidStartAt,
          }, { payload, req: photographerReq }),
          /whole event-local hours|60-minute blocks/i,
        ),
      );
    }
  } catch (error) {
    record(
      "Milestone 2 controlled booking execution",
      false,
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    if (req?.transactionID) await killTransaction(req);
  }

  try {
    const [bookings, users] = await Promise.all([
      payload.find({
        collection: "retreat-bookings",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { idempotencyKey: { equals: idempotencyKey } },
      }),
      payload.find({
        collection: "users",
        depth: 0,
        limit: 2,
        overrideAccess: true,
        where: { email: { in: [photographerEmail, modelEmail] } },
      }),
    ]);
    record(
      "Controlled proof rolled back without persistent booking data",
      bookings.totalDocs === 0 && users.totalDocs === 0,
    );

    if (fixture) {
      const [artist, photographer, event, availability] = await Promise.all([
        payload.findByID({
          collection: "model-profiles",
          depth: 0,
          id: fixture.artist.id,
          overrideAccess: true,
        }),
        payload.findByID({
          collection: "photographer-profiles",
          depth: 0,
          id: fixture.photographer.id,
          overrideAccess: true,
        }),
        payload.findByID({
          collection: "retreat-events",
          depth: 0,
          id: fixture.event.id,
          overrideAccess: true,
        }),
        payload.find({
          collection: "artist-availability",
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              { event: { equals: fixture.event.id } },
              { artist: { equals: fixture.artist.id } },
              { date: { equals: `${fixture.day}T00:00:00.000Z` } },
            ],
          },
        }),
      ]);
      record(
        "Participant profiles and availability restored after rollback",
        relationshipID(artist.account) === relationshipID(fixture.artist.account)
        && relationshipID(photographer.account) === relationshipID(fixture.photographer.account)
        && event.lifecycleStatus === fixture.event.lifecycleStatus
        && availability.totalDocs === 0,
      );
    }
  } finally {
    await payload.destroy();
  }

  const summary = {
    failed: results.filter((result) => !result.pass).length,
    passed: results.filter((result) => result.pass).length,
    total: results.length,
  };
  console.log(JSON.stringify({
    database: "approved development database",
    results,
    runID,
    summary,
  }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

await validate();
