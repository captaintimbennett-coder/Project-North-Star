import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { POST as activate } from "../src/app/(payload)/api/account/activate/route";
import { getModelAvailabilityDays, saveModelAvailability } from "../src/lib/scheduling/availability-service";
import { getPhotographerBookingOptions } from "../src/lib/scheduling/booking-service";
import { getSharedRetreatScheduleEvents } from "../src/lib/auth/schedule-projection";

// Explicit non-production allowlist. Never run this against production.
assert.equal(new URL(process.env.DATABASE_URL || "").hostname,
  "ep-muddy-rain-ajcxgzld-pooler.c-3.us-east-2.aws.neon.tech");
assert.equal(process.env.PAYLOAD_MIGRATING, "true", "Disable automatic schema push for validation");
process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:3024";
const payload = await getPayload({ config });
const prefix = `onboarding-qa-${Date.now()}`;
const profiles: { collection: "model-profiles" | "photographer-profiles"; id: number }[] = [];
const invitations: number[] = [];
const emails: { to: unknown; text: string }[] = [];
const originalSend = payload.sendEmail;
payload.sendEmail = async (message) => { emails.push({ to: message.to, text: String(message.text) }); };
let eventID: number | undefined;

try {
  const model = await payload.create({ collection: "model-profiles", overrideAccess: true,
    data: { displayName: `${prefix} artist`, slug: `${prefix}-artist`, approvalStatus: "approved" } });
  profiles.push({ collection: "model-profiles", id: model.id });
  const photographer = await payload.create({ collection: "photographer-profiles", overrideAccess: true,
    data: { displayName: `${prefix} photographer`, slug: `${prefix}-photographer`, approvalStatus: "approved" } });
  profiles.push({ collection: "photographer-profiles", id: photographer.id });
  const event = await payload.create({ collection: "retreat-events", overrideAccess: true,
    data: { title: prefix, slug: prefix, summary: "Disposable validation event", lifecycleStatus: "published", _status: "published", registrationStatus: "closed",
      startDate: "2027-05-14T12:00:00Z", endDate: "2027-05-16T23:00:00Z", timeZone: "America/Chicago",
      participatingArtists: [{ artist: model.id, participationStatus: "confirmed", minimumBookingHours: "1" }],
      participatingPhotographers: [{ photographer: photographer.id, participationStatus: "approved" }],
    } });
  eventID = event.id;
  for (const role of ["model", "photographer"] as const) {
    const email = `${prefix}-${role}@example.invalid`;
    const profile = role === "model" ? profiles[0] : profiles[1];
    const invitation = await payload.create({ collection: "account-invitations", overrideAccess: true,
      data: { email, roles: [role], status: "pending", tokenHash: "", tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        ...(role === "model" ? { relatedModelProfile: profile.id } : { relatedPhotographerProfile: profile.id }),
      } });
    invitations.push(invitation.id);
    const audit = await payload.find({ collection: "security-audit-events", overrideAccess: true,
      where: { and: [{ targetInvitation: { equals: invitation.id } }, { eventType: { equals: "account_invitation.email_sent" } }] } });
    assert.equal(audit.totalDocs, 1, "Invitation delivery audit uses the invitation transaction");
    const messages = emails.filter(item => item.to === email);
    assert.equal(messages.length, 1, "Exactly one invitation message");
    const match = messages[0].text.match(/http:\/\/localhost:3024\/account\/activate\?token=([^\s]+)/);
    assert.ok(match, "Invitation points to its validation runtime");
    const token = decodeURIComponent(match[1]);
    const password = randomUUID();
    const request = () => new Request("http://localhost:3024/api/account/activate", { method: "POST",
      headers: { origin: "http://localhost:3024", "content-type": "application/json" },
      body: JSON.stringify({ token, password, name: `${prefix} ${role}` }),
    });
    const response = await activate(request());
    assert.equal(response.status, 200, `Activation: ${await response.text()}`);
    const login = await payload.login({ collection: "users", data: { email, password } });
    assert.ok(login.token, "Password sign-in succeeds");
    assert.ok(login.user);
    assert.deepEqual(login.user.roles, [role]);
    assert.equal(login.user.accountStatus, "active");
    const linked = await payload.findByID({ collection: profile.collection, id: profile.id, depth: 0, overrideAccess: true });
    assert.equal(linked.account, login.user.id, "Activation links the right participant profile");
    assert.equal((await activate(request())).status, 400, "Invitation cannot be reused");
    const schedules = await getSharedRetreatScheduleEvents(login.user, { payload });
    assert.ok(schedules.some(item => item.eventId === event.id), "Approved event is accessible");
    if (role === "model") {
      const days = await getModelAvailabilityDays(login.user, { payload });
      assert.equal(days.filter(day => day.eventId === event.id).length, 3);
      await saveModelAvailability(login.user, { eventId: event.id, date: "2027-05-14",
        availableFrom: "09:00", availableUntil: "12:00", blockedTimes: [] }, { payload });
    } else {
      const options = await getPhotographerBookingOptions(login.user, { payload });
      assert.ok(options.some(option => option.eventId === event.id && option.artistId === model.id), "Photographer can select newly onboarded artist availability");
    }
    console.log(`${role}: invitation message, activation, sign-in, profile link, event access and role-specific scheduling passed`);
  }
} finally {
  if (eventID) {
    await payload.delete({ collection: "artist-availability", where: { event: { equals: eventID } }, overrideAccess: true });
    await payload.delete({ collection: "retreat-events", id: eventID, overrideAccess: true });
  }
  for (const profile of profiles) await payload.delete({ ...profile, overrideAccess: true });
  for (const id of invitations) await payload.delete({ collection: "account-invitations", id, overrideAccess: true });
  // Find only this run's accounts, including one created before an assertion failed.
  const accounts = await payload.find({ collection: "users", where: { email: { contains: prefix } }, overrideAccess: true, limit: 10 });
  for (const account of accounts.docs) await payload.delete({ collection: "users", id: account.id, overrideAccess: true });
  payload.sendEmail = originalSend;
  await payload.destroy();
  console.log("Disposable validation records removed; no external email sent.");
}
process.exit(0);
