import { APIError, UnauthorizedError, type CollectionConfig } from "payload";
import { isStaff, ownerFieldAccess, ownerOnly, ownerOrSelf } from "../access/account";
import { firstUserOrAuthenticated } from "../access/firstUserOrAuthenticated";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 2 * 60 * 60,
    useSessions: true,
  },
  access: {
    admin: ({ req }) => isStaff(req.user),
    create: firstUserOrAuthenticated,
    delete: ownerOnly,
    read: ownerOrSelf,
    update: ownerOrSelf,
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
      label: "Staff permission level",
      options: [
        { label: "Owner", value: "owner" },
        { label: "Editor", value: "editor" },
        { label: "Reviewer", value: "reviewer" },
      ],
      required: true,
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: {
        condition: (_, siblingData) => siblingData?.roles?.includes("administrator"),
        description: "Applies only to administrator accounts.",
      },
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["administrator"],
      label: "Account roles",
      options: [
        { label: "Administrator", value: "administrator" },
        { label: "Photographer", value: "photographer" },
        { label: "Model", value: "model" },
      ],
      required: true,
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: {
        description: "Only an owner may assign or change account roles.",
      },
    },
    {
      name: "accountStatus",
      type: "select",
      defaultValue: "active",
      label: "Account status",
      options: [
        { label: "Invited", value: "invited" },
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
      ],
      required: true,
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: {
        description: "Invited and suspended accounts cannot access protected platform features.",
      },
    },
  ],
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      if (operation === "create") {
        const users = await req.payload.count({ collection: "users", overrideAccess: true, req });
        if (users.totalDocs === 0) {
          return { ...data, accountStatus: "active", role: "owner", roles: ["administrator"] };
        }
      }

      const roles = data.roles ?? originalDoc?.roles ?? [];
      const status = data.accountStatus ?? originalDoc?.accountStatus;
      const staffPermission = roles.includes("administrator")
        ? data.role ?? originalDoc?.role
        : null;

      const removingLastOwner = operation === "update"
        && originalDoc?.roles?.includes("administrator")
        && originalDoc?.role === "owner"
        && originalDoc?.accountStatus === "active"
        && (!roles.includes("administrator") || staffPermission !== "owner" || status !== "active");

      if (removingLastOwner) {
        const remainingOwners = await req.payload.count({
          collection: "users",
          overrideAccess: true,
          req,
          where: {
            and: [
              { id: { not_equals: originalDoc.id } },
              { roles: { contains: "administrator" } },
              { role: { equals: "owner" } },
              { accountStatus: { equals: "active" } },
            ],
          },
        });
        if (remainingOwners.totalDocs === 0) {
          throw new APIError("At least one active owner account must remain.", 400);
        }
      }

      return { ...data, role: staffPermission };
    }],
    beforeLogin: [({ user }) => {
      if (user.accountStatus !== "active") throw new UnauthorizedError();
      return user;
    }],
  },
};
