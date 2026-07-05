# Project North Star Changelog

## Sprint 1

### Highlights

- Established the Next.js public website foundation for Tim Bennett and
  Project North Star.
- Delivered the responsive homepage and initial Portfolio, Experiences,
  Project North Star, Lone Star Retreat, About, and Contact routes.
- Created the cinematic editorial direction, accessible navigation, shared
  page primitives, and responsive foundations.
- Approved Homepage Design Lock v1.0 as the governing visual benchmark.

### Architectural Decisions

- Tim Bennett is the primary public-facing brand; Project North Star is the
  philosophy and standard guiding his work.
- Public content remains locally structured and imagery remains replaceable
  without changing page composition.
- Portfolio content is organized as curated collections, while experiences are
  designed to expand over time.

### Breaking Changes

- None

### Next Sprint Focus

- Centralize the design system, refine production imagery and typography, and
  extend the approved homepage language across the principal public routes.

## Sprint 2

### Highlights

- Centralized design tokens, typography, spacing, components, content sources,
  and asset paths under the stable `src/` architecture.
- Refined and approved Homepage Design Lock v1.1, aligning the homepage with
  Portfolio, Private Client, Lone Star Retreat, and Workshops & Education.
- Delivered the responsive multi-page marketing foundation for Portfolio,
  Private Client, Lone Star Retreat, Workshops & Education, About Tim, and
  Contact.
- Added route metadata, sitemap and robots infrastructure, honest contact
  fallback behavior, and repository cleanup.
- Preserved the long-term North Star platform architecture around canonical
  photographer, model, and event records without prematurely implementing
  operational systems.

### Architectural Decisions

- Route files remain thin, server-rendered composition layers; owner-editable
  content lives in `src/data` until a future CMS adapter replaces it.
- Shared public routes inherit the Homepage Design Lock through reusable
  editorial hero, preview-block, and CTA components.
- Authentication, booking, applications, payments, CRM, messaging, scheduling,
  and dashboards remain outside Sprint 2.
- Small foundation exports may remain in git; large future deliverables should
  use external storage or Git LFS.

### Breaking Changes

- None

### Next Sprint Focus

- Validate Sprint 3 content-management requirements, permissions, media
  metadata, and editorial workflows before authorizing any external services or
  backend implementation.
