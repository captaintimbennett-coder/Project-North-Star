# Scheduling Engine Research Summary — Project North Star / Lone Star Retreat

**Status:** Background research supporting the authoritative Scheduling Engine Proof-of-Concept Decision
**Updated:** July 24, 2026
**Scope:** Scheduling only

**Authoritative decision:** [`../decisions/scheduling-engine-poc.md`](../decisions/scheduling-engine-poc.md)

## Requirement

Project North Star needs a scheduling engine, not an all-in-one event-management platform.

The engine may need to schedule models, instructors, rooms, locations, studios, equipment, and staff across multiple event days. It should handle independent availability, session lengths, blocked periods, breaks, buffers, time zones, conflict prevention, calendar synchronization, embedding, APIs, and webhooks.

Payments, CRM, registration, memberships, accounting, and marketing are separate modules.

## Central Finding

Most mainstream scheduling products are person-centric. They assume that a person owns a calendar and accepts appointments. Rooms, equipment, and other resources are usually missing or treated as secondary features.

- **Cal.com:** Strong API, embeds, webhooks, Google integration, and AI/MCP investment. Independent resources may require treating each resource as a user, which must be tested for feasibility and cost.
- **Timekit:** Strongest native, generic resource model. Weaker AI/MCP story and a smaller-vendor dependency.
- **SimplyBook.me:** More generic provider semantics, but weaker infrastructure for real-time API-driven integration.
- **Calendly:** Mature and familiar, but designed primarily for person-to-person meetings, with important features commonly gated by paid tiers.
- **Acuity:** Mature appointment scheduling, but its resource model does not match the requirement well.
- **Google Appointment Schedules:** Useful Google Calendar feature, but not a sufficient embeddable scheduling engine with the necessary API control.
- **Microsoft Bookings, SavvyCal, and YouCanBookMe:** Not shortlisted because their resource model, Google fit, customization, or platform APIs are weaker for this use case.

## Material Cal.com Changes

Two developments changed the original recommendation:

1. Cal.com’s Platform offering stopped accepting new signups on December 15, 2025. A new project should not assume access to its managed-user model.
2. On April 15, 2026, Cal.com moved its commercial production codebase from a public to a private repository.

Cal.diy remains available as a community/self-hostable edition, but it is excluded from current production planning because it is positioned for personal, non-production use without production security or support guarantees.

Consequently, Cal.com should be evaluated as hosted SaaS. Its previous production self-hosting advantage over Timekit should not be included in the decision.

## Architectural Agreement

Project North Star should own canonical resources and identities. A scheduling provider’s IDs are implementation mappings only.

All future AI actions should pass through Project North Star’s API so that permissions, credits, booking rules, and cross-resource conflicts are checked before the provider is called.

Provider-specific calls should be isolated. However, the project should not build a generalized multi-provider framework before a second provider is genuinely needed. One thin adapter module is sufficient for the initial implementation.

## Scope-Creep Correction

The initial architectural review proposed a fuller provider-neutral Scheduling Service. That approach is defensible for a large platform but excessive for a mostly completed, solo-founder project.

The converged position is:

- Preserve canonical Project North Star resource IDs.
- Isolate vendor calls.
- Keep Project North Star’s validation authoritative.
- Avoid speculative interfaces, migration systems, and self-hosting work.
- Do not let future scheduling research delay already-completed calendar work.

## Current Candidates

### Cal.com

Cal.com remains the first proof-of-concept candidate because of:

- Strong scheduling workflow
- Purpose-built embedding
- API and webhook support
- Google Calendar integration
- AI/MCP investment
- A hosted free plan suitable for an initial experiment

Open questions:

- Can multiple independent resources be represented simply?
- Does each resource require a paid seat?
- Does the Platform-plan freeze block the intended resource approach?
- Which API, webhook, embed, and branding capabilities are paid?
- What would the real annual cost be at Lone Star scale?

### Timekit

Timekit is the fallback proof-of-concept candidate because:

- Resource is a first-class API object.
- Human and non-human resources can be modeled uniformly.
- Less custom mapping may be required.

Concerns:

- Hosted-only vendor dependency
- Smaller company and ecosystem
- No comparable native MCP strategy identified
- Paid access for deeper API and customization capabilities

## Converged Recommendation

Do not begin with another broad comparison or a custom scheduling build.

First deploy the completed calendar work. When scheduling becomes the active mission:

1. Recheck current official Cal.com plans and capabilities.
2. Test hosted Cal.com using one representative resource.
3. Determine the real resource model and cost at the required scale.
4. Accept Cal.com if it reaches “good enough” simply and affordably.
5. Test Timekit only if Cal.com fails.
6. Record the decision and implement one thin adapter.

The authoritative scope and decision gates are defined in [`../decisions/scheduling-engine-poc.md`](../decisions/scheduling-engine-poc.md).
