import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/admin/", "/api/account/", "/internal/", "/opening-studies/", "/sign-in"],
    },
    sitemap: [
      `${siteConfig.domains.primary}/sitemap.xml`,
      `${siteConfig.domains.loneStarRetreat}/sitemap.xml`,
    ],
  };
}
