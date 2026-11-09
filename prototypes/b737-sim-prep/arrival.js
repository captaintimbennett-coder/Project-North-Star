// B737 Sim Prep: CAT III ILS and the arrival non-normals, for the SFO ILS 28R in the RNO–SFO flight.
// Sources: AOM 10.5.3 ILS CAT II/III Requirements (10-45) and CAT III visibility (10-49);
// AOM 18.2.4 Wind Limits (18-11); QRH 9.79 Yaw Damper, 10.86 Display Failure (3AA-3PX),
// 13.1 Hydraulic Pump Low Pressure (single). Pure data and functions with no DOM.
(function (root) {
  "use strict";

  // SFO ATIS L and the approach. The runway heading comes from the Jeppesen chart.
  const SFO = {
    atis: "SFO ATIS L: wind 010 at 10, RVR 28R 600 (mid 1000, rollout 500), fog, vertical visibility 100, 6/6, A29.78. ILS 28R in use.",
    chart: 600, tdz: 600, mid: 1000, ro: 500, windDir: 10, windSpd: 10, rwyHdg: 284, alternate: "KSMF",
  };

  // CAT III visibility requirements (AOM 10-49). Chart minimum → minimum RVR allowed per report.
  const RVR_TABLE = {
    700: { tdz: 700, mid: 700, ro: 300, rule: "Controlling: TDZ (no substitution)." },
    600: { tdz: 600, mid: 600, ro: 300, rule: "TDZ + 1 report required. Controlling if reporting: MID and RO." },
    300: { tdz: 600, mid: 400, ro: 300, rule: "Far-end (FE) report advisory; it may substitute for a missing RO and is then controlling." },
  };

  // Is the reported RVR legal for the chart minimum? Blank reports are passed as null.
  function rvrCheck(chart, tdz, mid, ro) {
    const req = RVR_TABLE[chart];
    if (!req) return { ok: false, lines: [], why: "Unknown chart minimum." };
    const lines = [["TDZ", tdz, req.tdz], ["MID", mid, req.mid], ["RO", ro, req.ro]].map(([name, got, min]) => ({
      name, got, min, ok: got == null ? null : got >= min,
    }));
    const reported = lines.filter((l) => l.got != null);
    let why = "";
    if (tdz == null) why = "TDZ RVR is required.";
    else if (chart === 600 && reported.length < 2) why = "A 600 chart needs TDZ plus one more report.";
    else if (reported.some((l) => !l.ok)) why = `${reported.filter((l) => !l.ok).map((l) => `${l.name} ${l.got} is below ${l.min}`).join("; ")}.`;
    const ok = !why;
    const margin = ok ? Math.min(...reported.map((l) => l.got - l.min)) : null;
    return { ok, lines, why: ok ? (margin === 0 ? "Legal, with no margin: a lower report makes it illegal." : "Legal.") : why, margin };
  }

  // Wind limits that apply to this approach (AOM 18-11). All are based on the peak gust.
  const WIND_LIMITS = [
    { id: "xw", label: "Crosswind: HUD SA CAT I / CAT II/III, and visibility below 3/4 SM (RVR 4000)", max: 15 },
    { id: "hw", label: "Headwind: CAT II/III", max: 25 },
    { id: "tw", label: "Tailwind: landing", max: 10 },
  ];
  function windCheck(dir, spd, gust, rwyHdg) {
    const peak = gust && gust > spd ? gust : spd;
    const a = ((dir - rwyHdg) * Math.PI) / 180;
    const head = Math.round(peak * Math.cos(a) * 10) / 10, cross = Math.round(Math.abs(peak * Math.sin(a)) * 10) / 10;
    const side = Math.sin(a) > 0.01 ? "from the right" : Math.sin(a) < -0.01 ? "from the left" : "";
    const vals = { xw: cross, hw: Math.max(0, head), tw: Math.max(0, -head) };
    const checks = WIND_LIMITS.map((l) => ({ ...l, value: vals[l.id], ok: vals[l.id] <= l.max }));
    return { peak, head, cross, side, checks, ok: checks.every((c) => c.ok) };
  }

  // Required aircraft equipment for CAT II/III (AOM 10.5.3).
  const EQUIP = [
    ["ADIRUs", "2, in NAV mode"], ["Anti-skid", "Operable"], ["CDU", "1"], ["Decision Height displays", "2"],
    ["Electrical power", "2 (APU generator may be used)"], ["Engine", "1 operating"], ["FCCs", "2"],
    ["Flaps", "15, 30 or 40"], ["FMA", "2 (one for each pilot)"], ["HUD", "in AIII (AIII below RVR 1800; AII/IMC down to RVR 1200)"],
    ["HUD Annunciator Panel", "Operable"], ["Hydraulic Pressure", "Normal A or B"], ["ILS receivers and displays", "2"],
    ["PFD and ND", "FO's"], ["Radio Altimeters and displays", "2"], ["Window heat", "Operable"], ["Windshield Wipers", "2"],
  ];

  // The arrival non-normals in the RLEE (NG), with what each means for the CAT III.
  const NONNORMALS = {
    yaw: {
      title: "YAW DAMPER", qrh: "QRH 9.79", scenario: "NG: YAW DAMPER - MAIN",
      condition: "The yaw damper is disengaged.",
      steps: [
        ["YAW DAMPER switch", "OFF then ON"],
        ["Choose one", "Light extinguishes: checklist complete. Light stays illuminated: YAW DAMPER switch OFF, go to step 3."],
        ["Turbulence", "Avoid areas of predicted moderate or severe turbulence. If encountered and passenger comfort is affected, reduce airspeed and/or descend."],
        ["Flaps", "Do not exceed flaps 30."],
      ],
      equip: ["Flaps"],
      cat3: "Available. The yaw damper is not on the required equipment list.",
      gotcha: "Land flaps 30, not 40: CAT III allows 15, 30 or 40. Brief flaps 30 and set the flaps 30 Vref.",
    },
    display: {
      title: "DISPLAY FAILURE (3AA-3PX)", qrh: "QRH 10.86", scenario: "NG: DISPLAY FAILURE - L I/B",
      condition: "A display in the common display system is failed.",
      steps: [
        ["Choose one", "Single display not usable and automatic switching has occurred: continue normal operation. Automatic switching has not occurred: go to step 2."],
        ["MAIN PANEL DUs selector", "As needed"],
        ["LOWER DU selector", "As needed"],
      ],
      equip: ["PFD and ND", "FMA", "Decision Height displays"],
      cat3: "Available. Only the FO's PFD and ND are required; the Captain keeps the PFD (FMA and DH) on the outboard display.",
      gotcha: "Don't over-react: confirm two FMAs and two DH displays, reselect only what you need. The Captain has lost the map, so the PM keeps the map awareness.",
    },
    emdp: {
      title: "LOW PRESSURE - Hydraulic Pump (single)", qrh: "QRH 13.1", scenario: "NG: LOW PRESSURE - EMDP 2A",
      condition: "The hydraulic pump pressure is low.",
      steps: [
        ["HYD PUMP switch (affected side)", "OFF"],
      ],
      note: "Loss of an engine-driven pump and a high demand on the system may result in an intermittent LOW PRESSURE light on the remaining electric motor-driven pump.",
      equip: ["Hydraulic Pressure"],
      cat3: "Available. System A keeps its engine-driven pump; the list needs normal pressure in A or B.",
      gotcha: "Turn off the switch under the illuminated LOW PRESSURE light. On the NG, system A's electric pump switch is ELEC 2.",
    },
  };

  // The order to work it, once a non-normal appears on the arrival.
  const FLOW = [
    "Fly the airplane. Ask ATC for time or holding if needed (cancel the approach clearance, hold at a fix).",
    "Run the QRH checklist to completion.",
    "Equipment: check the failure against the CAT II/III required equipment list.",
    "RVR: reported TDZ / MID / RO against the chart minimum (SFO ILS 28R CAT III: 600).",
    "HUD in AIII available (required below RVR 1800). If not: AII/IMC only to RVR 1200, so hold or divert (alternate KSMF).",
    "Wind: within the limits for the approach, using the peak gust.",
    "Localizer not listed as unusable inside the threshold (rollout guidance).",
    "Brief the CAT III: landing flaps, minimums, HUD AIII to touchdown, callouts, go-around (EO missed approach in RTE 2).",
  ];

  root.SimArr = { SFO, RVR_TABLE, rvrCheck, WIND_LIMITS, windCheck, EQUIP, NONNORMALS, FLOW };
})(typeof window !== "undefined" ? window : globalThis);
