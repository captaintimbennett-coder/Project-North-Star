import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/account/SignOutButton";
import { requireCurrentAccount } from "@/lib/auth/current-account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Access",
  robots: { index: false, follow: false, nocache: true },
};

const roleLabels = {
  administrator: "Administrator",
  photographer: "Photographer",
  model: "Model / Featured Artist",
} as const;

export default async function AccountAccessPage() {
  const account = await requireCurrentAccount("/account/access");
  const roles = account.roles ?? [];

  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Identity & access verification</p>
      <h1>Access confirmed.</h1>
      <p>Signed in as {account.name}. Your permissions are enforced on the server.</p>
      <div className="account-role-list" aria-label="Approved account roles">
        {roles.map((role) => <span key={role}>{roleLabels[role]}</span>)}
      </div>
      <div className="account-access-actions">
        {(roles.includes("photographer") || roles.includes("model")) && <Link className="button button-primary" href="/account/my-schedule">Open My Retreat Schedule</Link>}
        {roles.includes("photographer") && <Link className="button button-outline" href="/account/book">Schedule a Shoot</Link>}
        {roles.includes("model") && <Link className="button button-outline" href="/account/availability">Manage Availability</Link>}
        {roles.includes("administrator") && <Link className="button button-outline" href="/admin">Open Payload Administration</Link>}
      </div>
      <SignOutButton />
    </section>
  </main>;
}
