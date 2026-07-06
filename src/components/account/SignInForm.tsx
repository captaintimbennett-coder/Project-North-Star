"use client";

import { useState } from "react";

function safeNextPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account/access";
}

export function SignInForm({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/users/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      setError("We could not sign you in with those credentials.");
      setSubmitting(false);
      return;
    }

    window.location.assign(safeNextPath(nextPath));
  }

  return <form className="account-sign-in-form" onSubmit={submit}>
    <label htmlFor="account-email">Email address</label>
    <input autoComplete="email" id="account-email" name="email" required type="email" />
    <label htmlFor="account-password">Password</label>
    <input autoComplete="current-password" id="account-password" name="password" required type="password" />
    {error && <p className="account-form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={submitting} type="submit">
      {submitting ? "Signing in…" : "Sign in"}
    </button>
  </form>;
}
