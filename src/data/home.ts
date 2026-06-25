import { images } from "./assets";

export const homeContent = {
  hero: {
    image: images.hero.homepage,
    alt: "Editorial portrait in a luminous evening landscape",
    eyebrow: "Photography · Experience · Purpose",
    headline: "A life composed",
    emphasis: "with intention.",
    introduction:
      "The digital home of Tim Bennett—photographer, creative director, educator, and architect of the next chapter.",
    action: { label: "The story", href: "/about" },
  },
  manifesto: {
    eyebrow: "One standard. Many expressions.",
    headline: ["Precision in craft.", "Freedom in creation."],
    paragraphs: [
      "Remarkable photography begins long before the shutter is pressed. It begins with trust, preparation, curiosity, and the ability to create room for something honest to happen.",
      "Project North Star brings every part of that belief together: creative work, meaningful experiences, disciplined growth, and the decision to build what comes next with purpose.",
    ],
    action: { label: "Read the philosophy", href: "/project-north-star" },
  },
  foundation: {
    eyebrow: "The foundation",
    headline: ["Three paths.", "One direction."],
    pillars: [
      {
        number: "01",
        eyebrow: "The Work",
        title: "Portfolio",
        description:
          "Curated editorial, beauty, glamour, and portrait work shaped by trust and exceptional light.",
        href: "/portfolio",
        image: images.portfolio.redEditorial,
      },
      {
        number: "02",
        eyebrow: "The Gatherings",
        title: "Experiences",
        description:
          "Retreats, mentoring, master classes, and special creative events designed with purpose.",
        href: "/experiences",
        image: images.portfolio.goldEditorial,
      },
      {
        number: "03",
        eyebrow: "The Journey",
        title: "Project North Star",
        description:
          "A deliberate pursuit of strength, creativity, purpose, and a life built by intention.",
        href: "/project-north-star",
        image: images.portfolio.balletEvening,
      },
    ],
  },
  perspective: {
    image: images.portfolio.silkBeauty,
    alt: "Editorial portrait in warm, elegant surroundings",
    eyebrow: "The point of view",
    quote: "The next chapter should not be smaller. It should be more honest.",
    body: "Experience creates perspective. Perspective creates the confidence to strip away what no longer matters—and invest deeply in what does.",
    action: { label: "Meet Tim", href: "/about" },
  },
  closing: {
    eyebrow: "Begin a conversation",
    headline: ["Exceptional work begins", "with shared intention."],
    action: {
      label: "Let’s create something meaningful",
      href: "/contact",
    },
  },
} as const;
