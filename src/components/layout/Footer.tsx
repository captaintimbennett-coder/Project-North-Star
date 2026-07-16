import Link from "next/link";
import { primaryNavigation } from "@/data/navigation";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-identity">
          <p>{siteConfig.name}</p>
          <span>{siteConfig.footer.descriptor}</span>
        </div>
        <nav aria-label="Footer navigation">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="footer-meta">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </div>
    </footer>
  );
}
