# PR #3 — Premium Calendar UX Prototype

Status: Product Owner Approved

Sprint: 04 — Experience Manager

Branch: `codex/premium-calendar-ux-prototype`

## Objective

Create a non-public, read-only scheduling prototype for the Texas Hill Country
Creative Retreat using test records. The prototype exists to approve visual
language, role-based information density, navigation, responsive behavior, and
interaction concepts before any booking mutation or public access is enabled.

The signature experience is:

> Select a beautiful artist, see her day clearly, choose an uninterrupted
> creative window, and confirm with complete confidence in under a minute.

The experience must feel like a curated luxury-retreat itinerary—not a generic
calendar, database, or appointment table.

## Non-negotiable boundaries

- No live booking or database mutations
- No payments, rates, or financial information
- No notifications or messaging
- No participant dashboards or public accounts
- No photographer identity in the participant-facing Retreat Schedule
- No shoot type, theme, genre, concept, or other sensitive creative detail in
  the Retreat Schedule
- No production route in navigation or the sitemap
- No month grid, dense toolbar, persistent sidebar, tiny dropdown, colorful
  status pills, excessive filters, or modal chain

## Information architecture

### Participant entry

Participants land on **My Schedule**, with the relevant retreat day and current
or next reservation emphasized. **Retreat Schedule** is secondary.

### Role views

1. **My Schedule** — the participant's personal itinerary
2. **Retreat Schedule** — artist name, time, and booking status only
3. **Artist Availability** — photographer selection and time-range concept
4. **Shape Your Day** — model availability concept
5. **Administrator Master Calendar** — complete operational view

All views share the same event context, day selector, time zone, status
vocabulary, and continuous editorial time ribbon.

## Privacy contract

### Retreat Schedule

May display only:

- Artist/stage name
- Date and time
- Booking status

It must not expose photographer identity, contact details, shoot information,
payment information, private notes, or administrator data.

### Permissioned views

- A photographer may see their own confirmed artist and booking details.
- A model may see the photographer attached to their own confirmed booking.
- An administrator may see both participants and operational details.
- Any future shoot type or theme remains visible only to the booked photographer,
  booked model, and administrator.

## Experience composition

### Selected-day opening

Lead with the event day, atmosphere, and orientation—not controls. Present:

- Day and date
- Event-local time zone
- A restrained **Now / Next** summary during live dates
- A subtle **You Are Here** marker
- Secondary navigation to other approved views

### Editorial time ribbon

Use one continuous day sequence instead of a conventional calendar grid.
Reservations read as chapters in the day. Consecutive hourly blocks appear as
one continuous reservation.

Status is communicated through typography, border, icon, and subtle pattern;
color is supporting information only.

### Artist selection

After a time is chosen, available artists appear as large photography-led cards.
Portraits are used here and in confirmation only. No artist dropdown is used.

Each card may show:

- Approved portrait
- Stage name
- Selected availability window
- Minimum booking duration
- A clear availability statement

### Time selection

The user selects one continuous range and sees duration, minimum requirement,
and validity immediately. The target flow is:

`Day → Time range → Artist → Review → Prototype confirmation`

Unavailable selections return intelligent alternatives: the nearest valid time
or another available artist. Generic warning dialogs are not used.

### Confirmation

The review state presents the artist portrait, date, time, duration, event time
zone, and concise professional expectations. A restrained **Reservation
Confirmed** transition demonstrates the future experience but does not persist
or imply a live booking.

### Confirmed reservations

Confirmed blocks should feel permanent and protected through confident
typography, stable structure, and a refined locked-state icon. They must not look
like disabled form controls.

### Model availability

The **Shape Your Day** concept lets a model visually open, shorten, extend, or
block portions of a day. Models may copy one day's availability to another and
then refine exceptions. The PR #3 prototype demonstrates interaction only and
does not save changes.

### Administrator Master Calendar

Keep the timeline visually primary. Editing tools, filters, exceptions, and
details live in contextual drawers. Drag-and-drop is reserved for administrators
and remains a prototype interaction. Every proposed move presents a clear
before-and-after review before the simulated save state.

