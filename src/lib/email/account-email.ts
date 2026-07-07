import type { Payload } from "payload";
import { writeSecurityAuditEvent } from "@/lib/security/audit";
import { invitationEmailTemplate } from "./templates";

type SendInvitationEmailInput = {
  activationUrl: string;
  email: string;
  expiresAt: string;
  invitationId?: number;
  payload: Payload;
};

function formatExpiration(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

export async function sendAccountInvitationEmail({
  activationUrl,
  email,
  expiresAt,
  invitationId,
  payload,
}: SendInvitationEmailInput) {
  const template = invitationEmailTemplate(activationUrl, formatExpiration(expiresAt));

  try {
    await payload.sendEmail({
      html: template.html,
      subject: template.subject,
      text: template.text,
      to: email,
    });

    await writeSecurityAuditEvent(payload, {
      eventType: "account_invitation.email_sent",
      metadata: { email, invitationId },
      targetInvitation: invitationId ?? null,
    });
  } catch (error) {
    await writeSecurityAuditEvent(payload, {
      eventType: "account_invitation.email_failed",
      metadata: {
        email,
        error: error instanceof Error ? error.message : "Unknown email failure",
        invitationId,
      },
      severity: "warning",
      targetInvitation: invitationId ?? null,
    });
  }
}
