import { images } from "./assets";

export const portfolioContent = {
  hero: {
    eyebrow: "The art of visual storytelling",
    titleLineOne: "Where vision",
    titleLineTwo: "becomes art.",
    introduction:
      "A curated collection of imagery that celebrates beauty, emotion, and artistry through light, composition, and a clear vision.",
    image: images.portfolio.heroReal,
    imageAlt: "Black-and-white editorial portrait by Tim Bennett",
  },
  collectionsEyebrow: "Explore the collections",
  collections: [
    {
      slug: "glamour",
      title: "Glamour",
      description: "Bold. Confident. Timeless.",
      image: images.portfolio.glamourLizAshley,
      imageAlt: "Liz Ashley in a burgundy gown photographed by Tim Bennett",
    },
    {
      slug: "boudoir",
      title: "Boudoir",
      description: "Intimate. Elegant. Authentic.",
      image: images.portfolio.boudoirAzuraGrace,
      imageAlt: "Azura Grace in lavender lingerie and a pale fur coat photographed by Tim Bennett",
    },
    {
      slug: "editorial",
      title: "Editorial",
      description: "Stylized. Narrative. Impactful.",
      image: images.portfolio.editorialAlysonBeauty,
      imageAlt: "Alyson in a dramatic blue rain beauty portrait photographed by Tim Bennett",
    },
    {
      slug: "artistic-nude",
      title: "Artistic Nude",
      description: "Form. Light. Emotion. Art.",
      image: images.portfolio.artisticNudeReal,
      imageAlt: "Fine-art figure study photographed by Tim Bennett",
    },
  ],
} as const;
