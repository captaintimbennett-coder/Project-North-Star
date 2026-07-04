import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout";
import { applicationReceivedContent as content } from "@/data/applications";

export const metadata: Metadata = {
  title: "Application Received | Lone Star Retreat",
  description: "Your Featured Artist application has been received for private review.",
  robots: { index: false, follow: false },
};

export default function ModelApplicationReceivedPage() {
  return <main id="main-content" className="retreat-page application-received-page"><Container className="application-received"><span className="retreat-star" aria-hidden="true">✦</span><p className="ds-eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><span className="retreat-rule" aria-hidden="true" /><div>{content.paragraphs.map(p => <p key={p}>{p}</p>)}</div><Link className="ds-button ds-button--primary" href="/lone-star-retreat">Return to Lone Star Retreat <span aria-hidden="true">→</span></Link></Container></main>;
}
