import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/buttons";
import { Eyebrow } from "@/components/layout";
import { adminContent } from "@/data/admin";

export const metadata: Metadata = { title: "Content Studio" };

export default function AdminPage() {
  return (
    <main className="studio-page" id="main-content">
      <aside className="studio-sidebar">
        <div>
          <p className="studio-mark">TB<span>NS</span></p>
          <p>Content Studio</p>
        </div>
        <nav aria-label="Content Studio">
          <a className="is-active" href="#overview">Overview</a>
          <a href="#content">Content</a>
          <a href="#media">Media Library</a>
          <a href="#inquiries">Inquiries</a>
          <a href="#settings">Settings</a>
        </nav>
        <Link href="/">View website</Link>
      </aside>

      <section className="studio-main">
        <header>
          <div>
            <Eyebrow>Project North Star</Eyebrow>
            <h1>{adminContent.greeting}</h1>
          </div>
          <Button>New content</Button>
        </header>

        <div className="studio-summary" id="overview">
          <div><strong>6</strong><span>Content areas</span></div>
          <div><strong>3</strong><span>Drafts in progress</span></div>
          <div><strong>0</strong><span>New inquiries</span></div>
        </div>

        <section className="studio-content" id="content">
          <div className="studio-section-heading">
            <div>
              <Eyebrow>Website content</Eyebrow>
              <h2>Manage the platform</h2>
            </div>
            <p>Everything here is designed to be updated without editing code.</p>
          </div>
          <div className="studio-grid">
            {adminContent.areas.map(({ title, description, status }) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <span>{status}</span>
                </div>
                <p>{description}</p>
                <Button variant="ghost">Manage</Button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
