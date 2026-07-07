import type { Payload } from "payload";

type AuditSeverity = "info" | "warning" | "critical";

export type SecurityAuditInput = {
  actor?: number | null;
  eventType: string;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
  targetAccount?: number | null;
  targetInvitation?: number | null;
};

export async function writeSecurityAuditEvent(payload: Payload, input: SecurityAuditInput) {
  try {
    await payload.create({
      collection: "security-audit-events",
      data: {
        actor: input.actor ?? undefined,
        eventType: input.eventType,
        metadata: input.metadata ?? {},
        occurredAt: new Date().toISOString(),
        severity: input.severity ?? "info",
        targetAccount: input.targetAccount ?? undefined,
        targetInvitation: input.targetInvitation ?? undefined,
      },
      overrideAccess: true,
    });
  } catch (error) {
    console.error("Security audit event could not be written.", error);
  }
}
