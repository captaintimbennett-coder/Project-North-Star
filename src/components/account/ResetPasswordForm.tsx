"use client";

import { useState } from "react";

const minimumPasswordLength = 12;

export function ResetPasswordForm({ token }: { token: string }) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const charactersRemaining = Math.max(
    minimumPasswordLength - password.length,
    0,
  );
  const passwordIsLongEnough = charactersRemaining === 0;
  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!passwordIsLongEnough) {
      setError(
        `Add ${charactersRemaining} more ${charactersRemaining === 1 ? "character" : "characters"} to your new password.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/account/reset-password", {
      body: JSON.stringify({ password, token }),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "This reset link is invalid or has expired.");
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

  return <form className="account-sign-in-form" noValidate onSubmit={submit}>
    <label htmlFor="reset-password">New password</label>
    <input
      aria-describedby="reset-password-guidance"
      aria-invalid={password.length > 0 && !passwordIsLongEnough}
      autoComplete="new-password"
      id="reset-password"
      name="password"
      onChange={(event) => {
        setPassword(event.target.value);
        setError("");
      }}
      required
      type="password"
      value={password}
    />
    <small
      aria-live="polite"
      className={`account-field-guidance${passwordIsLongEnough ? " account-field-guidance--ready" : ""}`}
      id="reset-password-guidance"
    >
      {password.length === 0
        ? "Use 12 or more characters."
        : passwordIsLongEnough
          ? "Password length is ready."
          : `${charactersRemaining} more ${charactersRemaining === 1 ? "character" : "characters"} needed.`}
    </small>
    <label htmlFor="reset-confirm-password">Confirm new password</label>
    <input
      aria-describedby="reset-confirm-guidance"
      aria-invalid={!passwordsMatch}
      autoComplete="new-password"
      id="reset-confirm-password"
      name="confirmPassword"
      onChange={(event) => {
        setConfirmPassword(event.target.value);
        setError("");
      }}
      required
      type="password"
      value={confirmPassword}
    />
    <small
      aria-live="polite"
      className={`account-field-guidance${confirmPassword.length > 0 && passwordsMatch ? " account-field-guidance--ready" : ""}`}
      id="reset-confirm-guidance"
    >
      {confirmPassword.length === 0
        ? "Enter the same password again."
        : passwordsMatch
          ? "Passwords match."
          : "Passwords do not match yet."}
    </small>
    {error && <p className="account-form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={submitting} type="submit">
      {submitting ? "Updating…" : "Reset password"}
    </button>
  </form>;
}
