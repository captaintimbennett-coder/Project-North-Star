import { images } from "./assets";

export type CalendarDayId = "may-7" | "may-8" | "may-9";
export type CalendarStatus = "available" | "blocked" | "confirmed" | "lunch";

export type PrototypeDay = {
  id: CalendarDayId;
  date: string;
  label: string;
  shortLabel: string;
};

export type PrototypeArtist = {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  minimumHours: number;
  availableWindows: Record<CalendarDayId, Array<{ start: number; end: number }>>;
};

export type PrototypeBooking = {
  id: string;
  artistId: string;
  photographerName: string;
  day: CalendarDayId;
  start: number;
  end: number;
  status: "confirmed" | "admin-review";
};

export type PrototypePhotographer = {
  id: string;
  displayName: string;
};

export const prototypeDays: PrototypeDay[] = [
  { id: "may-7", label: "Friday", shortLabel: "Fri · May 7", date: "May 7, 2027" },
  { id: "may-8", label: "Saturday", shortLabel: "Sat · May 8", date: "May 8, 2027" },
  { id: "may-9", label: "Sunday", shortLabel: "Sun · May 9", date: "May 9, 2027" },
];

export const prototypeArtists: PrototypeArtist[] = [
  {
    id: "lexi-anne",
    name: "Lexi Anne",
    image: images.portfolio.redEditorial,
    imageAlt: "Editorial portrait representing participating artist Lexi Anne",
    minimumHours: 2,
    availableWindows: {
      "may-7": [{ start: 6, end: 12 }, { start: 13, end: 20 }],
      "may-8": [{ start: 7, end: 12 }, { start: 13, end: 19 }],
      "may-9": [{ start: 6, end: 15 }],
    },
  },
  {
    id: "amara-james",
    name: "Amara James",
    image: images.portfolio.goldEditorial,
    imageAlt: "Gold-toned editorial portrait representing participating artist Amara James",
    minimumHours: 1,
    availableWindows: {
      "may-7": [{ start: 13, end: 19 }],
      "may-8": [{ start: 6, end: 12 }, { start: 13, end: 18 }],
      "may-9": [{ start: 7, end: 12 }, { start: 13, end: 18 }],
    },
  },
  {
    id: "sloane-reed",
    name: "Sloane Reed",
    image: images.portfolio.silkBeauty,
    imageAlt: "Warm cinematic portrait representing participating artist Sloane Reed",
    minimumHours: 2,
    availableWindows: {
      "may-7": [{ start: 6, end: 12 }, { start: 13, end: 17 }],
      "may-8": [{ start: 8, end: 12 }, { start: 13, end: 18 }],
      "may-9": [{ start: 6, end: 16 }],
    },
  },
  {
    id: "elena-vale",
    name: "Elena Vale",
    image: images.portfolio.balletEvening,
    imageAlt: "Cinematic portrait representing participating artist Elena Vale",
    minimumHours: 1,
    availableWindows: {
      "may-7": [{ start: 7, end: 12 }, { start: 13, end: 18 }],
      "may-8": [{ start: 6, end: 12 }, { start: 13, end: 20 }],
      "may-9": [{ start: 8, end: 12 }, { start: 13, end: 18 }],
    },
  },
  {
    id: "camille-hart",
    name: "Camille Hart",
    image: images.portfolio.heroReal,
    imageAlt: "Editorial portrait representing participating artist Camille Hart",
    minimumHours: 2,
    availableWindows: {
      "may-7": [{ start: 10, end: 12 }, { start: 13, end: 18 }],
      "may-8": [{ start: 9, end: 12 }, { start: 13, end: 17 }],
      "may-9": [{ start: 12, end: 19 }],
    },
  },
];

export const prototypePhotographers: PrototypePhotographer[] = [
  { id: "tim-bennett", displayName: "Tim Bennett" },
  { id: "jordan-ellis", displayName: "Jordan Ellis" },
  { id: "morgan-lee", displayName: "Morgan Lee" },
  { id: "avery-cole", displayName: "Avery Cole" },
  { id: "riley-stone", displayName: "Riley Stone" },
];

