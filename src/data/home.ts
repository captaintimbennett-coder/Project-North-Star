import { images } from "./assets";

export const homeContent = {
  hero: {
    image: images.hero.founderPortrait,
    alt: "Tim Bennett seated against a dark studio background in a contemplative portrait",
    headline: ["Capturing", "Confidence.", "Creating Legacy."],
    supporting: ["Photography with purpose.", "Imagery that endures."],
    signature: "Tim Bennett",
    signatureImage: images.brand.signature,
    paths: [
      {
        title: "Portfolio",
        description: "Explore my work",
        href: "/portfolio",
        icon: "camera",
      },
      {
        title: "Lone Star",
        description: "Model photography events",
        href: "/lone-star-retreat",
        icon: "star",
      },
      {
        title: "Private Client",
        description: "Personal & exclusive sessions",
        href: "/contact",
        icon: "person",
      },
    ],
  },
  experience: {
    eyebrow: "The Experience",
    headline: "Professional. Personal. Unforgettable.",
    features: [
      {
        title: "Portraits & Glamour",
        description:
          "Empowering you with imagery that reveals your best.",
        href: "/portfolio",
        image: images.portfolio.redEditorial,
      },
      {
        title: "Lone Star Retreats",
        description:
          "Photographic experiences in iconic locations across Texas.",
        href: "/lone-star-retreat",
        image: images.portfolio.goldEditorial,
      },
      {
        title: "Private Sessions",
        description:
          "Personalized sessions designed around your vision.",
        href: "/contact",
        image: images.portfolio.silkBeauty,
      },
    ],
  },
  closingQuote: {
    quote: "Great photography isn’t about the camera. It’s about the connection.",
    signature: "Tim Bennett",
  },
} as const;
