import type { Access } from "payload";

export const firstUserOrAuthenticated: Access = async ({ req }) => {
  if (req.user) return true;

  const users = await req.payload.count({ collection: "users" });
  return users.totalDocs === 0;
};
