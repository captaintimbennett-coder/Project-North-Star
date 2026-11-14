// Checks the Load Closeout, Runway/Departure Change and briefing blocks.
// Run: node --test prototypes/b737-sim-prep/tests/taxi.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
for (const f of ["../procedure.js", "../perf.js", "../taxi.js"]) vm.runInNewContext(readFileSync(new URL(f, import.meta.url), "utf8"), ctx);
const { closeoutFlow, changeFlow, briefing, method2 } = ctx.SimTaxi;
const { PAGES } = ctx.SimPrep;
const labels = (F) => JSON.parse(JSON.stringify(F.map((s) => s.label)));

test("closeout uplink: LOAD, EXEC, verify ZFW, N1 LIMIT, TAKEOFF, ACCEPT twice (21j.2.1)", () => {
  const L = labels(closeoutFlow({ coSource: "UPLINK" }));
  assert.deepEqual(L.slice(0, 9), ["INIT REF key", "LOAD", "EXEC key", "ZFW is same as closeout", "N1 LIMIT",
    "Thrust and assumed temperature against the TPS · climb thrust", "TAKEOFF", "ACCEPT", "ACCEPT (again)"]);
  assert.ok(!L.includes("CG"));
});

test("closeout manual: ZFW [3L], EXEC, one ACCEPT, CG [3L]", () => {
  const F = closeoutFlow({ coSource: "MANUAL", perfAc: "NG" });
  const zfw = F.find((s) => s.label === "ZFW");
  assert.equal(zfw.key.lsk, "3L"); assert.equal(zfw.value, "125.0");
  assert.equal(F.filter((s) => s.label.startsWith("ACCEPT")).length, 1);
  assert.equal(F.find((s) => s.label === "CG").key.lsk, "3L");
});

test("closeout values follow the aircraft and runway", () => {
  const v2 = (ac, rwy) => closeoutFlow({ perfAc: ac, perfRwy: rwy }).find((s) => s.label === "V2 speed on MCP").value;
  assert.equal(v2("NG", "17R"), "144"); assert.equal(v2("NG", "17L"), "145"); assert.equal(v2("MAX", "17R"), "145");
  assert.equal(closeoutFlow({ perfAc: "MAX", perfRwy: "17L" }).find((s) => s.g === "coN1" && s.page === "N1 LIMIT").value, "TO, AT 23°C");
});

test("runway change: three steps, one performance option at a time (5-14, 5-15)", () => {
  const groups = (o) => [...new Set(changeFlow(o).map((s) => s.g))].join(",");
  assert.equal(groups({ rcOpt: "A" }), "rc1,rcA,rc3");
  assert.equal(groups({ rcOpt: "B" }), "rc1,rcB,rc3");
  assert.equal(groups({ rcOpt: "C", rcIntersection: true }), "rc1,rcX,rcC,rc3");
  assert.deepEqual(labels(changeFlow({})).slice(0, 6), ["DEP/ARR key", "DEPARTURES page", "RWY", "SID", "TRANSITION", "EXEC key"]);
});

test("QRH option: wind [1L], runway condition [1R], slope [2L] from the TPS, QRH ON", () => {
  const F = changeFlow({ rcOpt: "C", perfAc: "NG" });
  const at = (l) => F.find((s) => s.label === l);
  assert.equal(at("ATIS/ATC reported wind").key.lsk, "1L");
  assert.equal(at("Runway condition").key.lsk, "1R");
  assert.match(at("Runway slope").value, /^\.0 %/);
  assert.equal(at("QRH ON").key.lsk, "6R");
});

test("every lit line select key lands on a drawn prompt", () => {
  for (const F of [closeoutFlow({}), closeoutFlow({ coSource: "MANUAL" }), changeFlow({ rcOpt: "A", rcIntersection: true }), changeFlow({ rcOpt: "B" }), changeFlow({ rcOpt: "C" })]) {
    for (const s of F) {
      const p = PAGES[s.page];
      // DEPARTURES lists runways and SIDs from the nav database: the screen draws them as data.
      if (!p || !s.key || !s.key.lsk || s.page === "DEPARTURES") continue;
      const text = (s.scr && s.scr[s.key.lsk]) || p[s.key.lsk.slice(-1)][Number(s.key.lsk[0]) - 1];
      assert.ok(text, `${s.page} ${s.key.lsk} (${s.label})`);
    }
  }
});

test("Method 2 on 17L uses the TPS Airport Analysis: NG", () => {
  const m = method2("NG");
  assert.equal(m.sub, 4440); // 740 lb/kt × 6 kt
  assert.equal(m.rwy, 151.8); // 156.8 − 4.44 − 0.6
  assert.equal(m.climb, 166.5); // 167.1 − 0.6
  assert.equal(m.limit, 150.6); // MTOW (landing limited) is the lowest
  assert.equal(m.ok, true);
});

