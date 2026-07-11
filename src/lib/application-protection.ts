import type { NextRequest } from "next/server";

export const MAX_MODEL_IMAGES = 5;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

export type ValidationErrors = Record<string, string>;

export class ApplicationValidationError extends Error {
  constructor(public errors: ValidationErrors) {
    super("Application validation failed.");
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function isHoneypotTriggered(formData: FormData): boolean {
  return getOptionalString(formData, "companyWebsite") !== undefined;
}

export function getRequiredString(
  formData: FormData,
  field: string,
  errors: ValidationErrors,
): string {
  const value = getOptionalString(formData, field);
  if (!value) errors[field] = "This field is required.";
  return value || "";
}

export function getOptionalString(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function getStringArray(formData: FormData, field: string): string[] {
  return formData
    .getAll(field)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function requireSelection(values: string[], field: string, errors: ValidationErrors): void {
  if (values.length === 0) errors[field] = "Select at least one option.";
}

export function validateAllowedValues(
  values: string[],
  allowed: readonly string[],
  field: string,
  errors: ValidationErrors,
): void {
  if (values.some((value) => !allowed.includes(value))) {
    errors[field] = "One or more selected options are invalid.";
  }
}

export function validateEmail(email: string, errors: ValidationErrors): void {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
}

export function validateOptionalURL(
  value: string | undefined,
  field: string,
  errors: ValidationErrors,
): void {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Invalid protocol");
  } catch {
    errors[field] = "Enter a complete URL beginning with http:// or https://.";
  }
}

export function requireConfirmation(
  formData: FormData,
  field: string,
  errors: ValidationErrors,
): true {
  const value = formData.get(field);
  const confirmed = value === "true" || value === "on" || value === "1";
  if (!confirmed) errors[field] = "This confirmation is required.";
  return true;
}

export function getUploadedFiles(formData: FormData, field = "images"): File[] {
  return formData
    .getAll(field)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateModelImages(files: File[], errors: ValidationErrors): void {
  if (files.length === 0) {
    errors.images = "Upload at least one image for private review.";
    return;
  }

  if (files.length > MAX_MODEL_IMAGES) {
    errors.images = `Upload no more than ${MAX_MODEL_IMAGES} images.`;
    return;
  }

  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      errors.images = "Images must be JPG, JPEG, PNG, or WebP. Video files are not accepted.";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errors.images = "Each image must be 4MB or smaller.";
      return;
    }
  }
}

export function assertValid(errors: ValidationErrors): void {
  if (Object.keys(errors).length > 0) throw new ApplicationValidationError(errors);
}
