# Sprint 04 — Experience Manager

Status: Active — event experience and scheduling foundation

## Goal

Create a structured system for publishing and operating Lone Star Retreat,
master classes, mentoring, and future creative experiences.

## Scope

- Define experience types and lifecycle states.
- Manage dates, locations, capacity, team members, pricing visibility, and
  application or registration status.
- Build public experience detail pages from structured content.
- Add administrative scheduling and participant overview tools.
- Support announcements, requirements, and logistical updates.
- Establish clear safety, respect, professionalism, and conduct information.

## Deliverables

- Experience data model and migrations
- Experience creation and editing interface
- Public experience detail templates
- Date, venue, capacity, and status management
- Team and collaborator management
- Requirements, policies, and FAQ content
- Administrative participant overview
- Publication and archival workflow

## Decisions Made

- “Experiences” remains the public umbrella for multiple offering types.
- Lone Star Retreat is the founding experience, not the entire platform.
- Operational information must be structured rather than embedded in prose.
- Safety and professionalism requirements must be prominent and maintainable.
- Lone Star Retreat is the umbrella brand; individual retreat events are the
  products and own their public participating-artist assignments.
- Featured Artist public pages begin from a published Event record and read only
  explicitly approved event assignments linked to canonical master profiles;
  Model Applications are never a public content source.
- Public profiles require an approved profile, a published Payload version,
  confirmed image permission, approved featured media, and explicit field-level
  public-display controls.
- Public artist pages are read-only and never publish an application or promote
  an applicant automatically.

## Featured Artists progress — July 4, 2026

- [x] Event detail route created at
  `/lone-star-retreat/texas-hill-country-creative-retreat`.
- [x] Event artist index route created at
  `/lone-star-retreat/texas-hill-country-creative-retreat/artists`.
- [x] Event artist profile route created at
  `/lone-star-retreat/texas-hill-country-creative-retreat/artists/[slug]`.
- [x] Legacy global artist routes redirect into the event context.
- [x] Empty roster state implemented.
- [x] Field-level public-display approvals added to canonical artist profiles.
- [x] Approved-media-only public read policy added.
- [x] Public repository maps an allowlist and excludes applications, legal names,
  private administrator notes, unapproved media, drafts, and unapproved profiles.
- [x] Public-profile database migration applied.
- [x] Event-specific participating-artist assignment migration applied.
- [x] First real Featured Artist master profile created and published for Lexi Anne.
- [x] Lexi Anne assigned to the May 2027 event with event-specific public approval.
- [x] Version 1 test dates established: retreat May 7–9, 2027; planned model
  arrival evening May 6 remains outside the bookable event dates.
- [x] Scheduling and booking business rules approved and preserved as a
  permanent Foundation document.
- [x] Translate the approved rules into a scheduling domain model before any
  calendar or booking interface is implemented.
- [x] Define event-day availability for May 7–9 using 60-minute internal blocks
  and model-controlled minimum booking durations.
- [x] Define privacy-safe participant and shared-schedule projections plus the
  administrator-only operational record boundary before UI implementation.
- [x] Apply additive scheduling migrations and verify a private sample
  availability record and confirmed booking against the May 2027 event.
- [x] Capture the premium Calendar UX Standard as a locked requirement for the
  scheduling prototype.
- [x] Approve the PR #3 curated-itinerary direction, My Schedule default,
  privacy-restricted Retreat Schedule, editorial time ribbon, photography-led
  artist selection, mobile agenda, and administrator interaction concepts.
- [x] Implement the authorized non-public, read-only PR #3 calendar prototype
  with typed fixtures and no Payload booking access or mutations.
- [x] Prototype My Schedule, Retreat Schedule, artist selection, booking review
  and confirmation, Shape Your Day, and Administrator Master Calendar views.
- [x] Apply Product Owner Review #1 refinements: personal itinerary emphasis,
  quieter editorial navigation, restrained gold, elevated artist selection,
  and realistic three-day retreat activity using typed fixtures.
- [x] Complete Product Owner visual review and approve the Premium Calendar UX
  prototype as the implementation direction. Typography, spacing, motion timing,
  and other presentation refinements remain non-blocking.
- [x] Approve PR #4 Identity & Access Foundation architecture with a strict
  identity-and-authorization-only boundary.
- [x] Implement multiple account roles, account status, safe profile ownership,
  protected route guards, and read-only schedule projections on the dedicated
  PR #4 branch.
- [x] Apply the additive PR #4 migration and verify owner, editor, reviewer,
  photographer, model, suspended, and wrong-role boundaries.
- [x] Approve PR #5 Account Lifecycle & Security Hardening scope as the
  invitation, suspension, audit, Neon SSL, password-recovery, and mutation
  protection groundwork before live participant scheduling.
- [x] Implement and verify PR #5 on `codex/account-lifecycle-security` without
  introducing booking mutations, payments, messaging, dashboards, public signup,
  public registration, or notification automation.
- [x] Approve PR #6 Production Email & Invitation Delivery Foundation scope as
  transactional email infrastructure for invitation and password recovery only.
- [x] Implement and SendGrid-verify PR #6 on `codex/production-email-invitations`
  without introducing booking, payments, dashboards, messaging, public
  registration, marketing email, newsletters, SMS, or notification automation.
  Production email smoke verification completed July 7, 2026.

## Deferred Items

- Final payment processing
- Automated application scoring
- Contract or waiver e-signature
- Complex room assignment
- Travel booking
- Full CRM automation
- Native event mobile application

## Dependencies

- Sprint 03 authentication and content management
- Approved experience lifecycle and required fields
- Confirmed Lone Star Retreat operating model
- Decisions about application versus direct registration
- Legal review of policies, agreements, and acknowledgments where appropriate

## Acceptance Criteria

- [ ] Tim can create, edit, publish, close, and archive an experience.
- [ ] Public pages clearly show approved dates, location, capacity, status, and
  expectations.
- [ ] Lone Star Retreat content can be updated without code changes.
- [ ] Future experience types can be added without redesigning navigation or
  data architecture.
- [ ] Administrative views distinguish draft, open, full, completed, and
  archived experiences.
- [ ] Safety and professional-conduct information is visible and accessible.

## Notes for Future Codex Sessions

Do not assume every experience uses the same commercial model. Keep experience
content reusable while allowing applications, invitations, or direct
registration to be attached later. Operational clarity matters more than adding
decorative features.
