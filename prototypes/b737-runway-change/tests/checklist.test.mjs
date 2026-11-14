// Checks the generic Runway/Departure Change checklist against AOM 5.4.1 (5-14, 5-15, 24 JUN 26).
// Run: node --test prototypes/b737-runway-change/tests/checklist.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("../checklist.js", import.meta.url), "utf8"), ctx);
const { build, flat, CONSIDERATIONS, REVIEW } = ctx.RwyChange;
const plain = (v) => JSON.parse(JSON.stringify(v));
const lines = (o) => plain(flat(build(o)).map((i) => `${i.text} … ${i.action}`));

test("1. Runway Change: six items in AOM order", () => {
  assert.deepEqual(lines({ option: "uplink" }).slice(0, 6), [
    "DEP/ARR Key … Press", "DEPARTURES Page … Select", "RWY … Select", "SID … Select", "TRANSITION … Select", "EXEC Key … Press",
  ]);
});

test("2. Uplinked takeoff data: one item", () => {
  assert.deepEqual(lines({ option: "uplink" }).slice(6, 7), ["TAKEOFF REF Data [5L or 5R] … Accept or Reject"]);
});

test("2. Request new TPS: ten items, AOC AAL at [1R]", () => {
  assert.deepEqual(lines({ option: "newTps" }).slice(6, 16), [
    "MENU … Select", "ACARS [2L] … Select", "AOC AAL [1R] (if required) … Select", "T/O DATA [4L] (if required) … Select",
    "ACARS TAKEOFF DATA page … Enter", "SEND [5R] … Press", "INIT/REF … Press", "INDEX [6L] … Select", "TAKEOFF [4L] … Select",
    "TAKEOFF REF Data [5L] or [5R] … Accept or Reject",
  ]);
});

test("2. FMS QRH V-speeds: ten items", () => {
  assert.deepEqual(lines({ option: "qrh" }).slice(6, 16), [
    "N1 LIMIT … Select", "Thrust Rating/Assumed Temperature (as needed) … Select/Enter", "Takeoff [6R] … Select", "NEXT PAGE … Select",
    "ATIS/ATC reported wind [1L] … Enter", "Runway condition [1R] … Select", "Runway slope [2L] … Enter", "PREV PAGE … Select",
    "QRH ON … Select", "QRH speeds [1R]–[3R] … Select",
  ]);
});

test("intersection takeoff data comes first in section 2", () => {
  assert.deepEqual(lines({ option: "uplink", intersection: true }).slice(6, 9), [
    "TAKEOFF REF page … Select", "INTERSECT [5L] … Enter X", "TAKEOFF REF Data [5L or 5R] … Accept or Reject",
  ]);
});

test("3. Flight Preparation: eight items, then route/legs, Performance Review, Before Takeoff Checklist", () => {
  assert.deepEqual(lines({ option: "uplink" }).slice(7), [
    "Flap Setting/Thrust … Ensure loaded", "Trim … Set", "V2 speed … Note and enter in MCP",
    "EO ACCEL ALT (BARO and TAKEOFF REF Page 2/2) … Verify", "HUD … Set", "COURSE … Set", "HEADING … Set", "ALTITUDE … Set",
    "Verify Amended Portion of Route and Legs … Complete", "Performance Review … Complete", "Before Takeoff Checklist … Complete",
  ]);
});

test("generic: no airport, runway number, flight or weight anywhere in the data", () => {
  const src = readFileSync(new URL("../checklist.js", import.meta.url), "utf8");
  for (const word of ["RNO", "KRNO", "SFO", "17L", "17R", "AAL1080", "3LE", "139.6", "1260", "5680"]) assert.ok(!src.includes(word), word);
});

test("item ids are unique; no section 2 items until a choice is made", () => {
  for (const option of ["uplink", "newTps", "qrh"]) {
    const ids = plain(flat(build({ option, intersection: true })).map((i) => i.id));
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.ok(!flat(build({})).some((i) => i.id.startsWith("2")));
});

test("Takeoff Considerations (5-16) and the 7-item Performance Review", () => {
  assert.equal(CONSIDERATIONS.length, 9);
  assert.deepEqual(plain(REVIEW.map((r) => r[0])), ["Wind", "Runway conditions", "Temperature", "Weights", "Flaps", "Thrust", "Runway"]);
});
