# North Star Platform Architecture

Version 1.0 — July 1, 2026

## Status and purpose

This document records the approved long-term platform architecture for Project
North Star. It guides Lone Star Retreat information architecture in Sprint 2
and future implementation sprints without authorizing those future systems now.

Project North Star should evolve as one creative platform supported by reusable
data models, authenticated portals, and shared services—not as independent web
pages with duplicated information.

## Governing data principle

Every major feature must reference its appropriate canonical record.

1. One `UserAccount` for authentication and platform identity.
2. One `PhotographerMasterProfile` per photographer identity.
3. One `ModelMasterProfile` per model identity.
4. One `EventMasterRecord` per retreat or event.

Authentication remains separate from role-based profiles. A future account may
hold more than one authorized role without combining private role data.

## Canonical records

### PhotographerMasterProfile

The permanent photographer record may eventually contain biography, approved
profile media, contact details, website and social links, equipment, experience
level, emergency contact, attendance history, payment references, agreements,
notification preferences, calendar relationships, and registrations.

### ModelMasterProfile

The permanent model record may eventually contain biography, approved featured
media, approved portfolio media, modeling categories, comfort levels, personal
boundaries, rates, availability, travel information, social links,
publications, consent records, and approval history.

### EventMasterRecord

Each retreat is represented by an event record containing or referencing its
dates, location, venue, maps, directions, lodging, nearby places, airport and
parking information, weather guidance, packing checklist, schedule, pricing,
capacity, participants, policies, and frequently asked questions.

Event logistics belong to the event domain, not to participant profiles.
Normalized supporting records may be used internally, but they remain owned by
or referenced from the event.

## Supporting records

Transactional and auditable activity should use records that reference the
canonical entities rather than copying them:

- `EventParticipation`
- `Application`
- `Registration`
- `Booking`
- `Availability`
- `ScheduleBlock`
- `MediaAsset`
- `ConsentRecord`
- `Agreement`
- `PaymentReference`
- `MessageThread`
- `Notification`

The default booking duration may be two hours, but scheduling must support
other durations without changing the data model.

## Platform surfaces

### Public website

The public site introduces Tim Bennett, Project North Star, Lone Star Retreat,
approved participants, and published events without requiring authentication.
It receives only explicitly approved and publishable fields.

### Photographer portal

Future capabilities may include retreats, registrations, bookings, visual
calendar, Meet the Artists, event logistics, lodging, maps, weather, messages,
downloads, payments, notifications, and account settings.

### Model portal

Future capabilities may include schedules, bookings, availability, rates,
comfort levels, portfolio, event logistics, messages, notifications, and
account settings.

### Admin portal

Future capabilities may include photographer, model, event, booking, payment,
application, messaging, scheduling, approval, and reporting workflows.

## Meet the Artists

Meet the Artists is derived from approved relationships rather than manually
duplicated cards:

```text
EventMasterRecord
  → EventParticipation
    → approved ModelMasterProfile fields
      → approved featured MediaAsset
```

An event model profile is an event-scoped presentation of the Model Master
Profile plus event-specific participation information. It is not another
master profile.

## Application and registration boundaries

### Model application

A model application creates a new pending profile or proposes changes to an
existing Model Master Profile. It may collect biography, categories, comfort
levels, boundaries, rates, travel details, social links, a featured image,
additional portfolio images, and usage consent.

Uploads remain private until reviewed. The approved featured asset becomes the
canonical image reused by the Model Master Profile, Meet the Artists, event
pages, photographer booking views, and admin tools.

### Photographer registration

Photographer registration creates or updates the Photographer Master Profile
and may reference personal information, approved profile media, experience,
equipment, emergency contact, agreements, event registration, and payment
workflow records.

Applications and registrations never publish profile changes automatically.

## Scheduling, booking, and notifications

Availability and bookings reference profiles and events. A confirmed booking
must be capable of updating the relevant photographer, model, admin, and event
calendar views from one record.

Future notifications may include email and SMS confirmations, changes,
reminders, and cancellations. Notification delivery is a shared service and
must not become duplicated business logic inside individual pages.

## Privacy and security requirements

- Private by default.
- Public pages receive only approved fields.
- Sensitive boundaries, comfort levels, emergency contacts, agreements,
  payments, and consent history require restricted access.
- Store payment-provider references only; never store card data.
- Record consent and approval history with timestamps and policy versions.
- Enforce role-based access server-side and with database policies.
- Keep service credentials out of browser code.
- Preserve an audit trail for approval, replacement, and consent changes.

## Sprint 2 boundary

Sprint 2 remains limited to Lone Star Retreat information architecture. It may
define public routes, audience pathways, event-page structures, placeholder
content shapes, and the mock retreat journey.

Sprint 2 does not authorize implementation of authentication, portals,
applications, registration, booking, payments, scheduling, messaging,
notifications, production storage, or public profile publishing.
