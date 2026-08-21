# Tim Bennett Photography Homepage Hero Redesign

## Objective

Replace the current founder-portrait homepage hero with a completely photograph-free opening that feels like quiet luxury: spacious, elegant, understated, and confident. The hero should establish Tim Bennett Photography and then invite visitors to explore the complete Project North Star ecosystem.

The supplied desktop and mobile mockups are the visual source of truth for direction, hierarchy, tone, and responsive behavior.

## Reference files

- `tim-bennett-homepage-hero-desktop-reference.png`
- `tim-bennett-homepage-hero-mobile-reference.png`

## Exact copy

Brand:

- `TIM BENNETT`
- `PHOTOGRAPHY`

Hero statement:

- `CAPTURING CONFIDENCE.`
- `CREATING LEGACY.`

Supporting statement:

- `PHOTOGRAPHY WITH PURPOSE.`
- `IMAGERY THAT ENDURES.`

Exploration label:

- `EXPLORE PROJECT NORTH STAR`

Destinations:

- `PORTFOLIO`
- `PRIVATE CLIENT`
- `LONE STAR RETREAT`
- `WORKSHOPS & EDUCATION`

## Visual direction

- Deep near-black background with only a barely perceptible warm tonal texture.
- Soft ivory typography with restrained antique gold accents.
- Elegant high-contrast editorial serif for the hero statement.
- Carefully tracked uppercase sans-serif for navigation and supporting text.
- Use the existing Tim Bennett Photography wordmark and North Star symbol.
- Retain generous negative space. The design must never feel crowded.
- Use one fine gold rule, one small illuminated point, and subtle North Star coordinate geometry.
- `CREATING LEGACY.` may carry the principal gold emphasis.
- The four Project North Star destinations should have equal visual importance.

## Desktop behavior

- Preserve the existing five-part header structure: Home, Portfolio, centered brand, About, Contact.
- Center the hero statement within a spacious, nearly full-viewport stage.
- Keep the supporting statement beneath the fine gold rule.
- Present the four destinations in one refined horizontal row.
- The destination treatment should read as navigation, not as four chunky feature cards.

## Mobile behavior

- Use a compact menu control and centered brand.
- Maintain generous vertical breathing room around the hero statement.
- Allow the statement to wrap naturally without reducing it to tiny text.
- Stack the four destinations vertically as full-width navigation rows separated by hairline rules.
- Do not introduce mobile photography, alternate artwork, or a large call-to-action button.

## Remove from the current hero

- Founder portrait and all hero image loading.
- Image overlays that exist only to blend the portrait into the background.
- Handwritten Tim Bennett signature.
- Portrait-specific desktop and mobile positioning.
- Any decorative studio scene, model, camera, or substitute generated artwork.

## Preserve

- Existing routes and destination labels.
- Existing accessible navigation semantics and focus behavior.
- Existing brand color tokens where they match the reference.
- The established Tim Bennett Photography identity.
- Strong desktop and mobile legibility.

## Implementation boundaries

- Do not redesign the rest of the homepage during this task.
- Do not change destination routes or site information architecture.
- Do not add a carousel, video, animation framework, background image, or third-party dependency.
- Any movement should be limited to existing restrained hover/focus transitions.
- Reuse the existing design system and components before introducing anything new.

## Acceptance criteria

- No photograph or human figure appears anywhere in the opening hero at any breakpoint.
- The exact copy above is used and spelled correctly.
- All four Project North Star destinations are immediately visible or naturally reachable.
- The desktop and mobile layouts match the supplied references in hierarchy and tone.
- The hero remains accessible, responsive, and free of horizontal overflow.
- Existing navigation links continue to work.
- Type checking, linting, and existing tests remain clean.
