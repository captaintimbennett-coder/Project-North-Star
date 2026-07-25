# Operational Follow-ups

These items track vendor, account, and service-continuity work outside software
missions.

## Confirm SendGrid long-term transactional service

Status: awaiting vendor action

- SendGrid Consumer Trust review is pending.
- Tim submitted the requested business explanation and supporting email
  screenshot.
- Current transactional delivery is operational.
- The trial expires September 5, 2026.
- Confirm Consumer Trust approval status and the ongoing transactional plan and
  sending continuity.
- Escalate with SendGrid before expiration if the review remains unresolved.

This external dependency is operationally monitored and does not block Mission
06 engineering completion.

## Monitor recruitment email delivery

Status: operational after July 25, 2026 key replacement

- A previously working production SendGrid key stopped producing outbound API
  activity; the available logs do not establish whether it was revoked,
  replaced, corrupted, or otherwise became unusable.
- The replacement production key is restricted to Mail Send access.
- Photographer and Featured Artist application receipts and administrator
  notifications were successfully revalidated in production on July 25, 2026.
- After any SendGrid key change, Vercel environment-variable change, or
  production redeployment affecting email, submit one controlled application
  and confirm both the applicant receipt and administrator notification.
- If an application reaches its received page but mail is absent, check both
  Vercel function logs for an outgoing SendGrid request and SendGrid Email
  Activity before changing application code.
- Do not rely on the received page alone as proof of email delivery; application
  persistence intentionally remains successful when email delivery fails.