## Responsive behavior

### Desktop

- Continuous horizontal or spacious vertical time ribbon as composition allows
- Contextual detail drawer rather than persistent control panels
- Restrained day and view navigation

### Tablet

- Preserve readable time relationships without compressing labels
- Use an overlay drawer for contextual details
- Keep the active day and current reservation visible

### Mobile

- Default to a vertical editorial agenda
- No miniature desktop grid
- No required horizontal scrolling
- Sticky day selector and reachable view switcher
- Bottom sheet for details and review
- Minimum 44px interactive targets
- Explicit start/end selection instead of precision dragging

## Accessibility requirements

- Complete keyboard access and visible focus
- Semantic buttons and headings; no clickable generic cells
- Text, icon, and pattern accompany every status color
- Accessible agenda equivalent for any visual timeline
- Live-region announcements for selection and prototype confirmation
- Logical focus management in drawers and sheets
- Reduced-motion behavior for all transitions
- Event time zone stated in visible and accessible text
- Private data excluded from markup, labels, and client fixtures

## PR #3 implementation sequence

### 1. Prototype boundary

- Add an internal, non-indexed prototype route behind an explicit development
  feature flag.
- Exclude it from navigation, sitemap, and production discovery.
- Use typed fixtures only; do not query or mutate booking collections.

### 2. Shared calendar language

- Define approved role views, status vocabulary, day navigation, time ribbon,
  Now / Next, You Are Here, and privacy-safe fixture shapes.
- Extend existing design tokens only where a genuinely reusable calendar role is
  required.

### 3. My Schedule first

- Build the participant default view.
- Establish desktop, tablet, mobile, keyboard, reduced-motion, empty, and current-
  time states.

### 4. Retreat Schedule

- Build the privacy-restricted event itinerary.
- Verify that only artist, time, and status are present in rendered output.

### 5. Signature artist-first flow

- Build tactile continuous-range selection.
- Reveal photography-led available-artist cards.
- Add minimum-duration feedback and intelligent alternatives.
- Demonstrate review and non-persistent confirmation.

### 6. Shape Your Day

- Prototype open, shorten, extend, block, lunch, and copy-day interactions.
- Keep confirmed reservations visibly protected and immutable.

### 7. Administrator Master Calendar

- Add artist and photographer perspectives.
- Add contextual details and conflict awareness.
- Prototype administrator-only drag, before/after review, cancel, reassign, and
  override concepts without persistence.

### 8. Quality review

- Verify privacy in rendered markup and fixture data.
- Test at wide, tablet, and compact widths.
- Test keyboard, focus, reduced motion, contrast, and touch targets.
- Confirm no horizontal overflow and no production navigation exposure.
- Run lint, typecheck, and production build.

## Approval gates

- [x] Information architecture approved
- [x] Event-specific terminology approved
- [x] Privacy boundary approved
- [x] Signature interaction direction approved
- [x] Mobile agenda direction approved
- [x] Administrator interaction direction approved
- [x] Prototype implementation authorized
- [x] Non-public read-only prototype implemented with typed fixtures
- [x] Automated lint, typecheck, and production-build verification passed
- [x] Product Owner Review #1 experience refinements implemented
- [x] Realistic three-day test weekend expanded to five artists and five photographers
- [x] Product Owner visual review completed
- [x] Prototype design locked for implementation; minor presentation refinements remain non-blocking
- [ ] Transaction and authorization hardening approved before live booking
- [ ] Public booking implementation separately authorized

## Success criteria

- A first-time participant understands the current day and next commitment at a
  glance.
- The artist-first prototype can be completed confidently in under one minute.
- Mobile requires no horizontal calendar navigation.
- Photographer identity and shoot information never appear in Retreat Schedule.
- The visual experience is recognizably Project North Star and does not resemble
  generic scheduling software.
- No production booking, mutation, payment, notification, messaging, or account
  behavior changes.
