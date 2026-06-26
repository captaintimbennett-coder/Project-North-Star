# Sprint 02 — Design System and Visual Refinement

Status: In progress

## Goal

Turn the approved website direction into a centralized visual system, organize
the repository for long-term platform development, and refine the public visual
experience until Tim approves the design as ready for content-management work.

## Scope

- Define global design tokens.
- Create reusable typography, button, link, media, form, and layout primitives.
- Refactor pages to consume the shared system.
- Move application code under `src/`.
- Group components by responsibility.
- Centralize configurable content and image paths.
- Organize public image assets.
- Create project governance and architecture documentation.
- Evaluate and finalize the display and body typography.
- Replace prototype imagery with Tim Bennett’s selected photography.
- Refine image crops, focal points, sequencing, and responsive presentation.
- Review page composition, rhythm, hierarchy, and transitions across routes.
- Complete desktop, tablet, and mobile visual refinement.

## Deliverables

- `src/app` route architecture
- Responsibility-based `src/components` folders
- Centralized `src/styles` tokens and contracts
- Structured `src/data` content layer
- Categorized `public/images` folders
- Design-system documentation
- Architecture, roadmap, content strategy, master vision, and Codex instructions
- Clean production build after migration
- Approved font direction and implementation
- Curated final or approved interim photography
- Finalized image crops and sequencing for current public pages
- Completed visual review across supported breakpoints

## Decisions Made

- The `@/*` import alias resolves to `src/*`.
- Route files remain thin composition layers.
- Owner-editable content lives in `src/data` until replaced by a CMS adapter.
- Public image paths are centralized in `src/data/assets.ts`.
- Global brand changes belong in design tokens rather than page files.
- Components are grouped into layout, navigation, hero, portfolio, cards,
  forms, and buttons.
- Server components remain the default.
- The current visual foundation is strong but is not considered final.
- Typography, photography, crops, spacing, and page composition remain open to
  deliberate refinement within the approved luxury editorial direction.
- Compact navigation must preserve inverse contrast on both home and interior
  pages when the full-screen menu is open, and background page scroll should be
  locked while the menu is active.

## Deferred Items

- Automated component documentation or Storybook
- Visual regression testing
- A packaged component library
- CMS replacement for local data modules
- Further removal of legacy CSS aliases when no longer needed

## Dependencies

- Approved Sprint 01 visual direction
- Stable page information architecture
- Next.js support for `src/app`
- Documented ownership boundaries between routes, components, data, and styles
- Tim’s font preferences and any required licensing decisions
- Tim’s selected final photography and usage metadata
- Visual review and approval of each principal public route

## Acceptance Criteria

- [x] Colors, typography, spacing, motion, and layout rules are centralized.
- [x] Shared components exist for repeated interface patterns.
- [x] Application code is organized under `src/`.
- [x] Navigation, copy, collections, and image paths have predictable sources.
- [x] Required architecture and governance documents exist.
- [x] Linting, type checking, and production build pass.
- [x] Desktop and mobile visual checks show no unintended design change.
- [ ] Display and body fonts are reviewed and approved.
- [ ] Final or approved interim Tim Bennett photography replaces prototype
  imagery.
- [ ] Hero and portfolio focal points, crops, and sequencing are approved.
- [ ] Homepage and principal public routes receive final visual review at
  desktop, tablet, and mobile widths.
- [ ] Tim explicitly approves Sprint 02 as complete before Sprint 03 begins.

## Notes for Future Codex Sessions

Review `design-system.md`, `architecture.md`, and
`codex-instructions.md` before implementation. Do not introduce one-off colors,
type sizes, breakpoints, content sources, or component variants without first
checking the established system. Treat the existing site as an approved
foundation, not a frozen final design. Continue refining it within Sprint 02
until Tim explicitly approves the typography, photography, imagery treatment,
and overall public presentation.

June 25 refinement pass: production preview checks covered the homepage,
Portfolio, Experiences, Project North Star, About, and Contact at desktop and
tablet and compact widths. A compact-menu contrast issue on interior pages was
corrected. Final font, photography, crop, and overall presentation approval
remain open.
