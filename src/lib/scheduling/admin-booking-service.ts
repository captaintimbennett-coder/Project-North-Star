import config from "@payload-config";
import { getPayload, type Payload, type PayloadRequest } from "payload";
import type { RetreatBooking, User } from "@/payload-types";
import { dispatchSchedulingEmailsForBooking } from "@/lib/email/scheduling-email";
import { hasStaffPermission } from "@/payload/access/account";

type AdminSchedulingContext = {
  dispatchEmails?: boolean;
  payload?: Payload;
  req?: PayloadRequest;
};

function assertSchedulingAdministrator(account: User) {
  if (!hasStaffPermission(account, ["owner", "editor"])) {
    throw new Error("Administrator scheduling access is required.");
  }
}

function assertReason(reason: string) {
  const value = reason.trim();
  if (value.length < 3) {
    throw new Error("A private administrator reason is required.");
  }
  return value;
}

async function dispatchCommittedAdminEmails(
  payload: Payload,
  bookingID: number | string,
  context: AdminSchedulingContext,
) {
  if (context.dispatchEmails === false || context.req) return;
  try {
    await dispatchSchedulingEmailsForBooking(payload, bookingID);
  } catch (error) {
    payload.logger.error({
      booking: bookingID,
      error: error instanceof Error ? error.message : String(error),
    }, "Scheduling email dispatch could not start after an administrator booking change.");
  }
}

async function bookingByID(
  payload: Payload,
  bookingID: number | string,
  req?: PayloadRequest,
) {
  return payload.findByID({
    collection: "retreat-bookings",
    id: bookingID,
    depth: 0,
    overrideAccess: true,
    req,
  });
}

export async function cancelRetreatBooking(
  account: User,
  bookingID: number | string,
  reason: string,
  context: AdminSchedulingContext = {},
): Promise<RetreatBooking & { replayed: boolean }> {
  assertSchedulingAdministrator(account);
  const exceptionReason = assertReason(reason);
  const payload = context.payload ?? await getPayload({ config });
  const current = await bookingByID(payload, bookingID, context.req);

  if (current.status === "cancelled") {
    await dispatchCommittedAdminEmails(payload, current.id, context);
    return { ...current, replayed: true };
  }

  const booking = await payload.update({
    collection: "retreat-bookings",
    id: current.id,
    data: {
      exceptionReason,
      status: "cancelled",
    },
    depth: 0,
    overrideAccess: false,
    req: context.req,
    user: account,
  });
  await dispatchCommittedAdminEmails(payload, booking.id, context);
  return { ...booking, replayed: false };
}

export async function rescheduleRetreatBooking(
  account: User,
  bookingID: number | string,
  input: { endAt: string; reason: string; startAt: string },
  context: AdminSchedulingContext = {},
): Promise<RetreatBooking & { replayed: boolean }> {
  assertSchedulingAdministrator(account);
  const exceptionReason = assertReason(input.reason);
  const payload = context.payload ?? await getPayload({ config });
  const current = await bookingByID(payload, bookingID, context.req);

  if (current.status === "cancelled" || current.status === "rescheduled") {
    throw new Error("A cancelled booking cannot be rescheduled.");
  }
  if (
    new Date(current.startAt).getTime() === new Date(input.startAt).getTime()
    && new Date(current.endAt).getTime() === new Date(input.endAt).getTime()
  ) {
    await dispatchCommittedAdminEmails(payload, current.id, context);
    return { ...current, replayed: true };
  }

  const booking = await payload.update({
    collection: "retreat-bookings",
    id: current.id,
    data: {
      endAt: input.endAt,
      exceptionReason,
      startAt: input.startAt,
      status: "confirmed",
    },
    depth: 0,
    overrideAccess: false,
    req: context.req,
    user: account,
  });
  await dispatchCommittedAdminEmails(payload, booking.id, context);
  return { ...booking, replayed: false };
}
