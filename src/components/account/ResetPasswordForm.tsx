"use client";

import { useState } from "react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/account/reset-password", {
      body: JSON.stringify({ password, token }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setError("This reset link is invalid or has expired.");
      setSubmitting(false);
      return;
    }

    setComplete(true);
    setSubmitting(false);
  }

  if (complete) {
    return <div className="account-form-success" role="status">
      <h2>Password updated.</h2>
      <p>Your password has been reset. You may now sign in with your new password.</p>
      <a className="button button-primary" href="/sign-in">Continue to sign in</a>
    </div>;
  }

  return <form className="account-sign-in-form" onSubmit={submit}>
    <label htmlFor="reset-password">New password</label>
    <input autoComplete="new-password" id="reset-password" minLength={12} name="password" required type="password" />
    <label htmlFor="reset-confirm-password">Confirm new password</label>
    <input autoComplete="new-password" id="reset-confirm-password" minLength={12} name="confirmPassword" required type="password" />
    <small>Use at least 12 characters.</small>
    {error && <p className="account-form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={submitting} type="submit">
      {submitting ? "Updating…" : "Reset password"}
    </button>
  </form>;
}
