# Lone Star Retreat Applicant Experience

Version 1 planning proposal — July 3, 2026

## Experience principles

The landing page and application form have separate jobs.

- The landing page earns trust, explains the opportunity, sets expectations,
  and helps a visitor decide whether the retreat is right for them.
- The application collects accurate review information. It should be calm and
  clear, but it should not continue selling or pressure someone to finish.
- The Application Received page confirms receipt, not acceptance.
- Applications and uploads remain private review records.
- Decisions never create or publish a profile automatically.
- Version 1 has no public account or applicant dashboard.

## Photographer journey

### 1. Photographer landing page

**Proposed route:** `/lone-star-retreat/photographers`

- **Purpose:** Explain the photographer experience, standards, creative value,
  professional expectations, and application process before asking for personal
  information.
- **Visitor goals:** Decide whether the experience, creative disciplines,
  professional conduct, travel commitment, and collaborative model are a fit.
- **Information presented:** Retreat philosophy; who the experience is for;
  what photographers may create and learn; collaboration standards; what is and
  is not promised; application and review overview; concise FAQ.
- **Information collected:** None.
- **Primary CTA:** `Apply for a Retreat →`
- **Secondary CTA:** `View Upcoming Retreats →`
- **Navigation flow:** Lone Star Retreat overview → Photographer landing →
  Photographer Application. The page retains a clear route back to the retreat
  overview and upcoming events.
- **Payload relationship:** Public editorial content may later come from an
  approved Page record. It does not read or create application records.
- **Visitor should feel:** Interested, respected, informed, and confident that
  the retreat is professionally organized.
- **Visitor should accomplish:** Make an informed decision to apply or continue
  exploring without pressure.
- **What happens next:** The primary CTA opens the photographer application.

### 2. Photographer application

**Proposed route:** `/lone-star-retreat/photographers/apply`

- **Purpose:** Collect complete, reviewable information from an applicant who
  has already decided to apply.
- **Visitor goals:** Understand the required information, complete it without
  ambiguity, review consent statements, and submit once.
- **Information collected:** Identity and contact information; location; social,
  website, and portfolio links; marketing attribution; experience level; equipment summary; multiple
  genres/interests; creative intent; retreat goals; collaboration style; five
  required confirmations; honeypot field.
- **Primary CTA:** `Submit Photographer Application`
- **Supporting actions:** `Save` is not offered in Version 1 because there is no
  account or secure draft ownership. `Back to Photographer Experience` remains
  available before submission.
- **Navigation flow:** Photographer landing → Application → Application Received. Avoid
  unrelated promotional exits inside the form.
- **Payload relationship:** Posts multipart form data to
  `/api/applications/photographer`. The protected server endpoint validates the
  request and creates a private `Photographer Application` with status `new`.
  No master profile is created or updated.
- **Visitor should feel:** Calm, clear about expectations, and in control of the
  information being submitted.
- **Visitor should accomplish:** Submit one accurate application with explicit
  consent.
- **What happens next:** A successful response routes to the photographer
  Application Received page. Validation errors remain inline and preserve entered values.

### 3. Photographer Application Received

**Proposed route:** `/lone-star-retreat/photographers/apply/application-received`

- **Purpose:** Confirm receipt and set honest expectations.
- **Visitor goals:** Know the application arrived, understand that acceptance is
  not guaranteed, and know what communication to expect next.
- **Information presented:** The approved Application Received message; private-review
  statement; general review sequence; reminder that no profile is public; a
  support/contact path for corrections.
- **Information collected:** None. Do not put a database ID or applicant email in
  the URL.
- **Primary CTA:** `Return to Lone Star Retreat`
- **Secondary CTA:** `View Upcoming Retreats →`
- **Navigation flow:** Application → Application Received → Retreat overview or events.
- **Payload relationship:** No application lookup. Rendering the page does not
  reveal whether any email address or application exists.
- **Visitor should feel:** Reassured, appreciated, and accurately informed.
- **Visitor should accomplish:** Leave knowing the submission is under review.
- **What happens next:** An administrator reviews the private record.

**Approved message:**

> APPLICATION RECEIVED
>
> Thank you for your interest in becoming part of Lone Star Retreat.
>
> Your application has been received and is now in our private review process.
>
> Our team will carefully review your submission. If your application is selected,
> we will personally contact you with the next steps.
>
> We appreciate your interest and look forward to reviewing your work.

### 4. Admin review and decision

