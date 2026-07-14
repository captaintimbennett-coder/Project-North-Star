import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import type { ModelProfile, PhotographerProfile, User } from "@/payload-types";
import { getPersonalItinerary, getSharedRetreatSchedule } from "@/lib/auth/schedule-projection";
import { getModelAvailabilityDays, saveModelAvailability } from "@/lib/scheduling/availability-service";
import { confirmPhotographerBooking, getPhotographerBookingOptions } from "@/lib/scheduling/booking-service";

type TestResult = { detail?: string; name: string; pass: boolean };
type Fixture = {
  admin: User;
  availabilityIDs: number[];
  bookingIDs: number[];
  eventID: number;
  modelAccounts: User[];
  models: ModelProfile[];
  photographerAccounts: User[];
  photographerPasswords: string[];
  photographers: PhotographerProfile[];
  profileIDs: { model: number[]; photographer: number[] };
  userIDs: number[];
};

const results: TestResult[] = [];
const runID = `mission05-${Date.now()}`;

function record(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail });
}

function relationshipID(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "number") return value.id;
  return null;
}

async function rejects(action: () => Promise<unknown>, pattern?: RegExp) {
  try {
    await action();
    return false;
  } catch (error) {
    return pattern ? pattern.test(error instanceof Error ? error.message : String(error)) : true;
  }
}

async function createUser(payload: Payload, fixture: Fixture, suffix: string, roles: User["roles"], role: User["role"] = null) {
  const password = `M05-${suffix}-Validation-42!`;
  const user = await payload.create({
    collection: "users",
    data: { accountStatus: "active", email: `${runID}-${suffix}@example.invalid`, name: `${runID} ${suffix}`, password, role, roles },
    overrideAccess: true,
  });
  fixture.userIDs.push(user.id);
  return { password, user };
}

async function buildFixture(payload: Payload): Promise<Fixture> {
  const fixture: Fixture = {
    admin: null as unknown as User,
    availabilityIDs: [], bookingIDs: [], eventID: 0, modelAccounts: [], models: [],
    photographerAccounts: [], photographerPasswords: [], photographers: [],
    profileIDs: { model: [], photographer: [] }, userIDs: [],
  };
  const admin = await createUser(payload, fixture, "admin", ["administrator"], "editor");
  fixture.admin = admin.user;
  for (let index = 1; index <= 2; index += 1) {
    const account = await createUser(payload, fixture, `model-${index}`, ["model"]);
    fixture.modelAccounts.push(account.user);
    const profile = await payload.create({
      collection: "model-profiles", overrideAccess: true,
      data: {
        account: account.user.id, approvalStatus: "approved", displayName: `${runID} Model ${index}`,
        instagram: `mission05model${index}`, slug: `${runID}-model-${index}`,
        bookingPreferences: {
          email: `${runID}-model-${index}@example.invalid`, mobilePhone: "555-0100",
          notifyByEmail: true, notifyBySms: false, notifyInDashboard: false,
          shareEmail: true, shareInstagram: false, shareMobilePhone: false, shareWebsite: false,
        },
      },
    });
    fixture.models.push(profile); fixture.profileIDs.model.push(profile.id);
  }
  for (let index = 1; index <= 4; index += 1) {
    const account = await createUser(payload, fixture, `photographer-${index}`, ["photographer"]);
    fixture.photographerAccounts.push(account.user); fixture.photographerPasswords.push(account.password);
    const profile = await payload.create({
      collection: "photographer-profiles", overrideAccess: true,
      data: {
        account: account.user.id, approvalStatus: "approved", displayName: `${runID} Photographer ${index}`,
        slug: `${runID}-photographer-${index}`,
        bookingPreferences: {
          email: `${runID}-photographer-${index}@example.invalid`, mobilePhone: "555-0101",
          notifyByEmail: true, notifyBySms: false, notifyInDashboard: false,
          shareEmail: true, shareInstagram: false, shareMobilePhone: false, shareWebsite: false,
        },
      },
    });
    fixture.photographers.push(profile); fixture.profileIDs.photographer.push(profile.id);
  }
  const event = await payload.create({
    collection: "retreat-events", draft: false, overrideAccess: true,
    data: {
      _status: "published", lifecycleStatus: "published", locationName: "Validation Studio",
      participatingArtists: fixture.models.map((model) => ({ artist: model.id, displayOrder: 1, minimumBookingHours: "1", participationStatus: "approved" })),
      participatingPhotographers: fixture.photographers.slice(0, 3).map((photographer) => ({ photographer: photographer.id, participationStatus: "approved" })),
      registrationStatus: "closed", slug: `${runID}-event`, startDate: "2030-05-10T05:00:00.000Z",
      endDate: "2030-05-11T04:59:59.000Z", summary: "Temporary Mission 05 validation event.",
      timeZone: "America/Chicago", title: `${runID} Validation Event`,
    },
  });
  fixture.eventID = event.id;
  for (const model of fixture.models) {
    const availability = await payload.create({
      collection: "artist-availability", overrideAccess: true, user: fixture.admin,
      data: {
        artist: model.id, availableFrom: "06:00", availableUntil: "18:00",
        blockedTimes: [{ startTime: "12:00", endTime: "13:00", reason: "lunch" }],
        date: "2030-05-10T00:00:00.000Z", event: event.id,
      },
    });
    fixture.availabilityIDs.push(availability.id);
  }
  return fixture;
}

