import { images } from "./assets";

export const portfolioContent = {
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
} as const;
