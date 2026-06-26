"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/data/navigation";
import { siteConfig } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        open ? "site-header-menu-open" : "",
      ].filter(Boolean).join(" ")}
    >
      <Link className="wordmark" href="/" aria-label="Tim Bennett — home">
        <span>{siteConfig.name}</span>
        <small>{siteConfig.projectName}</small>
      </Link>

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
        className={`primary-navigation ${open ? "is-open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {primaryNavigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
