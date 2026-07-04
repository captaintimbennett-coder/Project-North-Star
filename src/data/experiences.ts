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
      href: "/lone-star-retreat/photographers",
    },
    {
      number: "02",
      eyebrow: "Model path",
      title: "Models",
      body: "Create in a professional environment centered on respect, clear boundaries, confidence, and artistic expression.",
      action: "Become a Featured Artist",
      href: "/lone-star-retreat/models",
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
    action: { label: "Meet All Featured Artists", href: "/lone-star-retreat/featured-artists" },
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

export const retreatAudienceContent = {
  photographers: {
    hero: {
      eyebrow: "Lone Star Retreat · Photographer Experience",
      title: "Create with purpose. Return with perspective.",
      introduction:
        "A destination retreat for photographers ready to make stronger work, collaborate with professional artists, and grow inside a thoughtfully designed creative environment.",
      image: images.retreat.texasHillCountryHero,
      imageAlt: "Texas Hill Country glowing at sunset",
    },
    why: {
      eyebrow: "Why this exists",
      title: "The best work rarely happens in isolation.",
      body:
        "Lone Star Retreat creates the time, place, and professional structure for photographers to move beyond routine. Remarkable settings, intentional collaboration, and a shared standard make room for new ideas—and the confidence to pursue them.",
      image: images.hero.studies.maker,
      imageAlt: "Photographer working thoughtfully in a warm studio",
    },
    audience: {
      eyebrow: "Who it is for",
      title: "For photographers serious about the work and the people behind it.",
      items: [
        {
          title: "Purposeful creators",
          body: "Photographers who arrive prepared, curious, and ready to create with intention rather than simply collect images.",
        },
        {
          title: "Respectful collaborators",
          body: "Professionals who value communication, boundaries, shared authorship, and a calm set experience.",
        },
        {
          title: "Growth-minded artists",
          body: "People willing to experiment, exchange ideas, and leave with a clearer visual direction than they arrived with.",
        },
      ],
    },
    expectations: {
      eyebrow: "What to expect",
      title: "A retreat shaped around preparation, access, and creative momentum.",
      items: [
        {
          number: "01",
          title: "Intentional sessions",
          body: "Curated opportunities with professional Featured Artists, considered settings, and enough time to make decisions with care.",
        },
        {
          number: "02",
          title: "Destination energy",
          body: "Texas landscapes, changing light, and a setting removed from the ordinary create space for work that feels distinct.",
        },
        {
          number: "03",
          title: "Meaningful community",
          body: "A small group of peers connected by professionalism, generosity, and the belief that collaboration elevates everyone.",
        },
      ],
    },
    standards: {
      eyebrow: "The professional standard",
      title: "Creative freedom begins with trust.",
      body:
        "Every participant is expected to communicate clearly, honor personal boundaries, follow the code of conduct, and contribute to a safe, focused environment. Access is intentionally reviewed so the retreat can remain professional, respectful, and creatively ambitious.",
    },
    cta: {
      eyebrow: "Photographer applications",
      title: "Ready to create under a wider sky?",
      body:
        "Tell us about your work, your creative direction, and what you hope to bring to the Lone Star Retreat community.",
      label: "Apply for Photographer Access",
      href: "/lone-star-retreat/photographers/apply",
    },
  },
  models: {
    hero: {
      eyebrow: "Lone Star Retreat · Featured Artist Experience",
      title: "Your artistry belongs in the story.",
      introduction:
        "A professional destination experience for traveling models who value strong creative collaboration, clear boundaries, exceptional imagery, and work made with purpose.",
      image: images.portfolio.redEditorial,
      imageAlt: "Professional model in a cinematic editorial portrait",
    },
    why: {
      eyebrow: "Why this exists",
      title: "Featured Artists are collaborators, not accessories.",
      body:
        "Lone Star Retreat is designed around mutual respect. Models bring experience, perspective, movement, and creative voice to every image. The retreat creates a setting where that contribution is recognized, protected, and given room to become something memorable.",
      image: images.portfolio.silkBeauty,
      imageAlt: "Featured Artist in a warm, refined beauty portrait",
    },
    audience: {
      eyebrow: "Who it is for",
      title: "For professional artists who know their range and value their boundaries.",
      items: [
        {
          title: "Experienced travelers",
          body: "Models comfortable preparing for destination work, communicating availability, and arriving ready to collaborate professionally.",
        },
        {
          title: "Creative partners",
          body: "Artists who bring ideas, presence, and a point of view—not simply poses—to the work being made together.",
        },
        {
          title: "Clear communicators",
          body: "Professionals who state genres, comfort levels, and personal boundaries honestly and expect those boundaries to be honored.",
        },
      ],
    },
    expectations: {
      eyebrow: "What to expect",
      title: "A considered environment built for excellent work.",
      items: [
        {
          number: "01",
          title: "Professional preparation",
          body: "Clear event information, thoughtful planning, and defined expectations before the first creative session begins.",
        },
        {
          number: "02",
          title: "Respectful collaboration",
          body: "Photographers are selected for professionalism, communication, and their willingness to work within confirmed boundaries.",
        },
        {
          number: "03",
          title: "Portfolio-minded creation",
          body: "Purposeful opportunities to create polished work, build lasting relationships, and expand your presence as an artist.",
        },
      ],
    },
    standards: {
      eyebrow: "Safety · Respect · Consent",
      title: "Your boundaries remain yours. Always.",
      body:
        "Genre selections and comfort levels are separate by design. No selected genre implies consent, and no participant may redefine an artist's boundaries. Clear communication, the Lone Star Retreat code of conduct, and a professional review process govern every experience.",
    },
    cta: {
      eyebrow: "Featured Artist applications",
      title: "Bring your voice to the next retreat.",
      body:
        "Tell us about your work, your creative range, and the kind of professional experience you hope to help create.",
      label: "Become a Featured Artist",
      href: "/lone-star-retreat/models/apply",
    },
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
