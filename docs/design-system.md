# Project North Star Design System

Version 1.0 — June 24, 2026

## Purpose

This system is the visual foundation for Project North Star, Tim Bennett
Photography, Lone Star Retreat, and future ventures. It preserves the approved
luxury editorial direction while making global brand changes predictable.

Pages should compose existing tokens and primitives. They should not introduce
new colors, type scales, button styles, breakpoints, or animation timings unless
the design system itself is intentionally revised.

Sprint 02 visual refinement is evolving the brand away from a modern SaaS feel
and toward a premium editorial luxury identity. `docs/brand/design-philosophy.md`
and `docs/brand/visual-language.md` define that atmosphere. This document
continues to define how the interface should be implemented.

## Source of truth

| Concern | Source |
| --- | --- |
| Brand and semantic tokens | `src/styles/tokens.css` |
| Brand philosophy and visual direction | `docs/brand/` |
| Reset, typography, focus, and layout foundations | `src/styles/foundation.css` |
| Buttons, links, cards, media, forms, and sections | `src/styles/components.css` |
| Reusable React primitives | `src/components/` |
| Page-specific composition | `src/app/globals.css` |

`src/app/globals.css` imports the three system stylesheets. It should contain only
site-shell and page-composition rules.

## Color

Primitive brand colors must not be used directly in page components. Prefer
semantic tokens:

- `--color-text`
- `--color-text-muted`
- `--color-text-subtle`
- `--color-text-inverse`
- `--color-surface`
- `--color-surface-soft`
- `--color-surface-dark`
- `--color-accent`
- `--color-accent-light`
- `--color-rule`
- `--color-rule-inverse`

The primitive palette remains available in `tokens.css` for deliberate system
work: black, ink, charcoal, bronze, warm gold, champagne, ivory, warm white,
stone, and taupe.

## Typography

The display family is editorial serif. The body family is a restrained modern
sans serif. System roles:

- `.ds-display` — homepage-scale display typography
- `.ds-heading-lg` — major page title
- `.ds-heading-md` — section heading
- `.ds-heading-sm` — card or subsection heading
- `.ds-lead` — introductory editorial copy
- `.ds-body` — standard supporting copy
- `.ds-eyebrow` / `<Eyebrow>` — labels and section identifiers
- `.ds-caption` / `<Caption>` — metadata and statuses

Do not set arbitrary font sizes in a new page. Add or revise a named role when a
genuinely new hierarchy is required.

## Spacing and layout

Spacing uses a 4px base scale from `--space-1` through `--space-48`, plus fluid
section values:

- `--space-section-sm`
- `--space-section`
- `--space-section-lg`

Use `<Container>` for standard page width. The global maximum is 1480px with a
fluid viewport gutter. Editorial reading widths use `--layout-reading` and
`--layout-copy`.

## Responsive standards

Three layout modes are approved:

- Wide: above 980px
- Medium: 761px–980px
- Compact: 760px and below

Add responsive behavior at these boundaries. Avoid isolated, component-specific
breakpoints unless the component demonstrably fails between them.

## Components

Import primitives from their responsibility-based component groups:

```tsx
import { ActionLink, Button, TextLink } from "@/components/buttons";
import { Container, Eyebrow, SectionIntro } from "@/components/layout";
```

### Actions

```tsx
<ActionLink href="/portfolio" variant="primary">View portfolio</ActionLink>
<ActionLink href="/about" variant="light">Meet Tim</ActionLink>
<TextLink href="/project-north-star">Read the philosophy</TextLink>
<Button variant="ghost">Manage</Button>
```

Approved variants are `primary`, `light`, `dark`, and `ghost`.

### Page introductions

```tsx
<SectionIntro eyebrow="Selected work" title="Portfolio">
  Introductory editorial copy.
</SectionIntro>
```

This is the default introduction for major interior pages.

### Public marketing pages

Principal public routes use the shared `EditorialHero`, `EditorialBlocks`, and
`EditorialCta` components from `src/components/marketing`. Together they carry
Homepage Design Lock v1.1 into interior pages through the same cinematic
black/charcoal environment, warm-gold accents, editorial typography, restrained
image treatment, and generous section rhythm.

Use `MarketingPage` when a route follows the complete hero → overview → CTA
sequence. Routes with established specialized content may compose the three
parts directly. Owner-editable copy and imagery remain in `src/data`.

### Media

Use `<MediaFrame>` around `next/image`. Add `interactive` only when the image is
part of a link or clearly responds to hover.

All meaningful images require useful alt text. Decorative portfolio cover
images may use an empty alt when the adjacent heading provides the same
information.

### Forms

Import forms from `@/components/forms`. Use `<InputField>` and
`<TextAreaField>`. Labels are always visible; placeholders
are supplementary and never replace labels. Primary form actions use `<Button>`.

### Cards and sections

Use `.ds-card` or `.ds-card--dark` for the base surface and border treatment.
Use `.ds-section`, `.ds-section--soft`, or `.ds-section--dark` for standard
vertical rhythm and background treatment. Page styles may add grid composition
without redefining the card surface.

### Icons

Icons use the `.ds-icon` contract: 20px, current color, 1.25 stroke. The current
system includes `ArrowIcon`. Future icons should be simple outline SVGs and
inherit color rather than embedding brand colors.

## Navigation

Primary navigation is uppercase sans serif at the navigation type role. Desktop
interaction uses a gold underline. At medium and compact widths it becomes a
full-screen charcoal editorial menu. New navigation items should come from the
central data in `src/data/navigation.ts`.

## Image presentation

Images are full-bleed within a defined aspect ratio, never stretched.
Interactive images use the standard 700ms restrained scale transition.
Responsive focal-point changes should use `object-position`, eventually stored
as media metadata in the CMS.

## Motion

- Fast interaction: 180ms
- Standard navigation/state change: 220ms
- Image treatment: 700ms with the approved image easing curve

Motion should communicate hierarchy or state, not decorate the page.
`prefers-reduced-motion` is respected globally.

## Accessibility contract

- Maintain visible keyboard focus.
- Preserve semantic heading order.
- Use visible form labels.
- Maintain readable contrast on ivory and charcoal surfaces.
- Honor reduced-motion preferences.
- Do not place important information only in hover states.

## Adding a new page

1. Start with `<SectionIntro>` and `<Container>`.
2. Compose typography and actions from the appropriate `src/components` group.
3. Use semantic color and spacing tokens.
4. Add only layout-specific selectors to `src/app/globals.css`.
5. Verify at 1280px, 980px, and 390px widths.
6. Run lint, type checking, and the production build.

## Changing the brand globally

Color, typography, spacing, motion, and maximum width changes belong in
`src/styles/tokens.css`. Component behavior changes belong in
`src/styles/components.css`. A page file should almost never be edited for a global
brand adjustment.
