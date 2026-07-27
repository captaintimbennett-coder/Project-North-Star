import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import {
  getAdministratorRescheduleOptions,
  rescheduleRetreatBooking,
} from "@/lib/scheduling/admin-booking-service";
import { isBookingConflictError } from "@/lib/scheduling/booking-service";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hasStaffPermission, isActiveAccount } from "@/payload/access/account";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function schedulingAdministrator(request: NextRequest) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  const account = auth.user as User | null;
  if (
    !account
    || !isActiveAccount(account)
    || !hasStaffPermission(account, ["owner", "editor"])
  ) {
    return null;
  }
  return account;
}

async function routeBookingID({ params }: RouteContext) {
  const { id } = await params;
  const bookingID = Number(id);
  return Number.isInteger(bookingID) && bookingID > 0 ? bookingID : null;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const account = await schedulingAdministrator(request);
  if (!account) {
    return NextResponse.json(
      { ok: false, error: "Administrator scheduling access is required." },
      { status: 403 },
    );
  }
  const bookingID = await routeBookingID(context);
  if (!bookingID) {
    return NextResponse.json(
      { ok: false, error: "A valid booking is required." },
      { status: 400 },
    );
  }
  try {
    const result = await getAdministratorRescheduleOptions(
      account,
      bookingID,
    );
    return NextResponse.json({ ...result, ok: true });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Replacement times could not be loaded.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;
  const account = await schedulingAdministrator(request);
  if (!account) {
    return NextResponse.json(
      { ok: false, error: "Administrator scheduling access is required." },
      { status: 403 },
    );
  }
  const bookingID = await routeBookingID(context);
  const body = await request.json().catch(() => null);
  const validDates = typeof body?.startAt === "string"
    && typeof body?.endAt === "string"
    && Number.isFinite(Date.parse(body.startAt))
    && Number.isFinite(Date.parse(body.endAt));
  if (
    !bookingID
    || !validDates
    || typeof body?.reason !== "string"
  ) {
    return NextResponse.json({
      ok: false,
      error: "A valid booking, new time, and private reason are required.",
    }, { status: 400 });
  }
  try {
    const booking = await rescheduleRetreatBooking(account, bookingID, {
      endAt: body.endAt,
      reason: body.reason,
      startAt: body.startAt,
    });
    return NextResponse.json({
      bookingId: booking.id,
      ok: true,
      replayed: booking.replayed,
      status: booking.status,
    });
  } catch (error) {
    const message = isBookingConflictError(error)
      ? "That replacement time is no longer available. Reload the valid times and choose another."
      : error instanceof Error
        ? error.message
        : "The booking could not be rescheduled.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
