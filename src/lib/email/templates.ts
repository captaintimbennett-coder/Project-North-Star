import { siteConfig } from "@/data/site";

type TemplateInput = {
  actionUrl: string;
  expirationLabel: string;
  preheader: string;
  title: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function baseText({ actionUrl, expirationLabel, preheader, title }: TemplateInput) {
  return `${siteConfig.name} · ${siteConfig.projectName}

${title}

${preheader}

This secure link expires ${expirationLabel}.

${actionUrl}

If you did not request this, you can safely ignore this email.
`;
}

function baseHtml({ actionUrl, expirationLabel, preheader, title }: TemplateInput) {
  const escapedUrl = escapeHtml(actionUrl);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#050505;color:#f4efe6;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:48px 18px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b0a08;border:1px solid rgba(184,132,45,.35);">
            <tr>
              <td style="padding:42px 42px 28px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:.16em;text-transform:uppercase;color:#f4efe6;">${escapeHtml(siteConfig.name)}</div>
                <div style="margin-top:8px;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#c7963f;">${escapeHtml(siteConfig.projectName)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 42px 42px;text-align:center;">
                <div style="width:48px;height:1px;background:#c7963f;margin:0 auto 30px;"></div>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.08;font-weight:400;color:#f4efe6;">${escapeHtml(title)}</h1>
                <p style="margin:24px auto 0;max-width:460px;font-size:16px;line-height:1.7;color:#c9c1b3;">${escapeHtml(preheader)}</p>
                <p style="margin:18px auto 0;max-width:460px;font-size:13px;line-height:1.6;color:#948878;">This secure link expires ${escapeHtml(expirationLabel)}.</p>
                <a href="${escapedUrl}" style="display:inline-block;margin-top:34px;padding:15px 24px;border:1px solid #c7963f;color:#f4efe6;text-decoration:none;text-transform:uppercase;letter-spacing:.22em;font-size:12px;">Continue Securely</a>
                <p style="margin:32px auto 0;max-width:470px;font-size:12px;line-height:1.7;color:#81776b;">If the button does not work, copy and paste this link into your browser:<br /><span style="color:#c9c1b3;word-break:break-all;">${escapedUrl}</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function invitationEmailTemplate(actionUrl: string, expirationLabel: string) {
  const input = {
    actionUrl,
    expirationLabel,
    preheader: "You have been invited to activate secure Project North Star access.",
    title: "Your private invitation.",
  };
  return {
    html: baseHtml(input),
    subject: "Your Project North Star invitation",
    text: baseText(input),
  };
}

export function passwordRecoveryEmailTemplate(actionUrl: string, expirationLabel: string) {
  const input = {
    actionUrl,
    expirationLabel,
    preheader: "Use this secure link to reset your Project North Star password.",
    title: "Reset your password.",
  };
  return {
    html: baseHtml(input),
    subject: "Reset your Project North Star password",
    text: baseText(input),
  };
}
