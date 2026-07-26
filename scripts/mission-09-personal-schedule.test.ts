import assert from "node:assert/strict";
import test from "node:test";
import type { PersonalItineraryItem } from "../src/lib/auth/schedule-projection";
import {
  buildPersonalScheduleDays,
  formatScheduleDuration,
  formatScheduleRange,
  scheduleDayKey,
  scheduleHour,
} from "../src/lib/scheduling/personal-calendar";

function itineraryItem(
  overrides: Partial<PersonalItineraryItem> = {},
): PersonalItineraryItem {
  return {
    administratorChanged: false,
    bookingStatus: "confirmed",
    contactMethods: [],
    durationMinutes: 120,
    endAt: "2027-05-14T16:00:00.000Z",
    eventLocation: "Lone Star Retreat",
    eventTimeZone: "America/Chicago",
    eventTitle: "Founders Edition",
    id: "booking-1",
    partnerLabel: "Model / Featured Artist",
    partnerName: "Featured Artist",
    startAt: "2027-05-14T14:00:00.000Z",
    ...overrides,
  };
}

test("groups and orders real itinerary records by event-local retreat day", () => {
  const lateFriday = itineraryItem({
    endAt: "2027-05-15T05:00:00.000Z",
    id: "friday-late",
    startAt: "2027-05-15T04:00:00.000Z",
  });
  const saturday = itineraryItem({
    endAt: "2027-05-15T07:00:00.000Z",
    id: "saturday",
    startAt: "2027-05-15T05:00:00.000Z",
  });

  const days = buildPersonalScheduleDays([saturday, lateFriday]);

  assert.equal(days.length, 2);
  assert.equal(days[0].items[0], lateFriday);
  assert.equal(days[0].shortLabel, "Fri, May 14");
  assert.equal(days[1].items[0], saturday);
  assert.equal(days[1].shortLabel, "Sat, May 15");
});

test("preserves only the already privacy-filtered itinerary objects", () => {
  const photographerView = itineraryItem({
    id: "photographer-private",
    partnerLabel: "Model / Featured Artist",
    partnerName: "Artist One",
  });
  const modelView = itineraryItem({
    id: "model-private",
    partnerLabel: "Photographer",
    partnerName: "Photographer One",
  });

  const photographerDays = buildPersonalScheduleDays([photographerView]);
  const modelDays = buildPersonalScheduleDays([modelView]);

  assert.deepEqual(photographerDays[0].items, [photographerView]);
  assert.deepEqual(modelDays[0].items, [modelView]);
  assert.equal(photographerDays[0].items[0].partnerName, "Artist One");
  assert.equal(modelDays[0].items[0].partnerName, "Photographer One");
});

test("formats schedule values in the event time zone without fixture dates", () => {
  const item = itineraryItem();

  assert.equal(scheduleDayKey(item.startAt, item.eventTimeZone), "2027-05-14");
  assert.equal(scheduleHour(item.startAt, item.eventTimeZone), 9);
  assert.equal(formatScheduleRange(item), "9:00 AM–11:00 AM");
  assert.equal(formatScheduleDuration(item.durationMinutes), "2 hours");
  assert.equal(formatScheduleDuration(90), "1.5 hours");
});
