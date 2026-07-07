import crypto from "crypto";

const TOKEN_BYTES = 32;

export function createSecureToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashSecurityToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
