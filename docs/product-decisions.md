# Project North Star Product Decisions

This document records approved product-level decisions that govern multiple
features or future sprints. Implementation detail remains in the relevant sprint
and architecture documents.

## July 4, 2026 — Project North Star Design Principles

- [`foundation/design-principles.md`](foundation/design-principles.md) is the
  approved foundational design philosophy for Project North Star.
- Every future page, feature, component, and user experience must reference its
  creative principles before visual decisions are made.
- The document governs creative direction and experience quality; implementation
  tokens and CSS-level standards remain in the technical design system.

## July 4, 2026 — Lone Star Retreat Professional Standards

- [`foundation/lone-star-retreat-code-of-conduct.md`](foundation/lone-star-retreat-code-of-conduct.md)
  is the approved cultural and professional standard for Lone Star Retreat.
- Photographer and Model applications must present the standards without taking
  applicants away from an in-progress form.
- Applicants must explicitly confirm that they have read and agree to follow the
  standards before either application can be submitted.
- The acknowledgment remains a private application record. It does not create an
  account, publish a profile, or replace event-specific agreements where those
  may later be required.

## July 4, 2026 — Event-Centric Lone Star Retreat Architecture

- Lone Star Retreat is the umbrella brand; individual retreat events are the
  actual public products.
- Participating artists are displayed only in the context of a specific event.
- A canonical artist profile may be reused across events, but each public event
  appearance requires an explicit event assignment with public approval.
- No permanent global or agency-style artist roster is part of Version 1.
- The Texas Hill Country Creative Retreat uses May 7–9, 2027 as its Version 1
  event and scheduling test window. The evening of May 6 is travel/arrival time,
  not an event booking day.

## July 4, 2026 — Lone Star Retreat Scheduling and Booking Rules

- [`foundation/scheduling-and-booking-rules.md`](foundation/scheduling-and-booking-rules.md)
  is the approved business-rules source of truth for future Lone Star Retreat
  calendars, bookings, notifications, and operational scheduling.
- Version 1 uses event-specific, first-come-first-served, instantly confirmed
  private one-on-one bookings built from 60-minute blocks.
- Participating models control future availability and minimum booking duration;
  confirmed bookings remain protected and require administrative intervention
  to cancel, move, or resolve.
- Lone Star Retreat may eventually process event admission through Stripe, but
  it does not publish model rates, process model compensation, negotiate creative
  terms, or provide participant messaging.
- Only participant-approved contact details may be shared after confirmation.
  The participant-facing Retreat Schedule may show artist/stage name, time, and
  status only. It must not disclose photographer identity, shoot information,
  private contact, payment, or administrator information.
- Future calendar interfaces must be highly visual, immediately legible,
  mobile-friendly, and consistent with the premium Project North Star design
  language. A basic scheduling table is not an acceptable final experience.
- The PR #3 prototype defaults participants to My Schedule and uses a curated
  editorial time ribbon. Photography-led artist selection, continuous-range
  time selection, intelligent alternatives, and restrained confirmation define
  the signature experience. The prototype remains non-public and read-only.
- The Premium Calendar UX prototype received Product Owner approval on July 5,
  2026. Its architecture, interaction model, information hierarchy, privacy
  boundaries, and overall experience are accepted as the implementation
  direction. Minor typography, spacing, and motion refinements are non-blocking.
