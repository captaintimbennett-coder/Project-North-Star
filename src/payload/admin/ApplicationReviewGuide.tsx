"use client";

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
      <h3 style={titleStyle}>Process this model application in this order.</h3>
      <ol style={listStyle}>
        <li>Read the application and look at the submitted image.</li>
        <li>Set Step 1 to Accepted, Declined, Waitlist, or Reviewing.</li>
        <li>If accepted and ready to publish, check “Approve for Founders Edition public lineup.”</li>
        <li>Save once. The system creates the profile, approves the image, adds the artist to the retreat, and publishes the public lineup assignment.</li>
        <li>If you only want a private draft, use “Create private draft profile only” instead.</li>
        <li>Step 3 is only a receipt. If it shows a model name, the profile exists.</li>
      </ol>
      <p style={noteStyle}>
        Safe rule: only the public lineup checkbox publishes the artist-facing pieces. The private draft checkbox keeps the profile private.
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
        <li>If accepted, connect the right private photographer profile.</li>
        <li>Add any private notes your team needs.</li>
        <li>Save the application.</li>
      </ol>
      <p style={noteStyle}>
        Safe rule: nothing becomes public from this screen. Publishing happens later from the profile itself.
      </p>
    </section>
  );
}
