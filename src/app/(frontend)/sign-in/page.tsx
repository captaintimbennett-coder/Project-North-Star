import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/SignInForm";
import { getCurrentAccount } from "@/lib/auth/current-account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Member Sign In",
  description: "Secure member access for Lone Star Retreat participants.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentAccount()) redirect("/account/access");
  const { next = "/account/access" } = await searchParams;

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Lone Star Retreat · Private access</p>
      <h1>Welcome back.</h1>
      <p>Sign in to continue to your approved retreat access.</p>
      <SignInForm nextPath={next} />
      <small>Access is invitation-only. Public account creation is not available.</small>
    </section>
  </main>;
}
