// Checks the performance-check block against the RNO–SFO training flight paperwork.
// Run: node --test prototypes/b737-sim-prep/tests/perf.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("../perf.js", import.meta.url), "utf8"), ctx);
const { items, makeDrill, mistakes, review, reserves } = ctx.SimPerf;
const val = (ac, rwy, id) => items(ac, rwy).find((i) => i.id === id).value;
const combos = [["NG", "17R"], ["NG", "17L"], ["MAX", "17R"], ["MAX", "17L"]];

test("the four AOM 3-32 pages, in order, with every required item", () => {
  const pages = [...new Set(items("NG", "17R").map((i) => i.page))];
  assert.deepEqual(JSON.parse(JSON.stringify(pages)), ["PERF INIT", "N1 LIMIT", "TAKEOFF REF 1/2", "TAKEOFF REF 2/2"]);
  assert.equal(items("NG", "17R").length, 15);
});

test("NG values match the NG TPS and flight plan", () => {
  assert.equal(val("NG", "17R", "zfw"), "125.0");
  assert.equal(val("NG", "17R", "ci"), "0");
  assert.equal(val("NG", "17R", "crz"), "FL280");
  assert.equal(val("NG", "17R", "rating"), "26K");
  assert.equal(val("NG", "17R", "vs"), "132 / 138 / 144");
  assert.equal(val("NG", "17L", "vs"), "132 / 138 / 145");
  assert.equal(val("NG", "17R", "at"), "32°C");
  assert.equal(val("NG", "17L", "at"), "23°C");
  assert.equal(val("NG", "17R", "acc"), "1410");
  assert.equal(val("NG", "17L", "acc"), "1260");
});

test("MAX values match the MAX TPS", () => {
  assert.equal(val("MAX", "17R", "zfw"), "129.3");
  assert.equal(val("MAX", "17R", "rating"), "TO");
  assert.equal(val("MAX", "17R", "vs"), "131 / 138 / 145");
  assert.equal(val("MAX", "17L", "vs"), "130 / 137 / 145");
  assert.equal(val("MAX", "17L", "acc"), "1270");
});

test("reserves are RSV + MAF + ALTN from the flight plan (AOM 3-25 minimum)", () => {
  assert.equal(reserves(), (4678 + 345 + 2667) / 1000);
  assert.equal(val("NG", "17R", "rsv"), "7.7");
});

test("accel height, thrust reduction and EO accel height all match the TPS E/O line", () => {
  for (const [ac, rwy] of combos) {
    const a = val(ac, rwy, "acc");
    assert.equal(val(ac, rwy, "red"), a);
    assert.equal(val(ac, rwy, "eoacc"), a);
  }
});

test("every planted mistake really differs from the correct value", () => {
  for (const [ac, rwy] of combos) {
    for (const m of mistakes(ac, rwy)) assert.notEqual(m.shown, val(ac, rwy, m.id), `${ac} ${rwy} ${m.id}`);
  }
});

test("a drill plants one or two mistakes and leaves the rest correct", () => {
  for (const [ac, rwy] of combos) {
    for (let seed = 0; seed < 20; seed++) {
      let x = seed / 20 + 0.013;
      const rand = () => (x = (x * 9301 + 0.49297) % 1);
      const rows = makeDrill(ac, rwy, rand);
      const wrong = rows.filter((r) => r.wrong);
      assert.ok(wrong.length >= 1 && wrong.length <= 2);
      for (const r of rows) {
        if (r.wrong) assert.ok(r.why && r.shown !== r.value);
        else assert.equal(r.shown, r.value);
      }
    }
  }
});

test("performance review: standard thrust stands for both aircraft", () => {
  for (const [ac, rwy] of combos) {
    const text = review(ac, rwy).map((r) => r.text).join(" ");
    assert.match(text, /WET/);
    assert.match(text, /standard thrust is authorized/);
  }
});
