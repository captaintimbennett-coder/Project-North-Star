"use client";

import { useState } from "react";

export function AccountActivationForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/activate", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        password: String(form.get("password") ?? ""),
        token,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "We could not activate this invitation.");
      setSubmitting(false);
      return;
    }

    setComplete(true);
    setSubmitting(false);
  }

  if (complete) {
    return <div className="account-form-success" role="status">
      <h2>Account activated.</h2>
      <p>Your account is ready. You may now sign in with your email address and password.</p>
      <a className="button button-primary" href="/sign-in">Continue to sign in</a>
    </div>;
  }

  return <form className="account-sign-in-form" onSubmit={submit}>
    <label htmlFor="activation-name">Your name</label>
    <input autoComplete="name" id="activation-name" name="name" required type="text" />
    <label htmlFor="activation-password">Create password</label>
    <input autoComplete="new-password" id="activation-password" minLength={12} name="password" required type="password" />
    <small>Use at least 12 characters. This invitation can only be accepted once.</small>
    {error && <p className="account-form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={submitting} type="submit">
      {submitting ? "Activating…" : "Activate account"}
    </button>
  </form>;
}
