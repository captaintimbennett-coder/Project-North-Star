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

export function getApplicationEmailConfig() {
  const email = getEmailConfig();
  return {
    adminRecipient: process.env.APPLICATION_EMAIL_ADMIN_TO || siteConfig.email,
    fromAddress: process.env.APPLICATION_EMAIL_FROM || email.fromAddress,
    fromName: process.env.APPLICATION_EMAIL_FROM_NAME || "Lone Star Retreat",
    replyTo: process.env.APPLICATION_EMAIL_REPLY_TO || email.replyTo,
  };
}
