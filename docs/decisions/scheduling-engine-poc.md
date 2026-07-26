# Project North Star — Mission 09 Skinny Native Scheduling

**Status:** Active — Milestones 1–4 and Milestones 5.1–5.4B-2 complete; stopped
before any additional administrator control

**Original decision date:** July 24, 2026

**Revised decision date:** July 26, 2026

**Applies to:** Project North Star / Lone Star Retreat

**Authority:** This document controls Mission 09 scope and execution. The
accompanying research provides historical background but does not expand the
approved scope.

**Supporting research:** [`../research/scheduling-engine-research-v2.md`](../research/scheduling-engine-research-v2.md)

## Executive Decision

Mission 09 will complete the smallest reliable native scheduling workflow for
Lone Star Retreat using the scheduling foundation already implemented in
Project North Star.

Cal.com is rejected for the initial implementation because its user- and
seat-oriented resource model does not fit a short event with multiple
independently bookable models at an acceptable recurring cost or administrative
burden. Making it fit would still require Project North Star integration and
business-rule code.

The previously planned Timekit proof of concept is stopped. It may be reopened
only if implementation reveals a specific, proven limitation in the existing
native foundation that a hosted provider would solve more simply.

This is not authorization to build a generalized scheduling product.

> Build the Lone Star Retreat scheduler, not a general scheduling platform.

## Why a Native Completion Is Proportionate

Project North Star already owns the difficult scheduling foundation:

- Canonical event, artist/model, and photographer identities
- Event participation and booking eligibility
- Event-local time zones and UTC booking timestamps
- Artist availability, blocked periods, and minimum booking durations
- Immediate first-come-first-served confirmation
- Server-side permission and business-rule validation
- PostgreSQL exclusion constraints preventing artist or photographer overlap
- Idempotency protection and operational history
- Private participant schedule projections
- Administrator scheduling authority
- A read-only premium calendar prototype

Mission 09 connects and verifies this foundation. It does not begin from zero
and must not reproduce Calendly, Cal.com, or a universal resource scheduler.

## Version 1 Authorized Outcome

Version 1 is complete when:

1. Participating models can set their event availability and blocked periods.
2. Approved photographers can see valid available times.
3. An approved photographer can book a participating model for an allowed
   duration.
4. A valid booking is confirmed immediately.
5. Neither participant can be double-booked, including under concurrent
   requests.
6. Models and photographers can see their own private schedules.
7. The administrator can see all bookings and can cancel or reschedule them.
8. Required booking, cancellation, and rescheduling emails are delivered
   reliably.

## Approved Milestone Sequence

Complete one milestone, verify it, record the result, and stop before beginning
the next milestone.

### Milestone 1 — Real Availability

Prove that one participating model's real event availability produces the
correct bookable time ranges.

Verify:

- Event-local day and time handling
- Default and customized availability
- Blocked periods and breaks
- Minimum booking duration
- Existing confirmed-booking protection
- No private information in participant-facing availability output

No booking mutation is authorized in this milestone.

**Result — July 25, 2026:** Complete.

- Extracted a deterministic event-local availability range calculator from the
  broader booking service.
- Corrected event-day enumeration to use the retreat time zone rather than UTC
  calendar dates. The stored Founders Edition timestamps now correctly produce
  May 14, May 15, and May 16 in `America/Chicago`.
- Verified default and customized hours, lunch and unavailable blocks, minimum
  duration, confirmed participant busy time, partial-hour boundaries, UTC
  conversion, and the privacy-safe range shape with six focused automated
  tests.
- Performed a read-only development-database proof using approved participating
  artist Lexi Anne. Her real event assignment produced the three correct
  event-local days and 78 valid default one-hour-or-longer ranges per day.
- Confirmed that existing collection hooks still prevent availability changes
  from hiding or blocking confirmed reservations.
- `pnpm mission:09:availability`, `pnpm lint`, `pnpm typecheck`, and
  `pnpm build` pass.

No booking was created or changed.

### Milestone 2 — One Real Booking

Allow one approved photographer to create one valid booking with one
participating model through the Project North Star API and interface.

Verify:

- Authentication and origin protection
- Event and participant eligibility
- Exact duration and whole-hour rules
- Availability validation
- Immediate confirmation
- Idempotent submission behavior
- Correct private schedule updates for both participants

**Result — July 25, 2026:** Complete.

- Added a repeatable controlled-development validator that uses the real
  booking service, Payload access rules, approved event assignments, artist
  availability, PostgreSQL transaction handling, private schedule projections,
  and security audit hooks.
