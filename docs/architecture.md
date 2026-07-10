# Project North Star Architecture

Version 1.0 — June 25, 2026

## Purpose

Project North Star is organized as a long-lived platform rather than a
single-purpose portfolio. The architecture separates routes, reusable
presentation, configurable content, design rules, and future service
integrations so each can evolve independently.

## Brand architecture

The platform name and repository history do not determine the public brand
hierarchy. The public experience must follow this order:

1. **Tim Bennett** — the primary brand and person visitors choose to work with
2. **Project North Star** — Tim’s guiding philosophy and standard
3. **Experiences** — portraiture, retreats, workshops, mentoring, editorial,
   and publications
4. **Shared services** — CRM, client portal, scheduling, contracts, payments,
   galleries, email, analytics, and automation

Homepage decisions should first answer, “Does this help the visitor understand
who Tim Bennett is?” and then, “Does this express the Project North Star
philosophy?” This hierarchy changes content emphasis, not the approved route,
component, responsive, or service architecture.

## Repository map

```text
.
├── docs/
│   ├── master-vision.md
│   ├── design-system.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── content-strategy.md
│   └── codex-instructions.md
├── public/
│   └── images/
│       ├── hero/
│       ├── portfolio/
│       ├── lone-star-retreat/
│       └── behind-the-scenes/
└── src/
    ├── app/
    ├── components/
    │   ├── layout/
    │   ├── navigation/
    │   ├── hero/
    │   ├── marketing/
    │   ├── portfolio/
    │   ├── cards/
    │   ├── forms/
    │   └── buttons/
    ├── styles/
    ├── data/
    └── lib/
```

## Responsibilities

### `src/app`

Next.js App Router routes, route metadata, and page composition. Route files
should remain thin. They select content from `src/data` and compose components;
they should not become storage for substantial copy or repeat UI patterns.

### `src/components`

Reusable React presentation organized by responsibility:

- `layout` — containers, page introductions, typography, site chrome, footer,
  and media frames
- `navigation` — primary navigation and future navigation variants
- `hero` — hero compositions
- `marketing` — shared public-route heroes, editorial preview grids, and
  closing calls to action
- `portfolio` — portfolio-specific grids and gallery presentation
- `cards` — repeatable content-card patterns
- `forms` — labeled form controls and future form assemblies
- `buttons` — buttons, action links, text links, and icons

A component belongs here when it is reused, owns a distinct interaction, or
encapsulates a meaningful presentation pattern.

### `src/styles`

The visual source of truth:

- `tokens.css` — colors, typography, spacing, layout dimensions, motion, and
  responsive standards
- `foundation.css` — reset, body defaults, typography roles, focus, selection,
  and accessibility foundations
- `components.css` — shared component contracts

`src/app/globals.css` imports these files and contains site-shell and
page-composition rules only.

### `src/data`

Structured local content and configuration:

- `assets.ts` — stable public image paths
- `navigation.ts` — primary navigation
- `site.ts` — identity, contact details, metadata, and footer configuration
- `home.ts` — homepage copy and configuration
- `portfolio.ts` — portfolio introduction and collections
- `experiences.ts` — experience listings and Lone Star Retreat introduction
- `north-star.ts` — North Star introduction and journal previews
- `pages.ts` — About and Contact content
- `admin.ts` — Content Studio prototype labels

These modules are the temporary local content layer. Future CMS repositories or
queries should implement equivalent typed shapes so page components do not need
to be redesigned when content moves to Payload.

### `src/lib`

Shared utilities, external clients, validation, formatting, and server-side
helpers. It is intentionally empty until a genuine shared utility exists.
Avoid creating miscellaneous helper files without a clear responsibility.

## Public marketing routes

The Sprint 02 public marketing foundation is organized around six principal
routes:

- `/portfolio`
- `/private-client`
- `/lone-star-retreat`
- `/workshops-education`
- `/about`
- `/contact`

These routes share a content-driven editorial hero, preview-block, and closing
action vocabulary. Portfolio, About, and Contact may compose specialized
sections around those shared patterns. Calls to future applications, booking,
enrollment, or forms must remain clearly informational until their supporting
services are implemented and approved.

### `public/images`

Static media grouped by editorial purpose. Pages reference assets through
`src/data/assets.ts`, not by scattering raw image paths through components.

