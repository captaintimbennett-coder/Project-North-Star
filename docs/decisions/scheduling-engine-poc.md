# Project North Star — Scheduling Engine Proof-of-Concept Decision

**Status:** Approved and parked for a future scheduling mission
**Decision date:** July 24, 2026
**Applies to:** Project North Star / Lone Star Retreat
**Authority:** This document controls the scope of the scheduling-engine proof of concept. The accompanying research provides background but does not expand the approved scope.

**Supporting research:** [`../research/scheduling-engine-research-v2.md`](../research/scheduling-engine-research-v2.md)

## Objective

Select the quickest hosted scheduling engine that satisfactorily manages Lone Star Retreat scheduling without turning the evaluation into a new infrastructure project.

This proof of concept covers scheduling only:

- Availability
- Independent schedules
- Session lengths
- Blocked periods and breaks
- Buffers
- Conflict prevention
- Calendar synchronization
- Creating, canceling, and rescheduling sessions

Payments, registration, CRM, marketing, memberships, and the broader booking workflow remain separate Project North Star modules.

## Decision

Evaluate **hosted Cal.com first** with a small representative proof of concept.

Evaluate **Timekit second only if** Cal.com’s resource model, feature gating, or long-term cost proves unacceptable.

Choose whichever hosted service reaches “good enough” fastest at an acceptable ongoing price. Do not seek a theoretically perfect scheduling platform.

## Agreed Architectural Boundary

Project North Star owns all canonical resources and identities.

Examples include:

- Models
- Instructors
- Rooms
- Studios
- Locations
- Equipment
- Staff

A vendor record is only a mapping:

```text
Project North Star resource ID
        |
        +--> scheduling provider
        +--> provider resource/user ID
```

Cal.com users, Timekit resources, or other provider records must never become the canonical identity used throughout Project North Star.

If Cal.com is selected, vendor API calls should be isolated in one thin adapter module. Project North Star retains its existing conflict rules, permissions, and business logic.

Future AI actions must call Project North Star’s API first. AI must not bypass Project North Star’s validation by writing directly to the scheduling provider.

## Confirmed Planning Assumptions

- Cal.com’s Platform offering stopped accepting new signups on December 15, 2025; this must not be assumed to provide managed resource-users for a new project.
- Cal.com moved its commercial production codebase to a private repository on April 15, 2026.
- Cal.diy remains a community/self-hostable edition but is excluded from current production planning because it is positioned for personal, non-production use without production security or support guarantees.
- Cal.com must therefore be evaluated as a hosted SaaS vendor, not as a guaranteed production self-hosting escape route.
- Timekit has stronger native resource semantics but remains a hosted-vendor dependency and has a weaker AI/MCP story.
- A thin adapter is useful insurance against vendor change. A generalized multi-provider framework is not currently justified.

These facts should be rechecked when the scheduling mission begins because vendor plans and product terms may change.

## Entry Condition

Do not begin this proof of concept until:

1. The completed calendar, DatePicker, and booking-location work has been deployed.
2. Scheduling has been explicitly selected as the active Project North Star mission.

This research must not delay already-completed work.

## Approved Execution Steps

### Step 1 — Revalidate current facts

Check Cal.com’s current official documentation and pricing for:

- Free-plan limitations
- Number and treatment of independent resources
- Whether each resource requires a paid user/seat
- API availability
- Webhook availability
- Embedding
- Branding removal
- Google Calendar synchronization
- Cancellation and rescheduling
- Current Platform or managed-user availability

Record exact plan names and costs. Do not rely on the July 2026 research if current vendor documentation differs.

### Step 2 — Run one small Cal.com test

Use hosted Cal.com to model one representative resource, such as one Lone Star model.

Test only:

- A small set of available time slots
- A blocked break
- A session buffer
- One booking
- One reschedule
- One cancellation
- Google Calendar synchronization
- The attendee-facing booking experience
- The administrator-facing schedule

Do not integrate it into Project North Star during this test.

### Step 3 — Test resource scaling

Determine how Cal.com would represent multiple independent models, instructors, rooms, and locations.

Answer:

- Does each resource require a separate user or paid seat?
- Can non-human resources have independent availability?
- What is the real monthly and annual cost at the anticipated Lone Star scale?
- Does the frozen Platform offering prevent the required setup?
- Can the solution remain operationally simple for one administrator?

### Step 4 — Apply the Cal.com decision gate

Accept Cal.com for the initial implementation only if:

- The required scheduling workflow works reliably.
- Multiple resources can be represented without an awkward administrative process.
- The recurring cost is acceptable.
- Required API, webhook, embed, and Google Calendar features are available on an acceptable plan.
- The attendee experience can feel sufficiently native to Lone Star.
- The implementation does not require production self-hosting of Cal.diy.

Reject or pause Cal.com if:

- It requires an impractical paid seat for every non-human or human resource.
- The Platform-plan freeze prevents the needed resource model.
- Essential API or webhook features require unjustifiable pricing.
- Embedding or branding limitations undermine the intended experience.
- Multi-resource scheduling cannot be handled without excessive custom work.

### Step 5 — Test Timekit only if necessary

If Cal.com fails the decision gate, repeat the same representative test in Timekit.

Compare only:

- Correct resource modeling
- Setup effort
- Core scheduling reliability
- API and webhook behavior
- Embedding
- Google Calendar integration
- Total cost
- Vendor viability

Do not restart a broad market survey unless both Cal.com and Timekit fail.

### Step 6 — Make and record the provider decision

Select the first provider that reaches “good enough.”

Record:

- Chosen provider and plan
- Verified cost
- What was tested
- Known limitations
- Rejected alternative and reason
- Date of decision

Only after that decision should implementation instructions be drafted.

## Implementation Limit

If a provider is selected:

- Keep Project North Star resource IDs canonical.
- Add only the provider mappings required by the implementation.
- Put provider-specific calls in one isolated adapter module.
- Keep conflict and permission validation inside Project North Star.
- Normalize incoming provider events at the application boundary.
- Route future AI operations through Project North Star.

Build the simplest implementation that supports the verified workflow.

## Explicit Non-Goals

The following are outside the approved scope:

- Production deployment of Cal.diy
- Self-hosting research or infrastructure
- A formal multi-provider Scheduling Service
- A generalized provider interface built for hypothetical vendors
- Simultaneous Cal.com and Timekit support
- Migration tooling
- Provider failover
- Rebuilding a scheduling engine
- AI concierge implementation
- MCP integration
- Payments or Stripe
- Registration
- CRM
- Marketing automation
- Membership logic
- Unrelated calendar redesign
- Another broad scheduling-platform comparison

## Focus-Drift Rule

Any proposed work outside the approved steps or implementation limit must stop and be identified as a scope expansion.

Do not implement that expansion without a deliberate decision from the project owner.

When uncertain, prefer:

1. The smallest representative test
2. The fewest new abstractions
3. The least custom code
4. The fastest path to a reliable “good enough” result

## Governing Principle

> Own the resource IDs, isolate vendor calls, assume the vendor may change, and do not build the escape vehicle before it is needed.
