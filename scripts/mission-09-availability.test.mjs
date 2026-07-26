import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAvailabilityRanges,
  enumerateEventDays,
  eventLocalDateTimeToUTC,
  eventLocalParts,
} from "../src/lib/scheduling/availability-ranges.ts";
import {
  formatAvailabilityRange,
  shiftAvailabilityHour,
  validateAvailabilityDraft,
} from "../src/lib/scheduling/model-availability-presentation.ts";

test("stored event timestamps enumerate all Chicago-local Founders Edition days", () => {
  const timeZone = "America/Chicago";
  const startDay = eventLocalParts("2027-05-15T00:00:00.000Z", timeZone).day;
  const endDay = eventLocalParts("2027-05-16T23:59:59.000Z", timeZone).day;

  assert.deepEqual(enumerateEventDays(startDay, endDay), [
    "2027-05-14",
    "2027-05-15",
    "2027-05-16",
  ]);
});

test("default retreat availability produces every valid two-hour-or-longer range", () => {
  const ranges = buildAvailabilityRanges({
    availableFrom: "06:00",
    availableUntil: "18:00",
    minimumHours: 2,
  });

  assert.equal(ranges.length, 66);
  assert.deepEqual(ranges[0], {
    durationHours: 2,
    endClock: "08:00",
    startClock: "06:00",
  });
  assert.deepEqual(ranges.at(-1), {
    durationHours: 2,
    endClock: "18:00",
    startClock: "16:00",
  });
});

test("lunch and unavailable blocks remove every overlapping range", () => {
  const ranges = buildAvailabilityRanges({
    availableFrom: "06:00",
    availableUntil: "18:00",
    blockedRanges: [
      { startClock: "12:00", endClock: "13:00" },
      { startClock: "15:00", endClock: "16:00" },
    ],
    minimumHours: 2,
  });

  assert.ok(ranges.some((range) => range.startClock === "06:00" && range.endClock === "12:00"));
  assert.ok(ranges.some((range) => range.startClock === "13:00" && range.endClock === "15:00"));
  assert.ok(ranges.some((range) => range.startClock === "16:00" && range.endClock === "18:00"));
  assert.ok(!ranges.some((range) => range.startClock < "13:00" && range.endClock > "12:00"));
  assert.ok(!ranges.some((range) => range.startClock < "16:00" && range.endClock > "15:00"));
});

test("confirmed participant time removes every conflicting candidate", () => {
  const ranges = buildAvailabilityRanges({
    availableFrom: "06:00",
    availableUntil: "12:00",
    busyRanges: [{ startClock: "08:00", endClock: "10:00" }],
    minimumHours: 1,
  });

  assert.ok(ranges.some((range) => range.startClock === "06:00" && range.endClock === "08:00"));
  assert.ok(ranges.some((range) => range.startClock === "10:00" && range.endClock === "12:00"));
  assert.ok(!ranges.some((range) => range.startClock < "10:00" && range.endClock > "08:00"));
});

test("partial-hour availability exposes only valid whole-hour booking boundaries", () => {
  const ranges = buildAvailabilityRanges({
    availableFrom: "06:30",
    availableUntil: "11:30",
    minimumHours: 2,
  });

  assert.deepEqual(ranges[0], {
    durationHours: 2,
    endClock: "09:00",
    startClock: "07:00",
  });
  assert.deepEqual(ranges.at(-1), {
    durationHours: 2,
    endClock: "11:00",
    startClock: "09:00",
  });
});

test("event-local time converts to UTC and round-trips without exposing profile data", () => {
  const utc = eventLocalDateTimeToUTC("2027-05-14", "06:00", "America/Chicago");
  assert.equal(utc, "2027-05-14T11:00:00.000Z");
  assert.deepEqual(eventLocalParts(utc, "America/Chicago"), {
    clock: "06:00",
    day: "2027-05-14",
  });

  const range = buildAvailabilityRanges({
    availableFrom: "06:00",
    availableUntil: "09:00",
    minimumHours: 2,
  })[0];
  assert.deepEqual(Object.keys(range).sort(), ["durationHours", "endClock", "startClock"]);
});

test("visual availability controls preserve real clock values", () => {
  assert.equal(formatAvailabilityRange("06:00", "18:00"), "6:00 AM–6:00 PM");
  assert.equal(shiftAvailabilityHour("06:00", -1), "05:00");
  assert.equal(shiftAvailabilityHour("18:00", 1), "19:00");
});

test("visual availability validation protects confirmed time", () => {
  const protectedTimes = [{ startTime: "09:00", endTime: "11:00" }];

  assert.equal(validateAvailabilityDraft({
    availableFrom: "06:00",
    availableUntil: "18:00",
    blockedTimes: [{ startTime: "12:00", endTime: "13:00", reason: "lunch" }],
  }, protectedTimes), null);
  assert.match(validateAvailabilityDraft({
    availableFrom: "10:00",
    availableUntil: "18:00",
    blockedTimes: [],
  }, protectedTimes), /protected session/i);
  assert.match(validateAvailabilityDraft({
    availableFrom: "06:00",
    availableUntil: "18:00",
    blockedTimes: [{ startTime: "10:00", endTime: "12:00", reason: "unavailable" }],
  }, protectedTimes), /cannot be marked unavailable/i);
});

test("visual availability validation rejects malformed or overlapping breaks", () => {
  assert.match(validateAvailabilityDraft({
    availableFrom: "06:00",
    availableUntil: "18:00",
    blockedTimes: [{ startTime: "13:00", endTime: "12:00", reason: "lunch" }],
  }, []), /end after it begins/i);
  assert.match(validateAvailabilityDraft({
    availableFrom: "06:00",
    availableUntil: "18:00",
    blockedTimes: [
      { startTime: "12:00", endTime: "13:00", reason: "lunch" },
      { startTime: "12:30", endTime: "14:00", reason: "other" },
    ],
  }, []), /cannot overlap/i);
});
