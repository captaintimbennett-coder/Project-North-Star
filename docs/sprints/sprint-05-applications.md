# Sprint 05 — Applications

Status: Planned

## Goal

Provide secure, respectful, and efficient application workflows for
photographers, models, makeup artists, stylists, and other experience
participants.

## Scope

- Define role-specific application questions and required acknowledgments.
- Build accessible application forms.
- Support draft, submission, review, waitlist, acceptance, and decline states.
- Create administrative review and internal note tools.
- Add secure document or portfolio-link handling where required.
- Notify applicants and administrators of important status changes.
- Establish retention and privacy rules.

## Deliverables

- Application and applicant data models
- Role-specific form schemas
- Secure submission endpoints
- Applicant confirmation messages
- Administrative review queue
- Filtering, status updates, notes, and assignment
- Acceptance, waitlist, and decline communication templates
- Consent, privacy, and data-retention documentation

## Decisions Made

- Application workflows must reflect safety, respect, and professionalism.
- Different participant roles may require different questions and evidence.
- Sensitive applicant data should be collected only when necessary.
- Review decisions require auditable statuses and internal notes.
- Public-facing communications should remain warm, clear, and dignified.
- Accepted model applications may be deliberately converted into draft canonical
  model profiles by staff, but acceptance must never publish a profile
  automatically.

## Deferred Items

- Automated acceptance decisions
- Background checks
- E-signature and legal document execution
- Travel and lodging management
- Payment collection
- Deep CRM synchronization

## Dependencies

- Sprint 03 authentication and permissions
- Sprint 04 experience records and capacity states
- Approved application questions and selection criteria
- Privacy policy and retention decisions
- Transactional email provider
- Vercel Blob-backed production media storage for private upload durability

## Acceptance Criteria

- [ ] Applicants can submit accessible, role-appropriate applications.
- [ ] Duplicate and incomplete submissions are handled predictably.
- [ ] Administrators can review, filter, annotate, and change application
  status securely.
- [ ] Accepted model applications can create or link a draft canonical model
  profile without publishing it.
- [ ] Applicants receive accurate status communications.
- [ ] Private application data is inaccessible to unauthorized users.
- [ ] Retention, export, correction, and deletion procedures are documented.
- [ ] Application states integrate with the related experience and capacity.

## Notes for Future Codex Sessions

Treat application data as private and potentially sensitive. Minimize
collection, avoid transmitting personal data to unapproved services, and never
substitute automated scoring for Tim’s judgment unless a later sprint explicitly
defines appropriate safeguards.
