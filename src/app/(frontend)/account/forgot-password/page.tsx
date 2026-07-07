import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a secure password reset link for Project North Star.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ForgotPasswordPage() {
  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Project North Star · Secure access</p>
      <h1>Reset your password.</h1>
      <p>Enter your email address and, if an account exists, we will send a secure reset link.</p>
      <ForgotPasswordForm />
      <small>For privacy, this page never confirms whether an email address has an account.</small>
    </section>
  </main>;
}
