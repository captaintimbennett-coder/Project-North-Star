import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access Unavailable",
  robots: { index: false, follow: false, nocache: true },
};

export default function AccessDeniedPage() {
  return <main className="account-access-page" id="main-content">
    <section className="account-access-panel">
      <p className="ds-eyebrow">Private access</p>
      <h1>Access unavailable.</h1>
      <p>This account does not have permission to open that area.</p>
      <Link className="button button-outline" href="/account/access">Return to account access</Link>
    </section>
  </main>;
}
