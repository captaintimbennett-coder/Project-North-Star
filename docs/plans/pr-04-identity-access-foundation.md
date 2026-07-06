# PR #4 — Identity & Access Foundation

Status: Implemented and verified; Product Owner review pending

Sprint: 04 — Experience Manager

Branch: `codex/identity-access-foundation`

## Objective

Prove secure identity and server-enforced authorization before live scheduling,
payments, messaging, notifications, or participant dashboards are introduced.

## Approved boundaries

- One authenticated UserAccount remains separate from canonical photographer
  and model profiles.
- Accounts may hold administrator, photographer, and model roles concurrently.
- Administrator accounts retain owner, editor, and reviewer permission levels.
- Account status is invited, active, or suspended.
- Public account creation and automatic application-to-profile promotion remain
  prohibited.
- Participant schedule access is read-only in PR #4.
- No dashboard, booking mutation, payment, messaging, or notification work is
  authorized.

## Permission matrix

| Capability | Owner | Editor | Reviewer | Photographer | Model |
| --- | --- | --- | --- | --- | --- |
| Payload Admin | Yes | Yes | Yes | No | No |
| Manage accounts and roles | Yes | No | No | No | No |
| Create/update managed content | Yes | Yes | No | No | No |
| Review applications | Yes | Yes | Yes | No | No |
| Delete managed records | Yes | No | No | No | No |
| Read own profile | Yes | Yes | Yes | Yes | Yes |
| Read own bookings | Yes | Yes | Yes | Yes | Yes |
| Mutate participant bookings | Not in PR #4 | Not in PR #4 | No | No | No |

## Account/profile relationship

`users` owns authentication, status, and authorization. `model-profiles` and
`photographer-profiles` each contain an optional unique relationship back to a
UserAccount. Linking is an explicit staff action and the linked account must
hold the matching role. Applications never create or publish accounts or
profiles automatically.

## Protected routes

- `/sign-in` — invitation-only account sign-in
- `/account/access` — minimal identity and role verification
- `/account/my-schedule` — server-filtered, read-only schedule verification
- `/account/access-denied` — privacy-safe wrong-role response
- `/admin` — active administrator accounts only

## Security controls

- Five-attempt login lockout with a fifteen-minute lock period
- Two-hour session token lifetime
- Secure cookies in production with SameSite Lax
- Suspended and invited accounts rejected before login and by every protected
  server helper
- Owner-only role/status changes and account deletion
- Last active owner protection
- Field-level protection for administrator notes and exception data
- Explicit allowlisted schedule projection
- No participant access to Payload Admin or booking mutations

## Verification gates

- [x] Additive migration applies successfully
- [x] Existing owner is backfilled as an active administrator
- [x] Administrator access is restricted to active staff
- [x] Photographer reads only photographer-linked records
- [x] Model reads only model-linked records
- [x] Suspended and wrong-role access is rejected
- [x] Private fields are absent from participant responses
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm build`

## Migration note

Payload detected prior development-mode schema synchronization and warned that
its standard migration runner could cause data loss. The destructive path was
declined. The reviewed additive SQL was applied in one transaction with a
preflight duplicate-schema check, a complete existing-owner backfill assertion,
rollback-on-error behavior, and an explicit migration-history record. Payload
now reports the migration as batch 15 and applied.

## Follow-up security recommendations

- Change the Neon connection string to explicit `sslmode=verify-full` before
  the next major PostgreSQL driver upgrade.
- Add a production email adapter before password recovery is enabled; console
  email is development-only.
- Add CSRF/origin verification to future state-changing participant endpoints.
- Add audit events for role, status, and profile-link changes before production
  administrators manage participant accounts at scale.
