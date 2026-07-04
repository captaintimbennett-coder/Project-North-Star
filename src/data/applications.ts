export const photographerApplicationContent = {
  hero: {
    eyebrow: "Lone Star Retreat · Photographer Application",
    title: "Apply for Photographer Access",
    introduction:
      "Tell us about your work, your creative direction, and the kind of retreat experience you hope to help create.",
  },
  introduction: {
    eyebrow: "Before you begin",
    title: "A thoughtful application for a thoughtful experience.",
    body:
      "This application helps us understand your experience, interests, equipment, and approach to collaboration. There are no perfect answers. Clarity, professionalism, and respect matter more than an elaborate response.",
    note:
      "Allow approximately 10–15 minutes. Required fields are marked with an asterisk. Submitting an application does not guarantee acceptance.",
  },
  sections: [
    { number: "01", title: "About you" },
    { number: "02", title: "Your photography" },
    { number: "03", title: "Retreat goals" },
    { number: "04", title: "Confirm & submit" },
  ],
  genres: [
    { label: "Glamour", value: "glamour" },
    { label: "Boudoir", value: "boudoir" },
    { label: "Editorial", value: "editorial" },
    { label: "Artistic Nude", value: "artistic-nude" },
    { label: "Fashion", value: "fashion" },
    { label: "Swimwear", value: "swimwear" },
    { label: "Beauty", value: "beauty" },
    { label: "Other", value: "other" },
  ],
  experienceLevels: [
    { label: "Developing", value: "developing" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
    { label: "Professional", value: "professional" },
  ],
  marketingSources: [
    { label: "Instagram", value: "instagram" },
    { label: "Facebook", value: "facebook" },
    { label: "Friend", value: "friend" },
    { label: "Photographer", value: "photographer" },
    { label: "Model", value: "model" },
    { label: "Workshop", value: "workshop" },
    { label: "Magazine", value: "magazine" },
    { label: "Google Search", value: "google-search" },
    { label: "Other", value: "other" },
  ],
  consents: [
    {
      name: "informationAccurateConfirmed",
      label: "I confirm the information submitted is accurate.",
    },
    {
      name: "noAcceptanceGuaranteeConfirmed",
      label: "I understand submitting an application does not guarantee acceptance.",
    },
    {
      name: "internalImageReviewConfirmed",
      label:
        "I understand any materials I provide are for internal review only and will not be published without approval.",
    },
    {
      name: "codeOfConductConfirmed",
      label: "I have read and agree to follow the Lone Star Retreat Professional Standards & Code of Conduct.",
    },
    {
      name: "contactPermissionConfirmed",
      label: "I understand Lone Star Retreat may contact me using the information provided.",
    },
  ],
  submitLabel: "Submit Photographer Application",
} as const;

export const modelApplicationContent = {
  hero: {
    eyebrow: "Lone Star Retreat · Featured Artist Application",
    title: "Become a Featured Artist",
    introduction:
      "Share your work, your creative range, and what you hope to bring to a thoughtful community of artists.",
  },
  introduction: {
    eyebrow: "Before you begin",
    title: "Your work deserves a thoughtful review.",
    body:
      "This application gives us a clear sense of who you are, how you work, and the creative experiences you hope to build. Be honest, take your time, and tell us what matters to you.",
    note:
      "Allow approximately 15–20 minutes. Required fields are marked with an asterisk. Submitting an application does not guarantee acceptance.",
  },
  sections: [
    { number: "01", title: "About you" },
    { number: "02", title: "Session availability" },
    { number: "03", title: "Featured artist materials" },
    { number: "04", title: "Your goals" },
    { number: "05", title: "Professional standards" },
  ],
  genres: [
    { label: "Fashion", value: "fashion" }, { label: "Editorial", value: "editorial" },
    { label: "Glamour", value: "glamour" }, { label: "Beauty", value: "beauty" },
    { label: "Swimwear", value: "swimwear" }, { label: "Lingerie", value: "lingerie" },
    { label: "Boudoir", value: "boudoir" }, { label: "Artistic Nude", value: "artistic-nude" },
    { label: "Fine Art Nude", value: "fine-art-nude" },
    { label: "Conceptual / Fine Art", value: "conceptual-creative" },
    { label: "Lifestyle", value: "lifestyle" }, { label: "Other", value: "other" },
  ],
  experienceLevels: [
    { label: "Aspiring", value: "aspiring" }, { label: "Developing", value: "developing" },
    { label: "Experienced", value: "experienced" }, { label: "Professional", value: "professional" },
  ],
  travelAvailability: [
    { label: "Local only", value: "local-only" }, { label: "Regional", value: "regional" },
    { label: "Domestic", value: "domestic" }, { label: "International", value: "international" },
    { label: "Case by case", value: "case-by-case" },
  ],
  goals: [
    { label: "Network with photographers", value: "network-with-photographers" },
    { label: "Build long-term creative collaborations", value: "long-term-collaborations" },
    { label: "Paid shooting opportunities", value: "paid-shooting-opportunities" },
    { label: "Expand my professional portfolio", value: "expand-portfolio" },
    { label: "Publication opportunities", value: "publication-opportunities" },
    { label: "Travel to professionally organized events", value: "professional-event-travel" },
    { label: "Meet other professional models", value: "meet-professional-models" },
    { label: "Work with respectful, professional photographers", value: "professional-respectful-photographers" },
    { label: "Other", value: "other" },
  ],
  marketingSources: photographerApplicationContent.marketingSources,
  consents: [
    { name: "informationAccurateConfirmed", label: "I confirm the information submitted is accurate." },
    { name: "noAcceptanceGuaranteeConfirmed", label: "I understand submitting an application does not guarantee acceptance." },
    { name: "consentImageUsageConfirmed", label: "I understand my uploaded images are for internal review only and will not be published without approval." },
    { name: "codeOfConductConfirmed", label: "I have read and agree to follow the Lone Star Retreat Professional Standards & Code of Conduct." },
    { name: "contactPermissionConfirmed", label: "I understand Lone Star Retreat may contact me using the information provided." },
  ],
  submitLabel: "Submit Featured Artist Application",
} as const;

export const applicationReceivedContent = {
  eyebrow: "Lone Star Retreat",
  title: "Application Received",
  paragraphs: [
    "Thank you for your interest in becoming part of Lone Star Retreat.",
    "Your application has been received and is now in our private review process.",
    "Our team will carefully review your submission. If your application is selected, we will personally contact you with the next steps.",
    "We appreciate your interest and look forward to reviewing your work.",
  ],
} as const;
