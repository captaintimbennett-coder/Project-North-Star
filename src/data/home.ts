import { images } from "./assets";

export const homeContent = {
  hero: {
    headline: ["Capturing Confidence.", "Creating Legacy."],
    supporting: ["Photography with purpose.", "Imagery that endures."],
    signatureImage: images.brand.signature,
    paths: [
      {
        title: "Portfolio",
        href: "/portfolio",
      },
      {
        title: "Private Client",
        href: "/private-client",
      },
      {
        title: "Lone Star Retreat",
        href: "/lone-star-retreat",
      },
      {
        title: "Workshops & Education",
        href: "/workshops-education",
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
        href: "/private-client",
        image: images.portfolio.silkBeauty,
      },
    ],
  },
  closingQuote: {
    quote: "Great photography isn’t about the camera. It’s about the connection.",
    signature: "Tim Bennett",
  },
} as const;
