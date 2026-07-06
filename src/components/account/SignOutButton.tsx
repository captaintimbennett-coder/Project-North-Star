"use client";

import { useState } from "react";

export function SignOutButton() {
  const [submitting, setSubmitting] = useState(false);

  async function signOut() {
    setSubmitting(true);
    await fetch("/api/users/logout", { method: "POST", credentials: "same-origin" });
    window.location.assign("/sign-in");
  }

  return <button className="account-text-action" disabled={submitting} onClick={signOut} type="button">
    {submitting ? "Signing out…" : "Sign out"}
  </button>;
}
