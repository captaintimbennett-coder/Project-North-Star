import assert from "node:assert/strict";
import test from "node:test";
import type {
  AdministratorMasterCalendarBooking,
  AdministratorMasterCalendarEvent,
} from "../src/lib/auth/administrator-master-calendar-projection";
import {
  canCancelAdministratorMasterCalendarBookings,
  canViewAdministratorMasterCalendar,
} from "../src/lib/auth/administrator-master-calendar-projection";
import type { User } from "../src/payload-types";
import {
  administratorMasterCalendarHourRange,
  buildAdministratorMasterCalendarDays,
  formatAdministratorMasterCalendarRange,
  groupAdministratorBookingsByArtist,
  isActiveAdministratorBooking,
  isCancellableAdministratorBooking,
  normalizedAdministratorCancellationReason,
} from "../src/lib/scheduling/administrator-master-calendar";

function booking(
  overrides: Partial<AdministratorMasterCalendarBooking> = {},
): AdministratorMasterCalendarBooking {
  return {
    artistName: "Featured Artist",
    endAt: "2027-05-14T16:00:00.000Z",
    id: "booking-1",
    photographerName: "Photographer",
    startAt: "2027-05-14T14:00:00.000Z",
    status: "confirmed",
    ...overrides,
  };
}

function event(
  items: AdministratorMasterCalendarBooking[],
): AdministratorMasterCalendarEvent {
  return {
    endAt: "2027-05-17T04:59:00.000Z",
    eventId: 1,
    eventTitle: "Founders Edition",
    items,
    startAt: "2027-05-14T05:00:00.000Z",
    timeZone: "America/Chicago",
  };
}

function account(
  roles: User["roles"],
  accountStatus: User["accountStatus"] = "active",
  role: User["role"] = "owner",
) {
  return {
    accountStatus,
    id: 1,
    role,
    roles,
  } as User;
}

test("allows only active administrator accounts into the master calendar", () => {
  assert.equal(canViewAdministratorMasterCalendar(account(["administrator"])), true);
  assert.equal(canViewAdministratorMasterCalendar(account(["photographer"])), false);
  assert.equal(canViewAdministratorMasterCalendar(account(["model"])), false);
  assert.equal(
    canViewAdministratorMasterCalendar(
      account(["administrator"], "suspended"),
    ),
    false,
  );
});

test("limits cancellation controls to active owner and editor administrators", () => {
  assert.equal(
    canCancelAdministratorMasterCalendarBookings(
      account(["administrator"], "active", "owner"),
    ),
    true,
  );
  assert.equal(
    canCancelAdministratorMasterCalendarBookings(
      account(["administrator"], "active", "editor"),
    ),
    true,
  );
  assert.equal(
    canCancelAdministratorMasterCalendarBookings(
      account(["administrator"], "active", "reviewer"),
    ),
    false,
  );
  assert.equal(
    canCancelAdministratorMasterCalendarBookings(
      account(["administrator"], "suspended", "owner"),
    ),
    false,
  );
  assert.equal(
    canCancelAdministratorMasterCalendarBookings(
      account(["photographer"], "active", "owner"),
    ),
    false,
  );
});

test("builds every operational retreat day in event-local time", () => {
  const days = buildAdministratorMasterCalendarDays([
    event([booking()]),
  ]);

  assert.equal(days.length, 3);
  assert.equal(days[0].date, "2027-05-14");
  assert.equal(days[0].shortLabel, "Fri, May 14");
  assert.equal(days[0].items.length, 1);
  assert.equal(days[1].date, "2027-05-15");
  assert.equal(days[1].items.length, 0);
  assert.equal(days[2].date, "2027-05-16");
});

test("preserves every booking status while grouping by Featured Artist", () => {
  const confirmed = booking({ artistName: "Lexi Anne", id: "confirmed" });
  const cancelled = booking({
    artistName: "Lexi Anne",
    id: "cancelled",
    status: "cancelled",
  });
  const rescheduled = booking({
    artistName: "Elena Vale",
    id: "rescheduled",
    status: "rescheduled",
  });
  const review = booking({
    artistName: "Elena Vale",
    id: "review",
    status: "admin-review",
  });
  const groups = groupAdministratorBookingsByArtist([
    cancelled,
    review,
    confirmed,
    rescheduled,
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups.flatMap((group) => group.items).length, 4);
  assert.deepEqual(
    new Set(groups.flatMap((group) => group.items.map((item) => item.status))),
    new Set(["confirmed", "cancelled", "rescheduled", "admin-review"]),
  );
});

test("exposes only the approved operational booking fields", () => {
  const item = booking();

  assert.deepEqual(
    Object.keys(item).sort(),
    [
      "artistName",
      "endAt",
      "id",
      "photographerName",
      "startAt",
      "status",
    ],
  );
  assert.equal(
    Object.keys(item).some((key) =>
      /contact|email|phone|payment|rate|concept|note|reason/i.test(key)),
    false,
  );
});

test("formats active sessions and keeps changed records out of the live timeline", () => {
  const confirmed = booking();
  const review = booking({
    endAt: "2027-05-14T19:00:00.000Z",
    id: "review",
    startAt: "2027-05-14T18:00:00.000Z",
    status: "admin-review",
  });
  const cancelled = booking({ id: "cancelled", status: "cancelled" });
  const day = buildAdministratorMasterCalendarDays([
    event([confirmed, review, cancelled]),
  ])[0];
  const range = administratorMasterCalendarHourRange(day);

  assert.equal(isActiveAdministratorBooking(confirmed), true);
  assert.equal(isActiveAdministratorBooking(review), true);
  assert.equal(isActiveAdministratorBooking(cancelled), false);
  assert.equal(
    formatAdministratorMasterCalendarRange(confirmed, day.timeZone),
    "9:00 AM–11:00 AM",
  );
  assert.equal(range.firstHour, 6);
  assert.equal(range.span, 14);
  assert.deepEqual([range.hours[0], range.hours.at(-1)], [6, 19]);
});

test("permits cancellation only for active booking states", () => {
  assert.equal(
    isCancellableAdministratorBooking(booking({ status: "confirmed" })),
    true,
  );
  assert.equal(
    isCancellableAdministratorBooking(booking({ status: "admin-review" })),
    true,
  );
  assert.equal(
    isCancellableAdministratorBooking(booking({ status: "cancelled" })),
    false,
  );
  assert.equal(
    isCancellableAdministratorBooking(booking({ status: "rescheduled" })),
    false,
  );
});

test("normalizes a valid private reason and rejects empty guidance", () => {
  assert.equal(
    normalizedAdministratorCancellationReason("  Participant request  "),
    "Participant request",
  );
  assert.equal(normalizedAdministratorCancellationReason("  "), null);
  assert.equal(normalizedAdministratorCancellationReason("no"), null);
});
