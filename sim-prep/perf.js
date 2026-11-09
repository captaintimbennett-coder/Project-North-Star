// B737 Sim Prep: Performance check block.
// Values come from the RNO–SFO training flight paperwork (AAL1080: NG and MAX TPS,
// NG flight plan, ATIS K). The checklist itself follows AOM 3-32 Performance Verification.
// Pure data and functions with no DOM, shared by index.html and tests/.
(function (root) {
  "use strict";

  // Paperwork, per aircraft. Runway lines are flaps 5, bleeds on, as printed.
  const FLIGHT = {
    route: "KRNO ZEFFR@ MRLET DCT DYAMD DYAMD@ KSFO",
    alternate: "KSMF",
    costIndex: "0",
    crzAlt: "FL280",
    fuel: { rsv: 4678, maf: 345, altn: 2667 },
    distance: 210,
    atis: "RNO ATIS K 1955Z 09012KT 3SM -RA OVC006 5/4 A29.75. Departing RWY 17R, 17L.",
    oat: 5,
    NG: {
      ship: "3LE", header: "737-NG 26K WET", rating: "26K", temp: 5, ptow: 139.7, atow: 141.7, zfw: 125.0, fuelLoad: 15.0, tow: 139.6,
      rwy: {
        "17R": { flaps: 5, n1: "96.1", v1: 132, vr: 138, v2: 144, at: 32, mtow: "150.6L", accel: 1410, accelMsl: 5830 },
        "17L": { flaps: 5, n1: "98.1", v1: 132, vr: 138, v2: 145, at: 23, mtow: "150.6L", accel: 1260, accelMsl: 5680 },
      },
    },
    MAX: {
      ship: "3RS", header: "737-MAX 8 TO WET", rating: "TO", temp: 5, ptow: 143.9, atow: 145.9, zfw: 129.3, fuelLoad: 15.0, tow: 143.9,
      rwy: {
        "17R": { flaps: 5, n1: "89.2", v1: 131, vr: 138, v2: 145, at: 32, mtow: "156.5L", accel: 1410, accelMsl: 5830 },
        "17L": { flaps: 5, n1: "92.1", v1: 130, vr: 137, v2: 145, at: 23, mtow: "156.5L", accel: 1270, accelMsl: 5690 },
      },
    },
  };

  const reserves = () => (FLIGHT.fuel.rsv + FLIGHT.fuel.maf + FLIGHT.fuel.altn) / 1000;

  // The AOM 3-32 checklist with this flight's values and where each one is on the paperwork.
  // lsk: the AOM's own line select key for the entry (3-25, 3-26), where it gives one.
  function items(ac, rwy) {
    const a = FLIGHT[ac], r = a.rwy[rwy], other = rwy === "17R" ? "17L" : "17R", o = a.rwy[other];
    return [
      { page: "PERF INIT", id: "zfw", label: "ZFW", lsk: "3L", value: a.zfw.toFixed(1),
        from: `TPS header ZFW ${a.zfw.toFixed(1)}${ac === "NG" ? "; flight plan PAYLOAD line ZFW 125000" : ""}; W&B ZFW.`,
        note: "Do not enter the ZFW into the GW boxes. The FMC will calculate performance data with significant errors. (AOM 3-25)" },
      { page: "PERF INIT", id: "rsv", label: "Reserves", lsk: "4L", value: reserves().toFixed(1),
        from: `Flight plan: RSV ${FLIGHT.fuel.rsv} + MAF ${FLIGHT.fuel.maf} + ALTN SMF ${FLIGHT.fuel.altn} = ${(reserves() * 1000).toFixed(0)}.`,
        note: "Enter a minimum of RSV + MAF + most distant ALTN (when required). (AOM 3-25)" },
      { page: "PERF INIT", id: "ci", label: "Cost index", lsk: "5L", value: FLIGHT.costIndex, from: "Flight plan page 1: COST INDEX: 0." },
      { page: "PERF INIT", id: "crz", label: "CRZ ALT", lsk: "1R", value: FLIGHT.crzAlt, from: "Flight plan: filed F280 (-N0464F280); TOC at 280." },
      { page: "PERF INIT", id: "trans", label: "Transition altitude", lsk: "4R", value: "18000",
        from: "Not printed on this paperwork: U.S. transition altitude 18,000 ft.", note: "TRANS ALT: verify. (AOM 3-26)" },
      { page: "N1 LIMIT", id: "at", label: "Assumed temperature", value: `${r.at}°C`,
        from: `TPS ${rwy} line: AT ${r.at}. (${other} is ${o.at}: don't mix the lines.)` },
      { page: "N1 LIMIT", id: "oat", label: "OAT", lsk: "1L", value: `${FLIGHT.oat}°C`,
        from: `TPS TEMP ${a.temp}C; ATIS 5/4.`, note: "Check that OAT is reasonable for the ambient conditions, specifically the ± value. (AOM 3-26)" },
      { page: "N1 LIMIT", id: "rating", label: "Thrust rating", value: a.rating, from: `TPS header: ${a.header}.` },
      { page: "N1 LIMIT", id: "clb", label: "Climb thrust", value: "As selected", from: "Not on the TPS: full or derated climb thrust, selected as needed. (AOM 3-26)" },
      { page: "TAKEOFF REF 1/2", id: "flaps", label: "Flap setting", lsk: "1L", value: String(r.flaps), from: `TPS ${rwy} line: FLAP 05.` },
      { page: "TAKEOFF REF 1/2", id: "rwy", label: "Runway", value: rwy, from: "ATIS K: departing 17R, 17L; ATC clearance assigns the runway." },
      { page: "TAKEOFF REF 1/2", id: "vs", label: "V1 / VR / V2", lsk: "1R", value: `${r.v1} / ${r.vr} / ${r.v2}`,
        from: `TPS ${rwy} line: ${r.v1} ${r.vr} ${r.v2}. (${other}: ${o.v1} ${o.vr} ${o.v2}.)` },
      { page: "TAKEOFF REF 2/2", id: "acc", label: "Acceleration height", value: `${r.accel}`, from: `TPS E/O ACCEL /AFL/ FT, ${rwy} column, flaps 5: ${r.accel}.` },
      { page: "TAKEOFF REF 2/2", id: "red", label: "Thrust reduction", value: `${r.accel}`, from: `Same TPS line: ${r.accel} AFL.` },
      { page: "TAKEOFF REF 2/2", id: "eoacc", label: "Engine-out acceleration height", value: `${r.accel}`, from: `Same TPS line: ${r.accel} AFL.`,
        note: "Verify the ACCEL HT, EO ACCEL HT, and thrust REDUCTION all match the TPS E/O ACCEL/AFL/FT line or modify as directed by Ops Advisory page (##-7). NADP1: REDUCTION 1500 AGL and ACCEL HT 3000 AGL. (AOM 3-32) This TPS notes: SPECIAL ENGINE-FAILURE PROCEDURES EXIST ALL RUNWAYS." },
    ];
  }

  // Performance review (AOM 3-32): ATIS and TPS compatible with conditions. Checks use the takeoff card.
  function review(ac, rwy) {
    const a = FLIGHT[ac], r = a.rwy[rwy];
    return [
      { label: "Runway condition", text: `ATIS: 3SM -RA (rain). TPS header says WET, which matches. (Takeoff card: wet runways need a TPS labeled WET.)` },
      { label: "Temperature", text: `ATIS 5°C, TPS TEMP 5C, AT ${r.at}. Current temperature is colder than AT, so standard thrust is authorized.` },
      { label: "Weight", text: `W&B TOW ${a.tow.toFixed(1)} is within ATOW ${a.atow.toFixed(1)} (PTOW ${a.ptow.toFixed(1)} + 2,000 lb) and MTOW ${r.mtow}. Standard thrust stands.` },
      { label: "Wind", text: "ATIS 090/12 on runway 17: mostly crosswind, a small headwind. The TPS planned zero wind, so any headwind is fine. (Wind Variation)" },
      { label: "Anti-ice", text: "TPS shows ANTI-ICE ON, so engine anti-ice is already accounted for." },
      { label: "Flaps and thrust", text: `Flaps 5, ${a.rating} rating, assumed temperature ${r.at}.` },
    ];
  }

  // Plausible mistakes for the drill, each with the wrong value shown and why it's wrong.
  function mistakes(ac, rwy) {
    const a = FLIGHT[ac], r = a.rwy[rwy], other = rwy === "17R" ? "17L" : "17R", o = a.rwy[other];
    const list = [
      { id: "zfw", shown: a.tow.toFixed(1), why: `${a.tow.toFixed(1)} is the takeoff weight. ZFW is ${a.zfw.toFixed(1)}.` },
      { id: "rsv", shown: (FLIGHT.fuel.rsv / 1000).toFixed(1), why: `That's RSV alone. The AOM minimum is RSV + MAF + ALTN = ${reserves().toFixed(1)}.` },
      { id: "ci", shown: "10", why: "The flight plan says COST INDEX: 0." },
      { id: "crz", shown: "FL290", why: "Filed and planned at FL280." },
      { id: "oat", shown: "15°C", why: "TPS TEMP and ATIS both say 5°C. Check the ± value." },
      { id: "rating", shown: ac === "NG" ? "24K" : "TO1", why: `The TPS header says ${a.header}.` },
      { id: "flaps", shown: "1", why: `The ${rwy} line is flaps 5.` },
      { id: "acc", shown: `${o.accel}`, why: `${o.accel} is the ${other} E/O ACCEL height. ${rwy} is ${r.accel}.` },
    ];
    if (r.at !== o.at) list.push({ id: "at", shown: `${o.at}°C`, why: `${o.at} is the ${other} assumed temperature. ${rwy} is ${r.at}.` });
    if (`${r.v1}/${r.vr}/${r.v2}` !== `${o.v1}/${o.vr}/${o.v2}`) {
      list.push({ id: "vs", shown: `${o.v1} / ${o.vr} / ${o.v2}`, why: `Those are the ${other} speeds. ${rwy} is ${r.v1} / ${r.vr} / ${r.v2}.` });
    }
    return list;
  }

  // A drill: the checklist with one or two mistakes planted. `rand` makes it repeatable in tests.
  function makeDrill(ac, rwy, rand = Math.random) {
    const all = mistakes(ac, rwy).slice();
    const count = rand() < 0.5 ? 1 : 2;
    const chosen = [];
    while (chosen.length < count && all.length) chosen.push(all.splice(Math.floor(rand() * all.length), 1)[0]);
    const byId = Object.fromEntries(chosen.map((m) => [m.id, m]));
    return items(ac, rwy).map((it) => ({ ...it, shown: byId[it.id] ? byId[it.id].shown : it.value, wrong: !!byId[it.id], why: byId[it.id] ? byId[it.id].why : "" }));
  }

  // The paperwork lines worth having open during the check.
  function paperwork(ac) {
    const a = FLIGHT[ac];
    const line = (rw) => { const r = a.rwy[rw]; return `${rw}    05   ON     ${r.n1}   ${r.v1} ${r.vr} ${r.v2}    ${r.at}       ${r.mtow}`; };
    return [
      { title: "TPS", text: [`STA RNO  FLT 1080  AIRPL ${a.ship}`, `*** ${a.header} ***`, `TEMP ${a.temp}C  PTOW ${a.ptow.toFixed(1)}  ATOW ${a.atow.toFixed(1)}  ZFW ${a.zfw.toFixed(1)}  FUEL ${a.fuelLoad.toFixed(1)}P`, "*   ANTI-ICE ON   *", "RWY   FLAP BLD   N1     V1  VR  V2    AT    MTOW", line("17R"), line("17L"), `E/O ACCEL /AFL/ FT (flaps 5)  17R ${a.rwy["17R"].accel}   17L ${a.rwy["17L"].accel}`, "SPECIAL ENGINE-FAILURE PROCEDURES EXIST ALL RUNWAYS."].join("\n") },
      { title: "Flight plan", text: [`ROUTE: ${FLIGHT.route}`, "COST INDEX: 0     Filed: -N0464F280", `RSV ${FLIGHT.fuel.rsv}   MAF 00${FLIGHT.fuel.maf}   ALTN SMF 0${FLIGHT.fuel.altn}`, "PAYLOAD 29500  ZFW 125000  RAMP WT 140000  PTOW 139559", `ENRT BRN SFO  DIST ${FLIGHT.distance}`].join("\n") },
      { title: "ATIS", text: FLIGHT.atis },
    ];
  }

  root.SimPerf = { FLIGHT, items, review, mistakes, makeDrill, paperwork, reserves };
})(typeof window !== "undefined" ? window : globalThis);
