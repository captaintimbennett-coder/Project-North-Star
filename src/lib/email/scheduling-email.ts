import type { Payload, SendEmailOptions } from "payload";
import type { SchedulingEmailDelivery } from "@/payload-types";
import { siteConfig } from "@/data/site";
import { getSchedulingEmailConfig, isEmailConfigured } from "./config";

type SchedulingTemplateData = {
  artistName: string;
  endAt: string;
  eventLocation: string;
  eventTitle: string;
  photographerName: string;
  previousEndAt?: string;
  previousStartAt?: string;
  startAt: string;
  timeZone: string;
};

type SchedulingEmailTemplate = {
  html: string;
  subject: string;
  text: string;
};

type SendEmail = (message: SendEmailOptions) => Promise<unknown>;

export type SchedulingEmailDispatchResult = {
  failed: number;
  sent: number;
  skipped: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Scheduling email data is missing ${label}.`);
  }
  return value;
}

function schedulingTemplateData(value: SchedulingEmailDelivery["templateData"]): SchedulingTemplateData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Scheduling email data is invalid.");
  }
  const data = value as Record<string, unknown>;
  return {
    artistName: requireString(data.artistName, "artistName"),
    endAt: requireString(data.endAt, "endAt"),
    eventLocation: typeof data.eventLocation === "string" ? data.eventLocation : "",
    eventTitle: requireString(data.eventTitle, "eventTitle"),
    photographerName: requireString(data.photographerName, "photographerName"),
    previousEndAt: typeof data.previousEndAt === "string" ? data.previousEndAt : undefined,
    previousStartAt: typeof data.previousStartAt === "string" ? data.previousStartAt : undefined,
    startAt: requireString(data.startAt, "startAt"),
    timeZone: requireString(data.timeZone, "timeZone"),
  };
}

function formatDateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatRange(startAt: string, endAt: string, timeZone: string) {
  return `${formatDateTime(startAt, timeZone)} – ${formatTime(endAt, timeZone)}`;
}

function templateCopy(delivery: SchedulingEmailDelivery, data: SchedulingTemplateData) {
  const partnerName = delivery.recipientRole === "photographer"
    ? data.artistName
    : data.photographerName;

  if (delivery.notificationType === "booking-cancelled") {
    return {
      intro: `Your session with ${partnerName} has been cancelled by the Lone Star Retreat team.`,
      subject: "Your Lone Star Retreat session has been cancelled",
      title: "Session cancelled.",
    };
  }
  if (delivery.notificationType === "booking-rescheduled") {
    return {
      intro: `Your session with ${partnerName} has been rescheduled by the Lone Star Retreat team.`,
      subject: "Your Lone Star Retreat session has been rescheduled",
      title: "Session rescheduled.",
    };
  }
  return {
    intro: `Your session with ${partnerName} is confirmed.`,
    subject: "Your Lone Star Retreat session is confirmed",
    title: "Session confirmed.",
  };
}

export function schedulingEmailTemplate(
  delivery: SchedulingEmailDelivery,
): SchedulingEmailTemplate {
  const data = schedulingTemplateData(delivery.templateData);
  const copy = templateCopy(delivery, data);
  const currentRange = formatRange(data.startAt, data.endAt, data.timeZone);
  const priorRange = delivery.notificationType === "booking-rescheduled"
    && data.previousStartAt
    && data.previousEndAt
    ? formatRange(data.previousStartAt, data.previousEndAt, data.timeZone)
    : null;
  const scheduleUrl = `${siteConfig.url.replace(/\/$/, "")}/account/my-schedule`;
  const locationLine = data.eventLocation ? `Location: ${data.eventLocation}` : "";
  const changeText = priorRange ? `Previous time: ${priorRange}\n\nNew time: ${currentRange}` : `Time: ${currentRange}`;
  const note = delivery.notificationType === "booking-cancelled"
    ? "The cancelled session has been removed from your active schedule."
    : "Sign in to Project North Star to review your private schedule.";

  const text = `${siteConfig.loneStarRetreat.name}

${copy.title}

Hello ${delivery.recipientName},

${copy.intro}

Event: ${data.eventTitle}
${changeText}
${locationLine}

${note}

${scheduleUrl}

Questions? Reply to this email and the Lone Star Retreat team will help.
`;

  const priorHtml = priorRange
    ? `<tr>
        <td style="padding:0 0 10px;color:#948878;font-size:13px;text-transform:uppercase;letter-spacing:.12em;">Previous time</td>
        <td style="padding:0 0 10px;color:#c9c1b3;font-size:15px;text-align:right;">${escapeHtml(priorRange)}</td>
      </tr>`
    : "";
  const timeLabel = priorRange ? "New time" : "Time";
  const locationHtml = data.eventLocation
    ? `<tr>
        <td style="padding:10px 0 0;color:#948878;font-size:13px;text-transform:uppercase;letter-spacing:.12em;">Location</td>
        <td style="padding:10px 0 0;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(data.eventLocation)}</td>
      </tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(copy.subject)}</title>
  </head>
  <body style="margin:0;background:#050505;color:#f4efe6;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(copy.intro)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:48px 18px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b0a08;border:1px solid rgba(184,132,45,.35);">
            <tr>
              <td style="padding:42px 42px 28px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:.16em;text-transform:uppercase;color:#f4efe6;">${escapeHtml(siteConfig.loneStarRetreat.name)}</div>
                <div style="margin-top:8px;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#c7963f;">Private Schedule</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 42px 42px;text-align:center;">
                <div style="width:48px;height:1px;background:#c7963f;margin:0 auto 30px;"></div>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.08;font-weight:400;color:#f4efe6;">${escapeHtml(copy.title)}</h1>
                <p style="margin:24px auto 0;max-width:470px;font-size:16px;line-height:1.7;color:#c9c1b3;">Hello ${escapeHtml(delivery.recipientName)}, ${escapeHtml(copy.intro)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;padding:20px;border-top:1px solid rgba(184,132,45,.25);border-bottom:1px solid rgba(184,132,45,.25);text-align:left;">
                  <tr>
                    <td style="padding:0 0 10px;color:#948878;font-size:13px;text-transform:uppercase;letter-spacing:.12em;">Event</td>
                    <td style="padding:0 0 10px;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(data.eventTitle)}</td>
                  </tr>
                  ${priorHtml}
                  <tr>
                    <td style="padding:10px 0 0;color:#948878;font-size:13px;text-transform:uppercase;letter-spacing:.12em;">${timeLabel}</td>
                    <td style="padding:10px 0 0;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(currentRange)}</td>
                  </tr>
                  ${locationHtml}
                </table>
                <p style="margin:24px auto 0;max-width:470px;font-size:14px;line-height:1.7;color:#948878;">${escapeHtml(note)}</p>
                <a href="${escapeHtml(scheduleUrl)}" style="display:inline-block;margin-top:28px;padding:14px 20px;border:1px solid #c7963f;color:#f4efe6;text-decoration:none;text-transform:uppercase;letter-spacing:.18em;font-size:12px;">View My Schedule</a>
                <p style="margin:28px auto 0;max-width:470px;font-size:12px;line-height:1.7;color:#81776b;">Questions? Reply to this email and the Lone Star Retreat team will help.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, subject: copy.subject, text };
}

