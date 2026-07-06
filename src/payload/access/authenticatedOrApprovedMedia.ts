import type { Access } from "payload";
import { isActiveAccount } from "./account";

export const authenticatedOrApprovedMedia: Access = ({ req }) => {
  if (isActiveAccount(req.user)) return true;
  return { usageApproved: { equals: true } };
};
