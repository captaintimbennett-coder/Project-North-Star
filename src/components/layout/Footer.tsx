import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/assets";
import { primaryNavigation } from "@/data/navigation";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <Image
          src={images.brand.northStarSymbol}
          alt=""
          width={64}
          height={69}
        />
        <h2>
          {siteConfig.footer.signature.firstLine.lead}
          <em>{siteConfig.footer.signature.firstLine.emphasis}</em>
          {" "}
          {siteConfig.footer.signature.secondLine.lead}
          <em>{siteConfig.footer.signature.secondLine.emphasis}</em>
        </h2>
        <span aria-hidden="true" />
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