- Proved authentication role checks, allowed and rejected origins, approved
  event eligibility, minimum duration, whole event-local hours, availability
  boundaries, immediate confirmation, and rejection of a non-photographer
  account.
- Proved that the confirmed reservation appears correctly in both the
  photographer's and model's private schedules.
- Hardened idempotency so an exact retry returns the original reservation while
  the same key cannot authorize different booking details. The browser now
  preserves one key across a retry and creates a new key only when the selected
  range changes.
- Ensured scheduling and account audit records participate in the same database
  transaction as their source mutation.
- Removed concurrent queries sharing one transaction connection, preserving
  compatibility with the PostgreSQL driver's future behavior.
- The controlled proof passed all 16 checks and then rolled back. No temporary
  booking, account, profile link, availability, or audit data remained.
- `pnpm mission:09:booking`, `pnpm mission:09:availability`, `pnpm lint`,
  `pnpm typecheck`, `pnpm build`, and `git diff --check` pass.

Milestone 2 was completed and verified before concurrency work began.

### Milestone 3 — Concurrency and Conflict Proof

Prove with automated concurrent requests that:

- Two photographers cannot reserve the same model at overlapping times.
- One photographer cannot reserve overlapping sessions with different models.
- Exactly one competing valid request succeeds.
- Database protection remains authoritative if application validation races.

This milestone is not complete without a repeatable automated test.

**Result — July 25, 2026:** Complete.

- Added a repeatable development-only concurrency validator with five race
  rounds for each required scenario.
- Same-model races passed 5/5: exactly one photographer booking succeeded in
  every round.
- Same-photographer/different-model races passed 5/5: exactly one booking
  succeeded in every round.
- Direct PostgreSQL probes verified `retreat_bookings_artist_no_overlap` and
  `retreat_bookings_photographer_no_overlap`, both returning SQLSTATE `23P01`
  on conflicts.
- Nested PostgreSQL exclusion errors are now classified as safe booking
  conflicts by the service and API route.
- Temporary users, profiles, event data, bookings, availability records, and
  matching audit records were removed after validation; no test fixture
  remained.
- `pnpm mission:09:concurrency`, `pnpm mission:09:availability`,
  `pnpm mission:09:booking`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
  `git diff --check` pass.

### Milestone 4 — Required Transactional Email

Deliver and verify branded email for:

- Booking confirmation
- Administrator cancellation
- Administrator rescheduling

Email failure must be observable and retryable without duplicating the
underlying booking mutation.

**Result — July 25, 2026:** Complete.

- Added private `scheduling-email-deliveries` records that preserve one
  deterministic delivery intent per booking lifecycle event and participant.
  Booking confirmation, administrator rescheduling, and administrator
  cancellation each queue one message for the photographer and one for the
  Featured Artist.
- Delivery intent creation participates in the booking transaction. SendGrid
  delivery begins only after the booking mutation commits, so a rolled-back
  booking cannot send a participant email.
- Added branded HTML and plain-text Lone Star Retreat templates with
  event-local time, the public event location, and a private-schedule link.
  Private administrator reasons and notes are excluded from message snapshots
  and participant email.
- Added owner/editor cancellation, rescheduling, and failed-delivery retry
  services and protected API routes. Successful delivery is idempotent. Failed
  delivery is recorded and may be retried explicitly without replaying or
  changing the underlying booking.
- Added administrator-visible pending, sending, sent, and failed delivery state
  with attempt timestamps, safe errors, and sent timestamps.
- Applied the additive delivery-ledger migration to the approved development
  database only. No production migration, deployment, or live email was
  authorized or performed.
- The controlled development proof passed all 12 checks across confirmation,
  rescheduling, cancellation, two-recipient delivery, private-reason
  exclusion, provider failure, explicit retry, idempotency, and fixture cleanup.
- `pnpm mission:09:email`, the existing Mission 09 validators, `pnpm lint`,
  `pnpm typecheck`, `pnpm build`, and `git diff --check` pass.

Milestone 4 is complete. Work proceeded only into the separately approved
Milestone 5.1 private-schedule connection described below.

### Milestone 5 — Operational Completion

Connect the verified scheduling foundation to:

- Model availability management
- Photographer booking experience
- Photographer and model private schedules
- Administrator master-calendar controls for viewing, cancellation, and
  rescheduling

Verify desktop and mobile usability, accessibility, privacy boundaries, and
complete administrator visibility.

#### Milestone 5.1 — Real Visual My Schedule

Completed July 25, 2026:

- Connected the authenticated `/account/my-schedule` route to the approved
  premium personal-calendar visual direction without importing prototype
  fixtures into production.