## Import convention

The `@/*` alias resolves to `src/*`.

```ts
import { Container } from "@/components/layout";
import { homeContent } from "@/data/home";
```

Use aliases across responsibility boundaries. Relative imports are acceptable
inside a single component or data folder.

## Content boundary

Content that an owner or editor may eventually change belongs in `src/data`, not
inside a route. Examples include:

- navigation labels
- hero images and copy
- portfolio collections
- page introductions
- journal previews
- contact details
- experience descriptions

Purely structural or accessibility text may remain in components when it is
part of the component contract.

## Future service architecture

The approved long-term record, portal, event, booking, media, consent, and
security boundaries are defined in
[`north-star-platform-architecture.md`](north-star-platform-architecture.md).
That document governs future platform expansion while preserving the current
sprint's explicit non-implementation boundary.

The Sprint 04B operations blueprint is defined in
[`retreat-operations-architecture.md`](retreat-operations-architecture.md).
That document governs the participant lifecycle, privacy, scheduling, logistics,
and implementation sequencing for future Lone Star Retreat operational systems.

- Hosting and deployment: Vercel
- Primary production domain: `https://timbennettproductions.com`
- Lone Star Retreat marketing domain: `https://thelonestarretreat.com`
  points to the same Vercel application and uses host-aware routing so the
  domain root resolves to the current Founders Edition experience without
  creating a second app or duplicate deployment.
- Content administration and authentication: Payload CMS
- Relational data: PostgreSQL through Payload's database adapter
- Initial development media storage: Payload local uploads
- Production media storage: an approved object-storage provider, selected before
  durable media upload workflows are relied on
- Payments: Stripe when paid workflows are approved
- Transactional email: a dedicated provider called from secure server actions

The public website and administrative studio should remain separate surfaces
backed by one content model.

### Featured Artist public-read boundary

Featured Artist pages are event-scoped. A server-only repository begins with a
published `retreat-events` record and maps only artist assignments whose
event-specific participation status is `approved`. The related canonical
`model-profiles` record must also be approved and published, have confirmed usage
permission, and have an approved featured image. Location, categories,
biography, artist statement, Instagram, and website each require their
corresponding public-display approval. Model Applications, legal names, private
administrator notes, unassigned artists, and unapproved media are never part of
the public mapping. Approved Media may be read publicly; all other Media remains
authenticated-only.

### Lone Star Retreat scheduling domain

The approved business rules are defined in
[`foundation/scheduling-and-booking-rules.md`](foundation/scheduling-and-booking-rules.md).
The scheduling foundation is event-specific and uses the following records:

- `retreat-events` owns the event time zone and explicit artist and photographer
  participation assignments. Artist assignments also own the event-specific
  minimum booking duration.
- `artist-availability` stores one private availability record per event,
  artist, and bookable day. It defaults to 6:00 AM–6:00 PM local event time and
  may contain lunch or unavailable blocks.
- `retreat-bookings` relates one event, participating artist, and approved
  photographer to an exact UTC start and end time. Event time zones translate
  those timestamps into local schedule time. Versions preserve operational
  history.
- Canonical model and photographer profiles hold private contact-sharing and
  notification preferences. Email sharing and email notifications are required
  before a confirmed booking can be created.

Server-side hooks enforce event assignment, model minimum duration, whole
60-minute blocks, stated availability, participant contact readiness, and
artist/photographer conflict prevention. An administrator may place a booking
outside stated availability but may never create overlapping confirmed time.
Availability changes are rejected when they would hide or block a confirmed
reservation.

Both scheduling collections are authenticated-only. Future participant schedule
views must use an allowlisted server projection limited to artist/stage name,
date, time, and booking status. Photographer identity and shoot information are
excluded from the general Retreat Schedule. Contact details are released only to the two booked
participants according to their approved preferences after confirmation.
Email, phone, payment information, private notes, and administrator fields never
belong in Retreat Schedule output.

The scheduling domain intentionally contains no model rates, photographer-to-
model payments, creative negotiations, or internal messaging records. Future
event admission payment records are a separate Lone Star Retreat concern.

## Planned content model

- `site_settings`
- `media_assets`
- `portfolio_collections`
- `portfolio_items`
- `experiences`
- `journal_entries`
- `pages`
- `contact_submissions`

