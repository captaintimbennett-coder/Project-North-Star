"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { images } from "@/data/assets";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hasDarkHero = [
    "/portfolio",
    "/private-client",
    "/lone-star-retreat",
    "/workshops-education",
    "/about",
    "/contact",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <header
      className={[
        "site-header",
        isHome ? "" : "site-header-interior",
        hasDarkHero ? "site-header-dark" : "",
        open ? "site-header-menu-open" : "",
      ].filter(Boolean).join(" ")}
    >
      {isHome && (
        <nav className="home-navigation home-navigation--left" aria-label="Primary">
          <HeaderLink href="/" label="Home" pathname={pathname} />
          <HeaderLink href="/portfolio" label="Portfolio" pathname={pathname} />
        </nav>
      )}

      <Link className="wordmark" href="/" aria-label="Tim Bennett — home">
        {isHome && (
          <Image
            className="wordmark-compass"
            src={images.brand.northStarSymbol}
            alt=""
            width={52}
            height={56}
            priority
          />
        )}
        <span>{siteConfig.name}</span>
        <small>{isHome ? "Photography" : siteConfig.projectName}</small>
      </Link>

      {isHome && (
        <nav className="home-navigation home-navigation--right" aria-label="Secondary">
          <HeaderLink href="/about" label="About" pathname={pathname} />
          <HeaderLink href="/contact" label="Contact" pathname={pathname} />
        </nav>
      )}

      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{open ? "Close" : "Menu"}</span>
        <i aria-hidden="true" />
      </button>

      <nav
        className={`primary-navigation ${isHome ? "primary-navigation--home" : ""} ${open ? "is-open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {primaryNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              item.href === "/"
                ? pathname === "/" ? "page" : undefined
                : pathname.startsWith(item.href) ? "page" : undefined
            }
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function HeaderLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return <Link href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
}
