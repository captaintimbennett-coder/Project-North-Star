export type NavigationItem = {
  label: string;
  href: string;
};

export const primaryNavigation: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Experiences", href: "/experiences" },
  { label: "Project North Star", href: "/project-north-star" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