export const prototypeBookings: PrototypeBooking[] = [
  { id: "booking-1", artistId: "lexi-anne", photographerName: "Jordan Ellis", day: "may-7", start: 6, end: 9, status: "confirmed" },
  { id: "booking-2", artistId: "lexi-anne", photographerName: "Tim Bennett", day: "may-7", start: 9, end: 11, status: "confirmed" },
  { id: "booking-3", artistId: "lexi-anne", photographerName: "Avery Cole", day: "may-7", start: 13, end: 15, status: "confirmed" },
  { id: "booking-4", artistId: "lexi-anne", photographerName: "Morgan Lee", day: "may-7", start: 15, end: 18, status: "confirmed" },
  { id: "booking-5", artistId: "amara-james", photographerName: "Riley Stone", day: "may-7", start: 13, end: 15, status: "confirmed" },
  { id: "booking-6", artistId: "amara-james", photographerName: "Jordan Ellis", day: "may-7", start: 16, end: 18, status: "confirmed" },
  { id: "booking-7", artistId: "sloane-reed", photographerName: "Morgan Lee", day: "may-7", start: 7, end: 9, status: "confirmed" },
  { id: "booking-8", artistId: "sloane-reed", photographerName: "Tim Bennett", day: "may-7", start: 14, end: 16, status: "confirmed" },
  { id: "booking-9", artistId: "elena-vale", photographerName: "Avery Cole", day: "may-7", start: 9, end: 11, status: "confirmed" },
  { id: "booking-10", artistId: "camille-hart", photographerName: "Riley Stone", day: "may-7", start: 15, end: 17, status: "confirmed" },
  { id: "booking-11", artistId: "lexi-anne", photographerName: "Avery Cole", day: "may-8", start: 7, end: 9, status: "confirmed" },
  { id: "booking-12", artistId: "lexi-anne", photographerName: "Riley Stone", day: "may-8", start: 9, end: 12, status: "confirmed" },
  { id: "booking-13", artistId: "amara-james", photographerName: "Morgan Lee", day: "may-8", start: 6, end: 8, status: "confirmed" },
  { id: "booking-14", artistId: "amara-james", photographerName: "Tim Bennett", day: "may-8", start: 15, end: 17, status: "confirmed" },
  { id: "booking-15", artistId: "sloane-reed", photographerName: "Jordan Ellis", day: "may-8", start: 10, end: 12, status: "confirmed" },
  { id: "booking-16", artistId: "sloane-reed", photographerName: "Avery Cole", day: "may-8", start: 14, end: 16, status: "confirmed" },
  { id: "booking-17", artistId: "elena-vale", photographerName: "Tim Bennett", day: "may-8", start: 6, end: 8, status: "confirmed" },
  { id: "booking-18", artistId: "elena-vale", photographerName: "Morgan Lee", day: "may-8", start: 13, end: 15, status: "confirmed" },
  { id: "booking-19", artistId: "elena-vale", photographerName: "Riley Stone", day: "may-8", start: 18, end: 20, status: "confirmed" },
  { id: "booking-20", artistId: "camille-hart", photographerName: "Jordan Ellis", day: "may-8", start: 13, end: 15, status: "confirmed" },
  { id: "booking-21", artistId: "lexi-anne", photographerName: "Tim Bennett", day: "may-9", start: 6, end: 8, status: "confirmed" },
  { id: "booking-22", artistId: "lexi-anne", photographerName: "Morgan Lee", day: "may-9", start: 10, end: 12, status: "confirmed" },
  { id: "booking-23", artistId: "amara-james", photographerName: "Avery Cole", day: "may-9", start: 8, end: 10, status: "confirmed" },
  { id: "booking-24", artistId: "amara-james", photographerName: "Riley Stone", day: "may-9", start: 14, end: 16, status: "confirmed" },
  { id: "booking-25", artistId: "sloane-reed", photographerName: "Riley Stone", day: "may-9", start: 10, end: 12, status: "admin-review" },
  { id: "booking-26", artistId: "sloane-reed", photographerName: "Jordan Ellis", day: "may-9", start: 13, end: 15, status: "confirmed" },
  { id: "booking-27", artistId: "elena-vale", photographerName: "Avery Cole", day: "may-9", start: 9, end: 11, status: "confirmed" },
  { id: "booking-28", artistId: "camille-hart", photographerName: "Tim Bennett", day: "may-9", start: 13, end: 15, status: "confirmed" },
  { id: "booking-29", artistId: "camille-hart", photographerName: "Morgan Lee", day: "may-9", start: 16, end: 19, status: "confirmed" },
];

export const prototypeCurrentTime = { day: "may-7" as CalendarDayId, hour: 8.43 };

export const prototypeHours = Array.from({ length: 15 }, (_, index) => index + 6);

export function formatHour(hour: number): string {
  const normalized = hour % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const display = normalized % 12 || 12;
  return `${display}:00 ${suffix}`;
}

export function formatRange(start: number, end: number): string {
  return `${formatHour(start)} – ${formatHour(end)}`;
}

export function artistById(id: string): PrototypeArtist {
  return prototypeArtists.find((artist) => artist.id === id) || prototypeArtists[0];
}

export function artistIsAvailable(
  artist: PrototypeArtist,
  day: CalendarDayId,
  start: number,
  end: number,
): boolean {
  const withinWindow = artist.availableWindows[day].some(
    (window) => start >= window.start && end <= window.end,
  );
  const hasConflict = prototypeBookings.some(
    (booking) =>
      booking.artistId === artist.id &&
      booking.day === day &&
      start < booking.end &&
      end > booking.start,
  );
  return withinWindow && !hasConflict && end - start >= artist.minimumHours;
}
