// Checks the CAT III and arrival non-normal block against AOM 10.5.3, 10-49, 18.2.4 and the QRH.
// Run: node --test prototypes/b737-sim-prep/tests/arrival.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("../arrival.js", import.meta.url), "utf8"), ctx);
const { rvrCheck, windCheck, NONNORMALS, EQUIP, SFO } = ctx.SimArr;

test("SFO ILS 28R CAT III (chart 600) with RVR 600/1000/500: legal, no margin", () => {
  const r = rvrCheck(600, 600, 1000, 500);
  assert.equal(r.ok, true);
  assert.equal(r.margin, 0);
  assert.match(r.why, /no margin/);
});

test("TDZ drops to 500 on a 600 chart: not legal", () => {
  const r = rvrCheck(600, 500, 1000, 500);
  assert.equal(r.ok, false);
  assert.match(r.why, /TDZ 500 is below 600/);
});

test("a 700 chart with TDZ 600: not legal", () => {
  assert.equal(rvrCheck(700, 600, 1000, 500).ok, false);
});

test("a 600 chart needs TDZ plus one more report", () => {
  assert.equal(rvrCheck(600, 600, null, null).ok, false);
  assert.equal(rvrCheck(600, 600, 700, null).ok, true);
});

test("a 300 chart allows 600/400/300", () => {
  assert.equal(rvrCheck(300, 600, 400, 300).ok, true);
  assert.equal(rvrCheck(300, 600, 300, 300).ok, false);
});

test("SFO wind 010/10 on 28R (284): about 10 kt crosswind from the right, within the 15 kt limit", () => {
  const w = windCheck(SFO.windDir, SFO.windSpd, null, SFO.rwyHdg);
  assert.equal(w.cross, 10);
  assert.equal(w.side, "from the right");
  assert.equal(w.ok, true);
});

test("limits use the peak gust: 010/10 gusting 18 is over the 15 kt crosswind limit", () => {
  const w = windCheck(10, 10, 18, 284);
  assert.equal(w.ok, false);
  assert.equal(w.checks.find((c) => c.id === "xw").ok, false);
});

test("a tailwind over 10 kt fails the landing tailwind limit", () => {
  assert.equal(windCheck(104, 12, null, 284).checks.find((c) => c.id === "tw").ok, false);
});

test("all three arrival non-normals leave CAT III available, each with its gotcha", () => {
  assert.match(NONNORMALS.yaw.steps.at(-1)[1], /Do not exceed flaps 30/);
  assert.match(NONNORMALS.yaw.gotcha, /flaps 30/);
  assert.deepEqual(JSON.parse(JSON.stringify(NONNORMALS.emdp.steps[0])), ["HYD PUMP switch (affected side)", "OFF"]);
  for (const n of Object.values(NONNORMALS)) {
    assert.match(n.cat3, /^Available/);
    for (const e of n.equip) assert.ok(EQUIP.some(([item]) => item === e), `${e} is on the equipment list`);
  }
});
