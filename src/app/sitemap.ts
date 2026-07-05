import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

const routes = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/portfolio", priority: 0.9 },
  { path: "/private-client", priority: 0.8 },
  { path: "/lone-star-retreat", priority: 0.8 },
  { path: "/lone-star-retreat/photographers", priority: 0.7 },
  { path: "/lone-star-retreat/models", priority: 0.7 },
  { path: "/lone-star-retreat/texas-hill-country-creative-retreat", priority: 0.8 },
  { path: "/lone-star-retreat/texas-hill-country-creative-retreat/artists", priority: 0.7 },
  { path: "/workshops-education", priority: 0.8 },
  { path: "/experiences", priority: 0.6 },
  { path: "/project-north-star", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
  }));
}