- **Purpose:** Evaluate fit, completeness, professionalism, and event needs.
- **Applicant goal:** Receive a fair decision without having private information
  published or reused prematurely.
- **Admin information:** Submitted application, consent confirmations, status,
  private notes, and later event context.
- **Admin actions:** Move `new` → `reviewing` → `accepted`, `declined`, or
  `waitlist`; add private notes; request corrections outside the platform if
  necessary.
- **Payload relationship:** The application remains the audit/review record.
  Acceptance does not create a Photographer Participant profile. An admin must
  manually create or update and link the canonical profile later.
- **Applicant should feel:** Treated professionally and respectfully regardless
  of outcome.
- **What happens next:** Version 1 decision communication is manual. Automated
  email remains deferred.

## Model journey

### 1. Featured Model landing page

**Proposed route:** `/lone-star-retreat/models`

- **Purpose:** Explain what it means to participate as a Featured Model, the
  creative and professional environment, safety standards, collaboration model,
  travel expectations, and application process.
- **Visitor goals:** Decide whether the retreat supports their creative range,
  professional goals, boundaries, and travel needs.
- **Information presented:** Featured Model philosophy; reasons to participate;
  professional standards; respect for boundaries; portfolio and collaboration
  opportunities without guarantees; private image-review promise; process and
  concise FAQ.
- **Information collected:** None.
- **Primary CTA:** `Apply as Featured Model →`
- **Secondary CTA:** `Meet the Artists →`
- **Navigation flow:** Lone Star Retreat overview → Featured Model landing →
  Model Application. Preserve routes back to the retreat overview and artists.
- **Payload relationship:** Public editorial content may later use an approved
  Page record. It does not expose Model Applications or private media.
- **Visitor should feel:** Respected, safe, inspired, and confident that this is
  a professional creative environment rather than an open casting call.
- **Visitor should accomplish:** Make an informed decision about applying.
- **What happens next:** The primary CTA opens the model application.

### 2. Model application

**Proposed route:** `/lone-star-retreat/models/apply`

- **Purpose:** Collect accurate professional, creative, travel, availability, consent,
  biography, and private review-media information.
- **Visitor goals:** Represent their current session availability honestly,
  provide preferred imagery, and
  understand how that imagery will be used.
- **Information collected:** Identity and contact information; location; social,
  website, portfolio, optional agency information, and marketing attribution; experience and travel;
  required Display / Stage Name and optional private legal name; multiple session
  types; goals; biography and optional artist
  statement; up to five private images; five required confirmations; honeypot.
- **Primary CTA:** `Submit Featured Model Application`
- **Supporting action:** `Back to Featured Model Experience`.
- **Navigation flow:** Featured Model landing → Application → Application Received. Avoid
  promotional detours inside the form.
- **Payload relationship:** Posts multipart form data to
  `/api/applications/model`. The protected endpoint validates all fields and
  files, creates private Media records with platform approval disabled, and
  creates a private `Model Application` with status `new`. It does not create or
  update a Featured Artist profile.
- **Visitor should feel:** Safe, respected, unhurried, and confident about image
  privacy and the meaning of every consent.
- **Visitor should accomplish:** Submit one complete application that accurately
  represents their work and boundaries.
- **What happens next:** A successful response routes to the model Application Received
  page. Inline errors preserve entered values and identify the affected field.

#### Session availability contract

Public question: **Which types of sessions are you available to participate in at Lone Star Retreat?**

Use a multi-select checkbox group. Applicants may select any number of:

- Fashion
- Editorial
- Glamour
- Beauty
- Swimwear
- Lingerie
- Boudoir
- Artistic Nude
- Fine Art Nude
- Conceptual / Fine Art
- Lifestyle
- Other, with a conditional text field

The request repeats the existing `creativeInterests` field and Payload stores
the values as an array. At least one selection is required. Version 1 does not
ask a second, duplicative comfort-level question. Detailed boundaries and
session-specific consent are discussed later if the applicant is accepted.

Display / Stage Name is the required public-facing identity. Legal Name is
optional, private administrative information and must never appear publicly.
If required, legal name may be collected later during acceptance, contracting,
payment, or tax documentation.

### 3. Model Application Received

**Proposed route:** `/lone-star-retreat/models/apply/application-received`

- **Purpose:** Confirm private receipt and explain the review boundary.
- **Visitor goals:** Know the application and images arrived, understand that
  submission is not acceptance, and know that images will not publish without
  separate approval.
