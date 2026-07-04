import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: "Content",
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alternative text",
      required: true,
    },
    {
      name: "credit",
      type: "text",
      defaultValue: "Tim Bennett",
    },
    {
      name: "usageApproved",
      type: "checkbox",
      defaultValue: false,
      label: "Approved for platform use",
    },
  ],
  upload: {
    focalPoint: true,
    imageSizes: [
      {
        name: "card",
        width: 900,
        height: 1125,
        position: "centre",
      },
      {
        name: "hero",
        width: 2000,
        height: 1200,
        position: "centre",
      },
    ],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};