async function cleanup(payload: Payload, fixture?: Fixture) {
  if (!fixture) return;
  const audits = await payload.find({
    collection: "security-audit-events", depth: 0, limit: 500, overrideAccess: true, pagination: false,
    where: { actor: { in: fixture.userIDs } },
  }).catch(() => ({ docs: [] }));
  for (const bookingID of [...new Set(fixture.bookingIDs)].reverse()) await payload.delete({ collection: "retreat-bookings", id: bookingID, overrideAccess: true }).catch(() => null);
  for (const availabilityID of fixture.availabilityIDs.reverse()) await payload.delete({ collection: "artist-availability", id: availabilityID, overrideAccess: true }).catch(() => null);
  if (fixture.eventID) await payload.delete({ collection: "retreat-events", id: fixture.eventID, overrideAccess: true }).catch(() => null);
  for (const profileID of fixture.profileIDs.model.reverse()) await payload.delete({ collection: "model-profiles", id: profileID, overrideAccess: true }).catch(() => null);
  for (const profileID of fixture.profileIDs.photographer.reverse()) await payload.delete({ collection: "photographer-profiles", id: profileID, overrideAccess: true }).catch(() => null);
  for (const audit of audits.docs.reverse()) await payload.delete({ collection: "security-audit-events", id: audit.id, overrideAccess: true }).catch(() => null);
  for (const userID of fixture.userIDs.reverse()) await payload.delete({ collection: "users", id: userID, overrideAccess: true }).catch(() => null);
}

