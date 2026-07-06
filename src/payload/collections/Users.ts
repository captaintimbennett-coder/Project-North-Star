import { APIError, UnauthorizedError, type CollectionConfig } from "payload";
import { writeSecurityAuditEvent } from "@/lib/security/audit";
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
    {
      name: "invitedAt",
      type: "date",
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "invitationAcceptedAt",
      type: "date",
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "lastLoginAt",
      type: "date",
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "suspendedAt",
      type: "date",
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "suspensionReason",
      type: "textarea",
      label: "Private suspension reason",
      access: {
        create: ownerFieldAccess,
        read: ownerFieldAccess,
        update: ownerFieldAccess,
      },
    },
    {
      name: "sessionVersion",
      type: "number",
      defaultValue: 1,
      label: "Session version",
      access: {
        create: ownerFieldAccess,
        read: ownerFieldAccess,
        update: ownerFieldAccess,
      },
      admin: {
        description: "Incremented when access should be revoked. Existing Payload sessions are cleared when an account is suspended.",
        readOnly: true,
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

      const nextData: Record<string, unknown> = { ...data, role: staffPermission };
      if (operation === "update" && originalDoc?.accountStatus !== "suspended" && status === "suspended") {
        nextData.suspendedAt = data.suspendedAt ?? new Date().toISOString();
        nextData.sessionVersion = Number(originalDoc?.sessionVersion ?? 1) + 1;
        nextData.sessions = [];
      }

      return nextData;
    }],
    beforeLogin: [({ user }) => {
      if (user.accountStatus !== "active") throw new UnauthorizedError();
      return user;
    }],
    afterLogin: [async ({ req, user }) => {
      await req.payload.update({
        collection: "users",
        data: { lastLoginAt: new Date().toISOString() },
        id: user.id,
        overrideAccess: true,
        req,
      });
    }],
    afterChange: [async ({ doc, operation, previousDoc, req }) => {
      if (operation === "create") {
        await writeSecurityAuditEvent(req.payload, {
          actor: req.user?.id,
          eventType: "account.created",
          metadata: { createdAccountId: doc.id, roles: doc.roles, status: doc.accountStatus },
        });
      }

      if (operation === "update") {
        if (previousDoc?.accountStatus !== doc.accountStatus) {
          await writeSecurityAuditEvent(req.payload, {
            actor: req.user?.id,
            eventType: "account.status_changed",
            metadata: { from: previousDoc?.accountStatus, to: doc.accountStatus },
            severity: doc.accountStatus === "suspended" ? "warning" : "info",
            targetAccount: doc.id,
          });
        }

        if (JSON.stringify(previousDoc?.roles ?? []) !== JSON.stringify(doc.roles ?? [])) {
          await writeSecurityAuditEvent(req.payload, {
            actor: req.user?.id,
            eventType: "account.roles_changed",
            metadata: { from: previousDoc?.roles, to: doc.roles },
            severity: "warning",
            targetAccount: doc.id,
          });
        }
      }
    }],
  },
};
