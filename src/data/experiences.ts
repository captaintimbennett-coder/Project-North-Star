import { images } from "./assets";

export const experiencesContent = {
  introduction: {
    eyebrow: "Gather · Learn · Create",
    title: "Experiences",
    body: "Purposeful creative experiences designed to elevate the work, strengthen the community, and make space for serious artistic growth.",
  },
  items: [
    {
      title: "Lone Star Retreat",
      status: "Founding experience",
      description:
        "A premium gathering for serious photographers, professional talent, and ambitious creative collaboration.",
      href: "/lone-star-retreat",
    },
    {
      title: "Master Classes",
      status: "In development",
      description:
        "Focused, small-format learning experiences built around lighting, direction, and creative decision-making.",
    },
    {
      title: "Private Mentoring",
      status: "Future offering",
      description:
        "Individual guidance for photographers ready to refine their point of view, process, and professional direction.",
    },
    {
      title: "Special Creative Events",
      status: "Future offering",
      description:
        "Distinctive collaborations, editorial productions, and gatherings created when the right idea deserves a room.",
    },
  ],
} as const;

export const loneStarRetreatContent = {
  hero: {
    eyebrow: "A Project North Star experience",
    title: "Lone Star Retreat",
    introduction:
      "A premier, invitation-only creative retreat where photographers and models come together to create, connect, collaborate, and elevate in a safe, professional environment.",
    supporting: "Craft. Connection. Purpose.",
    image: images.retreat.texasHillCountryHero,
    imageAlt:
      "A contemporary retreat glowing at sunset above the Texas Hill Country",
    action: { label: "Explore the experience", href: "#retreat-paths" },
  },
  paths: [
    {
      number: "01",
      eyebrow: "Photographer path",
      title: "Photographers",
      body: "Elevate your craft through intentional shoots, meaningful collaboration, and a community built around growth.",
      action: "Explore the Photographer Experience",
      href: "/contact?interest=photographer",
    },
    {
      number: "02",
      eyebrow: "Model path",
      title: "Models",
      body: "Create in a professional environment centered on respect, clear boundaries, confidence, and artistic expression.",
      action: "Become a Featured Artist",
      href: "/contact?interest=featured-artist",
    },
    {
      number: "03",
      eyebrow: "Event calendar",
      title: "Upcoming Retreats",
      body: "Discover future destinations and be among the first to know when the next Lone Star Retreat is announced.",
      action: "View Upcoming Retreats",
      href: "#upcoming-retreats",
    },
  ],
  artists: {
    eyebrow: "Meet the artists",
    title: "Creative voices, brought together.",
    introduction:
      "Each retreat will feature a carefully selected artist roster. The first participating profiles will be introduced with the prototype event.",
    status: "Profile announcement forthcoming",
    items: [
      { label: "Artist No. 01", image: images.portfolio.redEditorial },
      { label: "Artist No. 02", image: images.portfolio.silkBeauty },
      { label: "Artist No. 03", image: images.portfolio.goldEditorial },
    ],
  },
  philosophy: {
    eyebrow: "Retreat philosophy",
    title: "The power of craft, connection, confidence, and purpose.",
    body: "Lone Star Retreat creates room for ambitious work without losing sight of the people making it. Thoughtful preparation, mutual respect, and shared purpose shape every part of the experience.",
    image: images.hero.studies.maker,
    imageAlt:
      "A photographer considering a finished print in a warm, quiet studio",
  },
  experience: {
    eyebrow: "The experience",
    title: "More than a place to photograph.",
    items: [
      {
        title: "Create",
        body: "Intentional shoots shaped by remarkable light, considered settings, and room to experiment.",
      },
      {
        title: "Connect",
        body: "A generous community of photographers, models, and collaborators who challenge and support one another.",
      },
      {
        title: "Elevate",
        body: "Return home with stronger work, renewed perspective, and relationships that continue beyond the retreat.",
      },
    ],
  },
  prototype: {
    eyebrow: "Upcoming retreat preview",
    status: "Prototype event · Dates forthcoming",
    title: "Texas Hill Country Creative Retreat",
    body: "A preview of the destination, artist, schedule, and logistics experience that will accompany every future retreat announcement.",
    image: images.retreat.texasHillCountryHero,
    imageAlt: "Texas Hill Country landscape at sunset",
    action: { label: "Ask about the retreat", href: "/contact?interest=retreat" },
  },
  closing: {
    eyebrow: "Under the North Star",
    title: "Come create something that matters.",
    body: "Create. Connect. Leave your mark.",
    action: { label: "Express interest", href: "/contact?interest=retreat" },
  },
} as const;