async function validate() {
  const target = new URL(process.env.DATABASE_URL || "");
  if (!target.hostname.startsWith("ep-muddy-rain-") || target.hostname.includes("ep-summer-truth-")) {
    throw new Error("Validation refused: target is not mission-05-validation.");
  }
  const payload = await getPayload({ config });
  let fixture: Fixture | undefined;
  try {
    fixture = await buildFixture(payload);
    const login = await payload.login({
      collection: "users",
      data: { email: fixture.photographerAccounts[0].email, password: fixture.photographerPasswords[0] },
    });
    record("Photographer authentication", Boolean(login.token && login.user?.id === fixture.photographerAccounts[0].id));
    const options = await getPhotographerBookingOptions(login.user as User);
    record("Photographer eligibility and server-derived ranges", options.length > 0 && options.every((option) => option.eventId === fixture?.eventID), `${options.length} ranges`);
    const unapprovedLogin = await payload.login({
      collection: "users",
      data: { email: fixture.photographerAccounts[3].email, password: fixture.photographerPasswords[3] },
    });
    record("Ineligible photographer receives no ranges", (await getPhotographerBookingOptions(unapprovedLogin.user as User)).length === 0);

    const option = options.find((item) => item.artistId === fixture?.models[0].id && item.durationHours === 2 && item.startAt === "2030-05-10T13:00:00.000Z");
    if (!option) throw new Error("Expected 8:00–10:00 AM booking option was not derived.");
    const input = { artistId: fixture.models[0].id, endAt: option.endAt, eventId: fixture.eventID, idempotencyKey: `${runID}-primary`, startAt: option.startAt };
    const booking = await confirmPhotographerBooking(login.user as User, input);
    fixture.bookingIDs.push(booking.id);
    record("Instant booking confirmation", booking.status === "confirmed");
    record("Idempotent retry", (await confirmPhotographerBooking(login.user as User, input)).id === booking.id);

    const photographerItem = (await getPersonalItinerary(login.user as User)).find((item) => item.id === booking.id);
    record("Photographer schedule projection", Boolean(photographerItem && photographerItem.partnerName === fixture.models[0].displayName && photographerItem.durationMinutes === 120 && photographerItem.eventLocation === "Validation Studio" && photographerItem.contactMethods.some((method) => method.label === "Email")));
    const modelItem = (await getPersonalItinerary(fixture.modelAccounts[0])).find((item) => item.id === booking.id);
    record("Model schedule projection", Boolean(modelItem && modelItem.partnerName === fixture.photographers[0].displayName && modelItem.durationMinutes === 120 && modelItem.contactMethods.some((method) => method.label === "Email")));
    const sharedItem = (await getSharedRetreatSchedule(fixture.modelAccounts[0], fixture.eventID)).find((item) => item.id === booking.id);
    record("Privacy-safe shared schedule", Boolean(sharedItem && !Object.keys(sharedItem).some((key) => /photographer|email|contact|phone|note/i.test(key))), sharedItem ? Object.keys(sharedItem).join(",") : "missing");

    record("Model availability read", (await getModelAvailabilityDays(fixture.modelAccounts[0])).some((day) => day.eventId === fixture?.eventID));
    record("Model availability editing", (await saveModelAvailability(fixture.modelAccounts[0], { availableFrom: "06:00", availableUntil: "17:00", blockedTimes: [{ startTime: "12:00", endTime: "13:00", reason: "lunch" }], date: "2030-05-10", eventId: fixture.eventID })) === fixture.availabilityIDs[0]);
    record("Confirmed reservation protected from availability edit", await rejects(() => saveModelAvailability(fixture!.modelAccounts[0], { availableFrom: "06:00", availableUntil: "17:00", blockedTimes: [{ startTime: "08:00", endTime: "09:00", reason: "unavailable" }], date: "2030-05-10", eventId: fixture!.eventID }), /confirmed booking|overlap/i));

    record("Cancellation requires administrative reason", await rejects(() => payload.update({ collection: "retreat-bookings", id: booking.id, overrideAccess: false, user: fixture!.admin, data: { status: "cancelled" } }), /reason is required/i));
    const cancelled = await payload.update({ collection: "retreat-bookings", id: booking.id, overrideAccess: false, user: fixture.admin, data: { exceptionReason: "Validation cancellation", status: "cancelled" } });
    record("Admin cancellation", cancelled.status === "cancelled" && Boolean(cancelled.administratorChangedAt));

    const source = await payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture.admin, data: { artist: fixture.models[0].id, endAt: "2030-05-10T16:00:00.000Z", event: fixture.eventID, photographer: fixture.photographers[0].id, startAt: "2030-05-10T15:00:00.000Z", status: "confirmed" } });
    fixture.bookingIDs.push(source.id);
    record("Reschedule requires administrative reason", await rejects(() => payload.update({ collection: "retreat-bookings", id: source.id, overrideAccess: false, user: fixture!.admin, data: { status: "rescheduled" } }), /reason is required/i));
    const rescheduled = await payload.update({ collection: "retreat-bookings", id: source.id, overrideAccess: false, user: fixture.admin, data: { exceptionReason: "Validation reschedule", status: "rescheduled" } });
    const replacement = await payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture.admin, data: { artist: fixture.models[0].id, endAt: "2030-05-10T17:00:00.000Z", event: fixture.eventID, photographer: fixture.photographers[0].id, rescheduledFrom: source.id, startAt: "2030-05-10T16:00:00.000Z", status: "confirmed" } });
    fixture.bookingIDs.push(replacement.id);
    record("Admin rescheduling", rescheduled.status === "rescheduled" && relationshipID(replacement.rescheduledFrom) === source.id);

    const overrideData = { adminOverride: true, artist: fixture.models[0].id, endAt: "2030-05-11T01:00:00.000Z", event: fixture.eventID, photographer: fixture.photographers[1].id, startAt: "2030-05-11T00:00:00.000Z", status: "confirmed" as const };
    record("Availability override requires administrative reason", await rejects(() => payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture!.admin, data: overrideData }), /reason is required/i));
    const override = await payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture.admin, data: { ...overrideData, exceptionReason: "Approved validation override" } });
    fixture.bookingIDs.push(override.id);
    record("Admin availability override", override.adminOverride === true);

    const competing = await Promise.allSettled([1, 2].map((index) => confirmPhotographerBooking(fixture!.photographerAccounts[index], { artistId: fixture!.models[1].id, endAt: "2030-05-10T14:00:00.000Z", eventId: fixture!.eventID, idempotencyKey: `${runID}-competing-${index}`, startAt: "2030-05-10T13:00:00.000Z" })));
    competing.forEach((item) => { if (item.status === "fulfilled") fixture?.bookingIDs.push(item.value.id); });
    record("Two photographers competing for same model/time", competing.filter((item) => item.status === "fulfilled").length === 1 && competing.filter((item) => item.status === "rejected").length === 1, competing.map((item) => item.status).join(","));

    const overlaps = await Promise.allSettled(fixture.models.map((model) => payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture!.photographerAccounts[0], data: { artist: model.id, endAt: "2030-05-10T19:00:00.000Z", event: fixture!.eventID, photographer: fixture!.photographers[0].id, startAt: "2030-05-10T18:00:00.000Z", status: "confirmed" } })));
    overlaps.forEach((item) => { if (item.status === "fulfilled") fixture?.bookingIDs.push(item.value.id); });
    record("One photographer overlapping bookings", overlaps.filter((item) => item.status === "fulfilled").length === 1 && overlaps.filter((item) => item.status === "rejected").length === 1, overlaps.map((item) => item.status).join(","));

    const raceRounds = 10;
    let racePasses = 0;
    for (let round = 0; round < raceRounds; round += 1) {
      await payload.update({ collection: "artist-availability", id: fixture.availabilityIDs[1], overrideAccess: false, user: fixture.modelAccounts[1], data: { blockedTimes: [] } });
      const race = await Promise.allSettled([
        payload.update({ collection: "artist-availability", id: fixture.availabilityIDs[1], overrideAccess: false, user: fixture.modelAccounts[1], data: { blockedTimes: [{ startTime: "14:00", endTime: "15:00", reason: "unavailable" }] } }),
        payload.create({ collection: "retreat-bookings", overrideAccess: false, user: fixture.photographerAccounts[2], data: { artist: fixture.models[1].id, endAt: "2030-05-10T20:00:00.000Z", event: fixture.eventID, photographer: fixture.photographers[2].id, startAt: "2030-05-10T19:00:00.000Z", status: "confirmed" } }),
      ]);
      const fulfilled = race.filter((item) => item.status === "fulfilled");
      if (fulfilled.length === 1) racePasses += 1;
      for (const item of fulfilled) {
        if ("status" in item.value) {
          fixture.bookingIDs.push(item.value.id);
          await payload.delete({ collection: "retreat-bookings", id: item.value.id, overrideAccess: true });
        }
      }
    }
    record("Availability-versus-booking concurrency (10 rounds)", racePasses === raceRounds, `${racePasses}/${raceRounds} exactly-one-commit rounds`);

    const audits = await payload.find({ collection: "security-audit-events", depth: 0, limit: 500, overrideAccess: true, pagination: false, where: { actor: { in: fixture.userIDs } } });
    const auditTypes = new Set(audits.docs.map((audit) => audit.eventType));
    const overrideAudit = audits.docs.find((audit) => audit.eventType === "booking.admin_override" && (audit.metadata as Record<string, unknown>)?.bookingId === override.id);
    const safeOverrideMetadata = overrideAudit?.metadata as Record<string, unknown> | undefined;
    record("Normal confirmation audit preserved", auditTypes.has("booking.confirmed"));
    record("Dedicated administrator override audit", Boolean(overrideAudit && safeOverrideMetadata?.eventId === fixture.eventID && safeOverrideMetadata?.actorId === fixture.admin.id && safeOverrideMetadata?.override === true && safeOverrideMetadata?.reason === "Approved validation override" && Object.keys(safeOverrideMetadata).every((key) => ["actorId", "bookingId", "eventId", "override", "reason"].includes(key))), overrideAudit ? Object.keys(safeOverrideMetadata || {}).join(",") : "missing");
  } finally {
    await cleanup(payload, fixture);
    await payload.destroy();
  }
  const summary = { failed: results.filter((result) => !result.pass).length, passed: results.filter((result) => result.pass).length, total: results.length };
  console.log(JSON.stringify({ runID, target: "mission-05-validation", results, summary }, null, 2));
  if (summary.failed) process.exitCode = 1;
}

await validate();