- Preserved `getPersonalItinerary` as the only booking-data source for the
  route. The interface receives only its existing allowlisted partner, event,
  event-local time, duration, status, administrator-change, location, and
  approved contact fields.
- Limited the route to authenticated photographer and model accounts. An
  administrator-only account cannot use this participant route as a substitute
  master calendar.
- Added real event-day selection, active-session agenda cards, approved contact
  presentation, empty state, and a separate record of cancelled or rescheduled
  items. The interface remains read-only.
- Added three focused event-local presentation tests. The existing controlled
  booking validator again proved that one authenticated photographer and one
  authenticated model each receive their own private itinerary; all 16 checks
  pass and temporary data is rolled back.
- `pnpm mission:09:personal-schedule`, `pnpm mission:09:booking`, `pnpm lint`,
  `pnpm typecheck`, `pnpm build`, and `git diff --check` pass.
- No production deployment, production mutation, or live email was authorized
  or performed.

#### Milestone 5.2 — Real Visual Shape Your Day

Completed locally July 25, 2026:

- Connected the authenticated `/account/availability` route to the approved
  Shape Your Day visual direction using each Featured Artist's real eligible
  retreat days and canonical `artist-availability` records.
- Limited the route and mutation service to active model accounts. The
  experience can edit one retreat day at a time, adjust working-day boundaries,
  add, edit, and remove lunch or unavailable blocks, preserve unsaved changes
  while switching days, and save through the existing origin-protected API.
- Added a privacy-safe protected-time projection for confirmed and
  administrator-review sessions. It exposes only booking ID, event-local start
  and end time, and status; photographer identity and contact information do
  not enter the availability interface.
- Kept the server authoritative. Client validation gives immediate guidance,
  while existing Payload hooks independently reject a working-day boundary or
  blocked period that would hide protected booking time.
- Added nine focused availability and presentation checks plus a 19-check
  isolated development transaction proving the real projection, save and
  reread flow, privacy allowlist, and protected-session rejection. The original
  16-check booking proof, 8-check concurrency proof, 12-check email proof, and
  3-check personal-calendar proof continue to pass, and temporary data is
  rolled back.
- No production deployment, production mutation, or live email was authorized
  or performed.

#### Milestone 5.3 — Real Visual Photographer Booking

Completed locally July 25, 2026:

- Connected the authenticated `/account/book` route to the approved Schedule a
  Shoot visual direction. An active photographer with an approved canonical
  profile and event participation can choose a real retreat day, a real
  server-derived start time and duration, and an eligible Featured Artist.
- Preserved `getPhotographerBookingOptions` as the selection authority and the
  existing origin-protected booking endpoint as the mutation authority. The
  visual experience does not calculate or invent bookable ranges.
- Added an allowlisted visual projection containing only event, date, time,
  duration, approved artist display name, minimum duration, and an approved
  profile image when one is available. Contact information, private profile
  fields, rates, payment, concepts, wardrobe, and administrator data are not
  exposed before confirmation.
- Implemented the approved selection, review, and confirmed stages. A conflict
  returns the existing safe message, refreshes authoritative availability, and
  does not change either schedule. Exact retries retain the existing
  idempotency protection.
- Continued using the verified booking transaction to protect both participant
  schedules and begin required two-recipient confirmation delivery only after
  commit.
- Added four focused presentation tests and a 17-check isolated development
  transaction proving approved-role access, the privacy allowlist, exact
  event-local ranges, immediate confirmation, both private schedule updates,
  idempotency, audit participation, invalid-time rejection, and full rollback.
  The 9-test/19-check model availability proof, 8-check concurrency proof,
  12-check email proof, and 3-check personal-calendar proof remain green.
- No production deployment, production mutation, or live email was authorized
  or performed.

Work is deliberately stopped before Milestone 5.4. Shared Retreat Schedule and
administrator master-calendar interface changes are not part of Milestone 5.3.
Executive visual review may occur from this stable local baseline before the
next milestone is authorized.

#### Executive Visual Acceptance — Milestones 5.1–5.3

Accepted July 26, 2026:

- The Product Owner visually accepted the connected Schedule a Shoot selection
  and review flow, Featured Artist Shape Your Day experience, and photographer
  and Featured Artist private My Schedule views.
- The controlled review used isolated development-only participant accounts
  and records at 1440px desktop and 390px mobile widths. Ten captures completed
  without horizontal overflow, failed final-state images, or browser-console
  errors.
- The temporary review accounts, booking, availability, delivery intents, and
  matching audit records were removed, and the original development profile
  relationships and values were restored. Production data was not changed.
