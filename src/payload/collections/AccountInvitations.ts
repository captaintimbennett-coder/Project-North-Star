import type { CollectionConfig } from "payload";
import { ownerOnly, ownerOrEditorOnly, staffFieldAccess, staffOnly } from "../access/account";
import { writeSecurityAuditEvent } from "@/lib/security/audit";

export const AccountInvitations: CollectionConfig = {
  slug: "account-invitations",
  labels: {
    plural: "Account Invitations",
    singular: "Account Invitation",
  },
  access: {
    create: ownerOrEditorOnly,
    delete: ownerOnly,
    read: staffOnly,
    update: ownerOrEditorOnly,
  },
  admin: {
    defaultColumns: ["email", "status", "roles", "tokenExpiresAt", "acceptedAt"],
    description:
      "Invitation-only account activation records. Raw activation tokens are never stored.",
    group: "Administration",
    useAsTitle: "email",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      label: "Invited account roles",
      options: [
        { label: "Administrator", value: "administrator" },
        { label: "Photographer", value: "photographer" },
        { label: "Model", value: "model" },
      ],
      required: true,
    },
    {
      name: "staffPermission",
      type: "select",
      label: "Staff permission level",
      options: [
        { label: "Owner", value: "owner" },
        { label: "Editor", value: "editor" },
        { label: "Reviewer", value: "reviewer" },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.roles?.includes("administrator"),
        description: "Only applies when the invitation includes administrator access.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Accepted", value: "accepted" },
        { label: "Revoked", value: "revoked" },
        { label: "Expired", value: "expired" },
      ],
      required: true,
      index: true,
    },
    {
      name: "tokenHash",
      type: "text",
      required: true,
      index: true,
      access: {
        read: () => false,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: "tokenExpiresAt",
      type: "date",
      required: true,
      index: true,
      label: "Invitation expires at",
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "invitedBy",
      type: "relationship",
      relationTo: "users",
      access: { read: staffFieldAccess },
    },
    {
      name: "acceptedAccount",
      type: "relationship",
      relationTo: "users",
      access: { read: staffFieldAccess },
    },
    {
      name: "acceptedAt",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "revokedAt",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
    {
      name: "relatedModelProfile",
      type: "relationship",
      relationTo: "model-profiles",
      label: "Related model profile",
      access: { read: staffFieldAccess },
    },
    {
      name: "relatedPhotographerProfile",
      type: "relationship",
      relationTo: "photographer-profiles",
      label: "Related photographer profile",
      access: { read: staffFieldAccess },
    },
    {
      name: "adminNotes",
      type: "textarea",
      label: "Private administrator notes",
      access: { read: staffFieldAccess },
    },
  ],
  hooks: {
    afterChange: [async ({ doc, operation, previousDoc, req }) => {
      if (operation === "create") {
        await writeSecurityAuditEvent(req.payload, {
          actor: typeof doc.invitedBy === "number" || typeof doc.invitedBy === "string" ? doc.invitedBy : req.user?.id,
          eventType: "account_invitation.created",
          metadata: { email: doc.email, invitationId: doc.id, roles: doc.roles },
        });
      }

      if (operation === "update" && previousDoc?.status !== doc.status) {
        await writeSecurityAuditEvent(req.payload, {
          actor: req.user?.id,
          eventType: "account_invitation.status_changed",
          metadata: {
            acceptedAccountId: typeof doc.acceptedAccount === "number" ? doc.acceptedAccount : undefined,
            from: previousDoc?.status,
            invitationId: doc.id,
            to: doc.status,
          },
          severity: doc.status === "revoked" ? "warning" : "info",
        });
      }
    }],
  },
};
