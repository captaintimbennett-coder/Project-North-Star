# Codex Instructions for Project North Star

Read this file before making material changes.

## Foundation Pack precedence

The files in `docs/foundation/` supersede every earlier creative direction.
The North Star Constitution v1.0 governs mission, values, experience, brand,
builder, design, and technical decisions. North Star Visual Reference v1.0 is
the approved design language. When older documentation conflicts with the
Foundation Pack, follow the Foundation Pack and flag the older text for
revision.

## North star

This is the long-term digital home of Tim Bennett. Tim Bennett is the primary
public-facing brand; Project North Star is his guiding philosophy and standard.
The platform must remain premium, editorial, cinematic, maintainable,
accessible, and able to expand beyond photography.

Evaluate public-facing decisions in this order:

1. Does this help the visitor understand who Tim Bennett is?
2. Does this express the Project North Star philosophy?

## Required context

Before implementation work, review:

1. `docs/sprints/README.md`
2. the current sprint file in `docs/sprints/`
3. `docs/master-vision.md`
4. `docs/architecture.md`
5. `docs/design-system.md`
6. `docs/brand/design-philosophy.md`
7. `docs/brand/visual-language.md`
8. `docs/brand/references/README.md`
9. every documented asset in `docs/brand/references/`
10. `docs/roadmap.md`
11. `docs/content-strategy.md`

## Working rules

1. Preserve the approved visual direction unless Tim explicitly requests a
   change.
2. Do not hard-code owner-editable content in route files. Put it in
   `src/data`, or in the future CMS layer.
3. Use existing components and design tokens before creating new variants.
4. Keep route files thin and server-rendered by default.
5. Add `"use client"` only when browser state or interaction requires it.
6. Put components in the folder matching their responsibility.
7. Reference public imagery through `src/data/assets.ts`.
8. Update documentation when architecture, content rules, or design standards
   materially change.
9. Avoid speculative integrations and premature abstractions.
10. Preserve user changes and inspect the working tree before editing.
11. Keep the current sprint file updated when scope, decisions, dependencies,
    deferred items, or acceptance status materially change.
12. Treat Sprint 02 and Homepage Design Lock v1.1 as closed. New visual work
    must extend the approved system and remain within the active sprint scope.

## Where changes belong

- navigation: `src/data/navigation.ts`
- site identity, email, metadata, footer: `src/data/site.ts`
- homepage content and hero: `src/data/home.ts`
- portfolio collections: `src/data/portfolio.ts`
- experiences: `src/data/experiences.ts`
- North Star journal previews: `src/data/north-star.ts`
- About and Contact copy: `src/data/pages.ts`
- image paths: `src/data/assets.ts`
- color, type, spacing, motion: `src/styles/tokens.css`
- shared component styling: `src/styles/components.css`
- page composition styling: `src/app/globals.css`

## Component standard

Create a component when a pattern:

- appears more than once,
- owns interaction or state,
- has a stable visual contract, or
- materially simplifies a route.

Prefer small composable components over a large universal component with many
boolean props.

## Verification

For implementation changes:

1. Run `pnpm lint`.
2. Run `pnpm typecheck`.
3. Run `pnpm build`.
4. Visually check affected pages at desktop and compact mobile widths.
5. Check browser console errors and horizontal overflow.

## Safety and product judgment

- Do not publish, deploy, connect paid services, or create external accounts
  without explicit authorization.
- Treat `/admin` as an authenticated Payload surface backed by PostgreSQL.
  Preserve private-by-default collection access and explicit public projections.
- Do not imply that contact forms, payments, applications, or publishing tools
  are functional unless they are connected and verified.
- Challenge requests that would create avoidable technical debt or weaken
  safety, privacy, accessibility, or brand coherence.
