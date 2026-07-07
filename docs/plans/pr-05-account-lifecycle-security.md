# PR #5 — Account Lifecycle & Security Hardening

Status: Implemented and verified; Product Owner review pending

Sprint: 04 — Experience Manager

Branch: `codex/account-lifecycle-security`

## Objective

Lock the doors before the platform invites real participant users into protected
Lone Star Retreat surfaces. PR #5 hardens the account lifecycle and security
foundation without introducing booking, payments, messaging, dashboards, public
registration, or notification automation.

## Approved scope

- Invitation-only account activation
- Separate Account Invitations collection
- Account activation token lifecycle
- Safer suspended-account and session handling
- Security audit event records
- Explicit Neon `sslmode=verify-full`
- Production password-recovery email requirements
- CSRF/origin protection groundwork for future mutation routes

## Out of scope

- Live booking mutations
- Payments
- Messaging
- Dashboards
- Public account creation
- Public registration
- Booking confirmation flows
- Notification automation

## Account lifecycle

Accounts remain invitation-only. A staff-created invitation stores only a secure
token hash, expiration, intended roles, optional staff permission level, and any
related profile references. The raw activation token is never stored in the
database.

Invitation statuses:

- `pending` — invitation may be accepted before expiration
- `accepted` — invitation has created an active account
- `revoked` — staff intentionally invalidated the invitation
- `expired` — invitation expired before acceptance

User account statuses:

- `invited` — blocked from authentication and protected access
- `active` — allowed to authenticate and use authorized protected surfaces
- `suspended` — blocked from authentication and protected access

Suspending an account clears active Payload sessions, records suspension timing,
increments the account session version, and preserves a private owner-only
suspension reason.

## Security audit events

Security audit events are internal-only records used to preserve a concise
history of sensitive account lifecycle actions.

Initial events include:

- account created
- account roles changed
- account status changed
- account invitation created
- account invitation status changed
- account invitation accepted
- account invitation acceptance failed

Audit records are immutable after creation. Owners may delete records only if
required for administrative cleanup; ordinary editing is disabled.

## Production email requirement

Payload currently has no production email adapter configured. Console email is
development-only and must not be treated as production password recovery.

Before public launch or real participant account invitations:

- configure an approved transactional email provider;
- verify password-reset delivery outside local development;
- avoid account-enumeration messaging in password recovery flows;
- ensure invitation and password-reset tokens expire; and
- keep token values out of logs, committed files, and public responses.

## CSRF and origin protection groundwork

Future participant mutation endpoints must use the shared origin-check helper
before state changes are accepted. The helper verifies request origins against
the configured site URL, Vercel URL, and local development origins.

This groundwork does not authorize live booking mutations. It exists so future
POST, PATCH, PUT, and DELETE routes start from a safe default.

## Neon SSL

Database connection strings must explicitly use `sslmode=verify-full`.
Configuration also normalizes missing, `require`, or `prefer` SSL modes to
`verify-full` before passing the connection string to Payload's PostgreSQL
adapter. This addresses the PostgreSQL/Neon SSL warning discovered during PR #4
verification.

## Verification gates

- [x] Staff can create an invitation through the internal invitation model.
- [x] Invitation-only activation works.
- [x] Expired or revoked invitations cannot activate accounts.
- [x] Suspended accounts cannot access protected routes.
- [x] Existing sessions are invalidated or safely blocked after suspension.
- [x] Users cannot self-promote roles.
- [x] Participants remain blocked from Payload Admin.
- [x] Security audit events are created for sensitive actions.
- [x] Password recovery production requirements are documented.
- [x] Neon SSL warning is resolved in application configuration and documented for environment setup.
- [x] CSRF/origin helpers are present for future mutations.
- [x] No booking, payment, messaging, dashboard, or public signup functionality is added.
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm build`

## Verification notes

- The standard Payload migration runner was not used because it was blocked by
  the prior live-database data-loss warning. The migration was applied through a
  reviewed additive SQL transaction with preflight checks and an explicit
  migration-history record.
- Payload reports `20260706_211702_account_lifecycle_security` as applied in
  batch 16.
- Local production verification used JWT authorization for protected-route
  checks because production cookies are secure and do not round-trip over local
  HTTP.
- Temporary verification accounts and invitations were removed after testing.
