import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import { checkRateLimit, getClientIP } from "@/lib/application-protection";
import { saveModelAvailability } from "@/lib/scheduling/availability-service";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { hasAccountRole, isActiveAccount } from "@/payload/access/account";

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: NextRequest) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  const account = auth.user as User | null;
  if (!account || !isActiveAccount(account) || !hasAccountRole(account, "model")) {
    return NextResponse.json({ ok: false, error: "Model access is required." }, { status: 403 });
  }
  const rateLimit = checkRateLimit(`availability:${account.id}:${getClientIP(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many availability changes. Please wait and try again." }, {
      status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }
  const body = await request.json().catch(() => null);
  const validBlocks = Array.isArray(body?.blockedTimes) && body.blockedTimes.length <= 12 && body.blockedTimes.every((block: unknown) => {
    if (!block || typeof block !== "object") return false;
    const value = block as Record<string, unknown>;
    return typeof value.startTime === "string" && CLOCK.test(value.startTime) &&
      typeof value.endTime === "string" && CLOCK.test(value.endTime) &&
      ["lunch", "other", "unavailable"].includes(String(value.reason));
  });
  if (!body || typeof body.eventId !== "number" ||
    typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
    typeof body.availableFrom !== "string" || !CLOCK.test(body.availableFrom) ||
    typeof body.availableUntil !== "string" || !CLOCK.test(body.availableUntil) || !validBlocks) {
    return NextResponse.json({ ok: false, error: "Review the availability times and try again." }, { status: 400 });
  }
  try {
    const availabilityId = await saveModelAvailability(account, body);
    return NextResponse.json({ ok: true, availabilityId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Availability could not be saved.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
