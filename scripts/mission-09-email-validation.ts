import config from "@payload-config";
import { getPayload, type Payload, type SendEmailOptions } from "payload";
import type { User } from "@/payload-types";
import {
  dispatchSchedulingEmailsForBooking,
  retrySchedulingEmailDelivery,
} from "@/lib/email/scheduling-email";
import {
  cancelRetreatBooking,
  rescheduleRetreatBooking,
} from "@/lib/scheduling/admin-booking-service";
import { confirmPhotographerBooking } from "@/lib/scheduling/booking-service";

type Result = { detail?: string; name: string; pass: boolean };
type CreatedIDs = {
  availability?: number;
  bookingIDs: number[];
  event?: number;
  modelProfile?: number;
  photographerProfile?: number;
  userIDs: number[];
};

const results: Result[] = [];
const runID = `mission09-email-${Date.now()}`;
const modelEmail = `${runID}-model@example.invalid`;
const photographerEmail = `${runID}-photographer@example.invalid`;
const privateRescheduleReason = `${runID}-private-reschedule-reason`;
const privateCancellationReason = `${runID}-private-cancellation-reason`;
const created: CreatedIDs = { bookingIDs: [], userIDs: [] };

function record(name: string, pass: boolean, detail?: string) {
  results.push({ detail, name, pass });
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

async function createParticipant(
  payload: Payload,
  role: "model" | "photographer",
  email: string,
) {
  const user = await payload.create({
    collection: "users",
    data: {
      accountStatus: "active",
      email,
      name: `${runID} ${role}`,
      password: `M09-${role}-Email-Validation-42!`,
      role: null,
      roles: [role],
    },
    overrideAccess: true,
  });
  created.userIDs.push(user.id);
  return user;
}

async function deliveriesForBooking(payload: Payload, bookingID: number) {
  return payload.find({
    collection: "scheduling-email-deliveries",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    sort: "createdAt",
    where: { booking: { equals: bookingID } },
  });
}

async function removeFixtures(payload: Payload) {
  const deliveries = await payload.find({
    collection: "scheduling-email-deliveries",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: { recipientEmail: { in: [modelEmail, photographerEmail] } },
  });
  for (const delivery of deliveries.docs) {
    await payload.delete({
      collection: "scheduling-email-deliveries",
      id: delivery.id,
      overrideAccess: true,
    }).catch(() => null);
  }
  for (const bookingID of created.bookingIDs.reverse()) {
    await payload.delete({
      collection: "retreat-bookings",
      id: bookingID,
      overrideAccess: true,
    }).catch(() => null);
  }
  if (created.availability) {
    await payload.delete({
      collection: "artist-availability",
      id: created.availability,
      overrideAccess: true,
    }).catch(() => null);
  }
  if (created.event) {
    await payload.delete({
      collection: "retreat-events",
      id: created.event,
      overrideAccess: true,
    }).catch(() => null);
  }
  if (created.modelProfile) {
    await payload.delete({
      collection: "model-profiles",
      id: created.modelProfile,
      overrideAccess: true,
    }).catch(() => null);
  }
  if (created.photographerProfile) {
    await payload.delete({
      collection: "photographer-profiles",
      id: created.photographerProfile,
      overrideAccess: true,
    }).catch(() => null);
  }
  for (const userID of created.userIDs.reverse()) {
    await payload.delete({ collection: "users", id: userID, overrideAccess: true }).catch(() => null);
  }
}

async function validate() {
  const target = new URL(process.env.DATABASE_URL || "");
  if (!target.hostname.startsWith("ep-summer-truth-") || target.hostname.includes("ep-muddy-rain-")) {
    throw new Error("Validation refused: DATABASE_URL is not the approved development database.");
  }

  const payload = await getPayload({ config });
  const sentMessages: SendEmailOptions[] = [];
  const captureEmail = async (message: SendEmailOptions) => {
    sentMessages.push(message);
    return {};
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
    const owner = owners.docs[0] as User | undefined;
    if (!owner) throw new Error("No active owner account is available for the development proof.");

    const photographerAccount = await createParticipant(
      payload,
      "photographer",
      photographerEmail,
    );
    const modelAccount = await createParticipant(payload, "model", modelEmail);
    const modelProfile = await payload.create({
      collection: "model-profiles",
      data: {
        account: modelAccount.id,
        approvalStatus: "approved",
        bookingPreferences: bookingPreferences(modelEmail),
        displayName: `${runID} Featured Artist`,
        slug: `${runID}-artist`,
      },
      overrideAccess: true,
    });
    created.modelProfile = modelProfile.id;
    const photographerProfile = await payload.create({
      collection: "photographer-profiles",
      data: {
        account: photographerAccount.id,
        approvalStatus: "approved",
        bookingPreferences: bookingPreferences(photographerEmail),
        displayName: `${runID} Photographer`,
        slug: `${runID}-photographer`,
      },
      overrideAccess: true,
    });
    created.photographerProfile = photographerProfile.id;

    const event = await payload.create({
      collection: "retreat-events",
      data: {
        endDate: "2027-05-16T23:00:00.000Z",
        lifecycleStatus: "published",
        locationName: "Lone Star Retreat",
        participatingArtists: [{
          artist: modelProfile.id,
          displayOrder: 1,
          minimumBookingHours: "1",
          participationStatus: "approved",
        }],
        participatingPhotographers: [{
          participationStatus: "approved",
          photographer: photographerProfile.id,
        }],
        registrationStatus: "registration-open",
        slug: `${runID}-event`,
        startDate: "2027-05-14T14:00:00.000Z",
        summary: "Temporary Mission 09 transactional email validation event.",
        timeZone: "America/Chicago",
        title: `${runID} Founders Edition`,
      },
      overrideAccess: true,
    });
    created.event = event.id;
    const availability = await payload.create({
      collection: "artist-availability",
      data: {
        artist: modelProfile.id,
        availableFrom: "09:00",
        availableUntil: "15:00",
        blockedTimes: [],
        date: "2027-05-15T00:00:00.000Z",
        event: event.id,
      },
      overrideAccess: true,
      user: modelAccount,
    });
    created.availability = availability.id;

    const confirmed = await confirmPhotographerBooking(
      photographerAccount,
      {
        artistId: modelProfile.id,
        endAt: "2027-05-15T15:00:00.000Z",
        eventId: event.id,
        idempotencyKey: crypto.randomUUID(),
        startAt: "2027-05-15T14:00:00.000Z",
      },
      { dispatchEmails: false, payload },
    );
    created.bookingIDs.push(confirmed.id);
    let deliveries = await deliveriesForBooking(payload, confirmed.id);
    record(
      "Confirmation creates one durable intent for each participant",
      deliveries.totalDocs === 2
      && new Set(deliveries.docs.map((delivery) => delivery.recipientRole)).size === 2
      && deliveries.docs.every((delivery) => delivery.status === "pending"),
    );

    const confirmationResult = await dispatchSchedulingEmailsForBooking(payload, confirmed.id, {
      sendEmail: captureEmail,
    });
    deliveries = await deliveriesForBooking(payload, confirmed.id);
    record(
      "Confirmation sends exactly two branded participant emails",
      confirmationResult.sent === 2
      && sentMessages.length === 2
      && sentMessages.every((message) => message.subject === "Your Lone Star Retreat session is confirmed")
      && new Set(sentMessages.map((message) => String(message.to))).has(modelEmail)
      && new Set(sentMessages.map((message) => String(message.to))).has(photographerEmail),
    );
    record(
      "Successful confirmation delivery is visible",
      deliveries.docs.every((delivery) =>
        delivery.status === "sent" && delivery.attempts === 1 && Boolean(delivery.sentAt)),
    );
    const confirmationReplay = await dispatchSchedulingEmailsForBooking(payload, confirmed.id, {
      sendEmail: captureEmail,
    });
    record(
      "Successful confirmation cannot be sent twice",
      confirmationReplay.sent === 0 && sentMessages.length === 2,
    );

    const rescheduled = await rescheduleRetreatBooking(
      owner,
      confirmed.id,
      {
        endAt: "2027-05-15T16:00:00.000Z",
        reason: privateRescheduleReason,
        startAt: "2027-05-15T15:00:00.000Z",
      },
      { dispatchEmails: false, payload },
    );
    const beforeRescheduleMessages = sentMessages.length;
    const rescheduleResult = await dispatchSchedulingEmailsForBooking(payload, confirmed.id, {
      sendEmail: captureEmail,
    });
    record(
      "Administrator reschedule sends one message to each participant",
      rescheduled.status === "confirmed"
      && rescheduleResult.sent === 2
      && sentMessages.length === beforeRescheduleMessages + 2
      && sentMessages.slice(-2).every((message) =>
        message.subject === "Your Lone Star Retreat session has been rescheduled"
        && String(message.text).includes("Previous time:")
        && String(message.text).includes("New time:")),
    );

    const cancelled = await cancelRetreatBooking(
      owner,
      confirmed.id,
      privateCancellationReason,
      { dispatchEmails: false, payload },
    );
    const beforeCancellationMessages = sentMessages.length;
    const cancellationResult = await dispatchSchedulingEmailsForBooking(payload, confirmed.id, {
      sendEmail: captureEmail,
    });
    record(
      "Administrator cancellation sends one message to each participant",
      cancelled.status === "cancelled"
      && cancellationResult.sent === 2
      && sentMessages.length === beforeCancellationMessages + 2
      && sentMessages.slice(-2).every((message) =>
        message.subject === "Your Lone Star Retreat session has been cancelled"),
    );
    record(
      "Private administrator reasons never enter participant email",
      sentMessages.every((message) =>
        !String(message.text).includes(privateRescheduleReason)
        && !String(message.html).includes(privateCancellationReason)
        && !String(message.html).includes(privateRescheduleReason)
        && !String(message.text).includes(privateCancellationReason)),
    );

    const failureBooking = await confirmPhotographerBooking(
      photographerAccount,
      {
        artistId: modelProfile.id,
        endAt: "2027-05-15T17:00:00.000Z",
        eventId: event.id,
        idempotencyKey: crypto.randomUUID(),
        startAt: "2027-05-15T16:00:00.000Z",
      },
      { dispatchEmails: false, payload },
    );
    created.bookingIDs.push(failureBooking.id);
    const failedResult = await dispatchSchedulingEmailsForBooking(payload, failureBooking.id, {
      sendEmail: async () => {
        throw new Error("Simulated provider failure.");
      },
    });
    const failedDeliveries = await deliveriesForBooking(payload, failureBooking.id);
    const persistedBooking = await payload.findByID({
      collection: "retreat-bookings",
      id: failureBooking.id,
      depth: 0,
      overrideAccess: true,
    });
    record(
      "Email failure is visible without rolling back the booking",
      failedResult.failed === 2
      && persistedBooking.status === "confirmed"
      && failedDeliveries.docs.every((delivery) =>
        delivery.status === "failed"
        && delivery.attempts === 1
        && delivery.lastError === "Transactional email delivery failed."),
    );

    const beforeRetryMessages = sentMessages.length;
    for (const delivery of failedDeliveries.docs) {
      await retrySchedulingEmailDelivery(payload, delivery.id, { sendEmail: captureEmail });
    }
    let retriedDeliveries = await deliveriesForBooking(payload, failureBooking.id);
    record(
      "Explicit retry sends only the failed emails and records success",
      sentMessages.length === beforeRetryMessages + 2
      && retriedDeliveries.docs.every((delivery) =>
        delivery.status === "sent" && delivery.attempts === 2 && Boolean(delivery.sentAt)),
    );
    const duplicateRetry = await retrySchedulingEmailDelivery(
      payload,
      retriedDeliveries.docs[0].id,
      { sendEmail: captureEmail },
    );
    retriedDeliveries = await deliveriesForBooking(payload, failureBooking.id);
    const bookingAfterRetry = await payload.findByID({
      collection: "retreat-bookings",
      id: failureBooking.id,
      depth: 0,
      overrideAccess: true,
    });
    record(
      "Retry cannot replay email or mutate the booking",
      duplicateRetry.skipped === 1
      && sentMessages.length === beforeRetryMessages + 2
      && bookingAfterRetry.startAt === failureBooking.startAt
      && bookingAfterRetry.endAt === failureBooking.endAt
      && retriedDeliveries.docs.every((delivery) => delivery.attempts === 2),
    );

    const allDeliveries = await payload.find({
      collection: "scheduling-email-deliveries",
      depth: 0,
      limit: 20,
      overrideAccess: true,
      pagination: false,
      where: { recipientEmail: { in: [modelEmail, photographerEmail] } },
    });
    record(
      "Delivery keys prevent duplicate lifecycle intents",
      allDeliveries.totalDocs === 8
      && new Set(allDeliveries.docs.map((delivery) => delivery.deliveryKey)).size === 8,
      `${allDeliveries.totalDocs} lifecycle deliveries`,
    );
  } catch (error) {
    record(
      "Milestone 4 controlled email execution",
      false,
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    await removeFixtures(payload);
    const leftovers = await payload.find({
      collection: "scheduling-email-deliveries",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { recipientEmail: { in: [modelEmail, photographerEmail] } },
    });
    record("Controlled proof removed all temporary delivery records", leftovers.totalDocs === 0);
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
