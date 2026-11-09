// B737 Sim Prep: FMS Preflight procedure data.
// Source: AOM 3.5 Preflight Tasks, pages 3-18 to 3-32. Wording follows the AOM.
// Pure data and functions with no DOM, shared by index.html and tests/.
(function (root) {
  "use strict";

  // Ship number ranges: the AOM's steps differ by range (model, engine rating, POS INIT).
  const FLEETS = {
    A: { label: "3AA–3LB", type: "737-800", model: "737-800W", rating: "26K", hybrid: false },
    B: { label: "3LC–3PX", type: "737-800", model: "737-800W.1", rating: "26K", hybrid: false },
    C: { label: "3RA–3RG", type: "737 MAX 8", model: "737-8.1", rating: "28K", hybrid: false },
    D: { label: "3RH–3VR", type: "737 MAX 8", model: "737-8.1", rating: "28K", hybrid: true },
  };

  const DEFAULTS = {
    fleet: "B", // ship 3LE (the RNO–SFO training flight) is in 3LC–3PX
    source: "ACARS", // or "MANUAL"
    toData: true, // uplinked takeoff data available
    intersection: false,
    forecastWinds: false,
    cpdlc: true, // 3DM–3VM are CPDLC equipped
    rnavSid: false,
    eoSid: true, // special engine-failure procedures exist at RNO
  };

  // Sections, in the order they are flown. `when` limits a section to some setups.
  const GROUPS = [
    { id: "irs", title: "IRS alignment", ref: "3-18" },
    { id: "init", title: "Initial data", ref: "3-19" },
    { id: "posinit", title: "POS INIT", ref: "3-20" },
    { id: "acReq", title: "Request the uplink", ref: "3-21", when: (o) => o.source === "ACARS" },
    { id: "acRte", title: "When ROUTE 1 UPLINK is displayed", ref: "3-21", pad: "ROUTE 1 UPLINK READY", when: (o) => o.source === "ACARS" },
    { id: "acWind", title: "When CRZ WIND UPLINK READY is displayed", ref: "3-22", pad: "CRZ WIND UPLINK READY", when: (o) => o.source === "ACARS" },
    { id: "acFcst", title: "When FORECASTS UPLINK READY is displayed", ref: "3-22", pad: "FORECASTS UPLINK READY", when: (o) => o.source === "ACARS" && o.forecastWinds },
    { id: "acPerf", title: "When PERF INIT UPLINK READY is displayed", ref: "3-22", pad: "PERF INIT UPLINK READY", when: (o) => o.source === "ACARS" },
    { id: "acTo", title: "When TAKEOFF DATA UPLINK is displayed", ref: "3-22", pad: "TAKEOFF DATA UPLINK", when: (o) => o.source === "ACARS" && o.toData },
    { id: "acToReq", title: "Takeoff data not available: request by ACARS", ref: "3-24", when: (o) => o.source === "ACARS" && !o.toData },
    { id: "cpdlc", title: "CPDLC log-on", ref: "21d-41", when: (o) => o.source === "ACARS" && o.cpdlc },
    { id: "mRte", title: "RTE", ref: "3-25", when: (o) => o.source === "MANUAL" },
    { id: "mPerf", title: "PERF INIT", ref: "3-25", when: (o) => o.source === "MANUAL" },
    { id: "mN1", title: "N1 LIMIT", ref: "3-26", when: (o) => o.source === "MANUAL" },
    { id: "mTo1", title: "TAKEOFF REF 1/2", ref: "3-26", when: (o) => o.source === "MANUAL" },
    { id: "to2", title: "TAKEOFF REF 2/2", ref: "3-23", when: (o) => o.source === "MANUAL" || o.toData },
    { id: "rnav", title: "RNAV SID", ref: "3-27", when: (o) => o.rnavSid },
    { id: "eosid", title: "Engine-out SID", ref: "3-28", when: (o) => o.eoSid },
    { id: "rteV", title: "Route verification", ref: "3-29" },
    { id: "legsV", title: "Legs verification", ref: "3-30" },
    { id: "perfV", title: "Performance verification", ref: "3-32" },
  ];

  // Page layouts from the AA "B737 CDU Load Closeout and Performance Guide" (AOM Rev 10
  // pictures of the current CDU). Only labels and prompts are drawn, never flight data.
  // Prompts that appear only at some moments (<LOAD, <REJECT, STEP>) come from the
  // step's own `scr` override, e.g. scr: { "6L": "<LOAD" }.
  // "<page> MAX" is used instead on MAX ships (no 27K Bump line).
  const PAGES = {
    "IDENT": {
      L: ["MODEL", "NAV DATA", "", "OP PROGRAM", "", "<INDEX"],
      R: ["ENG RATING", "ACTIVE", "", "", "", "POS INIT>"],
    },
    "POS INIT": {
      title: "POS INIT 1/3",
      L: ["", "REF AIRPORT", "GATE", "", "GMT-MON/DY", "<INDEX"],
      R: ["LAST POS", "", "", "SET IRS POS", "", "ROUTE>"],
    },
    "POS REF 2/3": {
      L: ["FMC POS", "IRS L", "IRS R", "GPS L", "GPS R", "RADIO"],
      R: ["GS", "GS", "GS", "GS", "GS", ""],
    },
    "DES": {
      L: ["", "", "", "", "", "<FORECAST"],
      R: ["", "", "", "", "", ""],
    },
    "DES FORECASTS": {
      L: ["TRANS LVL", "", "", "", "", ""],
      R: ["TAI ON/OFF", "", "", "", "", "LOAD>"],
    },
    "ACT RTE 1": {
      L: ["ORIGIN", "CO ROUTE", "RUNWAY", "", "<ALTN DEST", "<RTE 2"],
      R: ["DEST", "FLT NO", "FLT PLAN REQUEST>", "", "RTE COPY>", "TAKEOFF>"],
    },
    "DEPARTURES": {
      L: ["SIDS", "", "", "", "", "<INDEX"],
      R: ["RUNWAYS", "", "", "", "", "ROUTE>"],
    },
    "CLB": {
      L: ["CRZ ALT", "TGT SPD", "SPD REST", "", "<MAX RATE", "<MAX ANGLE"],
      R: ["AT", "TO", "", "CLB N1", "", "RTA>"],
    },
    "PROGRESS": {
      L: ["FROM", "NEXT WPT", "WPT", "DEST  DTG", "TO T/C", "WIND"],
      R: ["ALT  ATA  FUEL", "DTG  ETA  FUEL", "", "ETA  FUEL", "FUEL QTY", "NAV STATUS>"],
    },
    "INIT/REF INDEX": {
      L: ["<IDENT", "<POS", "<PERF", "<TAKEOFF", "<APPROACH", "<OFFSET"],
      R: ["NAV DATA>", "MSG RECALL>", "ALTN DEST>", "", "SEL CONFIG>", "MAINT>"],
    },
    "RTE": {
      L: ["ORIGIN", "CO ROUTE", "RUNWAY", "", "<ALTN DEST", "<RTE 2"],
      R: ["DEST", "FLT NO", "FLT PLAN REQUEST>", "", "", "ACTIVATE>"],
    },
    "DEP/ARR INDEX": {
      L: ["<DEP", "", "<DEP", "", "", "<DEP"],
      R: ["ARR>", "ARR>", "ARR>", "ARR>", "", "ARR>"],
    },
    "LEGS": {
      L: ["", "", "", "", "RNP/ACTUAL", "<RTE 2 LEGS"],
      R: ["", "", "", "", "", "RTE DATA>"],
    },
    "RTE DATA": {
      L: ["", "", "", "", "", "<LOAD"],
      R: ["WIND", "", "", "", "", "WINDS REQUEST>"],
    },
    "PERF INIT": {
      L: ["GW/CRZ CG", "FUEL", "ZFW", "RESERVES", "COST INDEX", "<INDEX"],
      R: ["TRIP/CRZ ALT", "CRZ WIND", "T/C OAT", "TRANS ALT", "PERF INIT REQUEST>", "N1 LIMIT>"],
    },
    "N1 LIMIT MAX": {
      L: ["SEL/OAT", "<TO", "<TO-1", "<TO-2", "", "<PERF INIT"],
      R: ["RED N1", "CLB>", "CLB-1>", "CLB-2>", "", "TAKEOFF>"],
    },
    "N1 LIMIT": {
      L: ["SEL/OAT", "<TO", "<TO-1", "<TO-2", "<TO-B", "<PERF INIT"],
      R: ["RED N1", "CLB>", "CLB-1>", "CLB-2>", "", "TAKEOFF>"],
    },
    "TAKEOFF REF 1/2": {
      L: ["FLAPS", "N1", "CG  TRIM", "<REQUEST", "INTERSECT", "<INDEX"],
      R: ["V1", "VR", "V2", "GW / TOW", "", "QRH ON/OFF>"],
    },
    "TAKEOFF REF 2/2": {
      L: ["RW WIND", "RW SLOPE/HDG", "", "ACCEL HT", "REDUCTION", "<INDEX"],
      R: ["RW COND>", "SEL/OAT", "", "EO ACCEL HT", "THR", "CUTBACK ON/OFF"],
    },
    "MENU": {
      L: ["<FMC", "<ACARS", "<ACMS", "", "<HGS", ""],
      R: ["", "", "", "", "", ""],
    },
    "ACARS-APPLICATION MENU": {
      L: ["", "", "", "", "", ""],
      R: ["", "AOC AAL>", "ATS>", "TECHNICAL>", "", ""],
    },
    "ACARS-INDEX": {
      L: ["<PREFLIGHT", "<OOOI", "<DELAYS", "<T/O DATA", "*FLT PROG", "<RETURN"],
      R: ["WX REQUEST>", "MESSAGES>", "CHANGEOVER>", "POSTFLIGHT>", "MISC>", ""],
    },
    "ACARS TAKEOFF DATA": {
      L: ["RUNWAY", "TEMP", "HWIND/TWIND", "ANTI-ICE", "", "<RETURN"],
      R: ["FLAPS", "THRUST RTG", "QNH (IN)", "RWY CONDITION", "SEND*", ""],
    },
    "ATC INDEX": {
      L: ["", "", "", "", "<LOGON/STATUS", ""],
      R: ["", "", "", "", "", ""],
    },
    "ATC LOGON/STATUS": {
      L: ["LOGON TO", "FLT NO", "TAIL NO", "MAX U/L DELAY", "", "<ATC INDEX"],
      R: ["LOGON SEND>", "", "", "", "", ""],
    },
  };

  // Shared notes, quoted from the AOM.
  const N_ALT = [
    "Verify the ACCEL HT, EO ACCEL HT, and thrust REDUCTION all match the TPS E/O ACCEL/AFL/FT line or modify as directed by Ops Advisory page (##-7).",
    "If performing an NADP1 departure, modify the thrust REDUCTION to 1500 AGL and ACCEL HT to 3000 AGL.",
  ];
  const N_RSV = "For example, enter a minimum of RSV + MAF + most distant ALTN (when required). Larger values may be used for situational awareness and planning.";

  // key: { lsk: "6L" } line select key | { key: "LEGS" } CDU key | { panel: "..." } not on the CDU.
  // value: text or function of the setup. when: limits the step to some setups.
  const STEPS = [
    // --- IRS alignment (3-18)
    { g: "irs", key: { panel: "IRS mode selectors" }, label: "L and R IRS Mode selectors", action: "OFF, then NAV",
      notes: ["ON DC lights: on, then off.", "ALIGN lights: on.", "Recommend full IRS alignment before each flight. If time does not allow a full alignment, see 21j.1.2 IRS Fast Realignment.", "The UNABLE REQD NAV PERF-RNP message may show until IRS alignment is complete."] },

    // --- Initial data (3-19, 3-20)
    { g: "init", page: "MENU", key: { key: "INIT REF" }, label: "INIT/REF key", action: "Press", notes: ["Whatever page is showing, INIT REF brings up the initialization pages."] },
    { g: "init", page: "IDENT", key: { lsk: "6L" }, label: "Index", action: "Select" },
    { g: "init", page: "INIT/REF INDEX", key: { lsk: "1L" }, label: "IDENT", action: "Select" },
    { g: "init", page: "IDENT", key: { lsk: "1L" }, label: "MODEL", action: "Ensure correct",
      value: (o, f) => f.model, notes: ["3AA–3LB: 737-800W · 3LC–3PX: 737-800W.1 · 3RA–3VR: 737-8.1"] },
    { g: "init", page: "IDENT", key: { lsk: "1R" }, label: "ENG RATING", action: "Ensure correct",
      value: (o, f) => f.rating, notes: ["3AA–3PX: 26K · 3RA–3VR: 28K"] },
    { g: "init", page: "IDENT", key: { lsk: "2R" }, label: "NAV DATA ACTIVE", action: "Current local departure date",
      notes: ["Refer to NAV Database Out of Date for out of date database procedures.", "The database becomes effective at 0901Z on the date of change.", "Navigation database cannot be changed in flight. When an active database expires in flight, the expired database is used until the active date is changed before the next flight."] },
    { g: "init", page: "IDENT", key: { lsk: "4L" }, label: "OP PROGRAM", action: "Note version" },
    { g: "init", page: "IDENT", key: { lsk: "6R" }, label: "POS INIT", action: "Select" },

    // --- POS INIT (3-20)
    { g: "posinit", page: "POS INIT", key: { lsk: "5L" }, label: "Time", action: "Ensure correct", when: (o, f) => !f.hybrid },
    { g: "posinit", page: "POS INIT", key: { key: "NEXT PAGE" }, label: "NEXT PAGE", action: "Press",
      notes: ["How the IRS position is set, in four moves: (1) NEXT PAGE to POS REF 2/3. (2) Select GPS L [4L] (or GPS R [5L]): its position copies into the scratchpad. (3) PREV PAGE back to POS INIT 1/3. (4) SET IRS POS [4R]: the scratchpad position goes in."], when: (o, f) => !f.hybrid },
    { g: "posinit", page: "POS REF 2/3", key: { lsk: "4L" }, resultPage: "POS REF 2/3", resultPad: "N39°29.9 W119°46.1", result: "The GPS position is copied into the scratchpad (example: Reno).", label: "GPS L or R", action: "Select", alt: "[4L] or [5L]",
      notes: ["Use GPS position, if available, otherwise see Manual Alignment.", "Selecting GPS L [4L] or GPS R [5L] copies that GPS position into the scratchpad. The next two steps paste it into SET IRS POS on POS INIT."], when: (o, f) => !f.hybrid },
    { g: "posinit", page: "POS REF 2/3", key: { key: "PREV PAGE" }, pad: "N39°29.9 W119°46.1", resultPage: "POS INIT", resultPad: "N39°29.9 W119°46.1", result: "Back on POS INIT with the position still in the scratchpad.", label: "PREV PAGE", action: "Press", notes: ["Back to POS INIT, with the GPS position still in the scratchpad."], when: (o, f) => !f.hybrid },
    { g: "posinit", page: "POS INIT", key: { lsk: "4R" }, fills: ["POS INIT|4R"], pad: "N39°29.9 W119°46.1", result: "The position moves into SET IRS POS and the scratchpad clears. The IRS finishes aligning.", label: "IRS POS", action: "Set", notes: ["Press [4R] to put the scratchpad GPS position into SET IRS POS."], when: (o, f) => !f.hybrid },
    { g: "posinit", page: "POS INIT", key: null, label: "Present position", action: "Auto-populated",
      notes: ["3RH–3VR are equipped with a Hybrid GPS IRS and present position is auto-populated."], when: (o, f) => f.hybrid },

    // --- ACARS: request (3-21)
    { g: "acReq", key: { key: "RTE" }, label: "RTE key", action: "Press" },
    { g: "acReq", page: "RTE", key: { lsk: "3R" }, result: "The request is sent. When the flight plan arrives, ROUTE 1 UPLINK READY shows in the scratchpad.", label: "FLT PLAN REQUEST", action: "Select",
      notes: ["Request will be sent for flight plan, cruise winds, descent forecast winds, performance initialization, and takeoff data.", "The next leg flight information is available for upload 8 minutes after the IN event is sent. Prior to this time, either the current segment or nothing at all would occur.", "Verify FLT NO. is as shown on flight plan header.", "Flight 13 is used by maintenance for towing and taxiing."] },

    // --- ACARS: route (3-21)
    { g: "acRte", page: "RTE", key: { lsk: "4L" }, fills: ["RTE|1L", "RTE|1R", "RTE|2R", "RTE|3L", "@route"], scr: { "4L": "<LOAD" }, result: "ORIGIN, DEST, FLT NO and RUNWAY fill in on RTE 1.", label: "LOAD", action: "Select" },
    { g: "acRte", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press" },
    { g: "acRte", page: "DEP/ARR INDEX", key: { lsk: "1L" }, label: "DEP", action: "Select", notes: ["Select appropriate SIDS, TRANS and RUNWAYS, as desired."] },
    { g: "acRte", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press" },
    { g: "acRte", page: "DEP/ARR INDEX", key: { lsk: "2R" }, label: "ARR", action: "Select", notes: ["Select appropriate STARS / TRANS and APPROACHES / TRANS, as desired."] },
    { g: "acRte", page: "RTE", key: { lsk: "6R" }, label: "ACTIVATE", action: "Select" },
    { g: "acRte", key: { key: "EXEC" }, result: "The EXEC light goes out and the route is active: the title reads ACT RTE 1.", resultPage: "ACT RTE 1", label: "EXEC key", action: "Press", notes: ["Follow the prompts as they appear."] },

    // --- ACARS: cruise winds (3-22)
    { g: "acWind", key: { key: "LEGS" }, label: "LEGS key", action: "Press" },
    { g: "acWind", page: "LEGS", key: { lsk: "6R" }, label: "RTE DATA", action: "Select" },
    { g: "acWind", page: "RTE DATA", key: { lsk: "6L" }, fills: ["@winds"], result: "Cruise winds fill in by waypoint (up to 1 minute). <ERASE appears at 6L until you EXEC.", resultPad: "CRZ WINDS UPLINK", label: "LOAD", action: "Select",
      notes: ["May take up to 1 minute. DECS uploads the winds based upon the highest altitude on the flight plan. If the crew desires to have the winds for a different altitude loaded, request a WINDS REQUEST on the RTE DATA page."] },
    { g: "acWind", key: { key: "EXEC" }, result: "Winds are executed; 6L changes back to <LEGS.", label: "EXEC key", action: "Press" },
    { g: "acWind", key: { key: "LEGS" }, label: "LEGS key", action: "Press" },
    { g: "acWind", page: "LEGS", key: null, label: "RNP for the departure", action: "Verify" },

    // --- ACARS: descent forecast winds, if desired (3-22)
    { g: "acFcst", key: { key: "VNAV" }, label: "VNAV key", action: "Press", notes: ["The CLB page is displayed."] },
    { g: "acFcst", page: "CLB", key: { key: "PREV PAGE" }, label: "PREV PAGE key", action: "Select", notes: ["FORECASTS UPLINK READY stays in the scratchpad."] },
    { g: "acFcst", page: "DES", key: { lsk: "6L" }, label: "FORECAST", action: "Select" },
    { g: "acFcst", page: "DES FORECASTS", key: { lsk: "6R" }, result: "Descent forecast winds load into the forecast table.", label: "LOAD", action: "Select" },

    // --- ACARS: performance (3-22)
    { g: "acPerf", key: { key: "INIT REF" }, label: "INIT REF key", action: "Press" },
    { g: "acPerf", page: "POS INIT", key: { lsk: "6L" }, label: "INDEX", action: "Select" },
    { g: "acPerf", page: "INIT/REF INDEX", key: { lsk: "3L" }, label: "PERF", action: "Select" },
    { g: "acPerf", page: "PERF INIT", key: { lsk: "4L" }, label: "RESERVES", action: "Enter", notes: [N_RSV] },
    { g: "acPerf", page: "PERF INIT", key: { lsk: "6L" }, fills: ["PERF INIT|1L", "PERF INIT|2L", "PERF INIT|3L", "PERF INIT|5L", "PERF INIT|1R"], scr: { "6L": "<LOAD" }, result: "ZFW, fuel, cost index and cruise altitude fill in; the page shows MOD until you EXEC.", label: "LOAD", action: "Select" },
    { g: "acPerf", page: "PERF INIT", key: null, label: "Other entries", action: "Ensure correct" },
    { g: "acPerf", key: { key: "EXEC" }, result: "PERF INIT is executed (ACT PERF INIT).", label: "EXEC key", action: "Press" },

    // --- ACARS: takeoff data uplinked (3-22, 3-23)
    { g: "acTo", page: "PERF INIT", key: { lsk: "6R" }, label: "N1 LIMIT", action: "Select", notes: ["Verify OAT is reasonable. Specifically ± value."] },
    { g: "acTo", page: "N1 LIMIT", key: { lsk: "6R" }, label: "TAKEOFF", action: "Select" },
    { g: "acTo", page: "TAKEOFF REF 1/2", key: { lsk: "5R" }, fills: ["TAKEOFF REF 1/2|1L", "TAKEOFF REF 1/2|2L", "TAKEOFF REF 1/2|3L", "TAKEOFF REF 1/2|1R", "TAKEOFF REF 1/2|2R", "TAKEOFF REF 1/2|3R", "TAKEOFF REF 1/2|4R", "TAKEOFF REF 1/2|5L", "N1 LIMIT|1L", "N1 LIMIT|1R", "N1 LIMIT|2L", "TAKEOFF REF 2/2|1R", "TAKEOFF REF 2/2|2R", "TAKEOFF REF 2/2|4L", "TAKEOFF REF 2/2|4R", "TAKEOFF REF 2/2|5L"], scr: { "5L": "<REJECT", "5R": "ACCEPT>" }, result: "Flaps, V1, VR and V2 load from the TPS; the ACCEPT/REJECT prompts go away.", label: "TAKEOFF REF data", action: "ACCEPT or REJECT", alt: "[5R] or [5L]" },
    { g: "acTo", page: "TAKEOFF REF 1/2", key: null, label: "Flap setting / thrust", action: "Ensure loaded" },
    { g: "acTo", page: "TAKEOFF REF 1/2", key: { panel: "MCP speed window" }, label: "V2 speed", action: "Note and enter in MCP" },
    { g: "acTo", key: { panel: "Stabilizer trim" }, label: "Trim", action: "Set" },
    { g: "acTo", page: "TAKEOFF REF 1/2", key: { lsk: "5L" }, label: "Intersection takeoff", action: "Enter X/",
      notes: ["If intersection takeoff data is required (e.g., Kxxx RW33LX), enter either X/, Y/ or Z/.", "The entry in [5L] will appear as X/33L. The 33L is automatically loaded from the route page and cannot be modified."],
      when: (o) => o.intersection },

    // --- ACARS: takeoff data not available (3-24)
    { g: "acToReq", key: { key: "MENU" }, label: "MENU", action: "Select" },
    { g: "acToReq", page: "MENU", key: { lsk: "2L" }, label: "ACARS", action: "Select" },
    { g: "acToReq", page: "ACARS-APPLICATION MENU", key: { lsk: "2R" }, label: "AOC AAL", action: "Select (if required)",
      notes: ["AOM 21d.2.2 and the training guide picture show AOC AAL at [2R]. AOM 5-14 lists [1R]: use the prompt where it appears."] },
    { g: "acToReq", page: "ACARS-INDEX", key: { lsk: "4L" }, label: "T/O DATA", action: "Select (if required)" },
    { g: "acToReq", page: "ACARS TAKEOFF DATA", key: null, label: "ACARS TAKEOFF DATA page", action: "Enter",
      notes: ["Fill in appropriate fields to request new TPS (see TPS Request).", "If the runway does not have a L, C or R designation the third digit must remain blank (e.g. 33_X). Enter a space (SP)X."] },
    { g: "acToReq", page: "ACARS TAKEOFF DATA", key: { lsk: "5R" }, result: "The TPS prints. Then enter the data from the new TPS on N1 LIMIT and TAKEOFF REF.", label: "SEND", action: "Press",
      notes: ["If the TEMP field [2L] is left blank, the TPS Planned Temp will be used."] },
    { g: "acToReq", key: { key: "N1 LIMIT" }, label: "N1 LIMIT key", action: "Select" },
    { g: "acToReq", page: "N1 LIMIT", key: { lsk: "2L" }, fills: ["N1 LIMIT|1L", "N1 LIMIT|1R", "N1 LIMIT|2L", "TAKEOFF REF 1/2|2L", "TAKEOFF REF 1/2|4R", "TAKEOFF REF 1/2|5L"], label: "Thrust rating", action: "Select", alt: "[2L], [3L], [4L] or [5L]" },
    { g: "acToReq", page: "N1 LIMIT", key: { lsk: "6R" }, label: "TAKEOFF", action: "Select" },
    { g: "acToReq", page: "TAKEOFF REF 1/2", key: { lsk: "1L" }, label: "FLAPS", action: "Enter" },
    { g: "acToReq", key: { panel: "MCP speed window" }, label: "V2 speed", action: "Note and enter in MCP" },
    { g: "acToReq", key: { panel: "Stabilizer trim" }, label: "Trim", action: "Set" },
    { g: "acToReq", page: "TAKEOFF REF 2/2", key: { lsk: "4L" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Acceleration height", action: "Verify/Enter", notes: N_ALT },
    { g: "acToReq", page: "TAKEOFF REF 2/2", key: { lsk: "4R" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Engine-out acceleration height", action: "Verify/Enter" },
    { g: "acToReq", page: "TAKEOFF REF 2/2", key: { lsk: "5L" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Thrust reduction altitude", action: "Verify/Enter" },
    { g: "acToReq", key: { panel: "EFIS control panel: MINS selector (BARO)" }, label: "MINS selector", action: "Set EO ACCEL altitude (MSL)",
      value: (o) => (["C", "D"].includes(o.fleet) ? "5830 (17R) · 5690 (17L)" : "5830 (17R) · 5680 (17L)"),
      notes: ["From the TPS E/O ACCEL /MSL/ FT line for the departure runway. AOM 5-15: EO ACCEL ALT (BARO and TAKEOFF REF page 2/2)."] },

    // --- CPDLC (3-24)
    { g: "cpdlc", key: { key: "ATC" }, label: "ATC function key", action: "Select",
      notes: ["AOM 21d.3.2 CPDLC Log-On (3DM–3VM). For DCL, log on at least 30 minutes prior to departure. En route, log on 10 to 25 minutes before initial entry into a CPDLC FIR."] },
    { g: "cpdlc", page: "ATC INDEX", key: { lsk: "5L" }, label: "LOGON/STATUS", action: "Select" },
    { g: "cpdlc", page: "ATC LOGON/STATUS", key: { lsk: "1L" }, label: "LOGON TO", action: "Enter", value: "KUSA",
      notes: ["Enter the four letter ICAO identifier KUSA."] },
    { g: "cpdlc", page: "ATC LOGON/STATUS", key: { lsk: "2L" }, label: "FLT NO", action: "Enter", value: "AAL1080",
      notes: ["Enter as written on the flight plan (e.g., AAL102), with no leading zeros."] },
    { g: "cpdlc", page: "ATC LOGON/STATUS", key: { lsk: "3L" }, label: "TAIL NO", action: "Enter", value: (o) => (["A", "B"].includes(o.fleet) ? "N941NN (ship 3LE)" : "Aircraft registration"),
      notes: ["Six character alphanumeric format of the aircraft registration (e.g., N362AA)."] },
    { g: "cpdlc", page: "ATC LOGON/STATUS", key: { look: "4L" }, label: "MAX U/L DELAY", action: "Leave blank",
      notes: ["Do not enter anything in this field. Leave the default value of three dashes."] },
    { g: "cpdlc", page: "ATC LOGON/STATUS", key: { lsk: "1R" }, label: "LOGON SEND", action: "Select",
      resultPage: "ATC LOGON/STATUS", resultPad: "ATC COMM ESTABLISHED",
      result: "The logon goes to ATC; after their response ACCEPTED or REJECTED shows. When connected, ATC COMM ESTABLISHED appears in the scratchpad, LOGON TO shows dashes, and the active facility shows at ACT CTR [3R].",
      notes: ["En route: if you are already logged on and log on again, CPDLC will disconnect."] },

    // --- Manual: RTE (3-25)
    { g: "mRte", key: { key: "RTE" }, label: "RTE key", action: "Press" },
    { g: "mRte", page: "RTE", key: { lsk: "1L" }, label: "ORIGIN", action: "Enter" },
    { g: "mRte", page: "RTE", key: { lsk: "1R" }, label: "DEST", action: "Enter" },
    { g: "mRte", page: "RTE", key: { lsk: "2R" }, label: "FLT NO.", action: "Enter", notes: ["Enter FLT NO. as shown on the flight plan header (e.g. AAL50)."] },
    { g: "mRte", page: "RTE", key: { lsk: "3L" }, label: "RUNWAY", action: "Enter (if desired)" },
    { g: "mRte", page: "RTE", key: null, fills: ["@route"], label: "Route", action: "Enter" },
    { g: "mRte", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press" },
    { g: "mRte", page: "DEP/ARR INDEX", key: { lsk: "1L" }, label: "DEP", action: "Select", notes: ["Select SIDS/TRANS/RUNWAYS as required."] },
    { g: "mRte", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press" },
    { g: "mRte", page: "DEP/ARR INDEX", key: { lsk: "2R" }, label: "ARR", action: "Select", notes: ["Select STARS/TRANS and APPROACHES/TRANS or RUNWAYS as required."] },
    { g: "mRte", page: "RTE", key: { lsk: "6R" }, label: "ACTIVATE", action: "Select" },
    { g: "mRte", key: { key: "EXEC" }, result: "The route is active: the title reads ACT RTE 1, and 6R offers PERF INIT>.", label: "EXEC key", action: "Press" },

    // --- Manual: PERF INIT (3-25, 3-26)
    { g: "mPerf", page: "RTE", key: { lsk: "6R" }, scr: { "6R": "PERF INIT>" }, label: "PERF INIT", action: "Select" },
    { g: "mPerf", page: "PERF INIT", key: { lsk: "3L" }, fills: ["PERF INIT|3L", "PERF INIT|1L", "PERF INIT|2L"], label: "ZFW", action: "Enter",
      caution: "Do not enter the ZFW into the GW boxes. The FMC will calculate performance data with significant errors." },
    { g: "mPerf", page: "PERF INIT", key: null, label: "FUEL", action: "Verify",
      notes: ["FUEL on the CDU, the Flight Plan/Dispatch Release, and the fuel quantity indicators agree.", "Gross weight and cruise CG (GW/CRZ CG) on the CDU and the Flight Plan/Dispatch Release agree.", "Fuel is sufficient for flight."] },
    { g: "mPerf", page: "PERF INIT", key: { lsk: "4L" }, label: "RESERVES", action: "Enter", notes: [N_RSV] },
    { g: "mPerf", page: "PERF INIT", key: { lsk: "5L" }, label: "COST INDEX", action: "Enter" },
    { g: "mPerf", page: "PERF INIT", key: { lsk: "1R" }, label: "CRZ ALT", action: "Enter" },
    { g: "mPerf", page: "PERF INIT", key: { lsk: "4R" }, label: "TRANS ALT", action: "Verify" },
    { g: "mPerf", key: { key: "EXEC" }, result: "PERF INIT is executed (ACT PERF INIT).", label: "EXEC key", action: "Press" },

    // --- Manual: N1 LIMIT (3-26)
    { g: "mN1", page: "PERF INIT", key: { lsk: "6R" }, label: "N1 LIMIT", action: "Select" },
    { g: "mN1", page: "N1 LIMIT", key: null, label: "OAT", action: "Check", notes: ["Check that OAT is reasonable for the ambient conditions. Specifically the ± value."] },
    { g: "mN1", page: "N1 LIMIT", key: null, fills: ["N1 LIMIT|1L", "N1 LIMIT|1R", "N1 LIMIT|2L"], label: "Assumed temp / fixed derate takeoff, or both", action: "Select as needed" },
    { g: "mN1", page: "N1 LIMIT", key: null, label: "Full / derated climb thrust", action: "Select as needed" },

    // --- Manual: TAKEOFF REF 1/2 (3-26)
    { g: "mTo1", page: "N1 LIMIT", key: { lsk: "6R" }, label: "TAKEOFF", action: "Select" },
    { g: "mTo1", page: "TAKEOFF REF 1/2", key: { lsk: "1L" }, label: "FLAPS", action: "Enter" },
    { g: "mTo1", page: "TAKEOFF REF 1/2", key: null, fills: ["TAKEOFF REF 1/2|3L", "TAKEOFF REF 1/2|2L", "TAKEOFF REF 1/2|4R", "TAKEOFF REF 1/2|5L"], label: "CG", action: "Enter", notes: ["Trim value is displayed."] },
    { g: "mTo1", page: "TAKEOFF REF 1/2", key: { lsk: "1R" }, fills: ["TAKEOFF REF 1/2|1R", "TAKEOFF REF 1/2|2R", "TAKEOFF REF 1/2|3R"], label: "Takeoff V-speeds", action: "Enter from TPS", alt: "[1R], [2R] and [3R]" },

    // --- TAKEOFF REF 2/2 (3-23 uplinked, 3-26 manual)
    { g: "to2", page: "TAKEOFF REF 2/2", key: { lsk: "4L" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Acceleration height", action: "Verify/Enter", notes: N_ALT },
    { g: "to2", page: "TAKEOFF REF 2/2", key: { lsk: "4R" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Engine-out acceleration height", action: "Verify/Enter" },
    { g: "to2", page: "TAKEOFF REF 2/2", key: { lsk: "5L" }, value: (o) => (["C", "D"].includes(o.fleet) ? "1410 (17R) · 1270 (17L)" : "1410 (17R) · 1260 (17L)"), label: "Thrust reduction altitude", action: "Verify/Enter" },
    { g: "to2", key: { panel: "EFIS control panel: MINS selector (BARO)" }, label: "MINS selector", action: "Set EO ACCEL altitude (MSL)",
      value: (o) => (["C", "D"].includes(o.fleet) ? "5830 (17R) · 5690 (17L)" : "5830 (17R) · 5680 (17L)"),
      notes: ["From the TPS E/O ACCEL /MSL/ FT line for the departure runway. AOM 5-15: EO ACCEL ALT (BARO and TAKEOFF REF page 2/2)."] },

    // --- RNAV SID (3-27)
    { g: "rnav", key: { key: "DEP ARR" }, label: "DEP/ARR key", action: "Press",
      notes: ["Use when an RNAV SID is assigned, or the RNAV SID or transition is changed.", "RNAV SIDs must be loaded from a current navigation database; they may not be manually constructed (“built”) on the LEGS page. Manual modifications may be made as necessary to comply with ATC clearances (e.g., “direct to” routings).", "For an RNAV SID, a flight director must be operative and the LNAV roll mode must be used for departure."] },
    { g: "rnav", page: "DEP/ARR INDEX", key: { lsk: "1L" }, label: "DEP", action: "Select", notes: ["Opens the DEPARTURES page."] },
    { g: "rnav", page: "DEPARTURES", key: null, label: "RUNWAY", action: "Select" },
    { g: "rnav", page: "DEPARTURES", key: null, label: "SID", action: "Select" },
    { g: "rnav", page: "DEPARTURES", key: null, label: "TRANSITION", action: "Select (if required)" },
    { g: "rnav", key: { key: "LEGS" }, label: "LEGS page", action: "Select" },
    { g: "rnav", page: "LEGS", key: null, label: "Waypoint sequence and altitudes", action: "Check",
      notes: ["Crosscheck ND and LEGS page with the Jeppesen RNAV DP chart.", "Do not modify the procedure."] },
    { g: "rnav", key: { key: "EXEC" }, label: "EXEC key", action: "Press" },

    // --- EO SID (3-28)
    { g: "eosid", key: { key: "RTE" }, label: "RTE key", action: "Press",
      notes: ["EO SID Takeoff – Preflight: brief the terrain and the plan to climb at the up bug if an engine fails.", "Brief and review the EO SID by verifying the waypoint sequence (speed and/or altitude constraints) on the LEGS page and ND against the Ops Advisory pages (##-7E).", "Due to a U12.0/U13.0 anomaly, another page (e.g. RTE) must be selected prior to the departure page for the EO SID to load correctly.", "The departure runway must be selected for an EO SID to automatically populate."] },
    { g: "eosid", key: { key: "DEP ARR" }, label: "DEP ARR key", action: "Press" },
    { g: "eosid", page: "DEP/ARR INDEX", key: { lsk: "1L" }, label: "DEP", action: "Press" },
    { g: "eosid", page: "DEPARTURES", key: null, label: "Departure runway", action: "Select" },
    { g: "eosid", page: "DEPARTURES", key: null, label: "EO SID", action: "Select" },
    { g: "eosid", key: { panel: "EFIS control panel" }, label: "ND mode selector", action: "PLN" },
    { g: "eosid", key: { key: "LEGS" }, label: "LEGS key", action: "Press" },
    { g: "eosid", page: "LEGS", key: { lsk: "6R" }, scr: { "6R": "STEP>" }, label: "STEP", action: "Step through EO SID",
      notes: ["One pilot reads each waypoint from the ND, while the other pilot compares it against the Ops Advisory pages (##-7E).", "Confirm that each ND waypoint is connected with a white dash line."] },
    { g: "eosid", page: "LEGS", key: { lsk: "6L" }, scr: { "6L": "<ERASE" }, label: "ERASE", action: "Press" },
    { g: "eosid", key: { panel: "EFIS control panel" }, label: "ND mode selector", action: "MAP" },

    // --- Route verification (3-29)
    { g: "rteV", page: "ACT RTE 1", key: { look: "2R" }, label: "Route on RTE 1 vs ATC clearance / flight plan", action: "Verify",
      notes: ["One pilot reads aloud the route on the CDU, while the other verifies it against the flight plan and current ATC departure clearance.", "Working from the FMC display to the ATC departure clearance lessens the risk of seeing what is expected versus what is actually displayed.", "Ensure FLT NO on ACT RTE 1 page 1 is the three letter airline identifier plus the flight number with no leading zeros (e.g., AAL50 or AAL50P). It is copied to the ATC LOGON/STATUS page.", "ADS-B call sign mismatch: if ATC says the flight number they see does not match the one filed, correct the flight number and file an ASAP (14 CFR 91.227(d)(8)).", "If no ATC departure clearance yet: use the flight plan/dispatch release. When the clearance arrives, the first officer verifies the FMC routing; if it differs, update the FMC and verify the changed portion with both pilots (parking brake set)."] },

    // --- Legs verification (3-30)
    { g: "legsV", key: { panel: "EFIS control panel" }, label: "ND mode selector", action: "PLN" },
    { g: "legsV", key: { panel: "EFIS control panel" }, label: "ND range selector", action: "As desired" },
    { g: "legsV", key: { key: "LEGS" }, label: "LEGS key", action: "Press" },
    { g: "legsV", page: "LEGS", key: { lsk: "6R" }, scr: { "6R": "STEP>" }, label: "STEP", action: "Step through",
      notes: ["One pilot reads each waypoint from the ND, while the other checks it against the departure procedure, flight plan or ATC departure clearance.", "Confirm that each ND waypoint is connected with a solid magenta line."] },
    { g: "legsV", key: { key: "PROG" }, label: "PROG key", action: "Press" },
    { g: "legsV", page: "PROGRESS", key: { look: "4L" }, label: "Total distance (DTG) at [4L]", action: "Check", notes: ["Confirm total distance to destination is reasonable with flight plan distance."] },
    { g: "legsV", key: { panel: "EFIS control panel" }, label: "ND mode selector", action: "MAP" },
    { g: "legsV", key: { panel: "EFIS control panel" }, label: "ND range selector", action: "As desired" },
    { g: "legsV", key: { key: "RTE" }, label: "RTE key", action: "Press" },
    { g: "legsV", page: "ACT RTE 1", key: { lsk: "5R" }, result: "RTE COPY COMPLETE shows at 5R: RTE 2 now holds the active route.", label: "RTE COPY", action: "Press", notes: ["Copy the entire active route into RTE 2 or utilize as needed."] },

    // --- Performance verification (3-32)
    { g: "perfV", page: "PERF INIT", key: null, label: "ZFW · Reserves · Cost Index · CRZ altitude · Transition altitude", action: "Verify",
      notes: ["One pilot reads aloud the performance data in the FMC; the other verifies it against the TPS, flight plan and ATIS."] },
    { g: "perfV", page: "N1 LIMIT", key: null, label: "Assumed temperature · OAT · Proper engine thrust rating · Climb thrust", action: "Verify" },
    { g: "perfV", page: "TAKEOFF REF 1/2", key: null, label: "Flap setting · Correct runway · Takeoff V-speeds", action: "Verify" },
    { g: "perfV", page: "TAKEOFF REF 2/2", key: null, label: "Acceleration height · Thrust reduction altitude · Engine-out acceleration height", action: "Verify", notes: N_ALT },
    { g: "perfV", key: { panel: "Both pilots: ATIS and TPS" }, label: "Performance review", action: "Evaluate",
      notes: ["Evaluate ATIS and TPS for wind, runway conditions, temperature, maximum weights, flaps, and thrust to verify they are valid and compatible for existing conditions, aircraft configuration, and runway or intersection to be used."] },
  ];

  // The steps for one setup, in order, each with its section and a resolved value.
  function buildFlow(opts) {
    const o = { ...DEFAULTS, ...opts };
    const f = FLEETS[o.fleet] || FLEETS.A;
    const out = [];
    let last = null;
    for (const g of GROUPS) {
      if (g.when && !g.when(o)) continue;
      for (const s of STEPS) {
        if (s.g !== g.id || (s.when && !s.when(o, f))) continue;
        // A CDU key is pressed on whatever page is showing: draw that page.
        const page = s.page || (s.key && s.key.key ? last : undefined);
        const pad = s.pad || (g.pad && !out.some((x) => x.g === g.id) ? g.pad : "");
        if (page) last = page;
        out.push({ ...s, page, pad, group: g, ref: g.ref, value: typeof s.value === "function" ? s.value(o, f) : s.value || "" });
      }
    }
    return out.map((s, i) => ({ ...s, n: i + 1, id: `${s.g}-${i}` }));
  }

  // When each part must be complete (3-18).
  const TIMING = [
    "Who: the captain or first officer may make entries. The other pilot must verify the entries.",
    "Start the CDU preflight anytime prior to the General Preflight Flow.",
    "Initial navigation data entries: before the General Preflight Flow flight instrument check.",
    "Navigation and performance data entries: prior to the Before Start Checklist.",
    "Route, legs and performance verification: after the flight plan is loaded and the ATC departure clearance is received, prior to the Before Start Checklist.",
  ];

  root.SimPrep = { FLEETS, DEFAULTS, GROUPS, STEPS, PAGES, TIMING, buildFlow };
})(typeof window !== "undefined" ? window : globalThis);
