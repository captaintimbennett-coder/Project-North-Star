import config from "@payload-config";
import { getPayload } from "payload";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { writeSecurityAuditEvent } from "@/lib/security/audit";

function genericResponse() {
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const payload = await getPayload({ config });

  if (!email || !email.includes("@")) return genericResponse();

  try {
    await payload.forgotPassword({
      collection: "users",
      data: { email },
      expiration: 60 * 60 * 1000,
      overrideAccess: true,
    });

    await writeSecurityAuditEvent(payload, {
      eventType: "password_recovery.requested",
      metadata: { email },
    });
  } catch (error) {
    await writeSecurityAuditEvent(payload, {
      eventType: "password_recovery.request_failed",
      metadata: { email, error: error instanceof Error ? error.message : "Unknown password recovery failure" },
      severity: "warning",
    });
  }

  return genericResponse();
}
