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

## Deferred Items

- Payments
- Application workflows
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
