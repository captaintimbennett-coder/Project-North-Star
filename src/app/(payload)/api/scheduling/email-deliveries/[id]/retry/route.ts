import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/payload-types";
import { retrySchedulingEmailDelivery } from "@/lib/email/scheduling-email";
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
  const deliveryID = Number(id);
  if (!Number.isInteger(deliveryID) || deliveryID < 1) {
    return NextResponse.json({ ok: false, error: "A valid failed delivery is required." }, { status: 400 });
  }
  try {
    const result = await retrySchedulingEmailDelivery(payload, deliveryID);
    if (result.skipped === 1) {
      return NextResponse.json({
        ok: false,
        error: "Only a failed scheduling email can be retried.",
      }, { status: 409 });
    }
    return NextResponse.json({ ok: result.sent === 1, ...result }, { status: result.failed ? 502 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scheduling email could not be retried.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
