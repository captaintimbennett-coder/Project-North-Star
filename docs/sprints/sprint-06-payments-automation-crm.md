# Sprint 06 — Payments, Automation, and CRM

Status: Planned

## Goal

Connect approved commercial and communication workflows so registrations,
payments, follow-ups, and administrative records operate reliably with minimal
manual duplication.

## Scope

- Integrate Stripe for approved paid products or experiences.
- Define deposits, balances, refunds, discounts, taxes, and payment states.
- Connect transactional email and approved notification workflows.
- Introduce CRM synchronization or a lightweight internal relationship model.
- Automate appropriate follow-ups and administrative reminders.
- Add financial and operational reporting.
- Build webhook processing, retries, and audit records.

## Deliverables

- Stripe product, price, checkout, and webhook architecture
- Payment and order records linked to experiences or products
- Deposit, balance, cancellation, and refund workflows
- Transactional email templates
- CRM/contact synchronization strategy
- Automation rules with clear ownership and opt-out behavior
- Administrative payment and communication status views
- Monitoring, retry, reconciliation, and audit documentation

## Decisions Made

- Stripe is the preferred payment provider.
- Payment status must be confirmed by secure server-side webhooks, not browser
  redirects alone.
- Financial records and operational records require clear reconciliation.
- Automation should reduce repetitive administration without making
  communications feel impersonal.
- CRM integration should follow defined business workflows rather than dictate
  them.

## Deferred Items

- Subscription membership unless a clear product requires it
- Multi-currency support
- Complex affiliate or commission systems
- Full accounting-platform automation
- AI-generated outbound communication without human review
- Native mobile payment flows

## Dependencies

- Explicit authorization to create or connect Stripe and communication services
- Sprint 04 experience pricing and registration decisions
- Sprint 05 participant and applicant records
- Approved cancellation, refund, tax, and privacy policies
- Production deployment with secure secrets
- Chosen CRM or approved internal alternative

## Acceptance Criteria

- [ ] Approved payments can be completed securely.
- [ ] Webhooks update authoritative payment states idempotently.
- [ ] Deposits, balances, refunds, and failures are represented accurately.
- [ ] Administrators can reconcile participant and payment records.
- [ ] Customers receive correct transactional communications.
- [ ] Automation failures are visible and retryable.
- [ ] CRM or contact records do not create uncontrolled duplicates.
- [ ] Secrets, payment data, consent, and audit records follow documented
  security practices.

## Notes for Future Codex Sessions

Payments and outbound automation are high-consequence systems. Verify current
provider documentation, tax and policy assumptions, webhook security,
idempotency, and failure recovery before implementation. Never activate live
payments, send production messages, or connect a CRM without Tim’s explicit
approval.
