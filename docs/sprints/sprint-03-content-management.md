# Sprint 03 — Content Management

Status: In progress — Payload/PostgreSQL foundation authorized July 3, 2026

## Goal

Give Tim a secure, maintainable way to manage website content without editing
code while preserving the current public design and content shapes.

## Scope

- Configure Payload CMS and connect an owner-controlled PostgreSQL project.
- Implement secure administrative authentication.
- Establish Owner, Editor, and Reviewer permissions.
- Connect media, portfolio, homepage, About, Experiences, and journal content.
- Add draft, preview, schedule, publish, and revision workflows.
- Replace local `src/data` reads through a stable repository adapter.
- Build practical media organization and image metadata tools.

## Deliverables

- Version-controlled Payload/PostgreSQL migrations
- Authentication and protected administrative routes
- Row Level Security policies
- Typed content repositories
- Media library with metadata and focal-point support
- Portfolio collection and ordering tools
- Homepage hero management
- Journal editor and publishing workflow
- Editable About and Experiences content
- Preview and safe publication controls

## Decisions Made

- Payload CMS is the approved content and administrative platform.
- PostgreSQL is the approved relational database.
- Lone Star Retreat is the initial implementation test bed.
- SendGrid and Stripe remain later, separately verified integrations.
- The public website and administrative studio remain separate surfaces.
- Existing `src/data` structures are the interim content contracts.
- Service-role credentials must never reach the browser.
- Draft and preview states are required before publication.
- The Lone Star Retreat Professional Standards & Code of Conduct is an approved
  Foundation document and required acknowledgment for both public applications.

## Deferred Items

- Payments
- Public application forms and automated application-to-profile promotion
- Retreat registration
- CRM synchronization
- Advanced analytics
- AI-assisted publishing
- Native mobile administration

## Dependencies

- An owner-controlled PostgreSQL database and secure connection string
- Approved database and permission model
- Confirmed administrator accounts
- Final media metadata requirements
- A deployment environment for secure preview and authentication callbacks

## Acceptance Criteria

- [ ] Tim can sign in securely to a protected administrative area.
- [ ] Unauthorized users cannot read or mutate private administrative data.
- [ ] Tim can upload and organize portfolio media.
- [ ] Tim can replace and reorder homepage hero images.
- [ ] Tim can manage portfolio collections and ordering.
- [ ] Tim can draft, preview, and publish North Star journal entries.
- [ ] Tim can update About and Experiences content without code changes.
- [ ] Published content renders through the existing public design system.
- [ ] Migrations, security policies, recovery procedures, and editorial workflow
  are documented.

## Notes for Future Codex Sessions

This is the current implementation frontier. Before coding, validate the
content model and administrative workflow with Tim. Do not create external
accounts or production resources without explicit permission. Preserve a clean
adapter boundary so public pages do not depend directly on raw Payload response
shapes.

## Foundation progress — July 3, 2026

- [x] Payload packages installed at a supported version.
- [x] Next.js pinned to a Payload-supported release.
- [x] Payload admin and REST route contracts added.
- [x] PostgreSQL adapter configured through environment variables.
- [x] Private-by-default administrator, media, and retreat-event collections added.
- [x] Payload types generated.
- [x] Public routes preserved in a separate route group.
- [x] Owner PostgreSQL database provisioned and connected.
- [x] Initial Payload owner account created.
- [x] First mock retreat saved and verified in PostgreSQL.
- [x] Canonical Model / Featured Artist collection created and migrated.
- [x] Canonical Photographer / Participant collection created and migrated.
- [x] Prototype records created through Payload Admin and verified in PostgreSQL.
- [x] Private Model Application and Photographer Application collection schemas created.
- [x] Application records kept separate from canonical master profiles.
- [x] Application imagery routed through private Media records with approval off by default.
- [x] Application migration applied and prototype submissions verified in PostgreSQL.
- [x] Version 1 public application protection endpoints implemented.
- [x] Server-side validation, honeypot, process-local IP throttling, consent rules,
  and model upload limits implemented.
- [x] Public submissions forced into private `new` review records with no automatic
  profile promotion or publishing.
- [x] Live protected Model and Photographer submissions verified in Payload Admin;
  private model media and anonymous `403` access behavior confirmed.

## Application review boundary — July 3, 2026

- Applications are private, versioned review records and are not publishable content.
- Public submissions must never write directly to canonical Model or Photographer profiles.
- Acceptance does not automatically create, update, or publish a master profile.
- Administrators may optionally link a reviewed application to a canonical profile later.
- Model application imagery remains in the authenticated Media collection. Uploading an
  image does not set `usageApproved`; public use requires a separate administrator decision.
- Public forms, automated promotion, dashboards, payments, messaging, and matching remain
  outside this implementation.

The submission protection contract is documented in
[`../application-submission-protection.md`](../application-submission-protection.md).
Public form composition and visual design remain a separate approval step.

The proposed end-to-end Photographer and Featured Artist journeys, Version 1
page inventory, status-page boundary, and implementation order are documented
in [`../lone-star-retreat-applicant-experience.md`](../lone-star-retreat-applicant-experience.md).

## Public applicant experience progress — July 3, 2026

- [x] Photographer audience landing page implemented at `/lone-star-retreat/photographers`.
- [x] Featured Artist audience landing page implemented at `/lone-star-retreat/models`.
- [x] Lone Star Retreat pathway cards connected to the audience landing pages.
- [x] Featured Artist CTA routes to the implemented Model Application.
- [x] Photographer CTA routes to the implemented Photographer Application.
- [x] Photographer Application reference page implemented and connected to the protected endpoint.
- [x] Photographer Application Received page implemented and verified without private URL data.
- [x] Model Application refined to five editorial sections with Display / Stage Name
  as the required identity, optional private Legal Name, one session-availability
  multi-select, private media uploads, and the protected submission endpoint.
- [x] Model Application Received page implemented without private URL data.