- One stale development-only Featured Artist media URL referenced a retired
  local media host. The review used the existing initials fallback after
  preserving the original profile value. One approved production portrait must
  still be checked before participant launch; this does not expand or block the
  scheduling milestone.

The next candidate outcome was Milestone 5.4A. The Product Owner approved its
small boundary before implementation. The administrator outcome remained
separate and required its own later authorization.

#### Milestone 5.4A — Shared Retreat Schedule

Completed locally July 26, 2026:

- Added one authenticated, read-only Shared Retreat Schedule for approved
  photographers and Featured Artists assigned to the selected retreat.
- Reused the existing `getSharedRetreatSchedule` projection and approved
  premium Retreat Schedule direction. A small event adapter now resolves only
  published or closed retreats to which the active participant is assigned.
- The route displays only Featured Artist stage/display name, event-local date
  and time, and confirmed or administrator-review status. The focused privacy
  test confirms the booking item allowlist contains only `artistName`, `endAt`,
  `id`, `startAt`, and `status`.
- Preserved the secondary-view hierarchy. My Schedule remains the primary
  participant action, and the new Shared Retreat Schedule is a separate
  read-only account action with a return path to My Schedule.
- Added the protected `/account/retreat-schedule` route, pure presentation
  adapter, responsive editorial timeline and mobile agenda, and explicit
  active-participant access gate. Administrator-only and suspended accounts
  cannot use the participant route.
- Verified the completed interface at 1440px and 390px using isolated typed
  review data. The final mobile inspection reported no horizontal overflow,
  clipped content, or browser-console errors. No database record, production
  data, migration, external service, or notification was changed.
- `pnpm mission:09:shared-schedule`, `pnpm mission:09:personal-schedule`,
  `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `git diff --check` pass.

Milestone 5.4A does not include:

- Photographer identity
- Participant contact details
- Shoot type, concept, theme, wardrobe, rates, payment, or private notes
- Availability editing or participant booking mutation
- Administrator drag, cancellation, rescheduling, reassignment, override, or
  conflict-resolution controls
- A new collection, database migration, dependency, notification, dashboard,
  or generalized calendar abstraction

Milestone 5.4A is complete locally. Work proceeded only into the separately
approved Milestone 5.4B-1 read-only administrator view described below.

#### Milestone 5.4B-1 — Read-Only Administrator Master Calendar

Completed locally July 26, 2026:

- Added the protected `/account/master-calendar` route for active
  administrator accounts. Participant-only and suspended accounts are
  excluded.
- Added a dedicated server projection for published and closed retreats. It
  exposes only booking ID, Featured Artist display name, photographer display
  name, event-local start and end time, and booking status.
- Included confirmed, administrator-review, cancelled, and rescheduled records
  so the administrator receives both the active operating picture and the
  preserved schedule history without receiving contact details, rates,
  payment, creative planning, private notes, or change reasons.
- Added event-day selection, four operational counts, a desktop
  Featured-Artist timeline, a compact mobile agenda, and a separate schedule
  history. The interface is explicitly read-only.
- Added five focused access, event-local day, status, privacy-allowlist, and
  presentation checks. The Shared Retreat Schedule and personal My Schedule
  regressions remain green.
- Verified the completed interface at 1440px and 390px with no horizontal
  overflow, clipping, failed calendar resources, or page errors. The only
  browser warning was the project's pre-existing missing global
  `/favicon.ico`, which is outside this milestone.
- `pnpm mission:09:admin-master-calendar`,
  `pnpm mission:09:shared-schedule`, `pnpm mission:09:personal-schedule`,
  `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `git diff --check` pass.
- No database record, migration, production data, external service,
  notification, or production deployment was changed.

Milestone 5.4B-1 does not include drag-and-drop, cancellation, rescheduling,
reassignment, override, conflict resolution, payments, messaging, or any other
mutation control. Work is deliberately stopped before Milestone 5.4B-2 so that
the smallest administrator-control outcome can be defined and approved
separately.

#### Milestone 5.4B-2 — One Booking Cancellation

Completed locally July 26, 2026:

The smallest useful administrator mutation is cancellation of one active
booking at a time. Cancellation is selected before rescheduling because the
existing protected service already validates permission, requires a private
reason, writes the audit trail, creates the two participant email intents, and
handles an exact retry safely. Rescheduling would additionally require new-time
selection, availability, conflict, override, and recovery decisions.

The completed interaction is:

1. An owner or editor selects one confirmed or administrator-review booking
   from the Master Calendar.
2. A focused cancellation review panel repeats the Featured Artist,
   photographer, event-local date and time, and current status.