test("Method 2 on 17L uses the TPS Airport Analysis: MAX", () => {
  const m = method2("MAX");
  assert.equal(m.rwy, 162.9); // 169.0 − 5.10 − 1.0
  assert.equal(m.climb, 179.0);
  assert.equal(m.limit, 156.5);
});

test("briefings follow 7–3–7", () => {
  assert.deepEqual([["preflight", 7], ["closeout", 3], ["changeA", 7], ["changeC", 7]].map(([k]) => briefing(k, "NG", "17R").items.length), [7, 3, 7, 7]);
  assert.deepEqual(labels(briefing("closeout", "NG", "17R").items), ["Weights", "Winds", "N1s"]);
});

test("briefing numbers come from the right TPS line", () => {
  const say = (k, ac, rwy, l) => briefing(k, ac, rwy).items.find((i) => i.label === l).say;
  assert.match(say("preflight", "NG", "17R", "Temperature"), /assumed temperature of 32/);
  assert.match(say("preflight", "NG", "17L", "Temperature"), /assumed temperature of 23/);
  assert.match(say("preflight", "NG", "17R", "Maximum weights"), /ATOW is the most restrictive at 141\.7, MTOW is 150\.6/);
  assert.match(say("closeout", "MAX", "17R", "N1s"), /N1s 89\.2/);
  assert.match(say("changeC", "NG", "17R", "Thrust"), /26K, max, .*TPS 98\.5/);
  assert.match(say("changeC", "NG", "17R", "Weights"), /climb limit 166\.5, adjusted runway limit 151\.8 and MTOW 150\.6/);
  assert.match(say("changeC", "NG", "17R", "Winds"), /tailwind/);
});

test("no blank CDU in the closeout and runway change blocks", () => {
  for (const s of [...ctx.SimTaxi.CO_STEPS, ...ctx.SimTaxi.RC_STEPS]) if (s.key && s.key.lsk) assert.ok(PAGES[s.page], `${s.g} ${s.key.lsk} ${s.label}`);
});

test("no blank CDU anywhere: every on-CDU step in every flow draws a page", () => {
  const { buildFlow } = ctx.SimPrep;
  const flows = [
    buildFlow({ source: "ACARS", forecastWinds: true, cpdlc: true, intersection: true, rnavSid: true, eoSid: true }),
    buildFlow({ source: "ACARS", toData: false }), buildFlow({ source: "MANUAL", fleet: "D" }),
    closeoutFlow({}), closeoutFlow({ coSource: "MANUAL" }),
    changeFlow({ rcOpt: "A", rcIntersection: true }), changeFlow({ rcOpt: "B" }), changeFlow({ rcOpt: "C" }),
  ];
  for (const F of flows) for (const s of F) {
    if (s.key && s.key.panel) continue;
    assert.ok(PAGES[s.page], `${s.g} "${s.label}" draws no page (${s.page || "none"})`);
  }
});

test("runway change to 17L: EO ACCEL 1260 AFL and MINS 5680 on the NG (1270/5690 on the MAX)", () => {
  const v = (ac) => changeFlow({ perfAc: ac }).find((s) => s.label === "EO ACCEL ALT").value;
  assert.equal(v("NG"), "1260 AFL · MINS 5680 MSL");
  assert.equal(v("MAX"), "1270 AFL · MINS 5690 MSL");
});

test("runway change follows AOM 5.4.1 (24 JUN 26) item by item", () => {
  const nums = (o) => JSON.parse(JSON.stringify(changeFlow(o).map((s) => s.num)));
  const rc3 = ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3 · then", "3 · then", "3 · then"];
  assert.deepEqual(nums({ rcOpt: "A" }), ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2 · uplinked data 1", ...rc3]);
  assert.deepEqual(nums({ rcOpt: "C" }).slice(6, 16), ["2 · QRH 1", "2 · QRH 2", "2 · QRH 3", "2 · QRH 4", "2 · QRH 5", "2 · QRH 6", "2 · QRH 7", "2 · QRH 8", "2 · QRH 9", "2 · QRH 10"]);
  const B = changeFlow({ rcOpt: "B" }).filter((s) => s.g === "rcB");
  assert.equal(B.find((s) => s.label === "AOC AAL").key.lsk, "1R");
  assert.deepEqual(JSON.parse(JSON.stringify(changeFlow({ rcOpt: "A" }).filter((s) => s.g === "rc3").map((s) => s.label))),
    ["Flap Setting/Thrust", "Trim", "V2 speed", "EO ACCEL ALT", "HUD", "COURSE", "HEADING", "ALTITUDE", "Amended portion of route and legs", "Performance Review", "Before Takeoff Checklist"]);
  assert.match(changeFlow({ rcOpt: "A" }).find((s) => s.label === "V2 speed").value, /^145 /);
});
