import type { CollectionConfig } from "payload";
import { ownerOnly, staffOnly, staffFieldAccess } from "../access/account";

export const SecurityAuditEvents: CollectionConfig = {
  slug: "security-audit-events",
  labels: {
    plural: "Security Audit Events",
    singular: "Security Audit Event",
  },
  access: {
    create: staffOnly,
    delete: ownerOnly,
    read: staffOnly,
    update: () => false,
  },
  admin: {
    defaultColumns: ["eventType", "severity", "actor", "targetAccount", "occurredAt"],
    description:
      "Immutable security history for account lifecycle, role, status, invitation, and protected-access events.",
    group: "Administration",
    useAsTitle: "eventType",
  },
  fields: [
    {
      name: "eventType",
      type: "text",
      required: true,
    },
    {
      name: "severity",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Critical", value: "critical" },
      ],
      required: true,
    },
    {
      name: "actor",
      type: "relationship",
      relationTo: "users",
      label: "Actor account",
      access: { read: staffFieldAccess },
    },
    {
      name: "targetAccount",
      type: "relationship",
      relationTo: "users",
      label: "Target account",
      access: { read: staffFieldAccess },
    },
    {
      name: "targetInvitation",
      type: "relationship",
      relationTo: "account-invitations",
      label: "Target invitation",
      access: { read: staffFieldAccess },
    },
    {
      name: "metadata",
      type: "json",
      access: { read: staffFieldAccess },
    },
    {
      name: "occurredAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      required: true,
      index: true,
      admin: { date: { pickerAppearance: "dayAndTime", timeFormat: "h:mm a" } },
    },
  ],
};
