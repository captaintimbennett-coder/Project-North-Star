import { images } from "./assets";

export const portfolioContent = {
  hero: {
    eyebrow: "Selected work · The North Star standard",
    title: "Portfolio",
    introduction:
      "A considered body of editorial, beauty, glamour, and portrait work shaped by trust, exceptional light, and quiet confidence.",
    image: images.portfolio.redEditorial,
    imageAlt: "Editorial portrait from Tim Bennett's selected portfolio",
    action: { label: "Explore the collections", href: "#collections" },
  },
  introduction: {
    eyebrow: "Selected work · Curated by collection",
    title: "Portfolio",
    body: "A curated collection of editorial, beauty, glamour, and portrait work—created with intention, exceptional light, and a belief that remarkable photography begins with trust.",
  },
  collectionStatus: "Collection being curated",
  collections: [
    {
      title: "Editorial",
      description:
        "Narrative portraiture with the confidence and scale of a magazine story.",
      image: images.portfolio.redEditorial,
    },
    {
      title: "Beauty",
      description:
        "Exceptional light, refined detail, and an unwavering attention to presence.",
      image: images.portfolio.silkBeauty,
    },
    {
      title: "Glamour",
      description:
        "Sophisticated, collaborative imagery grounded in elegance rather than excess.",
      image: images.portfolio.goldEditorial,
    },
    {
      title: "Portraiture",
      description:
        "Personal portraits created around trust, character, and quiet confidence.",
      image: images.portfolio.balletEvening,
    },
    {
      title: "Publications",
      description:
        "Selected commissioned and internationally published editorial work.",
      image: images.hero.homepage,
    },
  ],
  overview: {
    eyebrow: "The work",
    title: "Craft before volume.",
    introduction:
      "These collections are being shaped as focused editorial chapters rather than a single endless gallery.",
    blocks: [
      {
        label: "Approach",
        title: "Intentional light",
        body: "Every frame begins with a clear visual idea and lighting designed to serve the person, not overpower them.",
      },
      {
        label: "Experience",
        title: "Built on trust",
        body: "Direction, preparation, and connection create the space for confident, honest work.",
      },
      {
        label: "Curation",
        title: "Imagery that endures",
        body: "Final selections favor presence, craft, and a point of view that remains compelling beyond the moment.",
      },
    ],
  },
  cta: {
    eyebrow: "Create with Tim",
    title: "Ready to begin a conversation?",
    body: "Private commissions and creative collaborations begin with a thoughtful exchange about your vision.",
    action: { label: "Contact Tim", href: "/contact" },
  },
} as const;
