import { images } from "./assets";

export const homeContent = {
  hero: {
    image: images.people.timBennett,
    alt: "Editorial portrait of founder, photographer, and educator Tim Bennett",
    name: "Tim Bennett",
    roles: "Photographer · Educator · Creator · Mentor",
    statement: [
      "I create images.",
      "I build experiences that transform.",
      "Guided by purpose.",
      "Driven by excellence.",
      "Built on trust.",
    ],
    introduction:
      "Project North Star is the philosophy that guides every image, experience, and idea in the world Tim Bennett has built.",
    action: { label: "Explore Project North Star", href: "/project-north-star" },
  },
  manifesto: {
    eyebrow: "The vision behind the work",
    headline: ["One creative life.", "Many expressions."],
    paragraphs: [
      "Tim has built more than a body of photographs. His work brings together private portraiture, education, mentorship, editorial creation, and carefully considered experiences—all shaped by the same personal standard.",
      "Project North Star is the philosophy beneath that world: direction in the choices, purpose in the work, excellence in the details, and trust in every relationship.",
    ],
    action: { label: "Explore the philosophy", href: "/project-north-star" },
  },
  foundation: {
    eyebrow: "The experiences",
    headline: ["Different paths.", "One North Star."],
    pillars: [
      {
        number: "01",
        eyebrow: "Portraiture",
        title: "Private Portraiture",
        description:
          "Refined boudoir, glamour, and portrait experiences built around trust, expression, and exceptional light.",
        href: "/portfolio",
        image: images.portfolio.redEditorial,
      },
      {
        number: "02",
        eyebrow: "Gatherings",
        title: "Retreats & Education",
        description:
          "Lone Star Retreat, workshops, and immersive creative gatherings designed with purpose and professional care.",
        href: "/experiences",
        image: images.portfolio.goldEditorial,
      },
      {
        number: "03",
        eyebrow: "Guidance & Legacy",
        title: "Mentoring & Editorial",
        description:
          "One-on-one mentoring, editorial projects, and creative collaborations that strengthen craft, clarify direction, and extend the work.",
        href: "/experiences",
        image: images.portfolio.balletEvening,
      },
    ],
  },
  perspective: {
    image: images.hero.homepage,
    alt: "Confident woman in a bronze evening gown photographed against a charcoal studio backdrop",
    eyebrow: "The founder's perspective",
    quote: "I create images. I build experiences that transform.",
    body: "Everything in this world begins with the same standard: prepare deeply, act with purpose, earn trust, and make room for something extraordinary to happen.",
    action: { label: "The story behind the work", href: "/about" },
  },
  closing: {
    eyebrow: "Enter the experience",
    headline: ["Find your place", "in the world we're building."],
    action: {
      label: "Begin a conversation",
      href: "/contact",
    },
  },
} as const;
