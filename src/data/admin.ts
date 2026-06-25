export const adminContent = {
  greeting: "Good evening, Tim.",
  areas: [
    {
      title: "Portfolio",
      description:
        "Upload images, assign collections, edit captions, and reorder galleries.",
      status: "5 collections",
    },
    {
      title: "Homepage",
      description:
        "Replace hero imagery, change display order, and publish announcements.",
      status: "1 active hero",
    },
    {
      title: "North Star Journal",
      description:
        "Draft, schedule, publish, and organize journal entries by theme.",
      status: "3 drafts",
    },
    {
      title: "Experiences",
      description:
        "Update Retreat details and prepare future master classes or events.",
      status: "1 active",
    },
    {
      title: "About Tim",
      description: "Edit biography, credentials, and supporting page content.",
      status: "Published",
    },
    {
      title: "Inquiries",
      description:
        "Review contact submissions and mark conversations for follow-up.",
      status: "No new items",
    },
  ],
} as const;
