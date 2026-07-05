# Project North Star

The digital foundation for Tim Bennett Photography, Lone Star Retreat,
Project North Star, and future creative ventures.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Architecture

- `src/app/` — routes, page composition, metadata, and global styling
- `src/components/` — reusable components grouped by responsibility
- `src/data/` — navigation, page copy, image paths, and configurable content
- `src/styles/` — tokens, foundations, and shared component styling
- `src/lib/` — shared utilities and future service clients
- `public/images/` — categorized, locally optimized visual assets
- `docs/` — vision, architecture, design, content, roadmap, and Codex guidance

## Repository Asset Policy

- Small foundation exports and important project deliverables may remain
  committed to git.
- Large future exports—high-resolution mockups, large image collections,
  videos, repeated design deliverables, and similar files—should be stored
  externally or moved to Git LFS to prevent unnecessary repository growth.

The platform now uses Payload CMS and an owner-controlled Neon PostgreSQL
database for authenticated administration, private applications, canonical
participant profiles, event publishing, and the scheduling data foundation.
Most general marketing content remains in `src/data`; approved event and artist
pages use a privacy-safe Payload repository boundary.

The `/admin` route is functional and authenticated. Stripe, production email,
public booking, dashboards, messaging, and automatic profile publishing remain
intentionally unimplemented. See [`docs/architecture.md`](docs/architecture.md)
for current service boundaries and the implementation sequence.

The visual system is documented in
[`docs/design-system.md`](docs/design-system.md). New pages should use the
tokens and primitives defined there instead of introducing local visual rules.

The permanent creative philosophy for every page, feature, component, and user
experience is defined in the core Foundation document
[`docs/foundation/design-principles.md`](docs/foundation/design-principles.md).
Review it before making visual decisions.

Future Codex sessions should begin with
[`docs/codex-instructions.md`](docs/codex-instructions.md).

## Design principles

- Photography leads; interface elements remain restrained.
- Typography and spacing create luxury, rather than decorative excess.
- Semantic HTML, keyboard navigation, reduced-motion support, and responsive
  layouts are included from the beginning.
- Content and navigation data remain separate from visual components so the
  platform can expand without rebuilding its foundation.

## Recommended next phases

1. Complete Sprint 04 event-experience review and design lock.
2. Create the approved premium calendar UX prototype without public booking.
3. Define Vercel, object-storage, Neon backup, and production migration plans.
4. Harden role permissions, distributed rate limiting, and booking concurrency.
5. Continue extending Payload only through approved persistent-data workflows.
