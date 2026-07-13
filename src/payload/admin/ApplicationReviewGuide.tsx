"use client";

import { useMemo, useState } from "react";

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

const actionStyle = {
  alignItems: "flex-start",
  background: "rgba(245, 240, 232, 0.06)",
  border: "1px solid rgba(245, 240, 232, 0.18)",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "0.65rem",
  marginTop: "1rem",
  padding: "0.85rem",
} as const;

const buttonStyle = {
  background: "#d1a24d",
  border: 0,
  borderRadius: "999px",
  color: "#111",
  cursor: "pointer",
  fontSize: "0.88rem",
  fontWeight: 800,
  padding: "0.65rem 0.95rem",
} as const;

const smallTextStyle = {
  color: "rgba(245, 240, 232, 0.76)",
  fontSize: "0.86rem",
  lineHeight: 1.45,
  margin: 0,
} as const;

function useModelApplicationID() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;

    const match = window.location.pathname.match(/\/admin\/collections\/model-applications\/(\d+)/);
    if (!match?.[1]) return null;

    return match[1];
  }, []);
}

function RepairModelApplicationLabelsButton() {
  const applicationID = useModelApplicationID();
  const [message, setMessage] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);

  if (!applicationID) return null;

  async function repairLabels() {
    setIsRepairing(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/model-applications/${applicationID}/repair-labels`, {
        credentials: "same-origin",
        method: "POST",
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        result?: {
          displayName?: string;
          mediaIDs?: number[];
          profileID?: number;
          repairedMedia?: number;
          repairedProfile?: boolean;
        };
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "The repair did not finish.");
      }

      const repairResult = result?.result;
      const fixedSomething = repairResult?.repairedProfile || Number(repairResult?.repairedMedia ?? 0) > 0;

      setMessage(
        fixedSomething
          ? `Done. Fixed profile: ${repairResult?.repairedProfile ? "yes" : "no"}. Fixed images: ${repairResult?.repairedMedia ?? 0}. Refreshing now…`
          : `The repair ran, but did not change anything. Found profile: ${repairResult?.profileID ?? "no"}. Found images: ${repairResult?.mediaIDs?.length ?? 0}.`,
      );

      if (fixedSomething) window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The repair did not finish.");
    } finally {
      setIsRepairing(false);
    }
  }

  return (
    <div style={actionStyle}>
      <p style={smallTextStyle}>
        If Step 3 or the image says “Untitled,” click this. It fixes the missing names without using the Save button.
      </p>
      <button disabled={isRepairing} onClick={repairLabels} style={buttonStyle} type="button">
        {isRepairing ? "Fixing names…" : "Fix missing names now"}
      </button>
      {message ? <p style={smallTextStyle}>{message}</p> : null}
    </div>
  );
}

export function ModelApplicationReviewGuide() {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>What to do next</p>
      <h3 style={titleStyle}>Process this model application in this order.</h3>
      <ol style={listStyle}>
        <li>Read the application and look at the submitted image.</li>
        <li>Set Step 1 to Accepted, Declined, Waitlist, or Reviewing.</li>
        <li>If accepted, save the application.</li>
        <li>Look at Step 3.</li>
        <li>If Step 3 says “Select a value,” no draft profile has been made yet. Check Step 2 and save.</li>
        <li>If Step 3 shows a model name, the draft profile already exists. Go to Models / Featured Artists in the left menu and open that same name.</li>
      </ol>
      <p style={noteStyle}>
        Safe rule: nothing becomes public from this screen. The draft profile must still be reviewed and published later by Tim.
      </p>
      <RepairModelApplicationLabelsButton />
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
