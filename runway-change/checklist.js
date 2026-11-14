// B737 Runway/Departure Change: a generic, item-by-item checklist.
// Source: AOM 5.4.1 Runway/Departure Change, pages 5-14 to 5-16 (24 JUN 26), and the
// ACARS Takeoff Data Request fields (AOM 21d). Wording and order follow the AOM.
// No airport, flight or aircraft data: the crew supplies all values from the TPS and ATIS.
// Pure data and functions with no DOM, shared by index.html and tests/.
(function (root) {
  "use strict";

  const SOURCE = "AOM 5.4.1 Runway/Departure Change (5-14, 5-15, 24 JUN 26)";

  // Takeoff Considerations (AOM 5-16): referred to by item 1, "If required, see Takeoff Considerations".
  const CONSIDERATIONS = [
    "Contaminated Runways",
    "Engine-Out SID (EO SID)",
    "FMC QRH V-Speeds",
    "Manual Takeoff Calculation",
    "Normal/Noise Abatement Takeoff",
    "Severe Weather/Windshear Flow Chart",
    "SPAR Matrix Chart",
    "TPS Quick Reference Guide",
    "Unplanned Tailwind Takeoff",
  ];

  // The three takeoff performance choices in item 2 (choose one).
  const OPTIONS = {
    uplink: { title: "Use Uplinked Takeoff Data", when: "If the new runway is one of the first four on the TPS" },
    newTps: { title: "Request new TPS", when: "If the new runway is not one of the first four or not on the TPS" },
    qrh: { title: "Use FMS QRH V-Speeds", when: "Uplinked data is not desired or unavailable" },
  };

  // Performance Review (AOM 5-16), in the order crews brief it: WRT · WFT · R.
  const REVIEW = [
    ["Wind", "Headwind or tailwind, against the wind the TPS was computed for"],
    ["Runway conditions", "Matches the TPS (e.g., wet runway, wet TPS)"],
    ["Temperature", "Compared with the assumed (or planned) temperature"],
    ["Weights", "Gross weight against PTOW / ATOW / MTOW and any adjusted limit"],
    ["Flaps", "As on the TPS line for the new runway"],
    ["Thrust", "Rating, standard or max, bleeds; N1 within ± 0.5% of the TPS N1 setting"],
    ["Runway", "New runway, full length or intersection"],
  ];

  // Takeoff Data Request fields (AOM 21d), shown under "ACARS TAKEOFF DATA page: Enter".
  const TO_DATA_REQUEST = [
    ["RUNWAY [1L]", "Required. For an intersection not on the current TPS, use the Airport Notes designation (e.g., 33_X)."],
    ["FLAPS [1R]", "Leave blank to let FOS choose, or enter an approved takeoff flap setting."],
    ["TEMP [2L]", "Leave blank to use the reported station temperature, or enter a temperature."],
    ["THRUST RTG [2R]", "Leave blank for the lowest rating available, or enter a rating."],
    ["HWIND/TWIND [3L]", "Tailwind: negative value (e.g., -9). Headwind: positive value."],
    ["ANTI-ICE [4L]", "ON or OFF as required."],
    ["RWY CONDITION [4R]", "DRY or WET."],
  ];

  // Section 1: Runway Change.
  const S1 = [
    { key: "DEP/ARR", text: "DEP/ARR Key", action: "Press" },
    { lsk: "1L", text: "DEPARTURES Page", action: "Select" },
    { text: "RWY", action: "Select" },
    { text: "SID", action: "Select" },
    { text: "TRANSITION", action: "Select" },
    { key: "EXEC", text: "EXEC Key", action: "Press" },
  ];

  // Section 2: Takeoff Performance.
  const S2_INTERSECTION = [
    { key: "INIT REF", text: "TAKEOFF REF page", action: "Select" },
    { lsk: "5L", text: "INTERSECT [5L]", action: "Enter X", note: "The entry in [5L] will appear as X/(runway). The runway is automatically loaded from the route page and cannot be modified." },
  ];
  const S2 = {
    uplink: [
      { lsk: "5L / 5R", text: "TAKEOFF REF Data [5L or 5R]", action: "Accept or Reject" },
    ],
    newTps: [
      { key: "MENU", text: "MENU", action: "Select" },
      { lsk: "2L", text: "ACARS [2L]", action: "Select" },
      { lsk: "1R", text: "AOC AAL [1R] (if required)", action: "Select" },
      { lsk: "4L", text: "T/O DATA [4L] (if required)", action: "Select" },
      { text: "ACARS TAKEOFF DATA page", action: "Enter", fields: TO_DATA_REQUEST, note: "See Takeoff Data Request." },
      { lsk: "5R", text: "SEND [5R]", action: "Press" },
      { key: "INIT REF", text: "INIT/REF", action: "Press" },
      { lsk: "6L", text: "INDEX [6L]", action: "Select" },
      { lsk: "4L", text: "TAKEOFF [4L]", action: "Select" },
      { lsk: "5L / 5R", text: "TAKEOFF REF Data [5L] or [5R]", action: "Accept or Reject",
        note: "Requested TPS data is uplinked to the FMC and must be ACCEPTED or REJECTED. Failure to do so may cause a buffer overflow of the FMC memory." },
    ],
    qrh: [
      { key: "N1 LIMIT", text: "N1 LIMIT", action: "Select" },
      { text: "Thrust Rating/Assumed Temperature (as needed)", action: "Select/Enter" },
      { lsk: "6R", text: "Takeoff [6R]", action: "Select" },
      { key: "NEXT PAGE", text: "NEXT PAGE", action: "Select" },
      { lsk: "1L", text: "ATIS/ATC reported wind [1L]", action: "Enter" },
      { lsk: "1R", text: "Runway condition [1R]", action: "Select" },
      { lsk: "2L", text: "Runway slope [2L]", action: "Enter" },
      { key: "PREV PAGE", text: "PREV PAGE", action: "Select" },
      { lsk: "6R", text: "QRH ON", action: "Select" },
      { lsk: "1R–3R", text: "QRH speeds [1R]–[3R]", action: "Select" },
    ],
  };

  // Section 3: Flight Preparation ("Reset or verify, as required"), then the closing items.
  const S3 = [
    { text: "Flap Setting/Thrust", action: "Ensure loaded" },
    { text: "Trim", action: "Set" },
    { text: "V2 speed", action: "Note and enter in MCP" },
    { text: "EO ACCEL ALT (BARO and TAKEOFF REF Page 2/2)", action: "Verify" },
    { text: "HUD", action: "Set" },
    { text: "COURSE", action: "Set" },
    { text: "HEADING", action: "Set" },
    { text: "ALTITUDE", action: "Set" },
  ];
  const CLOSE = [
    { text: "Verify Amended Portion of Route and Legs", action: "Complete" },
    { text: "Performance Review", action: "Complete", review: REVIEW,
      note: "Evaluate ATIS and TPS for wind, runway conditions, temperature, maximum weights, flaps, and thrust (± 0.5% of TPS N1 setting) to verify they are valid and compatible for existing conditions, aircraft configuration, and runway or intersection to be used." },
    { text: "Before Takeoff Checklist", action: "Complete",
      note: "If a runway or flap setting change occurs after any part of the Before Takeoff Checklist has been accomplished, reset and re-accomplish the Before Takeoff Checklist in its entirety." },
  ];

  // The checklist for one choice: sections with numbered items, each with a stable id.
  function build(opts) {
    const o = { option: null, intersection: false, ...opts };
    const sec = (id, title, items, number = true) => ({
      id, title,
      items: items.map((it, i) => ({ ...it, id: `${id}.${i + 1}`, num: number ? `${i + 1}` : "—" })),
    });
    const out = [sec("1", "1. Runway Change", S1)];
    out[0].note = "If required, see Takeoff Considerations.";
    const s2 = [];
    if (o.intersection) s2.push(sec("2x", "If loading intersection takeoff data", S2_INTERSECTION));
    if (o.option && S2[o.option]) s2.push(sec(`2${o.option}`, `${OPTIONS[o.option].title}`, S2[o.option]));
    out.push({ id: "2", title: "2. Takeoff Performance", choose: true, parts: s2 });
    out.push(sec("3", "3. Flight Preparation", S3));
    out[2].note = "Reset or verify, as required.";
    out.push(sec("4", "Then", CLOSE, false));
    return out;
  }

  // Every checkable item in order (section 2's parts flattened).
  const flat = (sections) => sections.flatMap((s) => (s.parts ? s.parts.flatMap((p) => p.items) : s.items));

  root.RwyChange = { SOURCE, CONSIDERATIONS, OPTIONS, REVIEW, TO_DATA_REQUEST, build, flat };
})(typeof window !== "undefined" ? window : globalThis);
