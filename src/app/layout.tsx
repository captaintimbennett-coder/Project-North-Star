import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { siteConfig } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.metadata.title,
    template: siteConfig.metadata.titleTemplate,
  },
  description: siteConfig.metadata.description,
  applicationName: siteConfig.projectName,
  creator: siteConfig.name,
  icons: {
    icon: "/images/brand/north-star-symbol-v1.0.png",
    shortcut: "/images/brand/north-star-symbol-v1.0.png",
    apple: "/images/brand/north-star-symbol-v1.0.png",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.projectName,
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
