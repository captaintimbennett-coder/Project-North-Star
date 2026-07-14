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
APPLICATION_EMAIL_FROM=applications@thelonestarretreat.com
APPLICATION_EMAIL_FROM_NAME=Lone Star Retreat
APPLICATION_EMAIL_REPLY_TO=tim@thelonestarretreat.com
APPLICATION_EMAIL_ADMIN_TO=tim@thelonestarretreat.com
```

Payload's console email behavior is development-only. If `SENDGRID_API_KEY` is
missing, account lifecycle email will not be delivered and the server will log a
warning.

The `APPLICATION_EMAIL_*` settings isolate recruitment identity and routing
from password recovery and account invitations. The sender address must be
verified in SendGrid before production use. `APPLICATION_EMAIL_ADMIN_TO` may
later move to `applications@thelonestarretreat.com` without changing applicant
Reply-To behavior or other transactional mail.

## Mission 06 production operations

Mission 06 production deployment completed on July 14, 2026 from commit
`0e66dde`. The production migration history records the validated Mission 05
and Mission 06 migrations together in batch 18; the incident and safeguards are
documented in the guarded migration procedure below. The protected pre- and
post-migration Neon branches are the production recovery checkpoints.

Featured Artist recruitment mail uses the domain-authenticated identity
`Lone Star Retreat <applications@thelonestarretreat.com>`, replies to
`tim@thelonestarretreat.com`, and sends administrative notifications to
`tim@thelonestarretreat.com`. SendGrid DKIM selectors `s1` and `s2` and the
`em7928` branded return-path CNAME are published. Google Workspace mail delivery
continues through `smtp.google.com`, with the `google` DKIM selector published.

An initial monitoring-only DMARC policy was published on July 14, 2026:

```text
v=DMARC1; p=none; rua=mailto:tim@thelonestarretreat.com; adkim=r; aspf=r; pct=100
```

The record resolved identically through the local resolver, Google Public DNS,
and Cloudflare after publication. No root-domain SPF TXT record is currently
published. Existing production recruitment messages have authenticated through
the aligned SendGrid DKIM configuration; Google Workspace messages authenticate
through Google DKIM. Review aggregate DMARC reports before considering a staged
move to `p=quarantine` and later `p=reject`, and add or consolidate a root SPF
record only after inventorying every authorized sender.

SendGrid production delivery is operational, but the account remains under
Consumer Trust review and on a trial that ends September 5, 2026. The account
must be approved and moved to an appropriate ongoing transactional plan before
that date. Do not alter the validated sender authentication while that review is
pending unless SendGrid specifically requires it.

## Verification commands

```bash
pnpm payload:generate-types
pnpm lint
pnpm typecheck
pnpm build
```

After the database is connected, create and run a version-controlled migration
before any production deployment.

## Guarded production migration procedure

Payload 3.85 discovers executable migrations by scanning the physical
`src/migrations` directory. The exported registry in `src/migrations/index.ts`
does not limit that scan. On July 14, 2026, registry filtering was incorrectly
used to try to isolate the Mission 05 migration; Payload consequently applied
all three physically pending Mission 05 and Mission 06 files in batch 18. The
previously validated schema was accepted after exact schema and data
reconciliation, but the event is a release-procedure incident.

The accepted production state is protected by two non-expiring Neon branches:

- pre-migration: `mission-06-production-pre-migration-20260714t185438z`
  (`br-raspy-union-aj4muzpb`), created July 14, 2026 at 13:54:59 CDT;
- accepted post-migration: `mission-06-production-post-migration-20260714t190219z`
  (`br-fancy-wind-aj85f4jf`), created July 14, 2026 at 14:02:56 CDT.

Both descend directly from the protected `production` branch and remain
queryable. Preserve both until the Mission 06 production release is accepted.

Never run `pnpm payload:migrate` directly against production. Plan with the
guarded wrapper first:

```bash
pnpm payload:migrate:guarded -- \
  --expect-host APPROVED_DATABASE_HOST \
  --allow 20260714_010000_example
```

The wrapper safely prints the target hostname and discovered pending names,
without printing credentials. It refuses any difference between the physical
pending set and the ordered allowlist. Only after that plan matches exactly may
the identical command be repeated with `--execute`.

If only part of the pending physical set is authorized, use a reviewed release
workspace in which unauthorized migration files are physically absent. Editing
the exported migration registry is not sufficient isolation.

## Mission 06 rollback policy

The Mission 06 migration intentionally makes Featured Artist biography optional.
That product decision survives an application-level rollback: the down migration
removes Mission 06 consent-provenance and acceptance-email operational fields,
but it does not restore `short_biography` or its version column to `NOT NULL`.
The down migration is therefore intentionally partial rather than mechanically
symmetric.

A verified Neon recovery branch or point-in-time restore is the primary rollback
strategy for Mission 06 because it restores schema and data together at the
known pre-migration boundary. The version-controlled down migration remains a
secondary operational tool when removing only Mission 06 application fields is
appropriate. Do not use the secondary rollback to reverse the approved optional
biography decision.

## Current boundaries

- Local development continues to use Payload local uploads when
  `BLOB_READ_WRITE_TOKEN` is not present.
- Production media storage uses Vercel Blob through Payload's Vercel Blob
  storage adapter when `BLOB_READ_WRITE_TOKEN` is present.
- Vercel Blob must be connected to the Vercel project before relying on
  durable production media uploads.
- SendGrid is connected for transactional account lifecycle email. Stripe is not
  connected in this foundation step.
- Public application forms are implemented. Automated profile promotion,
  participant registration, payments, member portals, public booking, and
  general site-wide CMS publishing remain deferred.

## Production media storage

The `media` collection is configured to use Vercel Blob in production through
`@payloadcms/storage-vercel-blob`.

Required environment variable:

```bash
BLOB_READ_WRITE_TOKEN=...
```

Vercel usually creates `BLOB_READ_WRITE_TOKEN` automatically after Blob storage
is added and connected to the project. When the token is absent, the adapter is
disabled and Payload falls back to local media storage for development.

The adapter is configured for client uploads so production admin uploads bypass
Vercel's server upload-size limit. Continue to enforce collection-level media
privacy: uploaded media is private by default and only publicly readable after
explicit platform-use approval.
