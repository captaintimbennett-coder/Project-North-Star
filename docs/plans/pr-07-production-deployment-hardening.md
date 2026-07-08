# PR #7 — Production Deployment Hardening & Smoke Test

Status: In implementation

Sprint: 04 — Experience Manager

Branch: `codex/production-deployment-hardening`

Production domain: `https://timbennettproductions.com`

## Purpose

Verify the first Vercel production deployment, document the live configuration,
and harden obvious launch risks before Project North Star adds new product
features.

This is a production-readiness PR, not a feature PR.

## Scope

- Document the Vercel production setup.
- Confirm the required production environment variables are present.
- Update documentation and configuration away from placeholder domains.
- Test public routes and admin access.
- Test production password recovery email.
- Test production invitation email.
- Record authentication behavior.
- Identify current media-storage risk.
- Record SendGrid key-rotation requirement because the setup key was exposed
  during manual configuration.
- Decide and document the Neon SSL setting.
- Produce a production smoke-test report.

## Out of scope

- New product features
- Live booking
- Dashboards
- Payments
- Messaging
- Public registration
- UI redesign

## Vercel production setup

- Vercel team: Project Lone Star
- Vercel project: `project-north-star`
- Git provider: GitHub
- Repository: `captaintimbennett-coder/Project-North-Star`
- Production branch: `main`
- Framework preset: Next.js
- Root directory: `./`
- Production domain: `timbennettproductions.com`
- Temporary Vercel domain: `project-north-star-coral.vercel.app`
- Calendar prototype flag: disabled in production

## Environment variable status

The production deployment requires the following environment variables:

| Variable | Production status | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Present | Neon PostgreSQL connection configured. Current value uses `sslmode=require`. |
| `PAYLOAD_SECRET` | Present | Required for Payload authentication/session security. |
| `NEXT_PUBLIC_SERVER_URL` | Present | Set to `https://timbennettproductions.com`. |
| `NEXT_PUBLIC_SITE_URL` | Present | Set to `https://timbennettproductions.com`. |
| `SENDGRID_API_KEY` | Present | Must be rotated because the setup key was exposed in chat. |
| `SENDGRID_FROM_EMAIL` | Present | Set to `captaintimbennett@gmail.com`. |
| `SENDGRID_FROM_NAME` | Present | Set to `Tim Bennett · Project North Star`. |
| `SENDGRID_REPLY_TO` | Present | Set to `captaintimbennett@gmail.com`. |
| `SENDGRID_SANDBOX_MODE` | Present | Set to `false`. |
| `ENABLE_CALENDAR_PROTOTYPE` | Present | Set to `false`. |

Do not commit production secret values to Git.

## Smoke-test results

### Public site

- [x] `https://timbennettproductions.com` loads successfully.
- [x] Homepage renders the approved Project North Star visual system.
- [x] Custom domain is connected to the Vercel project with valid
  configuration.
- [x] Vercel temporary domain remains available as a fallback.
- [ ] Automated route checks from the Codex execution environment. The live
  Chrome browser resolved the domain successfully, but the command environment
  returned `ENOTFOUND` for the newly connected domain during this pass.

### Admin

- [x] `https://timbennettproductions.com/admin` routes to Payload Admin.
- [x] Payload Admin login screen loads.
- [x] Owner/admin login succeeds.
- [x] Admin dashboard loads.
- [x] CMS collections are visible after login.
- [x] Database connection is functioning in production.

### Email

- [x] Production password recovery email test — delivered successfully after SendGrid key rotation and Vercel redeploy.
- [x] Production invitation email test — delivered successfully after SendGrid key rotation and Vercel redeploy.

PR #6 verified SendGrid delivery from the same sender before deployment. PR #7
confirmed production password recovery and invitation delivery after the
SendGrid key was rotated and Vercel was redeployed.

## Security findings

1. **SendGrid API key rotated.** The setup key was pasted into chat during
   configuration. A replacement key was created, local `.env.local` was updated,
   Vercel was redeployed, and production password recovery plus invitation
   delivery were verified. The old exposed SendGrid key was deleted from
   SendGrid; only the rotated production key remains active.
2. **Neon database password rotation recommended.** The current `DATABASE_URL`
   was displayed during manual setup. Rotate the database password after the
   first stable deployment window if operationally safe.
3. **Payload secret should remain stable for now.** Rotating `PAYLOAD_SECRET`
   invalidates auth/session behavior. Do not rotate it casually; schedule a
   deliberate maintenance window if needed.
4. **Production media storage is not hardened.** Payload local uploads are not
   appropriate for durable production media on Vercel. Choose Vercel Blob, S3,
   or another approved object-storage provider before real public/admin media
   upload workflows are relied on.

## Neon SSL decision

Current production value uses:

```text
sslmode=require
```

Project documentation prefers:

```text
sslmode=verify-full
```

Decision for this first deployment: keep `sslmode=require` temporarily because
it matches the working local connection string used during the successful
production deployment.

Required follow-up: verify the Neon connection using `sslmode=verify-full` in a
controlled deployment/update window, then update Vercel once confirmed.

## Recommended fixes before next feature PR

1. Decide and verify durable production media storage.
2. Verify or migrate Neon SSL to `sslmode=verify-full`.
3. Consider rotating the Neon password after the deployment is stable.