Payload access controls must enforce Owner, Editor, and Reviewer roles on the
server. Database credentials and the Payload secret must never reach browser
code. PostgreSQL migrations remain version controlled.

## Identity and access foundation

The Payload `users` collection is the canonical UserAccount and remains
separate from role profiles. An account may hold administrator, photographer,
and model roles concurrently. Administrator accounts additionally use the
existing owner, editor, and reviewer staff permission levels. Accounts are
invited, active, or suspended; only active accounts may authenticate or access
protected platform data.

`model-profiles.account` and `photographer-profiles.account` are optional unique
relationships to `users`. They are assigned manually by authorized staff and
must match the account role. Application records never become accounts or
profiles automatically.

Participants never receive Payload Admin access. Server access rules constrain
profile, availability, and booking reads to the authenticated account's linked
profile. Participant-facing schedule code returns an explicit allowlist rather
than a raw Payload document. Booking creation, updates, and deletion remain
staff-only until a later PR separately authorizes live booking.

### Account lifecycle and security hardening

Accounts are activated by invitation only. `account-invitations` stores the
intended email, roles, optional staff permission level, expiration, status, and
related profile references. It stores a hash of the activation token; the raw
token is never stored. Accepting a valid pending invitation creates an active
UserAccount and marks the invitation accepted. Expired, revoked, or previously
accepted invitations cannot create accounts.

`users` additionally tracks invitation acceptance, last login, suspension
timing, private suspension reason, and a session version. Suspending an account
clears active Payload sessions, increments the session version, and continues to
block protected route access through fresh server-side account checks.

`security-audit-events` records sensitive account lifecycle actions including
invitation creation, invitation acceptance, failed invitation acceptance, account
creation, role changes, and status changes. Audit records are internal-only and
immutable after creation.

Future participant mutation routes must use the shared origin protection helper
before accepting state changes. This groundwork does not authorize public
booking mutations.

Production password recovery is not considered ready until a transactional
email provider is configured and verified. Console-only email remains a local
development behavior.

### Transactional email foundation

SendGrid is the approved production transactional email provider for account
invitations and password recovery. Payload email delivery is configured through
a server-only SendGrid adapter. Account lifecycle email templates live in the
shared email service layer and provide both branded HTML and plain-text output.

Account invitation creation generates a secure raw token, stores only the token
hash, and sends the activation link through SendGrid. Password recovery uses a
privacy-safe request endpoint that always returns the same response so account
existence is not disclosed.

Transactional email does not authorize marketing email, newsletters,
notification automation, public registration, dashboards, or booking workflows.

### Production deployment

Project North Star is deployed on Vercel from the GitHub `main` branch. The
production Vercel project is `project-north-star` under the Project Lone Star
team. The production domain is:

```text
https://timbennettproductions.com
```

The first production smoke test confirmed the public homepage, custom domain,
Payload Admin login screen, owner/admin login, visible CMS collections, and
database connectivity. The deployment uses Neon PostgreSQL, Payload CMS, and
SendGrid transactional email.

The current production database connection uses `sslmode=require`. The approved
target remains `sslmode=verify-full`; verify that mode in a controlled
deployment window before changing the Vercel production value.

Production media storage standard: Vercel Blob. The Payload `media` collection
uses Payload's Vercel Blob storage adapter when `BLOB_READ_WRITE_TOKEN` is
present, while local development falls back to local uploads when the token is
absent.

Before relying on production media uploads as durable records, confirm the
Vercel project has Blob storage connected, `BLOB_READ_WRITE_TOKEN` is present in
production and preview environments, and a Payload Admin upload remains
available after a redeploy.

## Architectural rules

1. Preserve server components by default; add `"use client"` only for actual
   browser state or interaction.
2. Prefer composition over large configurable “do everything” components.
3. Keep content, presentation, and service access separate.
4. Add dependencies only when they materially reduce complexity.
5. Never couple the public page layout directly to a vendor response shape.
6. Treat accessibility, responsive behavior, and performance as baseline
   requirements.
7. Record material architecture changes in this document.

## Legacy public routes

- `/photography` is intentionally retained as a permanent compatibility
  redirect to `/portfolio`. It is excluded from the sitemap and has no separate
  canonical identity.
