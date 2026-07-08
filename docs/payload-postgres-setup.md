# Payload and PostgreSQL Setup

Status: foundation connected and verified

## What is already installed

Payload CMS is integrated into the existing Next.js application. It provides:

- a private `/admin` surface;
- authenticated administrator accounts;
- a private media library with focal-point and image-size support;
- a `Retreat Events` collection with drafts and scheduled publishing;
- a PostgreSQL database adapter; and
- generated TypeScript types for the configured records.

The public website remains a separate surface. Published retreat events and
event-scoped participating-artist pages now read an allowlisted public view from
Payload; most general marketing content remains in `src/data`.

## Verified foundation milestone

On July 3, 2026:

- the owner-controlled Neon PostgreSQL database was connected;
- the initial version-controlled migrations were applied;
- the first Payload Owner account was created; and
- the first Lone Star Retreat prototype record was saved and
  verified through Payload's draft/version workflow.
- the canonical `Models / Featured Artists` and `Photographers / Participants`
  collections were migrated; and
- one clearly labeled draft prototype was saved and verified in each profile
  collection through Payload Admin.

Private `Model Applications` and `Photographer Applications` are implemented as
review records. These records are intentionally
separate from the canonical profiles. An accepted application may be linked to
a master profile by an administrator later, but acceptance does not create,
update, or publish a profile automatically.

Model application uploads use the authenticated Media collection. New media
starts with platform usage approval disabled, so an uploaded preferred image
cannot appear publicly without a separate administrator review and approval.

The public application forms submit through the protected endpoints documented in
[`application-submission-protection.md`](application-submission-protection.md).
It must not call Payload collection or media endpoints directly.

## Local setup

The owner-controlled Neon database and initial owner account are already
configured for development. A new environment must still provide its own
`DATABASE_URL`, `PAYLOAD_SECRET`, and `NEXT_PUBLIC_SERVER_URL` before startup.

Secrets must not be pasted into documentation, committed to Git, or exposed in
browser code. `.env` is ignored automatically.

## Local environment shape

Copy `.env.example` to `.env` and replace the example values:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=verify-full
PAYLOAD_SECRET=a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

`sslmode=verify-full` is required for Neon/PostgreSQL environments. The
application also normalizes missing, `require`, or `prefer` SSL modes to
`verify-full` before connecting so the database security posture is explicit.

## Password recovery and account invitations

Account access is invitation-only. Invitation records store only hashed tokens.
The raw activation link must be delivered through a trusted server-side flow and
must never be committed, logged, or stored in plaintext.

SendGrid is the approved transactional email provider for invitation and
password recovery delivery. Production environments must provide:

```dotenv
NEXT_PUBLIC_SITE_URL=https://timbennettproductions.com
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=captaintimbennett@gmail.com
SENDGRID_FROM_NAME=Tim Bennett · Project North Star
SENDGRID_REPLY_TO=captaintimbennett@gmail.com
SENDGRID_SANDBOX_MODE=false
```

Payload's console email behavior is development-only. If `SENDGRID_API_KEY` is
missing, account lifecycle email will not be delivered and the server will log a
warning.

## Verification commands

```bash
pnpm payload:generate-types
pnpm lint
pnpm typecheck
pnpm build
```

After the database is connected, create and run a version-controlled migration
before any production deployment.

## Current boundaries

- Local media uploads are suitable for development only.
- Production object storage must be selected before relying on durable media
  uploads in Vercel.
- SendGrid is connected for transactional account lifecycle email. Stripe is not
  connected in this foundation step.
- Public application forms are implemented. Automated profile promotion,
  participant registration, payments, member portals, public booking, and
  general site-wide CMS publishing remain deferred.
