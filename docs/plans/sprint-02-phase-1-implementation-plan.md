# Project North Star - Phase 1 Implementation Plan

**Planning designation:** Sprint 02 Visual Refinement - Phase 1  
**Status:** Approved for implementation; implementation not yet started  
**Scope:** Color atmosphere, typography, homepage hero experience, and Project North Star brand expression

> The request that initiated this plan used the title "Sprint 03 - Phase 1." The current project roadmap reserves Sprint 03 for Content Management, so this document records the work as a continuation of Sprint 02 unless the roadmap is intentionally revised.

## Purpose

This plan translates the approved Design Direction Report and architect guidance into a focused construction strategy. It defines the smallest set of high-value visual refinements capable of making the application feel more luxurious, cinematic, editorial, timeless, intentional, and unmistakably Project North Star.

This is an implementation plan only. It does not authorize implementation by itself.

The primary public-facing brand is Tim Bennett. Project North Star is the
guiding philosophy behind the Tim Bennett brand. Phase 1 should therefore make
the homepage feel first like the digital home of an individual artist,
photographer, and educator, with Project North Star explaining the purpose and
discipline connecting the experience.

Every Phase 1 decision should support the visitor’s journey from curiosity to confidence. The page-level emotional objectives in `docs/brand/design-philosophy.md` should be used as review aids throughout the work, not as requirements to redesign page structure.

## Architect Approval Gates

The Phase 1 construction strategy is approved. Phase 1A must establish and receive approval for:

- Final Phase 1 palette, including intended light and dark balance
- Display typography and licensing
- Approved Hero Study (Temporary Creative Asset), including responsive crop direction
- Wordmark treatment

The homepage must remain the Phase 1 proof-of-concept. No approved visual refinements should be propagated broadly across the application until the homepage proof has been reviewed and approved.

## Hero Study Clarification

The final Project North Star production hero photograph has not yet been created. Phase 1 must therefore use an **Approved Hero Study (Temporary Creative Asset)** rather than treating any current image as the final homepage photograph.

The hero study exists to validate:

- Composition
- Typography
- Color atmosphere
- Negative space
- Overlay treatment
- Emotional impact
- Responsive behavior
- Overall brand expression

The hero study is a deliberate creative study, not a disposable placeholder, and it is not expected to become the permanent homepage image.

The successful Phase 1 homepage proof should define the creative requirements for the future Project North Star production shoot. The website establishes the approved visual language first; the final production hero should then be photographed to fit that language.

Replacing the approved hero study with the future production hero should require little or no structural change. Typography, spacing, overlays, responsive behavior, and component architecture should remain stable when the image changes.

## Sources of Truth

Implementation must begin with a review of:

- `docs/brand/design-philosophy.md`
- `docs/brand/visual-language.md`
- `docs/brand/references/README.md`
- Every documented asset in `docs/brand/references/`
- `docs/reviews/sprint-02-design-direction-report.md`
- `docs/design-system.md`

## Architectural Constraints

Phase 1 must preserve:

- Information architecture
- Navigation structure
- Existing UX flow
- Responsive behavior
- Accessibility
- Performance
- Component hierarchy
- Overall page organization

The work should refine visual language through tokens, typography, imagery, composition, and pacing. It should not redesign the application.

## 1. Color Atmosphere

### 1.1 Clarify the dark foundation

**Current state**  
The existing palette already contains black, ink, charcoal, bronze, gold, champagne, ivory, warm white, stone, and taupe. These families support the brand, but the near-black values do not yet have sufficiently distinct roles. Dark surfaces can therefore feel interchangeable rather than intentionally atmospheric.

**Proposed refinement**  
Retain the existing color families while assigning clear functions to each dark tone:

- Near-black for the deepest cinematic fields and image framing
- Ink for primary dark sections and navigation treatments
- Charcoal for secondary dark surfaces, borders, and quiet tonal separation
- Soft warm shadow tones for overlays instead of neutral black alone

Introduce deeper charcoal selectively in the homepage hero, featured photographic sections, and one or two high-emphasis transitions. Avoid turning the site into a uniformly dark experience.

**Expected user impact:** High - establishes immediate atmosphere and visual confidence.  
**Estimated implementation effort:** Medium  
**Dependencies:** Approved palette values; contrast validation; approved hero study  
**Risk level:** Medium - excessive darkness could reduce warmth or readability.  
**Affected areas:** Global color tokens, hero overlay tokens, header states, dark section surfaces, footer, image captions, and borders.

