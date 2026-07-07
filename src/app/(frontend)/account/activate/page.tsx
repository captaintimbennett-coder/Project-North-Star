import type { Metadata } from "next";
import { AccountActivationForm } from "@/components/account/AccountActivationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activate Account",
  description: "Invitation-only account activation for Project North Star.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountActivationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Project North Star · Invitation access</p>
      <h1>Activate your account.</h1>
      <p>Set your password to finish your invitation-only account setup.</p>
      {token
        ? <AccountActivationForm token={token} />
        : <p className="account-form-error" role="alert">This activation link is missing its secure token.</p>}
      <small>Public account creation is not available.</small>
    </section>
  </main>;
}
