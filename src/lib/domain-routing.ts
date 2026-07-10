import { siteConfig } from "@/data/site";

export const loneStarRetreatDomainUrl = siteConfig.domains.loneStarRetreat;

function normalizeHost(host: string): string {
  return host
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/:\d+$/, "");
}

export function getHostFromUrl(url: string): string {
  return normalizeHost(new URL(url).host);
}

export function isLoneStarRetreatHost(host: string | null): boolean {
  if (!host) return false;

  return normalizeHost(host) === getHostFromUrl(loneStarRetreatDomainUrl);
}

export function retreatDomainPath(path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${loneStarRetreatDomainUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
}
