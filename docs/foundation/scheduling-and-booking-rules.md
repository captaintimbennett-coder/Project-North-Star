# Lone Star Retreat Scheduling & Booking Business Rules

- Version: 1.0
- Status: Approved Foundation Document
- Owner: Project North Star
- Last Updated: July 2026

## Purpose

This document defines the official scheduling and booking rules for Lone Star
Retreat.

These are business rules, not implementation details. All future calendar,
booking, dashboard, notification, and payment features should conform to this
specification unless superseded by a later Product Decision.

## Philosophy

Lone Star Retreat facilitates professional connections between photographers
and models.

The platform provides:

- Event registration
- Scheduling
- Calendar management
- Notifications
- Administrative oversight

The platform does not manage:

- Creative direction
- Pricing negotiations
- Model compensation
- Photographer/model financial transactions

Those remain private agreements between the participants.

## Booking Philosophy

Bookings are:

- Professional
- First-come, first-served
- Instantly confirmed
- Calendar-driven
- Event-specific

## Booking Time Blocks

The scheduling system uses 60-minute booking blocks.

Models may define their own minimum booking requirement, such as:

- 1 hour minimum
- 2 hour minimum
- 3 hour minimum

The system enforces the model's selected minimum. Internally, bookings remain
60-minute blocks. Visually, consecutive bookings are displayed as one
continuous reservation.

For example, three consecutive blocks from 9:00–10:00, 10:00–11:00, and
11:00–12:00 display as **9:00 AM–12:00 PM**.

## Model Availability

Default availability is **6:00 AM–6:00 PM**.

Each participating model may:

- Block unavailable times
- Add lunch breaks
- Extend availability beyond 6:00 PM
- Customize availability before booking opens

Models may not block time that has already been booked. Confirmed bookings are
protected.

## Booking Opens

Photographers gain booking access immediately after:

- Application approval
- Registration completion, if applicable

Booking is first-come, first-served. No universal booking release date exists.

## Booking Confirmation

Bookings are confirmed immediately.

Once confirmed:

- The photographer calendar updates
- The model calendar updates
- The time becomes unavailable to others

No approval workflow exists. The administrator retains override authority.

## Consecutive Bookings

Photographers may book:

- Multiple consecutive blocks
- Multiple sessions per day
- Multiple days
- Multiple models

There is no platform-imposed booking limit. Availability is the only
restriction.

## Booking Type

Version 1 supports **Private One-on-One Shoots**.

Future versions may support:

- Group shoots
- Workshops
- Specialty events

These will be separate booking types.

## Cancellation Policy

Models may not cancel bookings by editing availability. Once booked, the
reservation is locked. Any cancellation becomes an administrative event.

The organizer may:

- Cancel
- Reschedule
- Reassign
- Resolve conflicts

## Financial Responsibility

There are two completely separate financial transactions.

### Photographer to Lone Star Retreat

Covers:

- Admission
- Registration
- Event participation

This may eventually be processed through Stripe.

### Photographer to Model

This is a private agreement and may use:

- Venmo
- Cash App
- Zelle
- Cash
- Other agreed payment methods

Lone Star Retreat is not involved. No model pricing is published and no model
payments are processed by the platform.

## Model Rates

Model rates are intentionally excluded from the platform. Pricing remains a
private discussion between photographer and model.

After booking, they communicate directly regarding:

- Rates
- Creative concepts
- Wardrobe
- Props
- Expectations
- Payment

## Communication Philosophy

Lone Star Retreat introduces professionals. It is not an internal messaging
platform. After booking, participants communicate directly.

## Contact Information Sharing

During registration, each participant selects which information may be shared
after a confirmed booking.

Required:

- Email

Optional:

- Instagram
- Mobile phone
- Website

Only approved information is shared.

## Notification Preferences

Both photographers and models choose notification preferences.

Available methods:

- Email, required
- SMS
- Dashboard notifications
- Multiple methods

Email remains mandatory.

## Shared Retreat Schedule

Approved participants may view a shared retreat schedule.

Visible information:

- Photographer
- Model
- Date
- Time
- Session status

Hidden information:

- Email
- Phone
- Payment
- Admin notes
- Private data

The shared schedule exists to help participants coordinate throughout the
retreat.

## Administrator Master Calendar

The organizer has access to a complete operational calendar.

Functions include:

- View every photographer
- View every model
- View every booking
- View blocked time
- View available time
- Drag and move bookings
- Cancel bookings
- Resolve conflicts
- Override schedules
- Manage the retreat visually

This calendar serves as the operational control center for the event.

## Booking Entry Points

The scheduling system supports two workflows using the same scheduling engine.

### Workflow A — Artist First

Participating Artist → Artist Profile → Schedule a Shoot → Availability
Calendar → Confirm Booking

### Workflow B — Availability First

Retreat Schedule → Select Day/Time → View Available Artists → Choose Artist →
Confirm Booking

## Calendar UX Standard

The future calendar experience must be treated as a premium product interface,
not as a basic scheduling table.

The calendar should feel:

- Extremely elegant
- Exceptionally professional
- Highly visual
- Interactive
- Easy to understand at a glance
- Consistent with the Project North Star design language

Future calendar interfaces should support:

- Clear booked and available states
- Consecutive booking blocks displayed as one continuous reservation
- Hover or click details
- Day and artist views
- An administrator master-calendar view
- A participant-facing retreat schedule
- Mobile-friendly interaction
- Restrained motion and premium visual polish

This standard governs the future scheduling and calendar prototype. It does not
authorize calendar UI implementation.

## Future Considerations

Potential future enhancements include:

- Advanced availability filtering
- Genre filters
- Style filters
- Workshop scheduling
- Waitlists
- Automatic reminders
- Calendar syncing
- Dashboard analytics
- Stripe registration payments
- Event statistics

These are outside Version 1.

## Product Principle

The scheduling system exists to create a professional, friction-free experience
that allows photographers and models to connect quickly while giving Lone Star
Retreat complete administrative oversight.

Scheduling should always feel:

- Fast
- Elegant
- Professional
- Transparent
- Reliable
