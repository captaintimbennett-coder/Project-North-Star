# Sprint 02 — Design System and Visual Refinement

Status: Complete

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
- Build the principal public multi-page marketing foundation for Portfolio,
  Private Client, Lone Star Retreat, Workshops & Education, About Tim, and
  Contact.

## Deliverables

- `src/app` route architecture
- Responsibility-based `src/components` folders
- Centralized `src/styles` tokens and contracts
- Structured `src/data` content layer
- Categorized `public/images` folders
- Design-system documentation
- Architecture, roadmap, content strategy, master vision, and Codex instructions
- Brand design philosophy and visual-language documentation
- Brand reference library documentation
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
- The refined Sprint 02 direction should move away from a modern SaaS aesthetic
  toward a premium editorial luxury brand while preserving the existing UX,
  navigation, responsiveness, component structure, and accessibility foundation.
- The goal is not a dark website. Dark tones should create atmosphere, light
  surfaces should provide balance, and gold should remain an accent.
- Future visual refinements should be guided by `docs/brand/design-philosophy.md`
  `docs/brand/visual-language.md`, and the documented assets in
  `docs/brand/references/`.
- The architect review approved the design-direction report’s emphasis on
  visual refinement rather than structural redesign. Future implementation
  should treat the current application as a mature architectural foundation and
  refine the experience incrementally.
- Future visual decisions should be evaluated as part of the visitor’s emotional
  journey, not only as isolated component improvements.
- Every visual refinement should support the visitor’s journey from curiosity
  to confidence.
- Page-level emotional objectives are lightweight review aids for future visual
  decisions, not requirements to redesign approved page architecture: Home →
  inspiration, About → trust, Portfolio → wonder, Workshops → confidence, Lone
  Star Retreat → anticipation, and Contact → simplicity.
- The Phase 1 construction strategy is approved for implementation. Phase 1A
  must approve the final palette, display typography, Approved Hero Study
  (Temporary Creative Asset), and wordmark treatment before Phase 1B begins.
- The approved hero study validates the design system and is not expected to
  become the permanent homepage image. The approved homepage proof should
  define the creative requirements for the future Project North Star production
  shoot.
- The homepage remains the required Phase 1 proof-of-concept before approved
  refinements are propagated across the application.
- Phase 1A and Phase 1B have produced a homepage-only proof for architectural
  review. The proof uses `homepage-hero-study-v1.jpg` as the Approved Hero Study
  (Temporary Creative Asset), defines the refined Phase 1 palette and display
  roles as shared tokens, and activates those tokens only within the homepage.
- The homepage proof has passed linting, type checking, production build,
  browser-console, overflow, semantic-structure, compact-navigation, and visual
  checks at 1280px, 980px, and 390px widths. Broader propagation remains blocked
  pending architectural approval.
- Architect review approved Homepage Proof v1 as the Phase 1 direction and
  requested a refinement pass centered on unmistakable Project North Star
  identity. Three additional temporary hero studies explore threshold,
  craftsmanship, and ascent. The craftsmanship-led Maker study advances to the
  next proof with a purpose-and-direction narrative; the other studies remain
  comparison assets rather than production photography.
- Homepage Proof v2 clarifies the public brand hierarchy: Tim Bennett is the
  primary brand, and Project North Star is the philosophy guiding his work. The
  homepage now introduces Tim first, uses a feminine editorial-glamour hero
  study closer to his portrait style, and positions Project North Star beneath
  the artist rather than in place of him.
- The final brand-architecture correction establishes Tim Bennett as the
  photographer, educator, creator, mentor, and primary public brand. Project
  North Star represents his philosophy and standard: direction, purpose,
  excellence, craftsmanship, and legacy. Homepage Proof v2 now follows the
  sequence: meet Tim, understand his beliefs, discover his experiences, and
  choose how to work with him.
- No implementation redesign should begin until reference assets are added to
  `docs/brand/references/`, documented in `docs/brand/references/README.md`,
  and reviewed.
- Compact navigation must preserve inverse contrast on both home and interior
  pages when the full-screen menu is open, and background page scroll should be
  locked while the menu is active.