3. The administrator enters a required private reason and confirms the
   cancellation explicitly.
4. The interface submits to the existing origin-protected
   `/api/scheduling/bookings/[id]/cancel` endpoint without an optimistic local
   mutation.
5. After server success, the calendar refreshes from its authoritative
   projection, removes the booking from the active timeline, and shows it in
   Schedule History as cancelled.

Verified result:

- Only active owner and editor administrator accounts receive the cancellation
  action. Reviewer administrators retain the complete read-only calendar.
- A focused review dialog repeats the booking identity and event-local time,
  requires an explicit private reason of at least three trimmed characters,
  and provides distinct keep-booking and confirm-cancellation actions.
- Cancellation remains server-authoritative, audited, and idempotent. The
  interface performs no optimistic booking mutation and refreshes from the
  authoritative projection after success.
- The existing required cancellation email creates one durable delivery intent
  for each participant after the booking mutation commits. A failed send does
  not reverse or duplicate the cancellation.
- A failed or rejected request leaves the visible booking unchanged and gives
  the administrator a clear safe error.
- Eight focused access, status, reason, privacy, event-local presentation, and
  cancellation-control checks pass. The 12-check controlled email proof
  confirms two-recipient cancellation delivery, private-reason exclusion,
  failure visibility, safe retry, idempotency, and fixture cleanup.
- Desktop and mobile review at 1440px and 390px confirmed the open, close,
  private-reason, cancel, success, and authoritative-refresh interactions with
  no overflow, failed resources, console errors, or page errors.
- `pnpm mission:09:admin-master-calendar`,
  `pnpm mission:09:shared-schedule`, `pnpm mission:09:personal-schedule`,
  `pnpm mission:09:email`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
  `git diff --check` pass.
- No production data, production email, deployment, or external service was
  changed.

Milestone 5.4B-2 added no endpoint, collection, migration, dependency,
drag-and-drop, rescheduling, reassignment, override, conflict-resolution
control, delivery-retry dashboard, payment, or messaging feature. Those remain
separate future decisions.

## Implementation Boundary

- Project North Star records remain canonical.
- PostgreSQL remains the final authority for overlap prevention.
- Business rules remain enforced on the server, never only in the browser.
- Use the existing Payload, PostgreSQL, authentication, scheduling service, and
  calendar foundations before adding abstractions or dependencies.
- Add only the routes, services, fields, migrations, interfaces, and email
  state required by the active milestone.
- Preserve the approved privacy projections and administrator override rules.
- Prefer event-specific code over a speculative generic resource framework.

## Explicit Non-Goals

Version 1 does not include:

- Cal.com, Timekit, or simultaneous provider support
- A provider-adapter framework
- Production deployment of Cal.diy
- A general-purpose scheduling service
- Public anonymous booking
- Model rates or photographer-to-model payments
- Event admission payments or Stripe
- Internal participant messaging
- Creative negotiations or shoot planning
- SMS notifications
- AI concierge or MCP integration
- Waitlists
- Recurring appointments
- Group shoots or workshops
- Calendar-provider synchronization
- Automated reminders
- CRM or marketing automation
- Membership logic
- Analytics or reporting dashboards
- Unrelated calendar redesign
- Speculative rooms, equipment, instructors, or other resource types

Any item above requires a later explicit product decision.

## Decision Gates

Stop and request executive review if:

- A milestone requires changing an approved business rule.
- Existing database constraints cannot enforce the required conflict behavior.
- A security or privacy boundary cannot be maintained.
- Reliable email delivery requires an unapproved paid service or account change.
- The proposed work begins serving hypothetical events or resource types
  instead of the approved Lone Star Retreat workflow.
- A hosted provider becomes materially simpler only because a specific native
  limitation has been demonstrated.

## Model Reasoning Guidance

- Documentation, routine interface work, and straightforward refinement:
  GPT-5.6 Sol Low or Medium.
- Booking mutations, database migrations, concurrency, authentication, privacy,
  and release review: GPT-5.6 Sol High.
- Use higher reasoning only for a demonstrated difficult architecture or
  debugging problem, then return to the lower appropriate level.

## Focus-Drift Rule

For every proposed addition, ask:

1. Is it required for the active milestone?
2. Does it solve a real Version 1 problem?
3. Can Mission 09 succeed without it?

If it is not required now, record it as deferred and do not build it.

When uncertain, prefer:

1. The smallest useful outcome
2. Existing Project North Star foundations
3. The fewest new abstractions
4. The least custom code
5. Verification before expansion

## Governing Principle

> Grand vision in planning. Tiny steps in coding.
