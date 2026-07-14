import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [
  submissionSource,
  emailSource,
  emailConfigSource,
  adapterSource,
  hookSource,
  collectionSource,
  publicSource,
  applicationContentSource,
] = await Promise.all([
  readFile(new URL("../src/lib/application-submissions.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/email/application-email.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/email/config.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/email/sendgrid-adapter.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/payload/hooks/createModelProfileFromApplication.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/payload/collections/ModelApplications.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/featured-artists.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/data/applications.ts", import.meta.url), "utf8"),
]);

assert.match(submissionSource, /publicProfilePermissionConfirmed/);
assert.match(submissionSource, /publicProfilePermissionSource: "applicant-application"/);
assert.match(submissionSource, /publicProfilePermissionConfirmedAt: submittedAt/);
assert.match(submissionSource, /getOptionalString\(formData, "shortBiography"\)/);
assert.match(submissionSource, /acceptanceEmailStatus: "pending"/);
assert.match(applicationContentSource, /review permission does not authorize public publication/);
assert.match(applicationContentSource, /Draft language pending final legal and business review/);
assert.match(emailConfigSource, /APPLICATION_EMAIL_FROM/);
assert.match(emailConfigSource, /APPLICATION_EMAIL_REPLY_TO/);
assert.match(emailConfigSource, /APPLICATION_EMAIL_ADMIN_TO/);
assert.match(adapterSource, /replyToPayloadAddress\(message\.replyTo\)/);
assert.match(emailSource, /function featuredArtistAcceptanceTemplate/);
assert.match(emailSource, /Travel and accommodations are your responsibility/);
assert.match(emailSource, /sendFeaturedArtistAcceptance/);
assert.match(hookSource, /administrator-documented/);
assert.match(hookSource, /Explicit public profile permission, its source, and its recorded time are required/);
assert.match(hookSource, /application\.acceptanceEmailStatus === "sent"/);
assert.match(hookSource, /acceptanceEmailStatus: "failed"/);
assert.match(hookSource, /retryFeaturedArtistAcceptanceEmail/);
assert.match(hookSource, /addProfileToCurrentRetreat[\s\S]*deliverAcceptanceEmail/);
assert.match(hookSource, /alt: `Portrait of \$\{profileDisplayName\}`/);
assert.match(collectionSource, /name: "acceptanceEmailSentAt"/);
assert.match(collectionSource, /name: "retryAcceptanceEmail"/);
assert.match(collectionSource, /name: "recordDocumentedPublicProfilePermission"/);
assert.match(publicSource, /profile\.approvalStatus !== "approved"/);
assert.match(publicSource, /assignment\.participationStatus === "approved"/);

console.log("Mission 06 validation passed: 22 assertions.");
