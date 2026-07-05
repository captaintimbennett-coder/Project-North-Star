import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";
import { firstUserOrAuthenticated } from "../access/firstUserOrAuthenticated";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    create: firstUserOrAuthenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: "Administration",
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      defaultValue: "owner",
      options: [
        { label: "Owner", value: "owner" },
        { label: "Editor", value: "editor" },
        { label: "Reviewer", value: "reviewer" },
      ],
      required: true,
    },
  ],
};
