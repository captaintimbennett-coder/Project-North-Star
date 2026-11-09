// B737 Sim Prep: Load Closeout, Runway/Departure Change, and the performance briefings.
// Sources: AOM 21j.2.1 When Load Closeout is Received; AOM 5-14/5-15 Runway/Departure
// Change (24 JUN 26); AOM 3-32 Performance Review; and the AA "B737 CDU Load Closeout
// and Performance Guide" (rev. 7-28-2026), whose KMSP examples set the briefing pattern.
// Numbers come from the RNO–SFO training paperwork in perf.js (window.SimPerf).
// Pure data and functions with no DOM, shared by index.html and tests/.
(function (root) {
  "use strict";
  const P = root.SimPerf;
  const F = P.FLIGHT;

  // Airport Analysis data from each TPS: flaps 5, bleeds ON, at 5°C (the OAT).
  // A/I ON SUB is printed under the table and applies with engine anti-ice on.
  const AA = {
    NG: { climb: 167.1, rwy: { "17R": 165.5, "17L": 156.8 }, tlwnd: { "17R": 530, "17L": 740 }, hdwnd: { "17R": 0, "17L": 190 }, aiSub: 0.6, maxN1: "98.5", slope: { "17R": ".1", "17L": ".0" } },
    MAX: { climb: 180.0, rwy: { "17R": 178.1, "17L": 169.0 }, tlwnd: { "17R": 610, "17L": 850 }, hdwnd: { "17R": 90, "17L": 200 }, aiSub: 1.0, maxN1: "92.7", slope: { "17R": ".1", "17L": ".0" } },
  };
  // Planned W&B printed with each TPS. On the day, the closeout printout replaces these.
  const WB = { NG: { zfw: 125.0, tow: 139.6, cg: 25.6 }, MAX: { zfw: 129.3, tow: 143.9, cg: 25.6 } };

  // Practice scenario for the runway change: ATIS L, after the closeout is in.
  const CHANGE = {
    from: "17R", to: "17L",
    atisA: "RNO ATIS L: wind 090 at 12, 5/4, A29.75. Departing runway 17L. Runway 17R closed.",
    atisC: "RNO ATIS L: wind 340 at 6, 5/4, A29.75. Departing runway 17L. Runway 17R closed.",
    tailKt: 6,
  };

  const n1Band = (n) => `${(Number(n) - 0.5).toFixed(1)}–${(Number(n) + 0.5).toFixed(1)}`;

  // Method 2 (Airport Analysis) limit for the unplanned tailwind on the new runway.
  function method2(ac) {
    const a = AA[ac], r = CHANGE.to, kt = CHANGE.tailKt;
    const sub = a.tlwnd[r] * kt;
    const rwy = +(a.rwy[r] - sub / 1000 - a.aiSub).toFixed(1);
    const climb = +(a.climb - a.aiSub).toFixed(1);
    const mtow = Number(F[ac].rwy[r].mtow.replace(/[^\d.]/g, ""));
    const limit = Math.min(rwy, climb, mtow);
    return { kt, perKt: a.tlwnd[r], sub, zeroWind: a.rwy[r], aiSub: a.aiSub, rwy, climb, mtow, limit, gw: WB[ac].tow, ok: WB[ac].tow <= limit };
  }

  // ---------------- Load Closeout (AOM 21j.2.1) ----------------
  const CO_GROUPS = [
    { id: "coLoad", title: "Load the closeout", ref: "21j-16", pad: "PERF INIT UPLINK READY" },
    { id: "coN1", title: "N1 LIMIT", ref: "21j-16" },
    { id: "coTo", title: "TAKEOFF REF", ref: "21j-16" },
    { id: "coSet", title: "Set and brief", ref: "21j-16" },
  ];
  const up = (o) => o.coSource !== "MANUAL", man = (o) => o.coSource === "MANUAL";
  const CO_STEPS = [
    { g: "coLoad", page: "TAKEOFF REF 1/2", key: { key: "INIT REF" }, label: "INIT REF key", action: "Select",
      notes: ["PERF INIT UPLINK READY is displayed when the closeout uplink is available."] },
    { g: "coLoad", page: "PERF INIT", key: { lsk: "6L" }, scr: { "6L": "<LOAD" }, pad: "PERF INIT UPLINK READY", result: "The closeout ZFW loads; the title reads MOD PERF INIT and 6L shows <ERASE.", label: "LOAD", action: "Press", when: up },
    { g: "coLoad", key: { key: "EXEC" }, result: "ACT PERF INIT, with the new GW. VERIFY TAKEOFF SPEEDS appears in the scratchpad.", resultPage: "PERF INIT", resultPad: "VERIFY TAKEOFF SPEEDS", label: "EXEC key", action: "Select", when: up },
    { g: "coLoad", page: "PERF INIT", key: { lsk: "3L" }, label: "ZFW", action: "Enter", value: (o, d) => d.wb.zfw.toFixed(1), when: man,
      caution: "Do not enter the ZFW into the GW boxes. The FMC will calculate performance data with significant errors." },
    { g: "coLoad", key: { key: "EXEC" }, result: "ACT PERF INIT, with the new GW. VERIFY TAKEOFF SPEEDS appears in the scratchpad.", resultPage: "PERF INIT", resultPad: "VERIFY TAKEOFF SPEEDS", label: "EXEC key", action: "Select", when: man },
    { g: "coLoad", page: "PERF INIT", key: { lsk: "3L" }, label: "ZFW is same as closeout", action: "Verify", value: (o, d) => d.wb.zfw.toFixed(1) },
    { g: "coN1", page: "PERF INIT", key: { lsk: "6R" }, label: "N1 LIMIT", action: "Select" },
    { g: "coN1", page: "N1 LIMIT", key: null, label: "Thrust and assumed temperature against the TPS · climb thrust", action: "Check",
      value: (o, d) => `${d.a.rating}, AT ${d.r.at}°C`, notes: ["Check thrust and assumed temperature against TPS. Check climb thrust."] },
    { g: "coTo", page: "N1 LIMIT", key: { lsk: "6R" }, label: "TAKEOFF", action: "Select" },
    { g: "coTo", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, pad: "VERIFY TAKEOFF SPEEDS", result: "After a few seconds the prompt comes back as RWxx/--- TAKEOFF DATA with ACCEPT> again.", resultPad: "TAKEOFF DATA UPLINK", label: "ACCEPT", action: "Select", when: up,
      notes: ["The scratchpad shows RWxx TAKEOFF SPDS."] },
    { g: "coTo", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, pad: "TAKEOFF DATA UPLINK", result: "V-speeds load and the VERIFY TAKEOFF SPEEDS message clears.", label: "ACCEPT (again)", action: "Select", when: up,
      notes: ["After a few seconds the TAKEOFF DATA prompt returns. Accept it."] },
    { g: "coTo", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, pad: "VERIFY TAKEOFF SPEEDS", result: "The speeds are accepted. Now enter the CG.", label: "ACCEPT", action: "Select", when: man },
    { g: "coTo", page: "TAKEOFF REF 1/2", key: { lsk: "3L" }, label: "CG", action: "Enter", value: (o, d) => d.wb.cg.toFixed(1), when: man },
    { g: "coSet", page: "TAKEOFF REF 1/2", key: { panel: "Stabilizer trim" }, label: "CG is same as closeout · set trim", action: "Confirm and set",
      value: (o, d) => `CG ${d.wb.cg.toFixed(1)}`, notes: ["Trim is shown next to CG on TAKEOFF REF 1/2."] },
    { g: "coSet", key: { panel: "MCP speed window" }, label: "V2 speed on MCP", action: "Verify", value: (o, d) => String(d.r.v2) },
    { g: "coSet", page: "TAKEOFF REF 1/2", key: { key: "LEGS" }, label: "PF: TAKEOFF REF page · PM: LEGS page", action: "Select",
      notes: ["3AA–3PX: a difference of more than 500 pounds between the takeoff weight (TOW) and actual gross weight makes the FMC show the VERIFY T/O SPEEDS message at engine start (FMC U11.0 and U12.0)."] },
    { g: "coSet", key: { panel: "First officer briefs" }, label: "Load Closeout briefing (if no change)", action: "First officer briefs",
      value: (o, d) => `Weights · Winds · N1s`, notes: ["Weights: compare GW to PTOW/ATOW/MTOW. Winds: headwind or tailwind. N1s: compare N1s to TPS.", "After a runway or TPS change, brief the 7-item Performance Review instead."] },
  ];

  // ---------------- Runway/Departure Change (AOM 5-14, 5-15) ----------------
  const RC_GROUPS = [
    { id: "rc1", title: "1. Runway change", ref: "5-14" },
    { id: "rcX", title: "2. Takeoff performance: intersection", ref: "5-14", when: (o) => o.rcIntersection },
    { id: "rcA", title: "2. Takeoff performance: runway is one of the first four on the TPS", ref: "5-14", when: (o) => o.rcOpt === "A" },
    { id: "rcB", title: "2. Takeoff performance: request a new TPS", ref: "5-14", when: (o) => o.rcOpt === "B" },
    { id: "rcC", title: "2. Takeoff performance: uplinked data not desired or unavailable", ref: "5-15", when: (o) => o.rcOpt === "C" },
    { id: "rc3", title: "3. Flight preparation", ref: "5-15" },
  ];
  const CONSIDER = "Before starting, check the Takeoff Considerations as required: Contaminated Runways · Engine-Out SID · FMC QRH V-Speeds · Manual Takeoff Calculation · Normal/Noise Abatement Takeoff · Severe Weather/Windshear Flow Chart · SPAR Matrix Chart · TPS Quick Reference Guide · Unplanned Tailwind Takeoff.";
  const RC_STEPS = [
    { g: "rc1", page: "TAKEOFF REF 1/2", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press", notes: [CONSIDER] },
    { g: "rc1", page: "DEP/ARR INDEX", key: { lsk: "1L" }, label: "DEPARTURES page", action: "Select" },
    { g: "rc1", page: "DEPARTURES", key: { lsk: "2R" }, label: "RWY", action: "Select", value: () => CHANGE.to, result: "17L shows <SEL> beside it; the SIDs for 17L are listed on the left.",
      notes: ["Runways are listed on the right side. Select 17L wherever it appears; the order on the list may differ."] },
    { g: "rc1", page: "DEPARTURES", key: null, label: "SID", action: "Select", notes: ["As cleared. SIDs are listed on the left side."] },
    { g: "rc1", page: "DEPARTURES", key: null, label: "TRANSITION", action: "Select", notes: ["If required."] },
    { g: "rc1", key: { key: "EXEC" }, result: "The new runway and SID are active. Takeoff speeds are cleared until new data is accepted or entered.", label: "EXEC key", action: "Press" },

    { g: "rcX", key: { key: "INIT REF" }, label: "TAKEOFF REF page", action: "Select" },
    { g: "rcX", page: "TAKEOFF REF 1/2", key: { lsk: "5L" }, label: "INTERSECT", action: "Enter X",
      notes: ["The entry in [5L] will appear as X/17L. The 17L is automatically loaded from the route page and cannot be modified.", "Some runways have more than one intersection option: see the TPS Airport Notes for the entry."] },

    { g: "rcA", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, fills: ["TAKEOFF REF 1/2|1R", "TAKEOFF REF 1/2|2R", "TAKEOFF REF 1/2|3R"], scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, label: "TAKEOFF REF data", action: "Accept or Reject", alt: "[5R] or [5L]",
      value: (o, d) => `${d.to.v1} / ${d.to.vr} / ${d.to.v2}`, notes: ["Uses the uplinked data as written on the TPS. 17L is the second line on this TPS."] },

    { g: "rcB", key: { key: "MENU" }, label: "MENU", action: "Select" },
    { g: "rcB", page: "MENU", key: { lsk: "2L" }, label: "ACARS", action: "Select" },
    { g: "rcB", page: "ACARS-APPLICATION MENU", key: { lsk: "2R" }, label: "AOC AAL", action: "Select (if required)",
      notes: ["AOM 5-14 lists [1R]; AOM 21d.2.2 and the training guide picture show [2R]. Use the prompt where it appears."] },
    { g: "rcB", page: "ACARS-INDEX", key: { lsk: "4L" }, label: "T/O DATA", action: "Select (if required)" },
    { g: "rcB", page: "ACARS TAKEOFF DATA", key: { lsk: "1L" }, label: "RUNWAY", action: "Enter", value: () => CHANGE.to,
      notes: ["Runway is the minimum input. Blank fields let the FOS optimize (lowest thrust rating and flap setting)."] },
    { g: "rcB", page: "ACARS TAKEOFF DATA", key: { lsk: "3L" }, label: "HWIND/TWIND", action: "Enter (if needed)",
      notes: ["For a tailwind enter a negative value (e.g., -6 for a 6 knot tailwind); for a headwind a positive value. This is Unplanned Tailwind Method 1."] },
    { g: "rcB", page: "ACARS TAKEOFF DATA", key: { lsk: "4R" }, label: "RWY CONDITION", action: "Select", value: () => "WET",
      notes: ["Other reasons for a new TPS: a different thrust or flap setting (gusts, LLWAS), or changed conditions (wet, anti-ice)."] },
    { g: "rcB", page: "ACARS TAKEOFF DATA", key: { lsk: "5R" }, label: "SEND", action: "Press",
      notes: ["A TPS requested by ACARS prints only for the requested runway.", "“UNABLE TO COMPUTE TPS” means the request failed on performance limits: review every result, not just the items you asked for."] },
    { g: "rcB", key: { key: "INIT REF" }, label: "INIT/REF", action: "Press" },
    { g: "rcB", page: "TAKEOFF REF 1/2", key: { lsk: "6L" }, label: "INDEX", action: "Select" },
    { g: "rcB", page: "INIT/REF INDEX", key: { lsk: "4L" }, label: "TAKEOFF", action: "Select" },
    { g: "rcB", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, fills: ["TAKEOFF REF 1/2|1R", "TAKEOFF REF 1/2|2R", "TAKEOFF REF 1/2|3R"], scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, label: "TAKEOFF REF data", action: "Accept or Reject", alt: "[5R] or [5L]",
      caution: "Requested TPS data is uplinked to the FMC and must be ACCEPTED or REJECTED. Failure to do so may cause a buffer overflow of the FMC memory." },

    { g: "rcC", key: { key: "N1 LIMIT" }, label: "N1 LIMIT", action: "Select" },
    { g: "rcC", page: "N1 LIMIT", key: { lsk: "2L" }, label: "Thrust rating / assumed temperature", action: "Select/Enter (as needed)",
      value: (o, d) => `${d.a.rating} maximum`, notes: ["Unplanned tailwind, Method 2: maximum thrust at the planned rating, no assumed temperature."] },
    { g: "rcC", page: "N1 LIMIT", key: { lsk: "6R" }, label: "TAKEOFF", action: "Select" },
    { g: "rcC", page: "TAKEOFF REF 1/2", key: { key: "NEXT PAGE" }, label: "NEXT PAGE", action: "Select" },
    { g: "rcC", page: "TAKEOFF REF 2/2", key: { lsk: "1L" }, label: "ATIS/ATC reported wind", action: "Enter", value: () => "340/6" },
    { g: "rcC", page: "TAKEOFF REF 2/2", key: { lsk: "1R" }, label: "Runway condition", action: "Select", value: () => "WET" },
    { g: "rcC", page: "TAKEOFF REF 2/2", key: { lsk: "2L" }, label: "Runway slope", action: "Enter", value: (o, d) => `${d.aa.slope[CHANGE.to]} % (TPS: SLOPE - PCT)` },
    { g: "rcC", page: "TAKEOFF REF 2/2", key: { key: "PREV PAGE" }, label: "PREV PAGE", action: "Select" },
    { g: "rcC", page: "TAKEOFF REF 1/2", key: { lsk: "6R" }, label: "QRH ON", action: "Select" },
    { g: "rcC", page: "TAKEOFF REF 1/2", key: { lsk: "1R" }, fills: ["TAKEOFF REF 1/2|1R", "TAKEOFF REF 1/2|2R", "TAKEOFF REF 1/2|3R"], label: "QRH speeds", action: "Select", alt: "[1R]–[3R]",
      notes: ["Uplinked TPS speeds can't be used: the FMC QRH V-speeds are."] },

    { g: "rc3", page: "TAKEOFF REF 1/2", key: { look: "1L" }, label: "Flap setting / thrust", action: "Ensure loaded" },
    { g: "rc3", key: { panel: "Stabilizer trim" }, label: "Trim", action: "Set" },
    { g: "rc3", key: { panel: "MCP speed window" }, label: "V2 speed", action: "Note and enter in MCP" },
    { g: "rc3", page: "TAKEOFF REF 2/2", key: { lsk: "4R" }, label: "EO ACCEL ALT", action: "Verify", 
      notes: ["BARO and TAKEOFF REF page 2/2.", "For the new runway: ACCEL HT, EO ACCEL HT and REDUCTION from the TPS 17L E/O ACCEL /AFL/ line, and the MINS selector (BARO) to the /MSL/ altitude.", "Then review the EO SID for 17L (EO SID Takeoff – Preflight)."],
      value: (o, d) => `${d.to.accel} AFL · MINS ${d.to.accelMsl} MSL` },
    { g: "rc3", key: { panel: "HUD" }, label: "HUD", action: "Set" },
    { g: "rc3", key: { panel: "MCP" }, label: "COURSE · HEADING · ALTITUDE", action: "Set" },
    { g: "rc3", key: { key: "LEGS" }, label: "Amended portion of route and legs", action: "Verify",
      notes: ["Assess your Area of Vulnerability before the route/legs verification and performance review. Only the amended portion needs verifying."] },
    { g: "rc3", key: { panel: "Both pilots brief" }, label: "Performance Review", action: "Complete", notes: ["The 7-item review, now with gross weight and N1s. No further Performance Verification and no separate Load Closeout briefing are needed."] },
    { g: "rc3", key: { panel: "Checklist" }, label: "Before Takeoff Checklist", action: "Complete", notes: ["Crossing 17R to reach 17L: Captain “17R, clear left”, First Officer “clear right”. Before entering 17L: “17L, clear left” / “clear right”.", "If a runway or flap setting change happens after any part of the Before Takeoff Checklist, reset and re-accomplish it in its entirety."] },
  ];

  function build(groups, steps, opts) {
    const o = { coSource: "UPLINK", rcOpt: "A", rcIntersection: false, perfAc: "NG", perfRwy: "17R", ...opts };
    const a = F[o.perfAc] || F.NG;
    const d = { a, r: a.rwy[o.perfRwy] || a.rwy["17R"], to: a.rwy[CHANGE.to], wb: WB[o.perfAc] || WB.NG, aa: AA[o.perfAc] || AA.NG };
    const out = [];
    let last = null;
    for (const g of groups) {
      if (g.when && !g.when(o)) continue;
      for (const s of steps) {
        if (s.g !== g.id || (s.when && !s.when(o))) continue;
        const page = s.page || (s.key && s.key.key ? last : undefined);
        const pad = s.pad || (g.pad && !out.some((x) => x.g === g.id) ? g.pad : "");
        if (page) last = page;
        out.push({ ...s, page, pad, group: g, ref: g.ref, value: typeof s.value === "function" ? s.value(o, d) : s.value || "" });
      }
    }
    return out.map((s, i) => ({ ...s, n: i + 1, id: `${s.g}-${i}` }));
  }
  const closeoutFlow = (o) => build(CO_GROUPS, CO_STEPS, o);
  const changeFlow = (o) => build(RC_GROUPS, RC_STEPS, o);

  // ---------------- Briefings (AOM 3-32 pattern, as the guide teaches it) ----------------
  // Each item: what to say aloud, and what it is checked against.
  function briefing(kind, ac, rwy) {
    const a = F[ac], aa = AA[ac], wb = WB[ac];
    if (kind === "preflight") {
      const r = a.rwy[rwy];
      return {
        title: "Preflight Performance Review", count: 7, who: "Both pilots, after the Performance Verification.",
        setting: `ATIS K, RWY ${rwy}, ${a.header} TPS.`,
        items: [
          { label: "Wind", say: "Wind is 090 at 12, mostly crosswind with a little headwind.", check: "ATIS 09012KT. This TPS has no wind correction, so it was built for zero wind: valid with zero wind or a headwind, not a tailwind." },
          { label: "Runway conditions", say: "Wet runway, wet TPS.", check: `ATIS 3SM -RA; TPS header ${a.header}.` },
          { label: "Temperature", say: `5, colder than assumed temperature of ${r.at}.`, check: `ATIS 5/4; TPS ${rwy} line AT ${r.at}.` },
          { label: "Maximum weights", say: `ATOW is the most restrictive at ${a.atow.toFixed(1)}, MTOW is ${r.mtow.replace("L", "")} due to a landing weight limitation.`, check: `TPS header ATOW ${a.atow.toFixed(1)}; ${rwy} MTOW ${r.mtow} (L = landing limited).` },
          { label: "Flaps", say: "Flaps 5.", check: `TPS ${rwy} line FLAP 05.` },
          { label: "Thrust", say: `${a.rating}, standard, engine bleed on.`, check: `TPS header ${a.rating}; ${rwy} line BLD ON with an AT, so standard (reduced) thrust.` },
          { label: "Runway", say: `${rwy} full length.`, check: `ATIS K departing 17R, 17L; TPS ${rwy} line; no intersection.` },
        ],
        extra: [
          "Icing conditions: 5°C and rain. The TPS was computed with ANTI-ICE ON.",
          `EO ACCEL HT greater than 1000: ${r.accel} AFL on ${rwy}. Special engine-failure procedures exist on all runways.`,
          "Terrain: Reno.",
        ],
      };
    }
    if (kind === "closeout") {
      const r = a.rwy[rwy];
      return {
        title: "Load Closeout briefing", count: 3, who: "The first officer, when the closeout is loaded and nothing has changed since preflight.",
        setting: `Closeout loaded, RWY ${rwy}. Practice GW ${wb.tow.toFixed(1)} from the planned W&B on your TPS; in the sim use the closeout.`,
        items: [
          { label: "Weights", say: `Gross weight is ${wb.tow.toFixed(1)}, which is below both our ATOW ${a.atow.toFixed(1)} and MTOW ${r.mtow.replace("L", "")}.`, check: `GW on TAKEOFF REF 1/2 [4R]; compare to PTOW ${a.ptow.toFixed(1)}, ATOW ${a.atow.toFixed(1)}, MTOW ${r.mtow}.` },
          { label: "Winds", say: "Wind is 090 at 12, that's a headwind.", check: "Headwind or tailwind only. A zero-wind TPS is valid with zero wind or a headwind." },
          { label: "N1s", say: `N1s ${r.n1}, within half a percent of TPS ${r.n1}.`, check: `FMC N1 on TAKEOFF REF 1/2 [2L] against the TPS ${rwy} N1 ${r.n1}: acceptable ${n1Band(r.n1)}.` },
        ],
        extra: ["If anything changed since preflight (runway, TPS), brief the 7 items instead. The 3-item briefing is not then required."],
      };
    }
    // After a change: A = 17L uplinked data accepted, C = 17L tailwind, Method 2.
    const r = a.rwy[CHANGE.to];
    if (kind === "changeA") {
      return {
        title: "Performance Review after a runway change", count: 7, who: "Both pilots, as part of the Runway/Departure Change.",
        setting: `${CHANGE.atisA} New 17L data accepted from the TPS.`,
        items: [
          { label: "Winds", say: "Wind is 090 at 12, mostly crosswind with a little headwind.", check: "Zero-wind TPS: valid with zero wind or a headwind." },
          { label: "Runway conditions", say: "Wet runway, wet TPS.", check: `TPS header ${a.header}.` },
          { label: "Temperature", say: `5, colder than assumed temperature of ${r.at}.`, check: `TPS 17L line AT ${r.at} (17R was ${a.rwy["17R"].at}).` },
          { label: "Weights", say: `Gross weight is ${wb.tow.toFixed(1)}, which is below our ATOW ${a.atow.toFixed(1)} and MTOW ${r.mtow.replace("L", "")}.`, check: "With a closeout in, quote the gross weight against the limits." },
          { label: "Flaps", say: "Flaps 5.", check: "TPS 17L line FLAP 05." },
          { label: "Thrust", say: `${a.rating}, standard, engine bleed on. N1s ${r.n1}, within half a percent of TPS ${r.n1}.`, check: `TPS 17L N1 ${r.n1}: acceptable ${n1Band(r.n1)}.` },
          { label: "Runway", say: "17L full length.", check: `TPS 17L line. Accel height now ${r.accel} (17R was ${a.rwy["17R"].accel}).` },
        ],
        extra: ["Then the Before Takeoff Flow and Checklist. No separate Load Closeout briefing."],
      };
    }
    const m = method2(ac);
    return {
      title: "Performance Review after a change: unplanned tailwind", count: 7, who: "Both pilots, as part of the Runway/Departure Change.",
      setting: `${CHANGE.atisC} No takeoff data uplink: Method 2 with the Airport Analysis and FMC QRH V-speeds.`,
      items: [
        { label: "Winds", say: `Wind is 340 at 6, that's a tailwind.`, check: "About a 6 knot tailwind on 17L (use the Jeppesen runway heading). The zero-wind THRUST/V-SPEED section is no longer valid." },
        { label: "Runway conditions", say: "Wet runway, wet TPS.", check: `TPS header ${a.header}.` },
        { label: "Temperature", say: `5, not warmer than the planned temperature of ${a.temp}.`, check: `Maximum thrust: compare with the TPS planned TEMP ${a.temp}C, not the AT.` },
        { label: "Weights", say: `Gross weight is ${m.gw.toFixed(1)}, which is below our climb limit ${m.climb.toFixed(1)}, adjusted runway limit ${m.rwy.toFixed(1)} and MTOW ${m.mtow.toFixed(1)}.`,
          check: `17L runway limit ${m.zeroWind.toFixed(1)} − ${m.perKt} × ${m.kt} kt (${m.sub}) − A/I ON ${m.aiSub} = ${m.rwy.toFixed(1)}. Climb ${aa.climb.toFixed(1)} − ${m.aiSub} = ${m.climb.toFixed(1)}. MTOW ${m.mtow.toFixed(1)}.` },
        { label: "Flaps", say: "Flaps 5.", check: "Airport Analysis flaps 05 rows." },
        { label: "Thrust", say: `${a.rating}, max, engine bleed on. N1s ${aa.maxN1}, within half a percent of TPS ${aa.maxN1}.`, check: `TPS *MAX* N1 BLD ON ${aa.maxN1}: acceptable ${n1Band(aa.maxN1)}.` },
        { label: "Runway", say: "17L full length.", check: "New runway from ATIS L." },
      ],
      extra: ["QRH V-speeds are in use: the TPS V-speeds no longer apply.", "Then the Before Takeoff Flow and Checklist."],
    };
  }

  root.SimTaxi = { AA, WB, CHANGE, method2, CO_GROUPS, CO_STEPS, RC_GROUPS, RC_STEPS, closeoutFlow, changeFlow, briefing, n1Band };
})(typeof window !== "undefined" ? window : globalThis);
