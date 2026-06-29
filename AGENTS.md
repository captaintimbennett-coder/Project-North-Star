# Project North Star Agent Guide

Read this file before making material changes to the repository.

## Project purpose

Project North Star is the long-term digital home of Tim Bennett. Tim Bennett is
the primary public-facing brand; Project North Star is his guiding philosophy
and standard. Keep the platform premium, editorial, cinematic, maintainable,
accessible, and able to expand beyond photography.

Evaluate public-facing decisions in this order:

1. Does this help the visitor understand who Tim Bennett is?
2. Does this express the Project North Star philosophy?

## Required context

Before substantial work, read:

1. `docs/codex-instructions.md`
2. `docs/sprints/README.md` and the current sprint file
3. `docs/master-vision.md`
4. `docs/architecture.md`
5. `docs/design-system.md`
6. `docs/brand/design-philosophy.md`
7. `docs/brand/visual-language.md`
8. `docs/brand/references/README.md`
9. `docs/roadmap.md`
10. `docs/content-strategy.md`

## Repository map

```text
.
├── AGENTS.md              Agent operating rules
├── README.md              Human introduction and local setup
├── docs/                  Vision, architecture, brand, plans, and sprints
├── public/images/         Static imagery grouped by editorial purpose
├── src/app/               Next.js routes and page composition
├── src/components/        Reusable interface components
├── src/data/              Editable content, configuration, and asset paths
├── src/lib/               Shared utilities and future service clients
└── src/styles/            Design tokens and shared styling
```

See `docs/project-blueprint.md` for the reusable new-project structure.

## Working rules

- Preserve the approved visual direction unless Tim explicitly changes it.
- Never move or rename the project folder without Tim's explicit approval.
- Preserve user changes and inspect Git status and the relevant diff first.
- Keep route files thin and server-rendered by default.
- Add `"use client"` only for genuine browser state or interaction.
- Keep owner-editable content in `src/data` or the future CMS layer.
- Reuse existing components and design tokens before creating variants.
- Reference public imagery through `src/data/assets.ts`.
- Update documentation when architecture, scope, or standards change.
- Avoid speculative integrations and unnecessary dependencies.
- Do not publish, deploy, merge, connect paid services, or create external
  accounts without explicit authorization.
- Never imply unfinished forms, payments, publishing, or admin tools work.

## Where changes belong

- Routes and page composition: `src/app/`
- Reusable presentation: `src/components/`
- Editable content and configuration: `src/data/`
- Image paths: `src/data/assets.ts`
- Design tokens: `src/styles/tokens.css`
- Shared component styling: `src/styles/components.css`
- Page-composition styling: `src/app/globals.css`

## Verification

For implementation changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Also visually check affected pages at desktop and compact mobile widths,
including the browser console, keyboard navigation, focus, reduced motion,
contrast, image behavior, and horizontal overflow when relevant.

## Git and delivery

- Keep commits focused and do not stage unrelated changes.
- Use a `codex/` branch unless Tim requests another strategy.
- Push or open a pull request only when explicitly requested.
- Default pull requests to draft unless Tim asks for a ready review.
- Never merge a pull request without explicit authorization.

`docs/codex-instructions.md` contains the fuller Project North Star guidance.
Follow the more specific documented rule when additional detail is provided.
