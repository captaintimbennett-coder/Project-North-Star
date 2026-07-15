import { images } from "./assets";

export const aboutContent = {
  hero: {
    eyebrow: "Photographer · Educator · Creator · Mentor",
    title: "About Tim",
    introduction:
      "Tim Bennett brings the discipline of a long aviation career to a creative practice built on exceptional light, precise preparation, and genuine human connection.",
    image: images.hero.founderPortrait,
    imageAlt: "Tim Bennett seated in a contemplative studio portrait",
    action: { label: "Discover the story", href: "#about-overview" },
  },
  introduction: {
    eyebrow: "Photographer · Creative director · Educator",
    title: "Tim Bennett",
    body: "Tim Bennett is an internationally published photographer, creative director, educator, and founder of Lone Star Retreat. He creates luxury portrait experiences built on trust, exceptional light, and the belief that remarkable photography begins long before the shutter is pressed.",
  },
  story: {
    eyebrow: "Where precision and imagination intersect.",
    paragraphs: [
      "Before building his creative career, Tim spent more than three decades in professional aviation, retiring as an American Airlines Captain and continuing today as a Boeing 737 simulator instructor.",
      "The discipline, preparation, and leadership developed in aviation continue to shape every creative endeavor he undertakes—from the quiet details of a portrait session to the long-term vision for Lone Star Retreat and Project North Star.",
    ],
    location: "Dallas–Fort Worth, Texas",
  },
  overview: {
    eyebrow: "The foundation",
    title: "Where precision meets imagination.",
    introduction:
      "Tim's work is shaped by three decades of leadership, preparation, and high standards—translated into a calm, collaborative creative environment.",
    blocks: [
      {
        label: "Discipline",
        title: "Prepared with purpose",
        body: "Aviation taught Tim that preparation creates the freedom to respond with clarity when the moment matters.",
      },
      {
        label: "Craft",
        title: "Led by the light",
        body: "Photography became the place where technical precision and imagination could serve the same human story.",
      },
      {
        label: "Legacy",
        title: "Building what endures",
        body: "Project North Star connects the work, experiences, teaching, and values Tim intends to carry forward.",
      },
    ],
  },
  cta: {
    eyebrow: "The work continues",
    title: "Explore the world Tim is building.",
    body: "Begin with the portfolio, discover an experience, or start a direct conversation.",
    action: { label: "View the portfolio", href: "/portfolio" },
  },
} as const;

export const contactContent = {
  hero: {
    eyebrow: "Begin a conversation",
    title: "Contact",
    introduction:
      "For private commissions, Lone Star Retreat interest, education, creative partnerships, or future Project North Star opportunities.",
    image: images.portfolio.goldEditorial,
    imageAlt: "Warm editorial portrait representing the start of a creative conversation",
  },
  introduction: {
    eyebrow: "Begin a conversation",
    title: "Contact",
    body: "For photography commissions, Lone Star Retreat interest, creative partnerships, or future Project North Star opportunities.",
  },
  detailsLabel: "Direct correspondence",
  location: "Dallas–Fort Worth, Texas",
  formUnavailableTitle: "Online inquiry form coming soon",
  formUnavailableBody:
    "The online inquiry form and public contact details are currently being updated.",
  overview: {
    eyebrow: "How can Tim help?",
    title: "Choose the right starting point.",
    introduction:
      "The platform is still growing, but direct correspondence is open for thoughtful inquiries across the four business pillars.",
    blocks: [
      {
        label: "Private client",
        title: "Commission a session",
        body: "Share the kind of portrait experience you are considering and the vision you want to explore.",
      },
      {
        label: "Lone Star Retreat",
        title: "Express interest",
        body: "Introduce yourself as a photographer, model, or collaborator while future retreat dates are developed.",
      },
      {
        label: "Education",
        title: "Learn with Tim",
        body: "Tell Tim which areas of photography, direction, or creative practice you would most value exploring.",
      },
    ],
  },
} as const;