export const privateClientContent = {
  hero: {
    eyebrow: "Private Client",
    title: "A portrait experience designed around you.",
    introduction:
      "Calmly guided. Intentionally designed. Created to help you feel confident, comfortable, and beautifully seen.",
    image: images.portfolio.silkBeauty,
    imageAlt: "Woman in a warm, softly lit editorial portrait",
    action: { label: "Begin the conversation", href: "/contact?interest=private-client" },
  },
  reassurance: {
    id: "private-client-overview",
    eyebrow: "The experience",
    title: "This is not about performing for the camera. It is about feeling safe enough to be seen.",
    body:
      "Most clients arrive with a little uncertainty. That is expected. The experience is built to slow everything down, remove the guesswork, and guide you through each step with care.",
  },
  process: {
    eyebrow: "How it works",
    title: "A private process, guided from the beginning.",
    steps: [
      {
        number: "01",
        title: "We Listen",
        body: "Before anything is planned, we talk about your vision, your comfort level, and what you want this experience to become.",
      },
      {
        number: "02",
        title: "We Design",
        body: "Wardrobe, lighting, mood, styling, and direction are shaped around you. Nothing is accidental. Nothing is rushed.",
      },
      {
        number: "03",
        title: "We Create",
        body: "You are guided throughout the session so you never have to wonder what to do next. The goal is confidence, ease, and portraits that feel honest.",
      },
    ],
  },
  confidence: {
    image: images.portfolio.goldEditorial,
    imageAlt: "Woman posed with quiet confidence in a warm gold editorial portrait",
    quote: "The experience changed the way I saw myself.",
    body:
      "The best portraits are not simply images. They become evidence of a moment when you felt present, confident, and fully yourself.",
  },
  intention: {
    eyebrow: "Created with intention",
    title: "Designed for women who want something more personal than a photoshoot.",
    body:
      "Every private commission is shaped around the person in front of the camera—a calm, respectful, and highly intentional experience created with care from the first conversation onward.",
    benefits: [
      "Private, one-on-one experience",
      "Custom planning & styling guidance",
      "Professional hair & makeup available",
      "Multiple looks & creative direction",
      "Hand-edited, magazine-quality portraits",
    ],
    action: { label: "Begin the conversation", href: "/contact?interest=private-client" },
  },
  closing: {
    symbol: images.brand.northStarSymbol,
    lines: [
      "This isn't just a portrait session.",
      "It's an experience designed to remind you how extraordinary you already are.",
    ],
  },
} as const;

export const workshopsContent = {
  hero: {
    eyebrow: "Mentoring · Workshops · Education",
    title: "Workshops & Education",
    introduction:
      "Focused learning experiences for photographers ready to strengthen their craft, refine their visual language, and work with greater confidence.",
    image: images.portfolio.balletEvening,
    imageAlt: "Cinematic portrait representing photography education and creative development",
    action: { label: "Preview the direction", href: "#education-overview" },
  },
  overview: {
    id: "education-overview",
    eyebrow: "In development",
    title: "Education built around practice.",
    introduction:
      "This area establishes the future educational foundation. Programs, schedules, formats, and enrollment remain forthcoming.",
    blocks: [
      {
        label: "Future offering",
        title: "Small-group workshops",
        body: "Focused learning around light, direction, preparation, and the decisions that shape a complete portrait experience.",
      },
      {
        label: "Future offering",
        title: "Private mentoring",
        body: "Individual guidance for photographers refining their point of view, process, portfolio, and professional direction.",
      },
      {
        label: "Future offering",
        title: "Creative intensives",
        body: "Purposeful sessions where technical discipline and artistic experimentation can work together.",
      },
    ],
  },
  cta: {
    eyebrow: "Coming soon",
    title: "Learn with purpose.",
    body: "Education is still being shaped. Share your interest and the kind of creative growth you are seeking.",
    action: { label: "Register interest", href: "/contact" },
  },
} as const;
