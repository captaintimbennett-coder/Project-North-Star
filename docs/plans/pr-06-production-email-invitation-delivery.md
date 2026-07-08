# PR #6 — Production Email & Invitation Delivery Foundation

Status: Draft PR review

Sprint: 04 — Experience Manager

Branch: `codex/production-email-invitations`

## Objective

Establish the production-ready transactional email foundation required for
secure account invitations and password recovery before live participant
onboarding, booking, payments, dashboards, messaging, or notification automation.

## Approved scope

- Configure SendGrid as the transactional email provider.
- Integrate SendGrid with Payload email delivery.
- Send branded account invitation emails.
- Send branded password recovery emails.
- Keep activation and password-reset tokens secure.
- Preserve invitation-only account access.
- Protect against account enumeration.
- Document production environment variables.
- Update architecture and sprint documentation.

## Out of scope

- Live booking
- Payments
- Dashboards
- Messaging
- Notification automation
- Marketing email
- Newsletters
- SMS
- Public registration
- Public account creation

## Email architecture

Payload uses a SendGrid-backed email adapter. The adapter sends through
SendGrid's v3 Mail Send API using a server-only `SENDGRID_API_KEY`.

Shared email concerns live in `src/lib/email/`:

- configuration
- SendGrid adapter
- account invitation delivery
- branded HTML/plain-text templates

`payload.sendEmail` is the single delivery surface for account lifecycle emails.
If SendGrid is not configured, email is not sent and the server logs a warning.
Production must set the required environment variables before real participant
invitations or password recovery are used.

## Invitation email behavior

Account invitations remain separate records. Creating a new invitation without a
pre-existing token hash causes the system to:

1. generate a secure raw token;
2. store only the token hash;
3. set a default seven-day expiration if none is provided;
4. create the invitation record; and
5. send a branded activation email containing the one-time activation link.

Raw tokens are not stored in the database.

## Password recovery behavior

Password recovery is available through Project North Star account pages, not
public registration. The forgot-password endpoint always returns the same
successful response so it does not disclose whether an account exists.

Password reset links expire after one hour.

## Required environment variables

```dotenv
NEXT_PUBLIC_SITE_URL=https://timbennettproductions.com
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=captaintimbennett@gmail.com
SENDGRID_FROM_NAME=Tim Bennett · Project North Star
SENDGRID_REPLY_TO=captaintimbennett@gmail.com
SENDGRID_SANDBOX_MODE=false
```

Use `SENDGRID_SANDBOX_MODE=true` only for non-production verification.

## Verification results

- [x] Invitation email delivery path implemented through Payload's SendGrid
  adapter and accepted by SendGrid using the verified local sender.
- [x] Password recovery email delivery path implemented through Payload's
  SendGrid adapter and accepted by SendGrid using the verified local sender.
- [x] Activation links function correctly.
- [x] Password reset links function correctly.
- [x] Invalid or expired reset tokens return a generic failure message.
- [x] Account enumeration remains protected by generic password-recovery
  responses.
- [x] Security audit events continue to record invitation email and password
  recovery outcomes.
- [x] Email templates render as branded HTML and plain text.
- [x] Production configuration is documented.
- [x] `pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm build`

Production email smoke verification completed on July 7, 2026 against SendGrid
with `SENDGRID_SANDBOX_MODE=false`. Test messages were accepted by SendGrid for
a Gmail plus-address recipient, and the full invitation activation and password
reset flows completed successfully.
