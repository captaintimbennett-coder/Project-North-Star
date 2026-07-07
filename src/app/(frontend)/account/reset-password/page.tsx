import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose New Password",
  description: "Create a new password for Project North Star secure access.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Project North Star · Secure access</p>
      <h1>Choose a new password.</h1>
      <p>This secure reset link is time-limited. If it has expired, request a new one.</p>
      {token
        ? <ResetPasswordForm token={token} />
        : <p className="account-form-error" role="alert">This reset link is missing its secure token.</p>}
    </section>
  </main>;
}
