import type { Payload } from "payload";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { siteConfig } from "@/data/site";

type ApplicationType = "model" | "photographer";

type ApplicationEmailInput = {
  applicantName: string;
  applicationId: number | string;
  applicantEmail: string;
  payload: Payload;
  submittedAt: string;
};

type AdminApplicationNotificationInput = {
  applicantName: string;
  applicationId: number | string;
  applicationType: ApplicationType;
  payload: Payload;
  submittedAt: string;
};

type EmailTemplate = {
  html: string;
  subject: string;
  text: string;
};

const applicationLabels: Record<ApplicationType, string> = {
  model: "featured model",
  photographer: "photographer",
};

const adminCollectionSlugs: Record<ApplicationType, string> = {
  model: "model-applications",
  photographer: "photographer-applications",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

function adminApplicationUrl(applicationType: ApplicationType, applicationId: number | string) {
  const collectionSlug = adminCollectionSlugs[applicationType];
  return `${siteConfig.url.replace(/\/$/, "")}/admin/collections/${collectionSlug}/${applicationId}`;
}

function applicantApplicationReceivedTemplate(applicationType: ApplicationType): EmailTemplate {
  const label = applicationLabels[applicationType];
  const subject =
    applicationType === "model"
      ? "Your featured model application was received"
      : "Your photographer application was received";
  const title = "Application received.";
  const preheader =
    `Your ${label} application for ${currentRetreatEdition.title} has been received for private review.`;

  const text = `${siteConfig.loneStarRetreat.name}

${title}

${preheader}

Thank you for your interest in ${siteConfig.loneStarRetreat.name}. Your application has been received and is now in our private review process.

Our team will carefully review your submission. If your application is selected, we will personally contact you with the next steps.

Submission does not guarantee acceptance, approval, selection, or participation.

If you need to correct something, you can reply to this email.
`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#050505;color:#f4efe6;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:48px 18px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b0a08;border:1px solid rgba(184,132,45,.35);">
            <tr>
              <td style="padding:42px 42px 28px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:.16em;text-transform:uppercase;color:#f4efe6;">${escapeHtml(siteConfig.loneStarRetreat.name)}</div>
                <div style="margin-top:8px;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#c7963f;">${escapeHtml(currentRetreatEdition.shortTitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 42px 42px;text-align:center;">
                <div style="width:48px;height:1px;background:#c7963f;margin:0 auto 30px;"></div>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.08;font-weight:400;color:#f4efe6;">${escapeHtml(title)}</h1>
                <p style="margin:24px auto 0;max-width:470px;font-size:16px;line-height:1.7;color:#c9c1b3;">${escapeHtml(preheader)}</p>
                <p style="margin:24px auto 0;max-width:470px;font-size:15px;line-height:1.8;color:#c9c1b3;">Thank you for your interest in ${escapeHtml(siteConfig.loneStarRetreat.name)}. Your application has been received and is now in our private review process.</p>
                <p style="margin:18px auto 0;max-width:470px;font-size:15px;line-height:1.8;color:#c9c1b3;">Our team will carefully review your submission. If your application is selected, we will personally contact you with the next steps.</p>
                <p style="margin:24px auto 0;max-width:470px;font-size:13px;line-height:1.7;color:#948878;">Submission does not guarantee acceptance, approval, selection, or participation. If you need to correct something, you can reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, subject, text };
}

function adminApplicationNotificationTemplate({
  applicantName,
  applicationId,
  applicationType,
  submittedAt,
}: Omit<AdminApplicationNotificationInput, "payload">): EmailTemplate {
  const label = applicationLabels[applicationType];
  const submittedLabel = formatSubmittedAt(submittedAt);
  const adminUrl = adminApplicationUrl(applicationType, applicationId);
  const subject = `New ${label} application: ${applicantName}`;
  const title = "New application submitted.";
  const preheader = `${applicantName} submitted a ${label} application on ${submittedLabel}.`;

  const text = `${siteConfig.name} · ${siteConfig.projectName}

${title}

Applicant: ${applicantName}
Application type: ${label}
Submitted: ${submittedLabel}

Review in Payload Admin:
${adminUrl}
`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#050505;color:#f4efe6;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:40px 18px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b0a08;border:1px solid rgba(184,132,45,.35);">
            <tr>
              <td style="padding:36px 38px;">
                <p style="margin:0 0 10px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#c7963f;">${escapeHtml(siteConfig.projectName)}</p>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;font-weight:400;color:#f4efe6;">${escapeHtml(title)}</h1>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;border-collapse:collapse;">
                  <tr><td style="padding:10px 0;color:#948878;font-size:13px;">Applicant</td><td style="padding:10px 0;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(applicantName)}</td></tr>
                  <tr><td style="padding:10px 0;color:#948878;font-size:13px;">Application type</td><td style="padding:10px 0;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(label)}</td></tr>
                  <tr><td style="padding:10px 0;color:#948878;font-size:13px;">Submitted</td><td style="padding:10px 0;color:#f4efe6;font-size:15px;text-align:right;">${escapeHtml(submittedLabel)}</td></tr>
                </table>
                <a href="${escapeHtml(adminUrl)}" style="display:inline-block;margin-top:30px;padding:14px 20px;border:1px solid #c7963f;color:#f4efe6;text-decoration:none;text-transform:uppercase;letter-spacing:.2em;font-size:12px;">Open in Payload Admin</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, subject, text };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown application email failure";
}

async function sendApplicationEmailSafely({
  applicationId,
  applicationType,
  payload,
  purpose,
  template,
  to,
}: {
  applicationId: number | string;
  applicationType: ApplicationType;
  payload: Payload;
  purpose: string;
  template: EmailTemplate;
  to: string;
}) {
  try {
    await payload.sendEmail({
      html: template.html,
      subject: template.subject,
      text: template.text,
      to,
    });
  } catch (error) {
    payload.logger.error({
      applicationId,
      applicationType,
      error: getErrorMessage(error),
      purpose,
      recipient: to,
    }, "Application email delivery failed.");
  }
}

export async function sendModelApplicationReceived({
  applicantEmail,
  applicantName,
  applicationId,
  payload,
  submittedAt,
}: ApplicationEmailInput) {
  await sendApplicationEmailSafely({
    applicationId,
    applicationType: "model",
    payload,
    purpose: "applicant_confirmation",
    template: applicantApplicationReceivedTemplate("model"),
    to: applicantEmail,
  });

  await sendAdminApplicationNotification({
    applicantName,
    applicationId,
    applicationType: "model",
    payload,
    submittedAt,
  });
}

export async function sendPhotographerApplicationReceived({
  applicantEmail,
  applicantName,
  applicationId,
  payload,
  submittedAt,
}: ApplicationEmailInput) {
  await sendApplicationEmailSafely({
    applicationId,
    applicationType: "photographer",
    payload,
    purpose: "applicant_confirmation",
    template: applicantApplicationReceivedTemplate("photographer"),
    to: applicantEmail,
  });

  await sendAdminApplicationNotification({
    applicantName,
    applicationId,
    applicationType: "photographer",
    payload,
    submittedAt,
  });
}

export async function sendAdminApplicationNotification({
  applicantName,
  applicationId,
  applicationType,
  payload,
  submittedAt,
}: AdminApplicationNotificationInput) {
  await sendApplicationEmailSafely({
    applicationId,
    applicationType,
    payload,
    purpose: "admin_notification",
    template: adminApplicationNotificationTemplate({
      applicantName,
      applicationId,
      applicationType,
      submittedAt,
    }),
    to: siteConfig.email,
  });
}