- Principal marketing routes inherit Homepage Design Lock v1.1 through a shared
  editorial hero, preview-block, and closing-CTA composition. Future services
  remain clearly labeled as forthcoming and are not simulated.

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
- Reference assets for the Project North Star mood board, logo, and visual
  inspiration
- Reference-library descriptions explaining the purpose of each asset
- Design Direction Report and architect review approval
- Visual review and approval of each principal public route

## Acceptance Criteria

- [x] Colors, typography, spacing, motion, and layout rules are centralized.
- [x] Shared components exist for repeated interface patterns.
- [x] Application code is organized under `src/`.
- [x] Navigation, copy, collections, and image paths have predictable sources.
- [x] Required architecture and governance documents exist.
- [x] Brand documentation area exists for the updated design direction.
- [x] Brand reference library README exists.
- [x] Design Direction Report exists and has received architect review.
- [x] Linting, type checking, and production build pass.
- [x] Desktop and mobile visual checks show no unintended design change.
- [x] Display and body fonts are reviewed and approved.
- [x] Final or approved interim Tim Bennett photography replaces prototype
  imagery.
- [x] Reference assets are added to `docs/brand/references/`, documented, and
  reviewed before visual redesign implementation begins.
- [x] Hero and portfolio focal points, crops, and sequencing are approved.
- [x] Phase 1 homepage proof is implemented and verified at desktop, tablet,
  and mobile approval widths.
- [x] Phase 1 homepage proof receives architectural approval before tokens are
  propagated beyond the homepage.
- [x] Homepage and principal public routes receive final visual review at
  desktop, tablet, and mobile widths.
- [x] Principal marketing routes receive Tim's visual and content approval.
- [x] Tim explicitly approves Sprint 02 as complete before Sprint 03 begins.

## Notes for Future Codex Sessions

Review `design-system.md`, `architecture.md`, and
`codex-instructions.md` before implementation. Do not introduce one-off colors,
type sizes, breakpoints, content sources, or component variants without first
checking the established system. Treat the existing site as an approved
foundation, not a frozen final design. Continue refining it within Sprint 02
until Tim explicitly approves the typography, photography, imagery treatment,
and overall public presentation.

June 26 design-direction update: brand documentation was added under
`docs/brand/` to clarify that Sprint 02 should evolve toward a premium
editorial luxury identity rather than a modern SaaS aesthetic. The current UX,
component architecture, responsive behavior, and accessibility foundation remain
valid. Do not begin visual redesign implementation until Tim adds and reviews
the reference assets.

June 26 brand-reference update: `docs/brand/references/README.md` was added as
the permanent reference-library catalog. Future reference assets should be
documented there with their purpose and influence before significant visual
design work begins. Reference assets are brand guidance, not templates to copy.

June 26 architect review: the Design Direction Report was accepted as aligned
with the intended Project North Star direction. Future implementation should
proceed from the report’s prioritized roadmap, preserve the existing
architecture, and refine the site as an emotional journey through inspiration,
trust, wonder, confidence, anticipation, and simplicity.

June 26 Phase 1 homepage proof: Phase 1A creative direction and Phase 1B token
refinement were implemented as a homepage-only proof. The temporary hero study
was generated specifically to validate composition, typography, atmosphere,
negative space, overlay treatment, emotional impact, and responsive behavior.
The proof is verified and implementation is paused for architectural review.

June 26 Homepage Proof v1 architect review: the atmosphere, architecture, and
Phase 1 direction were approved. The next bounded refinement strengthens
identity without redesigning the page. Hero Study v3 (Maker) was selected from
three new studies because it most clearly joins disciplined photography,
creative vision, purpose, and legacy. The headline direction now centers the
idea that direction begins with purpose.

June 26 Homepage Proof v2 direction: the architect clarified that Tim Bennett
is the primary public-facing brand and Project North Star is the guiding
philosophy. The v2 proof preserves the approved architecture and visual system
while strengthening Tim’s presence, adopting an editorial-glamour portrait
study, and reframing the hero around the art and confidence of being fully seen.

