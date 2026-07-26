import assert from "node:assert/strict";
import test from "node:test";
import type { BookingRangeOption } from "../src/lib/scheduling/booking-service";
import {
  bookingDayID,
  bookingOptionID,
  formatBookingRange,
  getBookingArtists,
  getBookingDays,
  getBookingDurations,
  getBookingHourChoices,
  getBookingStartChoices,
} from "../src/lib/scheduling/photographer-booking-presentation";

function option(overrides: Partial<BookingRangeOption> = {}): BookingRangeOption {
  return {
    artistId: 1,
    artistImage: null,
    artistMinimumHours: 2,
    artistName: "Artist One",
    day: "2027-05-14",
    durationHours: 2,
    endAt: "2027-05-14T16:00:00.000Z",
    eventId: 10,
    eventTitle: "Founders Edition",
    startAt: "2027-05-14T14:00:00.000Z",
    timeZone: "America/Chicago",
    ...overrides,
  };
}

test("builds event-specific retreat-day choices from real booking options", () => {
  const friday = option();
  const saturday = option({
    day: "2027-05-15",
    endAt: "2027-05-15T16:00:00.000Z",
    startAt: "2027-05-15T14:00:00.000Z",
  });
  const days = getBookingDays([saturday, friday, { ...friday, artistId: 2 }]);

  assert.equal(days.length, 2);
  assert.equal(days[0].id, bookingDayID(friday));
  assert.equal(days[0].shortLabel, "Fri, May 14");
  assert.equal(days[1].shortLabel, "Sat, May 15");
});

test("orders selectable start times and preserves unavailable ribbon hours", () => {
  const dayOptions = [
    option(),
    option({
      endAt: "2027-05-14T18:00:00.000Z",
      startAt: "2027-05-14T16:00:00.000Z",
    }),
  ];
  const dayId = bookingDayID(dayOptions[0]);
  const starts = getBookingStartChoices(dayOptions, dayId);
  const ribbon = getBookingHourChoices(dayOptions, dayId);

  assert.deepEqual(starts.map((item) => item.clock), ["09:00", "11:00"]);
  assert.equal(ribbon.find((item) => item.clock === "09:00")?.available, true);
  assert.equal(ribbon.find((item) => item.clock === "10:00")?.available, false);
  assert.equal(ribbon.find((item) => item.clock === "11:00")?.available, true);
});

test("filters real durations and Featured Artists for one exact creative window", () => {
  const first = option();
  const longer = option({
    durationHours: 3,
    endAt: "2027-05-14T17:00:00.000Z",
  });
  const secondArtist = option({
    artistId: 2,
    artistMinimumHours: 1,
    artistName: "Artist Two",
  });
  const options = [longer, secondArtist, first];
  const dayId = bookingDayID(first);

  assert.deepEqual(getBookingDurations(options, dayId, first.startAt), [2, 3]);
  assert.deepEqual(
    getBookingArtists(options, dayId, first.startAt, 2).map((item) => item.artistName),
    ["Artist One", "Artist Two"],
  );
  assert.deepEqual(
    getBookingArtists(options, dayId, first.startAt, 3).map((item) => item.artistName),
    ["Artist One"],
  );
});

test("formats the review window in event-local time", () => {
  const selection = option();

  assert.equal(formatBookingRange(selection), "9:00 AM–11:00 AM");
  assert.match(bookingOptionID(selection), /^10\|1\|/);
});
