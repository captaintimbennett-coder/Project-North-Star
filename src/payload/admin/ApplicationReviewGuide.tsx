"use client";

import { currentRetreatEdition } from "@/data/retreat-editions";

const cardStyle = {
  background: "rgba(209, 162, 77, 0.10)",
  border: "1px solid rgba(209, 162, 77, 0.35)",
  borderRadius: "12px",
  marginBottom: "1.5rem",
  padding: "1rem 1.15rem",
} as const;

const eyebrowStyle = {
  color: "#d1a24d",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  margin: "0 0 0.35rem",
  textTransform: "uppercase",
} as const;

const titleStyle = {
  color: "#f5f0e8",
  fontSize: "1rem",
  fontWeight: 700,
  margin: "0 0 0.65rem",
} as const;

const listStyle = {
  color: "#f5f0e8",
  lineHeight: 1.6,
  margin: "0",
  paddingLeft: "1.35rem",
} as const;

const noteStyle = {
  color: "rgba(245, 240, 232, 0.72)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
  margin: "0.8rem 0 0",
} as const;

export function ModelApplicationReviewGuide() {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>What to do next</p>
      <h3 style={titleStyle}>One-screen review flow.</h3>
      <ol style={listStyle}>
        <li>Read the application and look at the submitted image.</li>
        <li>Set Step 1 to Accepted, Declined, Waitlist, or Reviewing.</li>
        <li>
          If accepted, publication permission is confirmed, and the profile is ready to show publicly, check “Approve publicly for {currentRetreatEdition.shortTitle}” and save once. The acceptance email is sent only after the public profile and event assignment succeed.
        </li>
        <li>
          If accepted but not ready to show publicly, check “Create private draft profile only” and save once.
        </li>
        <li>After saving, Step 3 is just the receipt showing which Featured Artist profile was created or updated.</li>
        <li>When participation is confirmed, check the artist’s assignment in the retreat event. “Confirmed” grants participant eligibility without public display; public lineup approval uses “Approved for public display.”</li>
        <li>In Account Invitations, use the applicant’s email, select Model, and connect that same model profile before saving. This sends a separate account activation email.</li>
        <li>After activation, verify the profile’s linked user account. The artist can sign in and use Manage Availability and their retreat schedules. Check the profile’s booking email and contact permissions before booking begins.</li>
      </ol>
      <p style={noteStyle}>
        Acceptance and account access are separate. The acceptance email does not create a login. If the applicant already has an account, connect that account with the Model role to the profile instead of sending a new-account invitation. Keep event assignment and invitations pending until you are ready to grant participation.
      </p>
    </section>
  );
}

export function PhotographerApplicationReviewGuide() {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>What to do next</p>
      <h3 style={titleStyle}>Process this photographer application in this order.</h3>
      <ol style={listStyle}>
        <li>Read the application and review the submitted information.</li>
        <li>Set Step 1 to Accepted, Declined, Waitlist, or Reviewing.</li>
        <li>If accepted, create or connect the right private photographer profile in Photographers / Participants.</li>
        <li>Add any private notes your team needs.</li>
        <li>Save the application.</li>
        <li>When participation is confirmed, add that profile to Participating photographers in the retreat event and select “Approved for booking.” “Invited” and “Registered” do not grant booking access.</li>
        <li>In Account Invitations, use the applicant’s email, select Photographer, and connect that same photographer profile before saving. This sends the account activation email.</li>
        <li>After activation, verify the profile’s linked user account. The photographer can sign in and use Schedule a Shoot and their retreat schedules. Check the profile’s booking email and contact permissions before booking begins.</li>
      </ol>
      <p style={noteStyle}>
        Accepting this application does not create an account or grant event access. If the applicant already has an account, connect that account with the Photographer role to the profile instead of sending a new-account invitation. Keep event assignment and invitations pending until you are ready to grant participation.
      </p>
    </section>
  );
}
