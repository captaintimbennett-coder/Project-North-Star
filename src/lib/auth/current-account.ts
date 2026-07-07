import config from "@payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/payload-types";
import { hasAccountRole, isActiveAccount, type AccountRole } from "@/payload/access/account";

export type CurrentAccount = User & { collection?: string };

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const payload = await getPayload({ config });
  const result = await payload.auth({ headers: await headers() });
  const account = result.user as CurrentAccount | null;

  if (!account || account.collection !== "users" || !isActiveAccount(account)) return null;

  const freshAccount = await payload.findByID({
    collection: "users",
    id: account.id,
    overrideAccess: true,
  }) as CurrentAccount | null;

  if (!freshAccount || freshAccount.collection !== "users" || !isActiveAccount(freshAccount)) return null;
  return freshAccount;
}

export async function requireCurrentAccount(nextPath = "/account/access") {
  const account = await getCurrentAccount();
  if (!account) redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  return account;
}

export async function requireAccountRole(role: AccountRole, nextPath: string) {
  const account = await requireCurrentAccount(nextPath);
  if (!hasAccountRole(account, role)) redirect("/account/access-denied");
  return account;
}
