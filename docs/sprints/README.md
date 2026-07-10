# Project North Star Sprint System

The files in this directory are the project planning and continuity system for
Project North Star. They record the goal, boundaries, deliverables, decisions,
dependencies, acceptance criteria, and deferred work for each major stage.

Sprint files are living planning documents. Update the relevant file when:

- scope is approved or changed,
- a material decision is made,
- a deliverable is completed,
- work is intentionally deferred,
- a new dependency or risk is discovered, or
- acceptance criteria are verified.

## Required reading for future Codex sessions

Before making material changes, future Codex sessions should review:

1. the current sprint file,
2. [`../master-vision.md`](../master-vision.md),
3. [`../design-system.md`](../design-system.md), and
4. [`../architecture.md`](../architecture.md).

Also consult `content-strategy.md`, `roadmap.md`, and
`codex-instructions.md` when the task touches those areas.

## Sprint sequence

| Sprint | Focus | Status |
| --- | --- | --- |
| 00 | Project foundation and governing context | Complete |
| 01 | Luxury public website foundation | Complete |
| 02 | Design system, imagery, typography, and visual refinement | Complete |
| 03 | Content management and secure administration | Complete |
| 04 | Experience and Lone Star Retreat management | Active |
| 04B | Retreat operations foundation architecture | Active |
| 05 | Applications and review workflows | Planned |
| 06 | Payments, automation, and CRM integration | Planned |

Sprint 04 is the current implementation frontier. Sprint 01 established the
public foundation, Sprint 02 closed with Homepage Design Lock v1.1 and the
multi-page marketing system, and Sprint 03 closed with the verified
Payload/PostgreSQL, protected-application, and canonical-profile foundation.
Sprint 04 owns event-centric Lone Star Retreat publishing and the approved
scheduling foundation. Sprint 04B defines the architecture for retreat
operations before production operational features are built. Planning does not
authorize deployment, paid services, payments, messaging, dashboards, or public
booking access; those actions require Tim’s explicit approval.

## Working convention

- Keep completed sprint records intact; add clarifications rather than
  rewriting history.
- Place newly discovered work in **Deferred Items** unless it is explicitly
  approved for the current sprint.
- Do not silently expand scope across sprint boundaries.
- Mark acceptance criteria complete only after verification.
- Preserve the approved visual direction unless a sprint explicitly authorizes
  a design change.
