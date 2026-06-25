import Link from "next/link";
import { Eyebrow } from "@/components/layout/Typography";
import { primaryNavigation } from "@/data/navigation";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <Eyebrow>{siteConfig.footer.eyebrow}</Eyebrow>
        <h2>{siteConfig.footer.headline}<br />{siteConfig.footer.headlineEmphasis}</h2>
      </div>
      <div className="footer-grid">
        <div>
          <p className="footer-mark">TB<span>NS</span></p>
          <p className="footer-note">
            {siteConfig.footer.note}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="footer-meta">
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
