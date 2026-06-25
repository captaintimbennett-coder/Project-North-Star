# Sprint 02 — Design System and Repository Architecture

Status: Complete

## Goal

Turn the approved website direction into a centralized visual system and
organize the repository for long-term platform development.

## Scope

- Define global design tokens.
- Create reusable typography, button, link, media, form, and layout primitives.
- Refactor pages to consume the shared system.
- Move application code under `src/`.
- Group components by responsibility.
- Centralize configurable content and image paths.
- Organize public image assets.
- Create project governance and architecture documentation.

## Deliverables

- `src/app` route architecture
- Responsibility-based `src/components` folders
- Centralized `src/styles` tokens and contracts
- Structured `src/data` content layer
- Categorized `public/images` folders
- Design-system documentation
- Architecture, roadmap, content strategy, master vision, and Codex instructions
- Clean production build after migration

## Decisions Made

- The `@/*` import alias resolves to `src/*`.
- Route files remain thin composition layers.
- Owner-editable content lives in `src/data` until replaced by a CMS adapter.
- Public image paths are centralized in `src/data/assets.ts`.
- Global brand changes belong in design tokens rather than page files.
- Components are grouped into layout, navigation, hero, portfolio, cards,
  forms, and buttons.
- Server components remain the default.

## Deferred Items

- Automated component documentation or Storybook
- Visual regression testing
- A packaged component library
- Final font licensing and hosted font strategy
- CMS replacement for local data modules
- Further removal of legacy CSS aliases when no longer needed

## Dependencies

- Approved Sprint 01 visual direction
- Stable page information architecture
- Next.js support for `src/app`
- Documented ownership boundaries between routes, components, data, and styles

## Acceptance Criteria

- [x] Colors, typography, spacing, motion, and layout rules are centralized.
- [x] Shared components exist for repeated interface patterns.
- [x] Application code is organized under `src/`.
- [x] Navigation, copy, collections, and image paths have predictable sources.
- [x] Required architecture and governance documents exist.
- [x] Linting, type checking, and production build pass.
- [x] Desktop and mobile visual checks show no unintended design change.

## Notes for Future Codex Sessions

Review `design-system.md`, `architecture.md`, and
`codex-instructions.md` before implementation. Do not introduce one-off colors,
type sizes, breakpoints, content sources, or component variants without first
checking the established system.
