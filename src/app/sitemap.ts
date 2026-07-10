import type { MetadataRoute } from "next";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { siteConfig } from "@/data/site";
import { retreatDomainPath } from "@/lib/domain-routing";

const routes = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/portfolio", priority: 0.9 },
  { path: "/private-client", priority: 0.8 },
  { path: "/lone-star-retreat", priority: 0.8 },
  { path: "/workshops-education", priority: 0.8 },
  { path: "/experiences", priority: 0.6 },
  { path: "/project-north-star", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
] as const;

const loneStarRetreatRoutes = [
  { url: retreatDomainPath("/"), priority: 0.9 },
  { url: retreatDomainPath("/lone-star-retreat"), priority: 0.8 },
  { url: retreatDomainPath("/lone-star-retreat/photographers"), priority: 0.7 },
  { url: retreatDomainPath("/lone-star-retreat/models"), priority: 0.7 },
  { url: retreatDomainPath(currentRetreatEdition.artistsPath), priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...routes.map(({ path, priority }) => ({
      url: `${siteConfig.url}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...loneStarRetreatRoutes.map(({ url, priority }) => ({
      url,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
    })),
  ];
}
