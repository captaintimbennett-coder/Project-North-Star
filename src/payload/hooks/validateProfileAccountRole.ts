import { APIError, type CollectionBeforeChangeHook } from "payload";
import type { AccountRole } from "../access/account";

function relationshipID(value: unknown): number | string | null {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "number" || typeof id === "string") return id;
  }
  return null;
}

export function validateProfileAccountRole(
  requiredRole: Extract<AccountRole, "model" | "photographer">,
): CollectionBeforeChangeHook {
  return async ({ data, req }) => {
    const accountID = relationshipID(data.account);
    if (!accountID) return data;

    const account = await req.payload.findByID({
      collection: "users",
      id: accountID,
      depth: 0,
      overrideAccess: true,
      req,
    });

    if (!account.roles?.includes(requiredRole)) {
      throw new APIError(`The linked account must include the ${requiredRole} role.`, 400);
    }

    return data;
  };
}