### 1.2 Warm the light surfaces

**Current state**  
Light sections are calm and readable, but some surfaces feel cooler and more neutral than the brand references. This weakens the relationship between the light and dark sections.

**Proposed refinement**  
Preserve ivory and warm white as the light foundation, then shift secondary light surfaces away from cool gray toward warm stone, parchment, and restrained champagne undertones. Use tonal differences that remain subtle enough to preserve calm.

**Expected user impact:** High - creates a more cohesive, tactile, editorial experience.  
**Estimated implementation effort:** Low  
**Dependencies:** Final dark palette and accessibility checks  
**Risk level:** Low  
**Affected areas:** Page backgrounds, cards, content bands, form fields, borders, and secondary text tokens.

### 1.3 Separate bronze and gold responsibilities

**Current state**  
Bronze and gold both appear as premium accents, but their roles can overlap. Repetition reduces the sense that gold is exceptional.

**Proposed refinement**  
Use bronze as the everyday editorial accent for rules, quiet labels, subdued borders, and supporting details. Reserve brighter gold for rare moments of emphasis such as a primary call to action, selected navigation state, significant pull quote, or key brand moment. Do not use gold as a broad surface color.

**Expected user impact:** Medium - increases perceived restraint and craftsmanship.  
**Estimated implementation effort:** Low  
**Dependencies:** Token role definitions and component inventory  
**Risk level:** Low  
**Affected areas:** Accent tokens, links, buttons, labels, rules, focus treatments, and selected states.

### Color decision gate

Before implementation proceeds beyond tokens, approve a compact palette proof showing:

- One hero treatment
- One dark content section
- One warm light section
- Primary and secondary text on both backgrounds
- Bronze and gold in their intended roles
- Accessibility contrast results for all required text and controls

## 2. Typography

### 2.1 Establish an editorial display voice

**Current state**  
The display stack uses Iowan Old Style, Baskerville, Times New Roman, and serif fallbacks. It is elegant and readable, but its appearance varies by device and can feel like a refined system default rather than a distinctive brand voice.

**Proposed refinement**  
Evaluate and approve a licensed or appropriately sourced editorial display serif with refined proportions, strong uppercase forms, graceful italics, and dependable web rendering. Preserve the restrained sans-serif direction for body copy and interface text.

The selected typeface should feel timeless and confident, not ornamental, fashionable, or fragile.

**Expected user impact:** High - typography is one of the strongest signals of editorial luxury and brand recognition.  
**Estimated implementation effort:** Medium  
**Dependencies:** Typeface licensing, web formats, performance budget, language coverage, and rendering tests  
**Risk level:** Medium - a poor selection could impair readability or performance.  
**Affected areas:** Display font tokens, headings, hero copy, wordmark text, pull quotes, and editorial accents.

### 2.2 Recalibrate hierarchy and scale

**Current state**  
The current hierarchy is clear, but some large interior headings compete with the photography and create a more contemporary marketing-site tone.

**Proposed refinement**  
Moderate the largest interior heading sizes while preserving the hero as the primary typographic moment. Refine the existing display, large heading, medium heading, small heading, and lead roles so that scale, weight, and spacing produce a calmer editorial cadence.

Use line length and line height to create authority without visual heaviness. Keep body copy highly legible and avoid reducing text size for the sake of elegance.

**Expected user impact:** High - improves pacing, hierarchy, and photographic prominence.  
**Estimated implementation effort:** Medium  
**Dependencies:** Approved display typeface and responsive visual review  
**Risk level:** Low  
**Affected areas:** Type scale tokens, `.ds-display`, `.ds-heading-lg`, `.ds-heading-md`, `.ds-heading-sm`, `.ds-lead`, page introductions, and card headings.

### 2.3 Refine spacing and expressive typography

**Current state**  
The system already uses generous spacing, but heading letter spacing, paragraph measure, and spacing between labels, headings, and copy can be tuned more deliberately.

**Proposed refinement**  
Create role-based spacing guidance for:

- Eyebrow to heading
- Heading to lead copy
- Lead copy to action
- Section title to content
- Caption to image

Use uppercase tracking only for short labels. Use italics sparingly for emotional emphasis, quotations, or moments of reflection. Avoid using italics as a general luxury effect.

**Expected user impact:** Medium - produces quiet refinement and more intentional reading rhythm.  
**Estimated implementation effort:** Low  
**Dependencies:** Final typeface metrics  
**Risk level:** Low  
**Affected areas:** Typography spacing tokens, labels, captions, pull quotes, section headings, and calls to action.

