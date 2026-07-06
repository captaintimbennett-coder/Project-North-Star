import type { Access } from "payload";
import { isOwner } from "./account";

export const firstUserOrAuthenticated: Access = async ({ req }) => {
  const users = await req.payload.count({ collection: "users" });
  if (users.totalDocs === 0) return true;
  return isOwner(req.user);
};
