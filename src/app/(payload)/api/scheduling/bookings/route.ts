import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import { checkRateLimit, getClientIP } from "@/lib/application-protection";
import { confirmPhotographerBooking } from "@/lib/scheduling/booking-service";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hasAccountRole, isActiveAccount } from "@/payload/access/account";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  const account = auth.user as User | null;
  if (!account || !isActiveAccount(account) || !hasAccountRole(account, "photographer")) {
    return NextResponse.json({ ok: false, error: "Photographer access is required." }, { status: 403 });
  }
  const rateLimit = checkRateLimit(`booking:${account.id}:${getClientIP(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many booking attempts. Please wait and try again." }, {
      status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.eventId !== "number" || typeof body.artistId !== "number" ||
    typeof body.startAt !== "string" || typeof body.endAt !== "string" ||
    typeof body.idempotencyKey !== "string" || body.idempotencyKey.length < 16) {
    return NextResponse.json({ ok: false, error: "Choose a valid available time range." }, { status: 400 });
  }
  try {
    const booking = await confirmPhotographerBooking(account, body);
    return NextResponse.json({ ok: true, bookingId: booking.id, status: booking.status }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking could not be confirmed.";
    const conflict = /conflict|overlap|exclude|unique|available/i.test(message);
    console.error("Booking confirmation failed.", error);
    return NextResponse.json({
      ok: false,
      error: conflict
        ? "That time is no longer available. Your schedule has not changed; choose another time."
        : message,
    }, { status: conflict ? 409 : 400 });
  }
}