### Typography decision gate

Approve a browser-based type specimen containing:

- Homepage hero title and supporting copy
- Interior page title
- Section heading and lead paragraph
- Body copy at realistic line length
- Button, navigation, label, and caption text
- Mobile, tablet, and desktop examples
- Fallback behavior and loading performance

## 3. Hero Experience

### 3.1 Preserve the structure and strengthen the image direction

**Current state**  
The homepage hero has a strong structural foundation and responsive behavior. The current visual impression is luminous and romantic, but it does not yet carry the full architectural intimacy, depth, and quiet confidence of the reference library.

**Proposed refinement**  
Preserve the `HomeHero` structure. Select photography with:

- Directional warm light
- Deep but detailed shadow
- Clear negative space for typography
- A strong focal path through the frame
- Cinematic depth without visual noise
- Emotional resonance connected to purpose, exploration, and aspiration

Approve focal points and crops for desktop, tablet, and mobile before implementation. The image must remain photography-led rather than functioning as a decorative background.

**Expected user impact:** High - creates the strongest immediate change in emotional perception.  
**Estimated implementation effort:** Medium  
**Dependencies:** Approved photography, usage rights, responsive crops, and image optimization  
**Risk level:** Medium - image choice and crop quality are decisive.  
**Affected areas:** `HomeHero`, hero asset metadata, responsive image sources, focal-position values, and image optimization settings.

### 3.2 Replace generic shading with controlled light falloff

**Current state**  
The existing hero overlay supports legibility but reads primarily as a practical gradient.

**Proposed refinement**  
Tune the overlay to behave like controlled light falloff: protect text contrast, preserve luminous image areas, deepen the frame edges selectively, and avoid flattening the photograph. Use warm shadow values where appropriate.

**Expected user impact:** High - makes the hero feel composed and cinematic rather than merely darkened.  
**Estimated implementation effort:** Low  
**Dependencies:** Approved hero study and contrast testing  
**Risk level:** Medium - overlays can obscure photography or weaken accessibility if not tested carefully.  
**Affected areas:** Hero shade styles, overlay tokens, breakpoint-specific positioning, and text contrast.

### 3.3 Rebalance hero typography after image approval

**Current state**  
The current hero copy is readable and well positioned, but its exact scale, line breaks, and placement were tuned for the current image and font stack.

**Proposed refinement**  
After the image and display typeface are approved, recalibrate title width, line breaks, supporting-copy measure, action spacing, and vertical placement. Preserve the content and component hierarchy. Let negative space determine placement rather than centering by habit.

**Expected user impact:** High - unifies image and typography into one intentional composition.  
**Estimated implementation effort:** Low  
**Dependencies:** Approved hero study and display typeface  
**Risk level:** Low  
**Affected areas:** Hero title, supporting copy, action group, content width, and responsive spacing.

### Hero decision gate

Approve one complete hero proof at:

- 1280px desktop width
- 980px tablet width
- 390px mobile width

The proof must confirm crop, focal point, text contrast, reading order, image performance, and the emotional objective of inspiration.

## 4. Project North Star Brand Expression

### 4.1 Strengthen the wordmark without changing navigation structure

**Current state**  
The restrained text wordmark works well with the approved architecture, but "Project North Star" can feel subordinate rather than acting as a confident identity anchor.

**Proposed refinement**  
Preserve the header structure and navigation. Refine the text wordmark through approved display typography, proportion, letter spacing, line relationship, and tonal contrast. The goal is recognition and quiet authority, not a larger or more decorative header.

**Expected user impact:** Medium - improves brand recognition across every page.  
**Estimated implementation effort:** Low  
**Dependencies:** Approved display typeface and header contrast states  
**Risk level:** Low  
**Affected areas:** Header wordmark, mobile header, footer identity, and navigation typography.

### 4.2 Establish a deliberate homepage emotional cadence

**Current state**  
Individual sections are polished, but the page can still read as a sequence of components rather than a guided emotional journey.

**Proposed refinement**  
Use the existing page order to create a planned rhythm:

1. Cinematic inspiration in the hero
2. A quiet warm-light introduction
3. Photography-led emphasis
4. A deeper atmospheric section
5. A warm, simple resolution and call to action

Achieve this through surface color, spacing, photographic scale, typography, and restrained transitions. Do not reorder content or add decorative sections.

