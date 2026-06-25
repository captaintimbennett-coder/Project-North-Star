# Project North Star Architecture

Version 1.0 — June 25, 2026

## Purpose

Project North Star is organized as a long-lived platform rather than a
single-purpose portfolio. The architecture separates routes, reusable
presentation, configurable content, design rules, and future service
integrations so each can evolve independently.

## Repository map

```text
.
├── docs/
│   ├── master-vision.md
│   ├── design-system.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── content-strategy.md
│   └── codex-instructions.md
├── public/
│   └── images/
│       ├── hero/
│       ├── portfolio/
│       ├── lone-star-retreat/
│       └── behind-the-scenes/
└── src/
    ├── app/
    ├── components/
    │   ├── layout/
    │   ├── navigation/
    │   ├── hero/
    │   ├── portfolio/
    │   ├── cards/
    │   ├── forms/
    │   └── buttons/
    ├── styles/
    ├── data/
    └── lib/
```

## Responsibilities

### `src/app`

Next.js App Router routes, route metadata, and page composition. Route files
should remain thin. They select content from `src/data` and compose components;
they should not become storage for substantial copy or repeat UI patterns.

### `src/components`

Reusable React presentation organized by responsibility:

- `layout` — containers, page introductions, typography, site chrome, footer,
  and media frames
- `navigation` — primary navigation and future navigation variants
- `hero` — hero compositions
- `portfolio` — portfolio-specific grids and gallery presentation
- `cards` — repeatable content-card patterns
- `forms` — labeled form controls and future form assemblies
- `buttons` — buttons, action links, text links, and icons

A component belongs here when it is reused, owns a distinct interaction, or
encapsulates a meaningful presentation pattern.

### `src/styles`

The visual source of truth:

- `tokens.css` — colors, typography, spacing, layout dimensions, motion, and
  responsive standards
- `foundation.css` — reset, body defaults, typography roles, focus, selection,
  and accessibility foundations
- `components.css` — shared component contracts

`src/app/globals.css` imports these files and contains site-shell and
page-composition rules only.

### `src/data`

Structured local content and configuration:

- `assets.ts` — stable public image paths
- `navigation.ts` — primary navigation
- `site.ts` — identity, contact details, metadata, and footer configuration
- `home.ts` — homepage copy and configuration
- `portfolio.ts` — portfolio introduction and collections
- `experiences.ts` — experience listings and Lone Star Retreat introduction
- `north-star.ts` — North Star introduction and journal previews
- `pages.ts` — About and Contact content
- `admin.ts` — Content Studio prototype labels

These modules are the temporary local content layer. Future CMS repositories or
queries should implement equivalent typed shapes so page components do not need
to be redesigned when content moves to Supabase.

### `src/lib`

Shared utilities, external clients, validation, formatting, and server-side
helpers. It is intentionally empty until a genuine shared utility exists.
Avoid creating miscellaneous helper files without a clear responsibility.

### `public/images`

Static media grouped by editorial purpose. Pages reference assets through
`src/data/assets.ts`, not by scattering raw image paths through components.

## Import convention

The `@/*` alias resolves to `src/*`.

```ts
import { Container } from "@/components/layout";
import { homeContent } from "@/data/home";
```

Use aliases across responsibility boundaries. Relative imports are acceptable
inside a single component or data folder.

## Content boundary

Content that an owner or editor may eventually change belongs in `src/data`, not
inside a route. Examples include:

- navigation labels
- hero images and copy
- portfolio collections
- page introductions
- journal previews
- contact details
- experience descriptions

Purely structural or accessibility text may remain in components when it is
part of the component contract.

## Future service architecture

- Hosting and deployment: Vercel
- Content, authentication, and relational data: Supabase
- Initial media storage: Supabase Storage
- Payments: Stripe when paid workflows are approved
- Transactional email: a dedicated provider called from secure server actions

The public website and administrative studio should remain separate surfaces
backed by one content model.

## Planned content model

- `site_settings`
- `media_assets`
- `portfolio_collections`
- `portfolio_items`
- `experiences`
- `journal_entries`
- `pages`
- `contact_submissions`

Supabase Row Level Security should enforce Owner, Editor, and Reviewer roles.
Service-role credentials must never reach the browser.

## Architectural rules

1. Preserve server components by default; add `"use client"` only for actual
   browser state or interaction.
2. Prefer composition over large configurable “do everything” components.
3. Keep content, presentation, and service access separate.
4. Add dependencies only when they materially reduce complexity.
5. Never couple the public page layout directly to a vendor response shape.
6. Treat accessibility, responsive behavior, and performance as baseline
   requirements.
7. Record material architecture changes in this document.
