import assert from "node:assert/strict";
import test from "node:test";
import { assertAllowedMutationOrigin, isAllowedOrigin } from "../src/lib/security/origin";

test("production accepts both owned domains while rejecting unrelated and lookalike origins", () => {
  const previous = { ...process.env };
  try {
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_SERVER_URL = "https://timbennettproductions.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://timbennettproductions.com";
    for (const origin of ["https://timbennettproductions.com", "https://thelonestarretreat.com"]) {
      assert.equal(assertAllowedMutationOrigin(new Request(`${origin}/api/account/activate`, { method: "POST", headers: { origin } })), null);
    }
    for (const origin of ["https://attacker.example", "https://thelonestarretreat.com.attacker.example", "http://thelonestarretreat.com"]) {
      assert.equal(isAllowedOrigin(origin), false);
    }
  } finally {
    process.env = previous;
  }
});

test("preview does not inherit production domain permission", () => {
  const previous = { ...process.env };
  try {
    process.env.VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_SERVER_URL = "https://preview.example";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(isAllowedOrigin("https://preview.example"), true);
    assert.equal(isAllowedOrigin("https://thelonestarretreat.com"), false);
  } finally {
    process.env = previous;
  }
});
