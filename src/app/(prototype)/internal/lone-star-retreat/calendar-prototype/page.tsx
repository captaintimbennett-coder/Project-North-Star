import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PremiumCalendarPrototype } from "@/components/retreat/PremiumCalendarPrototype";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Calendar UX Prototype — Internal",
  description: "Internal, non-public Project North Star calendar design prototype.",
  robots: { index: false, follow: false, nocache: true },
};

export default function CalendarPrototypePage() {
  if (process.env.ENABLE_CALENDAR_PROTOTYPE !== "true") notFound();
  return <PremiumCalendarPrototype />;
}
