import assert from "node:assert/strict";
import test from "node:test";
import type {
  SharedRetreatScheduleEvent,
  SharedRetreatScheduleItem,
} from "../src/lib/auth/schedule-projection";
import { canViewSharedRetreatSchedule } from "../src/lib/auth/schedule-projection";
import type { User } from "../src/payload-types";
import {
  buildSharedRetreatScheduleDays,
  formatSharedScheduleRange,
  groupSharedScheduleByArtist,
  sharedScheduleHourRange,
} from "../src/lib/scheduling/shared-retreat-schedule";

function scheduleItem(
  overrides: Partial<SharedRetreatScheduleItem> = {},
): SharedRetreatScheduleItem {
  return {
    artistName: "Featured Artist",
    endAt: "2027-05-14T16:00:00.000Z",
    id: "booking-1",
    startAt: "2027-05-14T14:00:00.000Z",
    status: "confirmed",
    ...overrides,
  };
}

function scheduleEvent(
  items: SharedRetreatScheduleItem[],
): SharedRetreatScheduleEvent {
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
) {
  return {
    accountStatus,
    id: 1,
    roles,
  } as User;
}

test("allows only active participant roles into the shared schedule route", () => {
  assert.equal(canViewSharedRetreatSchedule(account(["photographer"])), true);
  assert.equal(canViewSharedRetreatSchedule(account(["model"])), true);
  assert.equal(canViewSharedRetreatSchedule(account(["administrator"])), false);
  assert.equal(
    canViewSharedRetreatSchedule(account(["photographer"], "suspended")),
    false,
  );
});

test("builds every retreat day in event-local time, including empty days", () => {
  const days = buildSharedRetreatScheduleDays([
    scheduleEvent([scheduleItem()]),
  ]);

  assert.equal(days.length, 3);
  assert.equal(days[0].date, "2027-05-14");
  assert.equal(days[0].shortLabel, "Fri, May 14");
  assert.equal(days[0].items.length, 1);
  assert.equal(days[1].date, "2027-05-15");
  assert.equal(days[1].items.length, 0);
  assert.equal(days[2].date, "2027-05-16");
});

test("groups only the privacy-safe projection by Featured Artist", () => {
  const first = scheduleItem({ artistName: "Lexi Anne", id: "first" });
  const second = scheduleItem({
    artistName: "Lexi Anne",
    endAt: "2027-05-14T19:00:00.000Z",
    id: "second",
    startAt: "2027-05-14T18:00:00.000Z",
    status: "admin-review",
  });
  const groups = groupSharedScheduleByArtist([second, first]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, "Lexi Anne");
  assert.deepEqual(groups[0].items, [first, second]);
  assert.deepEqual(
    Object.keys(groups[0].items[0]).sort(),
    ["artistName", "endAt", "id", "startAt", "status"],
  );
  assert.equal(
    Object.keys(groups[0].items[0]).some((key) =>
      /photographer|contact|email|phone|payment|rate|concept|note/i.test(key)),
    false,
  );
});

test("formats and positions shared sessions in event-local time", () => {
  const item = scheduleItem();
  const day = buildSharedRetreatScheduleDays([scheduleEvent([item])])[0];
  const range = sharedScheduleHourRange(day);

  assert.equal(formatSharedScheduleRange(item, day.timeZone), "9:00 AM–11:00 AM");
  assert.equal(range.firstHour, 6);
  assert.equal(range.span, 14);
  assert.deepEqual([range.hours[0], range.hours.at(-1)], [6, 19]);
});
