# Sprint 04 — Experience Manager

Status: Planned

## Goal

Create a structured system for publishing and operating Lone Star Retreat,
master classes, mentoring, and future creative experiences.

## Scope

- Define experience types and lifecycle states.
- Manage dates, locations, capacity, team members, pricing visibility, and
  application or registration status.
- Build public experience detail pages from structured content.
- Add administrative scheduling and participant overview tools.
- Support announcements, requirements, and logistical updates.
- Establish clear safety, respect, professionalism, and conduct information.

## Deliverables

- Experience data model and migrations
- Experience creation and editing interface
- Public experience detail templates
- Date, venue, capacity, and status management
- Team and collaborator management
- Requirements, policies, and FAQ content
- Administrative participant overview
- Publication and archival workflow

## Decisions Made

- “Experiences” remains the public umbrella for multiple offering types.
- Lone Star Retreat is the founding experience, not the entire platform.
- Operational information must be structured rather than embedded in prose.
- Safety and professionalism requirements must be prominent and maintainable.

## Deferred Items

- Final payment processing
- Automated application scoring
- Contract or waiver e-signature
- Complex room assignment
- Travel booking
- Full CRM automation
- Native event mobile application

## Dependencies

- Sprint 03 authentication and content management
- Approved experience lifecycle and required fields
- Confirmed Lone Star Retreat operating model
- Decisions about application versus direct registration
- Legal review of policies, agreements, and acknowledgments where appropriate

## Acceptance Criteria

- [ ] Tim can create, edit, publish, close, and archive an experience.
- [ ] Public pages clearly show approved dates, location, capacity, status, and
  expectations.
- [ ] Lone Star Retreat content can be updated without code changes.
- [ ] Future experience types can be added without redesigning navigation or
  data architecture.
- [ ] Administrative views distinguish draft, open, full, completed, and
  archived experiences.
- [ ] Safety and professional-conduct information is visible and accessible.

## Notes for Future Codex Sessions

Do not assume every experience uses the same commercial model. Keep experience
content reusable while allowing applications, invitations, or direct
registration to be attached later. Operational clarity matters more than adding
decorative features.
