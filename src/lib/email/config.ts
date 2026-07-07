import { siteConfig } from "@/data/site";

export function getEmailConfig() {
  return {
    fromAddress: process.env.SENDGRID_FROM_EMAIL || siteConfig.email,
    fromName: process.env.SENDGRID_FROM_NAME || `${siteConfig.name} · ${siteConfig.projectName}`,
    replyTo: process.env.SENDGRID_REPLY_TO || siteConfig.email,
    sandboxMode: process.env.SENDGRID_SANDBOX_MODE === "true",
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    siteUrl: siteConfig.url.replace(/\/$/, ""),
  };
}

export function isEmailConfigured() {
  return Boolean(getEmailConfig().sendgridApiKey);
}
