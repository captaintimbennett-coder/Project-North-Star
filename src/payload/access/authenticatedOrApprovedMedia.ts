import type { Access } from "payload";

export const authenticatedOrApprovedMedia: Access = ({ req }) => {
  if (req.user) return true;
  return { usageApproved: { equals: true } };
};
