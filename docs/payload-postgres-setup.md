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

The public website remains separate and unchanged. No public page reads from
Payload yet.

## Verified foundation milestone

On July 3, 2026:

- the owner-controlled Neon PostgreSQL database was connected;
- the initial version-controlled migrations were applied;
- the first Payload Owner account was created; and
- the `Texas Hill Country Creative Retreat` prototype record was saved and
  verified through Payload's draft/version workflow.

## What Tim needs to do

1. Create an owner-controlled PostgreSQL database with the selected provider.
2. Copy the provider's PostgreSQL connection string.
3. Place that value in a local `.env` file as `DATABASE_URL`.
4. Add a long random value as `PAYLOAD_SECRET`.
5. Start the application and visit `/admin`.
6. Create the first owner account through Payload's setup screen.

Secrets must not be pasted into documentation, committed to Git, or exposed in
browser code. `.env` is ignored automatically.

## Local environment shape

Copy `.env.example` to `.env` and replace the example values:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
PAYLOAD_SECRET=a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

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
- Production object storage must be selected before deployment.
- SendGrid and Stripe are not connected in this foundation step.
- Applications, registration, payments, member portals, and public publishing
  remain non-functional until their dedicated workflows are implemented and
  verified.