June 27 Homepage Proof v2 creative reset: the platform is now explicitly
understood as Tim Bennett's digital headquarters—not simply an introduction to
Tim as a photographer. The homepage narrative should move from the world Tim
has built, to the vision behind it, to Project North Star as the philosophy, to
the experiences created through that philosophy, and finally to an invitation
to participate. The Tim Bennett Platform Ecosystem infographic is a hierarchy
and narrative reference only; its diagrammatic layout, boxes, icons, and
connectors must not be reproduced in the interface.

July 1 Homepage Design Lock v1.0: Tim approved the homepage structure, visual
language, production portrait treatment, North Star symbol, signature, and
editorial hierarchy as the production-quality baseline for the rest of the
platform. The final polish lowered the hero portrait optically without changing
its scale, refined a small set of tracking and line-height values, and preserved
the existing black/charcoal palette to retain shadow detail. Future routes should
extend this locked system; the homepage should not be redesigned without Tim's
explicit direction. This July 1 note was superseded by the July 2 acceptance
below, which closed Sprint 02 after the principal public routes were approved.

June 27 hero-content correction: the homepage hero no longer begins with a
marketing headline. It begins with the canonical Tim Bennett identity, the
roles Photographer · Educator · Creator · Mentor, and the five-line brand
statement beginning “I create images.” Project North Star follows as the
guiding philosophy. This content order is foundational and should not be
replaced with campaign language in future refinements.

June 27 Homepage Proof v3 opening chapter: the opening image now establishes
Tim Bennett as the real person behind the platform. His editorial portrait,
canonical roles, and foundational manifesto form the first chapter. The
temporary glamour study moves into the body of the homepage, where it
demonstrates the work and experiences created through the brand. The sequence
is person, belief, Project North Star, experiences, then invitation; the
approved architecture and design system remain unchanged.

June 25 refinement pass: production preview checks covered the homepage,
Portfolio, Experiences, Project North Star, About, and Contact at desktop and
tablet and compact widths. A compact-menu contrast issue on interior pages was
corrected. Final font, photography, crop, and overall presentation approval
remain open.

June 30 Foundation Pack fidelity correction: North Star Visual Reference v1.0
is the production target, not general inspiration. Homepage v1.0 follows the
approved sequence: Hero; Portfolio / Lone Star / Private Client pathways; The
Experience; three bordered feature cards; and the centered closing quote. The
reference governs composition, proportions, spacing, portrait treatment,
typographic hierarchy, black-charcoal environment, warm-gold accents, and
section rhythm. Earlier homepage narrative notes remain historical context but
do not override the Foundation Pack.

July 1 Homepage Design Lock v1.1: the locked homepage pathway row was refined
to represent the platform's four permanent business pillars: Portfolio, Private
Client, Lone Star Retreat, and Workshops & Education. This is a business-
alignment update only. The approved Hero, typography, spacing, palette,
cinematic treatment, experience section, closing quote, and overall composition
remain unchanged. Homepage Design Lock v1.1 supersedes v1.0 only for the pathway
count, labels, descriptions, destinations, and responsive four-card balance.

July 2 public marketing foundation: Portfolio, Private Client, Lone Star
Retreat, Workshops & Education, About Tim, and Contact now share a responsive
editorial interior-page system derived from Homepage Design Lock v1.1. The
routes include cinematic heroes, concise introductions, structured preview
blocks, honest calls to action, and route metadata. No booking, applications,
enrollment, authentication, payment, CRM, dashboard, or backend behavior is
present. Automated checks pass, and browser review at 1280px, 980px, and 390px
confirmed responsive structure, loaded imagery, compact-navigation contrast,
no console errors, and no horizontal overflow. Final approval is recorded in
the Sprint 02 acceptance entry below.

July 2 Sprint 02 acceptance: Tim accepted the completed public implementation
and authorized final repository housekeeping. The approved homepage export was
moved into `docs/foundation/exports/pdf/`; the repository asset policy and
executive changelog were added. Sprint 02 is closed. Sprint 03 requires
separate scope confirmation before any external service, authentication, or CMS
work begins.
