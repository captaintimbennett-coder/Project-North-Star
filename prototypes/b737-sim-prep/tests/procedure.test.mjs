// Checks the FMS preflight flows against AOM 3.5 (pages 3-18 to 3-32).
// Run: node --test prototypes/b737-sim-prep/tests/procedure.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("../procedure.js", import.meta.url), "utf8"), ctx);
const { buildFlow, GROUPS } = ctx.SimPrep;
// Copy out of the sandbox so deepEqual compares plain arrays.
const plain = (v) => JSON.parse(JSON.stringify(v));
const labels = (F) => plain(F.map((s) => s.label));
const groups = (F) => plain([...new Set(F.map((s) => s.g))]);
const find = (F, label) => F.find((s) => s.label === label);

test("every flow starts with IRS alignment and initial data (3-18, 3-19)", () => {
  for (const source of ["ACARS", "MANUAL"]) {
    const F = buildFlow({ source });
    assert.equal(F[0].label, "L and R IRS Mode selectors");
    assert.deepEqual(labels(F).slice(1, 4), ["INIT/REF key", "Index", "IDENT"]);
  }
});

test("IDENT model and engine rating follow the ship number (3-19)", () => {
  const cases = { A: ["737-800W", "26K"], B: ["737-800W.1", "26K"], C: ["737-8.1", "28K"], D: ["737-8.1", "28K"] };
  for (const [fleet, [model, rating]] of Object.entries(cases)) {
    const F = buildFlow({ fleet });
    assert.equal(find(F, "MODEL").value, model);
    assert.equal(find(F, "ENG RATING").value, rating);
  }
});

test("POS INIT: GPS and IRS POS steps on 3AA–3RG, auto-populated on 3RH–3VR (3-20)", () => {
  assert.ok(find(buildFlow({ fleet: "C" }), "IRS POS"));
  const D = buildFlow({ fleet: "D" });
  assert.equal(find(D, "IRS POS"), undefined);
  assert.equal(find(D, "Present position").action, "Auto-populated");
});

test("ACARS flow follows the uplink messages in AOM order (3-21, 3-22)", () => {
  const F = buildFlow({ source: "ACARS" });
  assert.deepEqual(groups(F).slice(3, 8), ["acReq", "acRte", "acWind", "acPerf", "acTo"]);
  const rte = labels(F.filter((s) => s.g === "acRte"));
  assert.deepEqual(rte, ["LOAD", "DEP/ARR key", "DEP", "DEP/ARR key", "ARR", "ACTIVATE", "EXEC key"]);
  assert.equal(find(F, "FLT PLAN REQUEST").key.lsk, "3R");
});

test("ACARS with takeoff data uplinked: ACCEPT or REJECT, then TAKEOFF REF 2/2 (3-23)", () => {
  const F = buildFlow({ source: "ACARS", toData: true });
  assert.ok(find(F, "TAKEOFF REF data"));
  assert.ok(groups(F).includes("to2"));
  assert.ok(!groups(F).includes("acToReq"));
});

test("ACARS without takeoff data: request the TPS by ACARS and enter it (3-24)", () => {
  const F = buildFlow({ source: "ACARS", toData: false });
  assert.ok(groups(F).includes("acToReq"));
  assert.ok(!groups(F).includes("acTo"));
  assert.equal(find(F, "SEND").key.lsk, "5R");
});

test("optional ACARS items appear only when chosen", () => {
  const base = buildFlow({ source: "ACARS" });
  assert.equal(find(base, "FORECAST"), undefined);
  assert.equal(find(base, "LOGON SEND"), undefined);
  assert.equal(find(base, "Intersection takeoff"), undefined);
  const all = buildFlow({ source: "ACARS", forecastWinds: true, cpdlc: true, intersection: true });
  assert.ok(find(all, "FORECAST") && find(all, "LOGON SEND") && find(all, "Intersection takeoff"));
});

test("every line select key used on a drawn page lands on a prompt or label", () => {
  const { STEPS, PAGES } = ctx.SimPrep;
  for (const s of STEPS) {
    const p = PAGES[s.page];
    if (!p || !s.key || !s.key.lsk) continue;
    const side = s.key.lsk.slice(-1), row = Number(s.key.lsk[0]);
    const text = (s.scr && s.scr[s.key.lsk]) || p[side][row - 1];
    assert.ok(text, `${s.page} ${s.key.lsk} (${s.label}) is blank on the drawing`);
  }
});

test("ACARS takeoff data request follows MENU → ACARS → AOC AAL → T/O DATA (AOM 5-14)", () => {
  const F = buildFlow({ source: "ACARS", toData: false }).filter((s) => s.g === "acToReq").slice(0, 4);
  assert.deepEqual(labels(F), ["MENU", "ACARS", "AOC AAL", "T/O DATA"]);
});

test("manual flow: RTE, PERF INIT, N1 LIMIT, TAKEOFF REF 1/2 and 2/2 (3-25, 3-26)", () => {
  const F = buildFlow({ source: "MANUAL" });
  assert.deepEqual(groups(F).slice(3, 8), ["mRte", "mPerf", "mN1", "mTo1", "to2"]);
  assert.ok(!groups(F).some((g) => g.startsWith("ac")));
  assert.match(find(F, "ZFW").caution, /Do not enter the ZFW into the GW boxes/);
  assert.equal(find(F, "COST INDEX").key.lsk, "5L");
});

test("RNAV SID and EO SID sections appear only when chosen (3-27, 3-28)", () => {
  assert.ok(!groups(buildFlow({})).includes("rnav"));
  const F = buildFlow({ rnavSid: true, eoSid: true });
  assert.ok(groups(F).includes("rnav") && groups(F).includes("eosid"));
});

test("every flow ends with route, legs and performance verification (3-29 to 3-32)", () => {
  for (const o of [{}, { source: "MANUAL" }, { toData: false }]) {
    assert.deepEqual(groups(buildFlow(o)).slice(-3), ["rteV", "legsV", "perfV"]);
  }
});

test("every step cites an AOM page and has a label and action", () => {
  const F = buildFlow({ forecastWinds: true, cpdlc: true, intersection: true, rnavSid: true, eoSid: true });
  for (const s of F) {
    assert.match(s.ref, /^(3-\d\d|21d-41)$/);
    assert.ok(s.label && s.action, `step ${s.n}`);
  }
  assert.ok(GROUPS.every((g) => /^(3-\d\d|21d-41)$/.test(g.ref)));
});

test("no blank CDU: every line select key step shows a drawn page", () => {
  const { STEPS, PAGES } = ctx.SimPrep;
  for (const s of STEPS) if (s.key && s.key.lsk) assert.ok(PAGES[s.page], `${s.g} ${s.key.lsk} ${s.label} has no drawn page`);
});

test("CPDLC log-on follows AOM 21d.3.2: ATC, LOGON/STATUS [5L], LOGON TO, FLT NO, TAIL NO, MAX U/L DELAY, LOGON SEND", () => {
  const F = buildFlow({ source: "ACARS", cpdlc: true }).filter((s) => s.g === "cpdlc");
  assert.deepEqual(labels(F), ["ATC function key", "LOGON/STATUS", "LOGON TO", "FLT NO", "TAIL NO", "MAX U/L DELAY", "LOGON SEND"]);
  assert.equal(F[1].key.lsk, "5L");
  assert.deepEqual(plain(F.slice(2, 5).map((s) => s.action)), ["Enter", "Enter", "Enter"]);
  assert.equal(F[2].value, "KUSA");
  assert.equal(F[6].resultPad, "ATC COMM ESTABLISHED");
});
