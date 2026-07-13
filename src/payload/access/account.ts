import type { Access, FieldAccess } from "payload";

export type AccountRole = "administrator" | "photographer" | "model";
export type StaffPermission = "owner" | "editor" | "reviewer";

type AccountLike = {
  accountStatus?: "active" | "invited" | "suspended" | null;
  id: number | string;
  role?: StaffPermission | null;
  roles?: AccountRole[] | null;
};

export function getAccount(user: unknown): AccountLike | null {
  if (!user || typeof user !== "object" || !("id" in user)) return null;
  return user as AccountLike;
}

export function isActiveAccount(user: unknown): user is AccountLike {
  const account = getAccount(user);
  return Boolean(account && account.accountStatus === "active");
}

export function hasAccountRole(user: unknown, role: AccountRole) {
  const account = getAccount(user);
  return Boolean(isActiveAccount(account) && account.roles?.includes(role));
}

export function isStaff(user: unknown) {
  return hasAccountRole(user, "administrator");
}

export function isOwner(user: unknown) {
  const account = getAccount(user);
  return Boolean(account && isStaff(account) && account.role === "owner");
}

export function hasStaffPermission(user: unknown, allowed: StaffPermission[]) {
  const account = getAccount(user);
  return Boolean(account && isStaff(account) && account.role && allowed.includes(account.role));
}

export const activeAccount: Access = ({ req }) => isActiveAccount(req.user);
export const staffOnly: Access = ({ req }) => isStaff(req.user);
export const ownerOnly: Access = ({ req }) => isOwner(req.user);
export const ownerOrEditorOnly: Access = ({ req }) => hasStaffPermission(req.user, ["owner", "editor"]);

export const ownerOrSelf: Access = ({ req }) => {
  if (isOwner(req.user)) return true;
  const account = getAccount(req.user);
  if (!isActiveAccount(account)) return false;
  return { id: { equals: account.id } };
};

export const ownerFieldAccess: FieldAccess = ({ req }) => isOwner(req.user);
export const staffFieldAccess: FieldAccess = ({ req }) => isStaff(req.user);

export function staffOrOwnProfile(role: Extract<AccountRole, "model" | "photographer">): Access {
  return ({ req }) => {
    if (isStaff(req.user)) return true;
    const account = getAccount(req.user);
    if (!isActiveAccount(account) || !hasAccountRole(account, role)) return false;
    return { account: { equals: account.id } };
  };
}

export const staffOrOwnBooking: Access = ({ req }) => {
  if (isStaff(req.user)) return true;
  const account = getAccount(req.user);
  if (!isActiveAccount(account)) return false;

  const filters: Record<string, { equals: number | string }>[] = [];
  if (hasAccountRole(account, "model")) filters.push({ "artist.account": { equals: account.id } });
  if (hasAccountRole(account, "photographer")) {
    filters.push({ "photographer.account": { equals: account.id } });
  }

  if (!filters.length) return false;
  return filters.length === 1 ? filters[0] : { or: filters };
};

export const staffOrOwnAvailability: Access = ({ req }) => {
  if (isStaff(req.user)) return true;
  const account = getAccount(req.user);
  if (!isActiveAccount(account) || !hasAccountRole(account, "model")) return false;
  return { "artist.account": { equals: account.id } };
};
