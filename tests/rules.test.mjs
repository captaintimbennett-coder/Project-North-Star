// Test matrix for the takeoff guide's rules engine: one case per path through
// the B737 Takeoff Card (rev. 24 JUN 26) and the AOM passages it relies on.
// Run: node --test prototypes/b737-takeoff-guide/tests/rules.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../rules.js", import.meta.url), "utf8");
const ctx = {};
vm.runInNewContext(src, ctx);
const { blank, evaluate } = ctx.TakeoffRules;

// Baselines: a clean dry-runway takeoff with a 8 kt headwind and no TPS wind.
const STD = { plan: "STD", rating: "24K", closeout: true, tow: "148.2", ptow: "149.0", mtow: "158.4", oat: "18", at: "44", rwy: "36", windDir: "360", windSpd: "8" };
const MAX = { plan: "MAX", rating: "26K", closeout: true, tow: "150.0", ptow: "150.5", mtow: "157.8", oat: "15", planTemp: "18", rwy: "36", windDir: "360", windSpd: "8" };
const run = (base, extra = {}) => evaluate({ ...blank(), ...base, ...extra });
const said = (E, re) => [...E.actions, ...E.alts].some((a) => re.test(a));
const why = (E, re) => E.reasons.some((r) => re.test(r.text));

test("standard thrust, everything within the TPS", () => {
  const E = run(STD);
  assert.equal(E.status, "go");
  assert.match(E.thrust, /^Standard/);
});

test("ATOW is worked out as PTOW + 2,000 lb (AOM 1p.3.2)", () => {
  assert.equal(run(STD, { tow: "151.0" }).status, "go"); // exactly ATOW
  assert.equal(run(STD, { tow: "151.1" }).stdHeavy, true); // just over
});

test("standard TPS heavier than ATOW: max thrust and an Airport Analysis check (1p.4.1, 1p.4.10)", () => {
  const E = run(STD, { tow: "152.9" });
  assert.equal(E.status, "pending");
  assert.equal(E.needAA, true);
  assert.equal(E.thrust, "Maximum at 24K");
  assert.match(E.speeds, /FMC QRH/);
  assert.ok(said(E, /new TPS authorizing standard thrust/));
});

test("standard TPS heavier than ATOW, Airport Analysis accommodates it", () => {
  const E = run(STD, { tow: "152.9", aa: "NOIP" });
  assert.equal(E.status, "amber");
  assert.equal(E.qrhSteps, true);
});

test("standard TPS heavier than ATOW, Airport Analysis cannot accommodate it", () => {
  const E = run(STD, { tow: "152.9", aa: "NO" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /Contact Dispatch/));
});

test("standard TPS heavier than ATOW and warmer than AT: AT no longer applies", () => {
  const E = run(STD, { tow: "152.9", oat: "46", at: "41" });
  assert.notEqual(E.status, "red");
  assert.ok(why(E, /no longer applies/));
});

test("standard TPS within ATOW but warmer than AT: request a new TPS", () => {
  const E = run(STD, { oat: "46", at: "41" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /new TPS/));
});

test("heavier than MTOW and Dispatch weight limited: contact Dispatch", () => {
  const E = run(STD, { tow: "160.0", mtowCode: "D" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /Contact Dispatch/));
});

test("max thrust, within PTOW", () => {
  assert.equal(run(MAX).status, "go");
});

test("max thrust, within PTOW + 2,000 lb: use the TPS data", () => {
  assert.equal(run(MAX, { tow: "152.0" }).status, "go");
});

test("max thrust, beyond PTOW + 2,000 lb but within MTOW: QRH V-speeds", () => {
  const E = run(MAX, { tow: "153.0" });
  assert.equal(E.status, "amber");
  assert.match(E.speeds, /FMC QRH/);
});

test("max thrust, up to 2°C warmer than plan: new TPS or Airport Analysis", () => {
  const E = run(MAX, { oat: "19.5" });
  assert.equal(E.needAA, true);
  assert.ok(said(E, /new TPS/));
});

