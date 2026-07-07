"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    await fetch("/api/account/forgot-password", {
      body: JSON.stringify({ email: String(form.get("email") ?? "") }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    setComplete(true);
    setSubmitting(false);
  }

  if (complete) {
    return <div className="account-form-success" role="status">
      <h2>Check your email.</h2>
      <p>If an account exists for that address, a secure password reset link has been sent.</p>
    </div>;
  }

  return <form className="account-sign-in-form" onSubmit={submit}>
    <label htmlFor="forgot-email">Email address</label>
    <input autoComplete="email" id="forgot-email" name="email" required type="email" />
    <button className="button button-primary" disabled={submitting} type="submit">
      {submitting ? "Sending…" : "Send reset link"}
    </button>
  </form>;
}
