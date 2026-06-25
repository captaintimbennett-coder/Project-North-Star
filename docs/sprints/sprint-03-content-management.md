# Sprint 03 — Content Management

Status: Planned

## Goal

Give Tim a secure, maintainable way to manage website content without editing
code while preserving the current public design and content shapes.

## Scope

- Define and create the Supabase project and schema migrations.
- Implement secure administrative authentication.
- Establish Owner, Editor, and Reviewer permissions.
- Connect media, portfolio, homepage, About, Experiences, and journal content.
- Add draft, preview, schedule, publish, and revision workflows.
- Replace local `src/data` reads through a stable repository adapter.
- Build practical media organization and image metadata tools.

## Deliverables

- Version-controlled Supabase migrations
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

- Supabase is the preferred initial content, authentication, and relational data
  platform.
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

- Explicit authorization to create or connect a Supabase project
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
adapter boundary so the public pages do not depend directly on raw Supabase
response shapes.