test("max thrust, more than 2°C warmer than plan: new data by ACARS or voice (1p.2.7)", () => {
  const E = run(MAX, { oat: "21" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /ACARS or voice call/));
});

test("Improved Performance, up to 2°C warmer, within PTOW + 2,000: TPS V-speeds only (1p.2.7)", () => {
  const E = run(MAX, { ip: true, oat: "19.5" });
  assert.equal(E.status, "amber");
  assert.equal(E.needAA, false);
  assert.match(E.speeds, /TPS Thrust\/V-speed section only/);
  assert.equal(E.qrhSteps, false);
});

test("Improved Performance beyond PTOW + 2,000 lb: new TPS", () => {
  const E = run(MAX, { ip: true, tow: "153.0" });
  assert.equal(E.status, "red");
});

test("windshear on a 24K standard TPS: new TPS at 26K or TO", () => {
  const E = run(STD, { windshear: true });
  assert.equal(E.status, "red");
  assert.ok(said(E, /26K or TO/));
});

test("wet runway with a dry TPS: new wet-runway TPS", () => {
  const E = run(STD, { runway: "WET" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /wet runway/));
});

test("contaminated runway within limits: CRC/MEL thrust and V-speeds", () => {
  const E = run(MAX, { runway: "CONTAM", contam: "S25" });
  assert.equal(E.status, "amber");
  assert.match(E.speeds, /CRC\/MEL/);
});

test("contaminated runway with a tailwind: not authorized", () => {
  assert.equal(run(MAX, { runway: "CONTAM", contam: "S25", windDir: "180" }).noGo, true);
});

test("contaminated runway beyond the depth limits: not authorized", () => {
  assert.equal(run(MAX, { runway: "CONTAM", contam: "OVERWET" }).noGo, true);
});

test("contaminated runway, standard TPS, TOW more than PTOW + 2,000: new data from Dispatch", () => {
  const E = run(STD, { runway: "CONTAM", contam: "S25", tow: "151.5" });
  assert.equal(E.status, "red");
  assert.ok(said(E, /contaminated runway data from Dispatch/));
});

test("headwind below the TPS headwind: new TPS, dispatch change or manual calculation", () => {
  const E = run(MAX, { tpsWind: "HEAD", tpsWindKt: "15" });
  assert.equal(E.status, "red");
  assert.equal(E.showManual, true);
});

test("tailwind within the TPS tailwind: authorized", () => {
  assert.equal(run(MAX, { windDir: "180", windSpd: "3", tpsWind: "TAIL", tpsWindKt: "5" }).status, "go");
});

test("tailwind beyond the TPS tailwind: new TPS, dispatch change or manual calculation", () => {
  const E = run(MAX, { windDir: "180", windSpd: "9", tpsWind: "TAIL", tpsWindKt: "3" });
  assert.equal(E.status, "red");
  assert.equal(E.showManual, true);
});

test("unplanned tailwind, Method 2 within the weight limit", () => {
  const E = run(MAX, { windDir: "180", windSpd: "6", zwMax: "160.0", twCorr: "1100", twMethod: "M2" });
  assert.equal(E.status, "amber");
  assert.equal(E.tail.m2, true);
});

test("unplanned tailwind with Improved Performance: Method 1 only", () => {
  const E = run(MAX, { ip: true, windDir: "180", windSpd: "6" });
  assert.equal(E.status, "red");
});

test("no Load Closeout: stop", () => {
  assert.equal(run(STD, { closeout: false }).status, "red");
});

test("gusty crosswind (the card's own example): 26K or TO max recommended", () => {
  const E = run(MAX, { windDir: "300", windSpd: "10", windGust: "22" });
  assert.ok(E.cautions.some((c) => /Gust increment 12 kt/.test(c)));
});

test("27K Bump without authorization: stop", () => {
  assert.equal(run(MAX, { rating: "27K" }).status, "red");
});
