# Lone Star Retreat Application Protection

Version 1 — July 3, 2026

## Purpose

The public Model and Photographer application endpoints accept review
submissions without exposing Payload collections, media, administrative fields,
or user-account creation. This is the protection contract for the future public
form interface.

## Endpoints

- `POST /api/applications/model`
- `POST /api/applications/photographer`

Both endpoints accept `multipart/form-data`. The hidden honeypot field is named
`companyWebsite`. Repeated field names are used for multi-select values such as
`creativeInterests`, `retreatGoals`, and `genresInterests`.
Model images use the repeated field name `images`.

Both application types require one `marketingSource` value for the question
“How did you hear about Lone Star Retreat?” Approved values are Instagram,
Facebook, Friend, Photographer, Model, Workshop, Magazine, Google Search, and
Other. Selecting Other requires `otherMarketingSource` text.

The model question “Which types of sessions are you available to participate in
at Lone Star Retreat?” uses a multi-select checkbox group. Each selected value
is submitted as a repeated `creativeInterests` field and stored as an array.
Detailed boundaries and session-specific consent are confirmed later if the
model is accepted; availability selections never replace explicit consent.

## Protection rules

- Five attempts per IP and application type are allowed in a rolling 15-minute
  window in a single application process.
- Honeypot submissions receive a neutral accepted response but create no record.
- All user input is validated on the server before Payload is called.
- Administrative values are never accepted from the request. New applications
  are always created with status `new`.
- Payload collection access remains authenticated-only. The public endpoints use
  narrowly scoped server-side Payload calls.
- All required consent confirmations must be true.
- Both applications present the approved
  [`foundation/lone-star-retreat-code-of-conduct.md`](foundation/lone-star-retreat-code-of-conduct.md)
  in an in-page disclosure and require `codeOfConductConfirmed` before submission.
- Model applications require a Display / Stage Name and at least one session type.
- Legal name is optional, remains private, and is never a public display field.
- Photographer applications require at least one genre or creative interest.
- Optional URLs must be complete HTTP or HTTPS URLs.
- Model uploads allow JPG/JPEG, PNG, and WebP only, up to 10MB each and five
  images total. Video and AVIF uploads are rejected.
- Images are created in the private Media collection with `usageApproved` set
  to false. Anonymous media reads remain forbidden.
- If the application record fails after media creation, the newly created media
  records are deleted to avoid orphaned private storage.
- No submission creates an account, master profile, public page, message,
  payment, or email.

## Deployment note

The Version 1 rate limiter is intentionally process-local. Before deploying
across multiple server instances, replace it with a shared provider-backed
limiter. Confirm Vercel Blob client uploads remain active before exposing
10MB-per-image uploads in production.

## Privacy and retention

Before public launch, approve applicant-facing privacy language and a retention
period for declined or abandoned applications. Collection deletion should remain
an administrative decision until that policy is approved.
