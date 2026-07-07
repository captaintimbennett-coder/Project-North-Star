import config from "@payload-config";
import { getPayload } from "payload";
import { assertAllowedMutationOrigin } from "@/lib/security/origin";
import { writeSecurityAuditEvent } from "@/lib/security/audit";

export async function POST(request: Request) {
  const blocked = assertAllowedMutationOrigin(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token || password.length < 12) {
    return Response.json({ error: "Invalid reset request." }, { status: 400 });
  }

  const payload = await getPayload({ config });

  try {
    await payload.resetPassword({
      collection: "users",
      data: { password, token },
      overrideAccess: true,
    });

    await writeSecurityAuditEvent(payload, {
      eventType: "password_recovery.completed",
      metadata: { completedAt: new Date().toISOString() },
    });

    return Response.json({ ok: true });
  } catch (error) {
    await writeSecurityAuditEvent(payload, {
      eventType: "password_recovery.reset_failed",
      metadata: { error: error instanceof Error ? error.message : "Unknown password reset failure" },
      severity: "warning",
    });

    return Response.json({ error: "Invalid or expired reset token." }, { status: 400 });
  }
}
