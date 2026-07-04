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

The first release intentionally keeps content local and the dependency surface
small. Payload, PostgreSQL, authentication, Stripe, applications, and administrative tools
should be introduced as separate service layers when their workflows are
defined—not preemptively coupled to the marketing site.

The `/admin` route is a non-functional Content Studio prototype demonstrating
the intended owner experience. See
[`docs/architecture.md`](docs/architecture.md) for the proposed
Payload content model, roles, and implementation sequence.

The visual system is documented in
[`docs/design-system.md`](docs/design-system.md). New pages should use the
tokens and primitives defined there instead of introducing local visual rules.

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

1. Curate and license the definitive photography collection.
2. Refine brand copy and confirm the public contact address.
3. Build portfolio taxonomy and image-management workflow.
4. Define Lone Star Retreat application and registration requirements.
5. Extend Payload and PostgreSQL only through approved persistent-data workflows.