function safeDeliveryError(error: unknown) {
  if (error instanceof Error && /not configured/i.test(error.message)) {
    return "Scheduling email is not configured.";
  }
  return "Transactional email delivery failed.";
}

async function claimDelivery(
  payload: Payload,
  delivery: SchedulingEmailDelivery,
  expectedStatus: "failed" | "pending",
) {
  const attemptedAt = new Date().toISOString();
  const result = await payload.update({
    collection: "scheduling-email-deliveries",
    data: {
      attempts: delivery.attempts + 1,
      lastAttemptAt: attemptedAt,
      lastError: null,
      status: "sending",
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: delivery.id } },
        { status: { equals: expectedStatus } },
      ],
    },
  });
  return result.docs[0] ?? null;
}

async function sendClaimedDelivery({
  delivery,
  expectedStatus,
  payload,
  sendEmail,
}: {
  delivery: SchedulingEmailDelivery;
  expectedStatus: "failed" | "pending";
  payload: Payload;
  sendEmail?: SendEmail;
}): Promise<"failed" | "sent" | "skipped"> {
  const claimed = await claimDelivery(payload, delivery, expectedStatus);
  if (!claimed) return "skipped";

  try {
    if (!sendEmail && !isEmailConfigured()) {
      throw new Error("Scheduling email is not configured.");
    }
    const template = schedulingEmailTemplate(claimed);
    const email = getSchedulingEmailConfig();
    await (sendEmail ?? payload.sendEmail.bind(payload))({
      from: { address: email.fromAddress, name: email.fromName },
      html: template.html,
      replyTo: email.replyTo,
      subject: template.subject,
      text: template.text,
      to: claimed.recipientEmail,
    });
    await payload.update({
      collection: "scheduling-email-deliveries",
      id: claimed.id,
      data: {
        lastError: null,
        sentAt: new Date().toISOString(),
        status: "sent",
      },
      depth: 0,
      overrideAccess: true,
    });
    return "sent";
  } catch (error) {
    const lastError = safeDeliveryError(error);
    payload.logger.error({
      booking: claimed.booking,
      delivery: claimed.id,
      error: error instanceof Error ? error.message : String(error),
      notificationType: claimed.notificationType,
      recipientRole: claimed.recipientRole,
    }, "Scheduling email delivery failed.");
    await payload.update({
      collection: "scheduling-email-deliveries",
      id: claimed.id,
      data: {
        lastError,
        status: "failed",
      },
      depth: 0,
      overrideAccess: true,
    });
    return "failed";
  }
}

function summarize(results: ("failed" | "sent" | "skipped")[]): SchedulingEmailDispatchResult {
  return {
    failed: results.filter((result) => result === "failed").length,
    sent: results.filter((result) => result === "sent").length,
    skipped: results.filter((result) => result === "skipped").length,
  };
}

export async function dispatchSchedulingEmailsForBooking(
  payload: Payload,
  bookingID: number | string,
  options: { sendEmail?: SendEmail } = {},
): Promise<SchedulingEmailDispatchResult> {
  const pending = await payload.find({
    collection: "scheduling-email-deliveries",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    sort: "createdAt",
    where: {
      and: [
        { booking: { equals: bookingID } },
        { status: { equals: "pending" } },
      ],
    },
  });
  const results: ("failed" | "sent" | "skipped")[] = [];
  for (const delivery of pending.docs) {
    results.push(await sendClaimedDelivery({
      delivery,
      expectedStatus: "pending",
      payload,
      sendEmail: options.sendEmail,
    }));
  }
  return summarize(results);
}

export async function retrySchedulingEmailDelivery(
  payload: Payload,
  deliveryID: number | string,
  options: { sendEmail?: SendEmail } = {},
): Promise<SchedulingEmailDispatchResult> {
  const delivery = await payload.findByID({
    collection: "scheduling-email-deliveries",
    id: deliveryID,
    depth: 0,
    overrideAccess: true,
  });
  const result = await sendClaimedDelivery({
    delivery,
    expectedStatus: "failed",
    payload,
    sendEmail: options.sendEmail,
  });
  return summarize([result]);
}
