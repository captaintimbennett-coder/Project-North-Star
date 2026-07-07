import type { EmailAdapter, SendEmailOptions } from "payload";
import { getEmailConfig } from "./config";

type EmailAddress = { email: string; name?: string };

function normalizeAddress(value: unknown): EmailAddress[] {
  if (!value) return [];
  if (typeof value === "string") return value.split(",").map((email) => ({ email: email.trim() })).filter((item) => item.email);
  if (Array.isArray(value)) return value.flatMap((item) => normalizeAddress(item));
  if (typeof value === "object" && "address" in value && typeof value.address === "string") {
    return [{ email: value.address, name: "name" in value && typeof value.name === "string" ? value.name : undefined }];
  }
  if (typeof value === "object" && "email" in value && typeof value.email === "string") {
    return [{ email: value.email, name: "name" in value && typeof value.name === "string" ? value.name : undefined }];
  }
  return [];
}

function fromPayloadAddress(value: SendEmailOptions["from"]) {
  const configured = getEmailConfig();
  const normalized = normalizeAddress(value)[0];
  return normalized ?? { email: configured.fromAddress, name: configured.fromName };
}

export const sendgridEmailAdapter: EmailAdapter<Response | void> = ({ payload }) => {
  const config = getEmailConfig();

  return {
    defaultFromAddress: config.fromAddress,
    defaultFromName: config.fromName,
    name: "sendgrid",
    sendEmail: async (message) => {
      if (!config.sendgridApiKey) {
        payload.logger.warn("SendGrid email adapter is not configured. Email was not sent.");
        return;
      }

      const to = normalizeAddress(message.to);
      if (!to.length) {
        payload.logger.warn("SendGrid email adapter received an email without recipients.");
        return;
      }

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        body: JSON.stringify({
          content: [
            ...(message.text ? [{ type: "text/plain", value: String(message.text) }] : []),
            ...(message.html ? [{ type: "text/html", value: String(message.html) }] : []),
          ],
          from: fromPayloadAddress(message.from),
          mail_settings: config.sandboxMode ? { sandbox_mode: { enable: true } } : undefined,
          personalizations: [{ to }],
          reply_to: config.replyTo ? { email: config.replyTo } : undefined,
          subject: message.subject,
        }),
        headers: {
          Authorization: `Bearer ${config.sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        payload.logger.error(`SendGrid email send failed with status ${response.status}. ${detail}`);
        throw new Error("Transactional email delivery failed.");
      }

      return response;
    },
  };
};
