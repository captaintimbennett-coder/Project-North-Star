import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import { rescheduleRetreatBooking } from "@/lib/scheduling/admin-booking-service";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hasStaffPermission, isActiveAccount } from "@/payload/access/account";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  const account = auth.user as User | null;
  if (!account || !isActiveAccount(account) || !hasStaffPermission(account, ["owner", "editor"])) {
    return NextResponse.json({ ok: false, error: "Administrator scheduling access is required." }, { status: 403 });
  }
  const { id } = await params;
  const bookingID = Number(id);
  const body = await request.json().catch(() => null);
  const validDates = typeof body?.startAt === "string"
    && typeof body?.endAt === "string"
    && Number.isFinite(Date.parse(body.startAt))
    && Number.isFinite(Date.parse(body.endAt));
  if (
    !Number.isInteger(bookingID)
    || bookingID < 1
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
    const message = error instanceof Error ? error.message : "The booking could not be rescheduled.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
