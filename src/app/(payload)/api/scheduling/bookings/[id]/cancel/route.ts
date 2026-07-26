import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import { cancelRetreatBooking } from "@/lib/scheduling/admin-booking-service";
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
  if (!Number.isInteger(bookingID) || bookingID < 1 || typeof body?.reason !== "string") {
    return NextResponse.json({ ok: false, error: "A valid booking and private reason are required." }, { status: 400 });
  }
  try {
    const booking = await cancelRetreatBooking(account, bookingID, body.reason);
    return NextResponse.json({
      bookingId: booking.id,
      ok: true,
      replayed: booking.replayed,
      status: booking.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The booking could not be cancelled.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
