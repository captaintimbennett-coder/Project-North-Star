export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://timbennettproductions.com",
  name: "Tim Bennett",
  projectName: "Project North Star",
  location: "Dallas–Fort Worth · Texas",
  email: "captaintimbennett@gmail.com",
  metadata: {
    title: "Tim Bennett | Project North Star",
    titleTemplate: "%s | Tim Bennett",
    description:
      "Photography, creative experiences, and a life built with intention by Tim Bennett.",
  },
  footer: {
    signature: {
      firstLine: { lead: "Create with ", emphasis: "intention." },
      secondLine: { lead: "Build something worth ", emphasis: "remembering." },
    },
    note: "Photography, experiences, and a life shaped with intention.",
  },
} as const;