**Expected user impact:** High - transforms the experience from assembled interface to purposeful journey.  
**Estimated implementation effort:** Medium  
**Dependencies:** Final color roles, typography, hero direction, and section inventory  
**Risk level:** Low  
**Affected areas:** Homepage section surfaces, spacing tokens, image presentation, section headings, and transitions.

### 4.3 Express identity through discipline, not motifs

**Current state**  
The application is restrained, which is a strong foundation. The next refinement must avoid filling that restraint with literal brand symbols.

**Proposed refinement**  
Use the logo as a source of principles: balance, symmetry, proportion, precision, confidence, and restrained gold. Do not repeat stars, circles, compasses, mountains, or paths as decorative motifs. Let identity emerge through consistent alignment, image treatment, tonal contrast, type, and pacing.

**Expected user impact:** Medium - creates a more mature and durable brand expression.  
**Estimated implementation effort:** Low  
**Dependencies:** Shared design review discipline and documented component rules  
**Risk level:** Low  
**Affected areas:** Global composition, imagery, accents, section transitions, cards, and decorative treatments.

## Controlled Implementation Sequence

### Phase 1A - Creative Approval

Approve:

- Final Phase 1 palette and color roles
- Display typeface and licensing
- Approved Hero Study (Temporary Creative Asset) and responsive crops
- Wordmark typography treatment

Phase 1B should not begin before all four creative decisions above are approved.

### Phase 1B - Global Design Tokens

Update only the tokens needed for Phase 1:

- Dark and light surface roles
- Text and border roles
- Bronze and gold accent roles
- Hero overlay values
- Display type family
- Type scale and line-height roles
- Essential typography spacing roles

Verify contrast and fallback behavior before propagation.

### Phase 1C - Homepage Proof

Apply the approved tokens and hero direction to the homepage only. Use it as the complete visual proof for atmosphere, hierarchy, rhythm, and brand expression.

#### Review at key breakpoints

Review the homepage at 1280px, 980px, and 390px widths. Confirm:

- Typography remains readable and balanced
- Hero crop and focal point remain intentional
- Navigation behavior is unchanged
- Light and dark rhythm feels composed
- Photography remains dominant
- Motion remains restrained
- Accessibility and performance remain intact

### Phase 1D - Propagate Approved Tokens

After homepage approval, propagate only the approved global token changes and shared typography rules to the remaining pages. Avoid page-specific redesign during Phase 1.

## Dependency Summary

| Dependency | Required before | Owner or decision source |
| --- | --- | --- |
| Approved Hero Study (Temporary Creative Asset) and usage rights | Hero study implementation | Tim Bennett / brand review |
| Display typeface and license | Typography implementation | Tim Bennett / design review |
| Final palette values | Token refinement | Design review |
| Responsive crop approval | Homepage proof completion | Design review |
| Contrast validation | Propagation | Implementation review |
| Image optimization confirmation | Production approval | Engineering review |

## Risk Controls

| Risk | Control |
| --- | --- |
| The site becomes too dark | Limit deep charcoal to high-emphasis moments and preserve warm light sections. |
| Gold becomes decorative or excessive | Reserve gold for rare emphasis; use bronze for everyday accents. |
| Editorial typography harms readability | Test realistic copy, fallbacks, mobile sizes, and line lengths before approval. |
| Hero study loses meaning on mobile | Approve focal points and crops at all three target widths. |
| Visual refinement expands into redesign | Preserve content order, components, UX, and navigation; use the homepage as the bounded proof. |
| Performance declines | Set font and image budgets before propagation and verify loading behavior. |
| Accessibility regresses | Validate contrast, focus visibility, reading order, and reduced-motion behavior at each gate. |

## Phase 1 Completion Criteria

Phase 1 is complete only when:

- The palette communicates cinematic depth while preserving warm balance.
- Gold is rare and intentional; bronze has a clear supporting role.
- Display typography feels editorial and distinctive while body copy remains highly legible.
- The homepage hero communicates inspiration, confidence, and quiet aspiration.
- The homepage reads as a paced emotional journey rather than a collection of sections.
- The application feels compatible with the logo without repeating its imagery.
- Responsive behavior, navigation, accessibility, performance, component structure, and UX remain intact.
- The homepage proof has been reviewed at desktop, tablet, and mobile widths.
- Tim Bennett has approved the Phase 1 visual direction before broader propagation.

## Explicitly Out of Scope

- Information architecture changes
- Navigation changes
- New component hierarchy
- New page organization
- New UX flows
- Literal logo motifs or decorative branding systems
- Full interior-page redesign
- Phase 2 and Phase 3 refinements from the Design Direction Report
