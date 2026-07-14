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
  `/lone-star-retreat/founders-edition`.
- [x] Event artist index route created at
  `/lone-star-retreat/founders-edition/artists`.
- [x] Event artist profile route created at
  `/lone-star-retreat/founders-edition/artists/[slug]`.
- [x] Legacy Texas Hill Country route redirects into the Founders Edition route.
- [x] Legacy global artist routes redirect into the event context.
- [x] Empty roster state implemented.
- [x] Field-level public-display approvals added to canonical artist profiles.
- [x] Approved-media-only public read policy added.
- [x] Public repository maps an allowlist and excludes applications, legal names,
  private administrator notes, unapproved media, drafts, and unapproved profiles.
- [x] Public-profile database migration applied.
- [x] Event-specific participating-artist assignment migration applied.
- [x] First real Featured Artist master profile created and published for Lexi Anne.
- [x] Lexi Anne assigned to the May 2027 Founders Edition with edition-specific public approval.
- [x] Version 1 test dates established: retreat May 14–16, 2027; planned model
  arrival evening May 13 remains outside the bookable retreat dates.
- [x] Scheduling and booking business rules approved and preserved as a
  permanent Foundation document.
- [x] Translate the approved rules into a scheduling domain model before any
  calendar or booking interface is implemented.
- [x] Define retreat-day availability for May 14–16 using 60-minute internal blocks
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
- [x] Deploy Project North Star to Vercel at
  `https://timbennettproductions.com` and confirm public homepage, Payload
  Admin login, owner/admin access, CMS collections, and database connectivity.
- [x] Complete PR #7 production hardening: route smoke tests, production email
  smoke tests, SendGrid key rotation, media storage risk documentation, and Neon
  SSL follow-up.
- [x] Complete Mission 04 Application Email Foundation using the existing
  SendGrid/Payload transactional email infrastructure. Model and photographer
  applications now send receipt-only applicant confirmations and minimal
  internal admin notifications after the private application record is created,
  without acceptance, decline, waitlist, payment, marketing, SMS, or CRM
  automation.
- [x] Complete PR #9 production media storage foundation with Vercel Blob as the
  approved durable object-storage standard for Payload media uploads.
  Production verification completed July 8, 2026: Payload Admin upload,
  redeploy persistence, and production-domain media delivery were verified.
- [x] Complete PR #10 Lone Star Retreat domain integration so
  `https://thelonestarretreat.com` acts as the public marketing domain for the
  Founders Edition while preserving the single Project North Star application
  and deployment.
- [x] Complete Sprint 04A public experience verification and administrative
  closeout. `https://thelonestarretreat.com` resolves to the Founders Edition
  root experience through the existing Project North Star Vercel deployment.
- [ ] Complete Sprint 04B Retreat Operations Foundation as an architecture-only
  sprint before implementing production booking, payments, calendars,
  dashboards, messaging, or notification workflows.
- [x] Complete Mission 05 Booking & Scheduling Foundation. The verified scope
  activates the existing event-specific booking and artist-availability models
  with authenticated photographer booking, model availability management,
  role-specific personal itineraries, administrator controls, privacy-safe
  projections, and database-enforced conflict prevention. Payments, public
  booking, internal messaging, SMS, calendar sync, and automated booking email
  delivery remain out of scope.
- [x] Implement Mission 06 Featured Artist Recruitment Ready on its dedicated
  feature branch. The approved scope adds recruitment essentials, reduces the
  initial application by making biography optional, separates private-review
  and draft publication permission, adds application-specific email routing,
  sends an idempotent branded acceptance email after successful public profile
  and event publication, exposes delivery failure and retry state, and replaces
  private-review media alt text at publication. Deployment, production email,
  and production smoke testing remain separately authorized stop points.
- [x] Reconcile the July 14 production migration-runner incident. Payload
  applied the validated Mission 05 and Mission 06 migrations together in batch
  18 because it scans the physical migration directory independently of the
  exported registry. Production schema matched validation exactly, existing
  records remained unchanged, historical consent remained false, and no email
  was sent. Pre- and post-migration Neon checkpoints are retained. A guarded
  host-and-allowlist migration wrapper now prevents the same procedure failure.
- [x] Complete the Mission 06 production deployment and controlled recruitment
  validation. Domain-authenticated SendGrid mail uses
  `applications@thelonestarretreat.com`, replies route to Tim, and the initial
  `_dmarc` monitoring policy is published with aggregate reports directed to
  Tim. Production recovery remains anchored by the retained pre- and
  post-migration Neon checkpoints.
- [ ] Close the remaining Mission 06 operational gate by obtaining SendGrid
  Consumer Trust approval and moving the account off the trial before September
  5, 2026. Transactional delivery is currently operational, but the trial is not
  an acceptable long-term production dependency.

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
- [x] Lone Star Retreat can be reached through its own marketing domain without
  duplicating the application or deployment.
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
