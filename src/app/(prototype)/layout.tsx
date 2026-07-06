import type { ReactNode } from "react";
import "../globals.css";
import "@/components/retreat/calendar-prototype.css";

export default function PrototypeLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to calendar prototype</a>{children}</body></html>;
}
