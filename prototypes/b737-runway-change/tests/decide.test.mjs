// The combined flow: the Takeoff Guide rules engine picks the AOM 5.4.1 item 2 option.
// Run: node --test prototypes/b737-runway-change/tests/decide.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
for (const f of ["../rules.js", "../decide.js"]) vm.runInNewContext(readFileSync(new URL(f, import.meta.url), "utf8"), ctx);
const { blank, evaluate } = ctx.TakeoffRules;
const { decide, review } = ctx.TakeoffDecide;
const STD = { plan: "STD", rating: "24K", closeout: true, tow: "148.2", ptow: "149.0", mtow: "158.4", oat: "18", at: "44", rwy: "36", rwyHdg: "360", windDir: "360", windSpd: "8" };
const MAX = { plan: "MAX", rating: "26K", closeout: true, tow: "150.0", ptow: "150.5", mtow: "157.8", oat: "15", planTemp: "18", rwy: "36", rwyHdg: "360", windDir: "360", windSpd: "8" };
const go = (base, extra = {}, c = {}) => decide(evaluate({ ...blank(), ...base, ...extra }), { onTps: "first4", uplink: true, ...c });

test("rules.js is the Takeoff Guide's rules engine, unchanged", () => {
  assert.equal(readFileSync(new URL("../rules.js", import.meta.url), "utf8"), readFileSync(new URL("../../b737-takeoff-guide/rules.js", import.meta.url), "utf8"));
});

test("valid TPS data on a runway in the first four: use uplinked takeoff data", () => {
  assert.equal(go(STD).option, "uplink");
  assert.equal(go(MAX).option, "uplink");
});

test("valid data but uplink unavailable: FMS QRH V-speeds", () => {
  assert.equal(go(STD, {}, { uplink: false }).option, "qrh");
});

test("runway not in the first four, or not on the TPS: request new TPS", () => {
  assert.equal(go(STD, {}, { onTps: "notFirst4" }).option, "newTps");
  assert.equal(go(STD, {}, { onTps: "notOn" }).option, "newTps");
});

test("warmer than the assumed temperature: new TPS", () => {
  assert.equal(go(STD, { oat: "46", at: "41" }).option, "newTps");
});

test("wet runway with a dry TPS: new TPS", () => {
  assert.equal(go(STD, { runway: "WET" }).option, "newTps");
});

test("unplanned tailwind, Method 1: new TPS", () => {
  assert.equal(go(MAX, { windDir: "180", windSpd: "6", twMethod: "M1" }).option, "newTps");
});

test("unplanned tailwind, Method 2 within the weight: QRH V-speeds", () => {
  const d = go(MAX, { windDir: "180", windSpd: "6", zwMax: "160.0", twCorr: "1100", twMethod: "M2" });
  assert.equal(d.option, "qrh");
  assert.equal(d.manualSpeeds, false);
});

test("unplanned tailwind without a method chosen: still pending", () => {
  assert.equal(go(MAX, { windDir: "180", windSpd: "6" }).kind, "pending");
});

test("max thrust TPS, heavier than ATOW within MTOW: QRH V-speeds", () => {
  assert.equal(go(MAX, { tow: "153.0" }).option, "qrh");
});

test("standard TPS heavier than ATOW: Airport Analysis asked first, then QRH speeds or Dispatch", () => {
  assert.equal(go(STD, { tow: "152.9" }).kind, "pending");
  assert.equal(go(STD, { tow: "152.9", aa: "NOIP" }).option, "qrh");
  assert.equal(go(STD, { tow: "152.9", aa: "IP" }).option, "newTps");
  assert.equal(go(STD, { tow: "152.9", aa: "NO" }).kind, "stop");
});

test("contaminated runway: CRC/MEL data from Dispatch; beyond the limits: not authorized", () => {
  assert.equal(go(MAX, { runway: "CONTAM", contam: "S25" }).kind, "dispatch");
  assert.equal(go(MAX, { runway: "CONTAM", contam: "OVERWET" }).kind, "stop");
});

test("no Load Closeout: stop", () => {
  assert.equal(go(STD, { closeout: false }).kind, "stop");
});

test("windshear on a 24K standard TPS: new TPS at 26K", () => {
  assert.equal(go(STD, { windshear: true }).option, "newTps");
});

test("windshear on a 26K standard TPS: maximum 26K, QRH V-speeds", () => {
  assert.equal(go(STD, { rating: "26K", windshear: true }).option, "qrh");
});

test("MEL/CDL weight correction not applied by TPS: V-speeds may not come from the FMC QRH", () => {
  const d = go(MAX, { melWt: true });
  assert.equal(d.option, "qrh");
  assert.equal(d.manualSpeeds, true);
});

test("Improved Performance, within 2°C and PTOW + 2,000: TPS data (uplinked)", () => {
  assert.equal(go(MAX, { ip: true, oat: "19.5" }).option, "uplink");
});

test("Performance Review is filled in from the entries", () => {
  const s = { ...blank(), ...STD, runway: "WET", tpsWet: true, rwy: "17L" };
  const r = Object.fromEntries(review(s, evaluate(s)));
  assert.match(r.Wind, /^8 kt headwind, 0 kt crosswind; TPS: zero wind$/);
  assert.equal(r["Runway conditions"], "Wet runway, wet TPS");
  assert.equal(r.Temperature, "18°C, assumed temperature 44°C");
  assert.equal(r.Weights, "TOW 148.2 · PTOW 149.0 · ATOW 151.0 · MTOW 158.4");
  assert.match(r.Thrust, /^Standard \(assumed temperature\) at 24K/);
  assert.equal(r.Runway, "17L");
});
