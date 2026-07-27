# Lone Star Retreat — Working Checklist

Last updated: July 25, 2026

This is the shared Product Owner checklist for the next stage of Lone Star
Retreat. Update it whenever an item is approved, completed, deferred, or changed.

## 1. Sprint 03 Foundation Lock

- [x] Photographer Application implemented
- [x] Featured Model Application implemented
- [x] Application Received pages implemented
- [x] Application validation and private upload protections verified
- [x] Professional Standards & Code of Conduct created and integrated
- [x] Project North Star Design Principles created and indexed
- [x] Product Owner final review of Photographer Application
- [x] Product Owner final review of Featured Model Application
- [x] Declare Sprint 03 application foundation locked
- [x] Repository review and documentation check
- [x] Commit and push approved Sprint 03 work

## 2. Event-Scoped Participating Artist Experience

- [x] Approve information architecture for Meet the Artists
- [x] Define approved public fields from the Model Master Profile
- [x] Define privacy boundary between applications and public profiles
- [ ] Create static Meet the Artists visual concept
- [ ] Approve directory art direction
- [x] Build event-scoped Meet the Artists directory
- [ ] Create static Featured Artist profile visual concept
- [ ] Approve profile art direction
- [x] Build event-scoped individual artist profile route
- [x] Verify responsive layout and accessibility
- [ ] Product Owner review and design lock

## 3. CMS-to-Public Profile Workflow

- [ ] Define manual application-to-profile promotion workflow
- [x] Define public approval fields and image approval behavior
- [x] Connect event artist directory to approved CMS profiles and assignments
- [x] Connect event-scoped profiles to approved CMS records
- [x] Verify applications never publish automatically
- [x] Verify unapproved, unpublished, and unassigned artists remain private
- [ ] Document administrator workflow

## 4. Retreat Event Experience

- [ ] Approve Upcoming Retreats information architecture
- [ ] Build Upcoming Retreats calendar/listing page
- [x] Define prototype event-detail information architecture
- [x] Build prototype retreat event page
- [x] Connect participating artists through event-specific assignments
- [ ] Connect participating photographers where appropriate
- [x] Add schedule and logistics placeholders
- [x] Add policies and FAQ presentation
- [x] Verify responsive layout and accessibility
- [ ] Product Owner review and design lock

## 5. Scheduling Foundation

- [x] Approve Scheduling & Booking Business Rules v1.0
- [x] Establish May 14–16, 2027 as the Founders Edition retreat window
- [x] Create event-specific availability and booking records
- [x] Apply migrations and verify private sample records
- [x] Capture the premium Calendar UX Standard
- [x] Approve the final premium calendar UX direction
- [x] Define My Schedule, Retreat Schedule, administrator, mobile, and privacy
  requirements for PR #3
- [x] Authorize and build the non-public read-only calendar prototype using
  typed fixtures with no live booking connection
- [x] Complete Product Owner visual review and approve the PR #3 Premium
  Calendar UX prototype
- [x] Verify transaction-level concurrency protection before participant
  booking access: artist/day advisory locks and both PostgreSQL overlap
  constraints passed Mission 09 Milestone 3 race validation
- [x] Complete Mission 09 Milestone 4 required booking, administrator
  cancellation, and administrator rescheduling email with two-recipient
  delivery visibility and safe retry
- [x] Complete Mission 09 Milestone 5.1 by connecting the approved visual My
  Schedule experience to each authenticated photographer or Featured Artist's
  real, allowlisted private itinerary
- [x] Complete Mission 09 Milestone 5.2 locally by connecting the approved
  Shape Your Day experience to each authenticated Featured Artist's real
  retreat-day availability, privacy-safe protected session times, and
  server-enforced save workflow
- [x] Complete Mission 09 Milestone 5.3 locally by connecting the approved
  Schedule a Shoot experience to each authenticated photographer's real
  eligible Featured Artists, event-local windows, review step, and protected
  immediate-confirmation workflow
- [x] Complete Product Owner visual acceptance of Mission 09 Milestones
  5.1–5.3 at desktop and mobile widths using isolated temporary participant
  records, then remove the temporary data and restore the original development
  records
- [x] Complete Mission 09 Milestone 5.4A Shared Retreat Schedule as an
  authenticated, read-only, privacy-safe participant view with Featured Artist
  name, event-local time, and confirmed or administrator-review status only
- [x] Complete Mission 09 Milestone 5.4B-1 as an authenticated, read-only
  administrator Master Calendar with event-day selection, every booking's
  photographer, Featured Artist, event-local time, and status, and a separate
  cancelled/rescheduled history
- [x] Complete Mission 09 Milestone 5.4B-2 as one owner/editor cancellation
  control using the existing protected cancellation service, mandatory private
  reason, authoritative calendar refresh, audit record, and two participant
  email intents
- [x] Complete Mission 09 Milestone 5.4B-3 as one owner/editor reschedule of
  the same retreat, Featured Artist,
  photographer, and duration using only server-derived conflict-free times,
  mandatory private reason, authoritative refresh, audit record, and two
  participant email intents

## 6. Future Operational Systems — Deferred

- [ ] Automated scheduling reminders beyond required transactional delivery
- [ ] Stripe registration and payments
- [ ] Public scheduling and booking tools
- [ ] Applicant and member dashboards
- [ ] Messaging
- [ ] Automated matching

These systems remain deferred until the public retreat experience and CMS
approval workflow are complete and approved.

## 7. Identity & Access Foundation — PR #4

- [x] Approve identity and authorization architecture
- [x] Create `codex/identity-access-foundation` from `main`
- [x] Define multiple account roles and account status
- [x] Lock Payload Admin to active administrator accounts
- [x] Restrict role and account-status changes to owners
- [x] Add unique account-to-profile relationships
- [x] Add protected sign-in and minimal access-verification routes
- [x] Add read-only, role-filtered schedule projection
- [x] Apply and verify the additive identity migration
- [x] Complete administrator, photographer, model, suspended, and wrong-role
  access testing
- [ ] Product Owner review and PR #4 approval

## Current Focus

**Next item:** Executive visual review of the completed Mission 09 Milestone
5.4B-3 one-booking rescheduling workflow. Do not begin another administrator
control until this checkpoint is accepted. Do not add drag-and-drop, free-form
time entry, reassignment, duration changes, override, manual conflict
resolution, bulk changes, payments, messaging, or any broader administrator
workflow.
