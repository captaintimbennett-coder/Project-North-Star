export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://timbennettproductions.com",
  domains: {
    primary: process.env.NEXT_PUBLIC_SITE_URL ?? "https://timbennettproductions.com",
    loneStarRetreat:
      process.env.NEXT_PUBLIC_LONE_STAR_RETREAT_URL ??
      "https://thelonestarretreat.com",
  },
  name: "Tim Bennett",
  projectName: "Project North Star",
  ecosystemName: "Tim Bennett Productions",
  location: "Dallas–Fort Worth · Texas",
  email: "captaintimbennett@gmail.com",
  metadata: {
    title: "Tim Bennett | Project North Star",
    titleTemplate: "%s | Tim Bennett",
    description:
      "Photography, creative experiences, and a life built with intention by Tim Bennett.",
  },
  loneStarRetreat: {
    name: "Lone Star Retreat",
    title: "Lone Star Retreat — Founders Edition",
    titleTemplate: "%s | Lone Star Retreat",
    description:
      "A premium, invitation-only creative retreat for serious photographers and featured models, created by Tim Bennett and shaped by the Project North Star standard.",
    ogImage: "/images/lone-star-retreat/texas-hill-country-hero-v1.jpg",
  },
  footer: {
    signature: {
      firstLine: { lead: "Create with ", emphasis: "intention." },
      secondLine: { lead: "Build something worth ", emphasis: "remembering." },
    },
    note: "Photography, experiences, and a life shaped with intention.",
  },
} as const;
