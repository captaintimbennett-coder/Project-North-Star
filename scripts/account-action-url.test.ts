import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAccountActionUrl,
  getAccountActionBaseUrl,
} from "../src/lib/email/account-action-url";

test("account links stay in the local environment that created them", () => {
  const environment = {
    NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_URL: "https://timbennettproductions.com",
  };

  assert.equal(
    getAccountActionBaseUrl(environment),
    "http://localhost:3000",
  );
  assert.equal(
    buildAccountActionUrl(
      "/account/reset-password",
      "token with spaces",
      environment,
    ),
    "http://localhost:3000/account/reset-password?token=token+with+spaces",
  );
});

test("preview account links stay on their Vercel preview deployment", () => {
  const environment = {
    NEXT_PUBLIC_SERVER_URL: "https://timbennettproductions.com",
    VERCEL_ENV: "preview",
    VERCEL_URL: "project-north-star-preview.vercel.app/",
  };

  assert.equal(
    buildAccountActionUrl("/account/activate", "preview-token", environment),
    "https://project-north-star-preview.vercel.app/account/activate?token=preview-token",
  );
});

test("production account links use the configured production server", () => {
  const environment = {
    NEXT_PUBLIC_SERVER_URL: "https://timbennettproductions.com/",
    NEXT_PUBLIC_SITE_URL: "https://thelonestarretreat.com",
    VERCEL_ENV: "production",
    VERCEL_URL: "project-north-star.vercel.app",
  };

  assert.equal(
    buildAccountActionUrl(
      "/account/reset-password",
      "production-token",
      environment,
    ),
    "https://timbennettproductions.com/account/reset-password?token=production-token",
  );
});
