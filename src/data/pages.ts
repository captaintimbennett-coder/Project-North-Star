import { images } from "./assets";

export const aboutContent = {
  hero: {
    eyebrow: "About Tim",
    title: "Hi, I’m Tim.",
    introduction: "Photographer. Mentor. Host. Builder of creative communities.",
    body:
      "For more than three decades, photography has been my way of connecting with people, telling stories, and helping others see themselves in a new light.",
    image: images.about.texasFence,
    imageAlt: "Tim Bennett smiling beside a ranch fence at sunset",
  },
  story: {
    eyebrow: "My story",
    title: "It’s never been\nabout the camera.",
    opening: [
      "I started in commercial and product photography, creating images for advertising campaigns and national publications. Over time, I discovered what fulfilled me most was working with people—collaborating, creating, and building trust.",
      "One experience early in my career has stayed with me ever since.",
    ],
    quote: [
      "After a portrait session, I sat down with a client to reveal her images. As she looked through them, she suddenly began to cry.",
      "I asked if something was wrong. She smiled and said, “No… I just didn’t think I was still that beautiful.”",
    ],
    closing: [
      "That moment changed the way I look at photography. I realized I wasn’t simply creating portraits. I was helping someone see themselves differently.",
      "Thirty years later, that’s still one of the greatest rewards of what I do.",
    ],
    image: images.about.workingPortrait,
    imageAlt: "Tim Bennett smiling while holding his camera during a portrait session",
    humilityLabel: "Experience shouldn’t make us more important.",
    humilityBody:
      "It should make us more willing to help someone who’s earlier in their journey.",
  },
  approach: {
    eyebrow: "My approach",
    values: [
      { icon: "people", title: "People first", body: "Respect, kindness, and professionalism create the foundation for extraordinary work." },
      { icon: "camera", title: "Create with intention", body: "Every detail matters. Every image should have purpose." },
      { icon: "star", title: "Share & inspire", body: "I love sharing what I’ve learned and helping others grow in their craft and confidence." },
      { icon: "heart", title: "Build community", body: "The best images happen when everyone feels welcome, valued, and supported." },
      { icon: "compass", title: "Keep learning", body: "Curiosity keeps us evolving. There’s always more to discover." },
    ],
  },
  retreat: {
    eyebrow: "Why Lone Star Retreat",
    title: "A place for creators.\nBuilt on respect.",
    body: [
      "I created Lone Star Retreat because I wanted to build the kind of event I’d always hoped existed—one where photographers can create alongside exceptional Featured Artists in a professional, respectful environment.",
      "Where artists are treated with kindness and professionalism. Where photographers feel welcome and supported. Where safety is foundational, creativity is encouraged, and community matters more than ego.",
      "Where everyone leaves inspired to create again.",
    ],
  },
  closing: {
    body:
      "If we ever have the opportunity to work together—whether that’s through a portrait session, a future educational experience, or a weekend at Lone Star Retreat—I hope you leave with more than photographs.",
    emphasis: ["A little more confident.", "A little more inspired.", "Excited to create something meaningful."],
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
  formUnavailableBody: "The online inquiry form and public contact details are currently being updated.",
  overview: {
    eyebrow: "How can Tim help?",
    title: "Choose the right starting point.",
    introduction: "The platform is still growing, but direct correspondence is open for thoughtful inquiries across the four business pillars.",
    blocks: [
      { label: "Private client", title: "Commission a session", body: "Share the kind of portrait experience you are considering and the vision you want to explore." },
      { label: "Lone Star Retreat", title: "Express interest", body: "Introduce yourself as a photographer, model, or collaborator while future retreat dates are developed." },
      { label: "Education", title: "Learn with Tim", body: "Tell Tim which areas of photography, direction, or creative practice you would most value exploring." },
    ],
  },
} as const;
