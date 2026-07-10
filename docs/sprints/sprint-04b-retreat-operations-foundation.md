# Sprint 04B — Retreat Operations Foundation

Status: Active — architecture only

## Goal

Define the complete operational foundation for Lone Star Retreat before
implementing production participant workflows.

Sprint 04B is an architecture sprint. It produces documentation, workflow
diagrams, data relationship decisions, privacy rules, scheduling architecture,
retreat operations recommendations, and implementation sequencing.

It does not implement authentication, booking, payments, calendars, messaging,
dashboards, or production notification automation.

## Primary objective

Architect the complete participant lifecycle for Lone Star Retreat across:

- photographers,
- models / featured artists,
- administrators,
- retreat events,
- supporting operational records, and
- future participant-facing portal experiences.

The architecture must preserve the existing Project North Star platform model:
one application, one normalized content and operations layer, role-aware
authenticated surfaces, and public pages that receive only explicitly approved
information.

## Guiding principle

Privacy is the default. Sharing is always the participant's choice.

Models model. Photographers shoot. Everything else is the platform's
responsibility.

## Scope

- Participant lifecycle architecture
- Canonical record validation
- Public/private data boundaries
- Consent and audit-history architecture
- Scheduling and booking architecture
- Retreat operations and logistics architecture
- Future implementation recommendations

## Explicitly out of scope

- Production booking mutations
- Payment collection
- Stripe integration
- Public registration launch
- Participant dashboards
- Calendar sync or calendar write access
- Messaging
- Automated notification delivery
- Authentication changes beyond documenting future requirements
- New production database migrations
- New public UI implementation

## Deliverables

- [ ] Retreat operations architecture document
- [ ] Photographer journey architecture
- [ ] Model journey architecture
- [ ] Administrator journey architecture
- [ ] Canonical record relationship validation
- [ ] Privacy and consent architecture
- [ ] Scheduling architecture
- [ ] Retreat logistics architecture
- [ ] Future implementation recommendations

## Source documents

- [`../north-star-platform-architecture.md`](../north-star-platform-architecture.md)
- [`../architecture.md`](../architecture.md)
- [`../foundation/scheduling-and-booking-rules.md`](../foundation/scheduling-and-booking-rules.md)
- [`../foundation/lone-star-retreat-code-of-conduct.md`](../foundation/lone-star-retreat-code-of-conduct.md)
- [`../retreat-operations-architecture.md`](../retreat-operations-architecture.md)

## Acceptance criteria

- [ ] The participant lifecycle is documented from visitor through retreat
  completion for photographers and models.
- [ ] Administrator responsibilities are documented without collapsing them into
  participant-facing flows.
- [ ] Existing canonical records are validated for normalization and scalability.
- [ ] Future records are clearly distinguished from records already implemented.
- [ ] Public, private, participant-visible, and administrator-only fields are
  separated.
- [ ] Consent history, communication preferences, publication approvals, and
  audit history are architected before implementation.
- [ ] Scheduling concepts support availability, booking windows, conflict
  prevention, administrator overrides, personal schedules, and event master
  schedules.
- [ ] Retreat logistics are modeled as event-owned information, not duplicated
  inside participant profiles.
- [ ] Implementation recommendations are sequenced so future sprints can build
  safely without adding dashboards, payments, messaging, or booking mutations
  prematurely.

## Notes for future Codex sessions

Do not interpret Sprint 04B approval as authorization to build live operational
features. Sprint 04B approval authorizes the architecture only. Production
implementation must happen in later approved sprints with explicit scope.
