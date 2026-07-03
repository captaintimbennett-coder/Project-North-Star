export type NavigationItem = {
  label: string;
  href: string;
};

export const primaryNavigation: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Private Client", href: "/private-client" },
  { label: "Lone Star Retreat", href: "/lone-star-retreat" },
  { label: "Workshops", href: "/workshops-education" },
  { label: "About Tim", href: "/about" },
  { label: "Contact", href: "/contact" },
];
