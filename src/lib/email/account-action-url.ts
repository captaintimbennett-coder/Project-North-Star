import { siteConfig } from "@/data/site";

type AccountActionEnvironment = {
  NEXT_PUBLIC_SERVER_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
};

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAccountActionBaseUrl(
  environment: AccountActionEnvironment = process.env as AccountActionEnvironment,
) {
  if (environment.VERCEL_ENV === "preview" && environment.VERCEL_URL) {
    return `https://${withoutTrailingSlash(environment.VERCEL_URL)}`;
  }

  return withoutTrailingSlash(
    environment.NEXT_PUBLIC_SERVER_URL ||
      environment.NEXT_PUBLIC_SITE_URL ||
      siteConfig.url,
  );
}

export function buildAccountActionUrl(
  pathname: "/account/activate" | "/account/reset-password",
  token: string,
  environment: AccountActionEnvironment = process.env as AccountActionEnvironment,
) {
  const url = new URL(pathname, `${getAccountActionBaseUrl(environment)}/`);
  url.searchParams.set("token", token);
  return url.toString();
}