- **Information presented:** Receipt confirmation; private media assurance;
  review sequence; general next-step expectations; support/contact path for a
  correction or withdrawal request.
- **Information collected:** None. No applicant or application identifier appears
  in the URL.
- **Primary CTA:** `Return to Lone Star Retreat`
- **Secondary CTA:** `Meet the Artists →`
- **Navigation flow:** Application → Application Received → Retreat overview or artists.
- **Payload relationship:** No private record lookup and no public media read.
- **Visitor should feel:** Reassured, respected, and clear about privacy.
- **Visitor should accomplish:** Leave with an accurate understanding of review.
- **What happens next:** An administrator reviews the application and images.

Use the same approved Application Received message as the Photographer journey.
The page remains warm, professional, and reassuring without exposing an
application ID, email address, uploaded image, or any other private information.

### 4. Admin review and decision

- **Purpose:** Review fit, professionalism, creative range, boundaries, travel,
  consent, and private media before making an event decision.
- **Admin actions:** Move `new` → `reviewing` → `accepted`, `declined`, or
  `waitlist`; add private notes; review, replace, crop, or select a preferred
  image; request clarification outside the platform if necessary.
- **Payload relationship:** The application and media remain private. Acceptance
  does not publish images or create a Featured Artist profile. An administrator
  must manually create or update the canonical profile, approve the selected
  media, and link the application.
- **Applicant should feel:** Their work and boundaries were treated with care.
- **What happens next:** Version 1 decision communication is manual. Automated
  notifications remain deferred.

## Required public pages

Version 1 includes six pages. The complete public applicant journey is now
implemented for Product Owner review:

1. `/lone-star-retreat/photographers` — implemented
2. `/lone-star-retreat/photographers/apply` — implemented as the reference form
3. `/lone-star-retreat/photographers/apply/application-received` — implemented
4. `/lone-star-retreat/models` — implemented
5. `/lone-star-retreat/models/apply` — implemented from the approved reference form
6. `/lone-star-retreat/models/apply/application-received` — implemented

The existing Lone Star Retreat overview and events paths remain upstream
discovery surfaces. A separate public application directory is unnecessary.

## Status-page recommendation

Do not build personalized public status pages in Version 1. Without applicant
authentication, a status lookup would either expose whether someone applied or
require a new secret-token and recovery system. The Application Received pages should set
review expectations, and decisions should be communicated manually until email
automation or a secure applicant portal is approved.

A generic `Application Process` section may live on both landing pages. It is
content, not a status checker.

## Future dashboard opportunities

Do not build these yet. A future authenticated applicant/member portal could
support:

- application status and history;
- secure requests for additional information;
- profile review and approved-image selection;
- event invitations and acceptance;
- agreements and code-of-conduct history;
- travel and availability updates;
- withdrawal and privacy requests;
- later registration, schedule, and payment surfaces after separate approval.

The portal should reference the canonical user and role profile records; it
must not turn the application itself into a permanent public profile.

## Recommended implementation order

1. Approve this journey, page inventory, field language, and privacy promises.
2. Approve concise landing-page content outlines and FAQ topics for each audience.
3. Approve the exact application questions, helper text, consent copy, and error
   messages, including the distinction between availability and later explicit consent.
4. Build accessible form components and the two application pages against the
   already protected endpoints.
5. Build the two Application Received pages and verify that direct navigation reveals no
   applicant information.
6. Build the Photographer and Featured Artist landing pages using the approved
   Lone Star Retreat design system.
7. Perform desktop, tablet, mobile, keyboard, screen-reader, error-recovery,
   privacy, and upload testing.
8. Conduct a Product Owner review before linking the pathways from the live Lone
   Star Retreat landing page.

## Version 1 journey lock

The approved architecture is locked as follows:

```text
Photographer Landing
  → Apply
    → Photographer Application
      → Application Received
        → Private Admin Review

Model Landing
  → Apply as Featured Model
    → Model Application
      → Application Received
        → Private Admin Review
```

Version 1 includes no public status page, applicant dashboard, public account,
or automatic profile publishing. Accepted applicants are manually promoted to
canonical profiles by an administrator after review.

Both application journeys include the approved
[`foundation/lone-star-retreat-code-of-conduct.md`](foundation/lone-star-retreat-code-of-conduct.md)
as an accessible in-page disclosure. Applicants must acknowledge the standards
before submission without leaving or losing progress in the application.
