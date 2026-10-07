// B737 Takeoff Guide: rules engine.
// Pure functions with no DOM, shared by index.html and tests/rules.test.mjs.
// Every finding cites the takeoff card or AOM section it comes from.
(function (root) {
  "use strict";

  // Thrust ratings by aircraft: the -NG uses 22K/24K/26K/27K Bump, the -MAX 8 uses TO2/TO1/TO.
  const RATINGS = { NG: ["22K", "24K", "26K", "27K"], MAX8: ["TO2", "TO1", "TO"] };
  // Ratings that meet "maximum thrust at 26K, 27K Bump, or TO" (27K only where a 27K TPS is planned).
  const HIGH = { NG: ["26K", "27K"], MAX8: ["TO"] };
  // The rating to ask for when one of those is required: 26K on the -NG, TO on the -MAX 8.
  const MAXRATING = { NG: "26K", MAX8: "TO" };
  // Takeoff on Contaminated Runways: Data Usage levels, plus the two over-limit cases.
  const CONTAM = [
    ["W25", "¼ in. standing water"], ["W50", "½ in. standing water"],
    ["S25", "¼ in. slush"], ["S50", "½ in. slush"],
    ["WS25", "¼ in. wet snow"], ["WS50", "½ in. wet snow"],
    ["DS2", "2 in. dry snow"], ["DS4", "4 in. dry snow"],
    ["CS", "Compacted snow"], ["ICE", "Ice"],
    ["OVERWET", "Over ½ in. water, slush or wet snow"], ["OVERDRY", "Over 4 in. dry snow"],
  ];

  const blank = () => ({
    aircraft: "NG", closeout: null, plan: null, rating: null, ip: false, bumpAuth: false,
    runway: "DRY", tpsWet: false, grooved: false, trInop: false,
    contam: "", contamChunks: false, antiSkidInop: false,
    windshear: false, adv7: false, antiIce: false, tpsAntiIce: false,
    melWt: false, melAuto: false, crcmel: false, eecAlt: false, flaps25: false,
    tow: "", ptow: "", mtow: "", mtowCode: "",
    oat: "", at: "", planTemp: "",
    rwy: "", windDir: "", windSpd: "", windGust: "", calm: false,
    tpsWind: "NONE", tpsWindKt: "",
    zwMax: "", twCorr: "", twMethod: "", twSpeeds: "QRH",
    aa: "",
  });

  const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const r1 = (n) => Math.round(n * 10) / 10;
  // TPS weights are written in thousands of pounds (135.4 = 135,400 lb).
  // A full figure (135400) is accepted too. Returns pounds.
  const wnum = (v) => { const n = num(v); return n == null ? null : n < 1000 ? Math.round(n * 1000) : n; };
  const fmtW = (lb) => (lb / 1000).toFixed(1);

  function rwyHeading(str) {
    const m = String(str || "").match(/^\s*(\d{1,2})/);
    if (!m) return null;
    const n = Number(m[1]);
    return n >= 1 && n <= 36 ? n * 10 : null;
  }

  function windCalc(s) {
    const g = num(s.windGust), v = num(s.windSpd);
    if (s.calm) return { ok: true, hw: 0, xw: 0, gi: 0, calm: true };
    const r = rwyHeading(s.rwy), d = num(s.windDir);
    if (r == null || d == null || v == null) return { ok: false };
    const a = ((d - r) * Math.PI) / 180;
    return {
      ok: true,
      hw: r1(v * Math.cos(a)),
      xw: r1(Math.abs(v * Math.sin(a))),
      gi: g != null && g > v ? g - v : 0,
    };
  }

  // ---------- rules engine ----------
  // Every rule cites the card section it comes from. Status: go < amber < red.
  function evaluate(s) {
    const R = {
      status: "go", thrust: 0, thrustOverride: null,
      reasons: [], actions: [], alts: [], cautions: [], missing: [],
      speedChange: false, noQRH: [], speedsOnly: null, needAA: false,
    };
    const rank = { go: 0, amber: 1, red: 2 };
    const bump = (lvl) => { if (rank[lvl] > rank[R.status]) R.status = lvl; };
    const why = (sec, text, lvl = "go") => { R.reasons.push({ sec, text, lvl }); bump(lvl); };
    const act = (t) => { if (!R.actions.includes(t)) R.actions.push(t); };
    const caution = (t) => { if (!R.cautions.includes(t)) R.cautions.push(t); };
    const max = (lvl) => { R.thrust = Math.max(R.thrust, lvl); };
    const rating = s.rating || "—";
    const high = HIGH[s.aircraft] || HIGH.NG;
    const need = MAXRATING[s.aircraft] || MAXRATING.NG;
    const contamOrCRC = s.runway === "CONTAM" || s.crcmel;

    // --- Preconditions
    if (s.closeout === false) {
      why("TPS Quick Reference Guide", "Load Closeout has not been received. Ensure Load Closeout is received prior to takeoff; FMC QRH V-speeds may only be used after it is received and accepted.", "red");
      act("Obtain Load Closeout before continuing.");
    }
    if (s.plan === "MAX") max(1);

    // --- Thrust rating rules
    if (s.rating === "27K") {
      max(1);
      why("27K Bump Thrust", "27K Bump always requires maximum thrust. Standard thrust is prohibited.", s.plan === "STD" ? "amber" : "go");
      if (!s.bumpAuth) {
        why("27K Bump Thrust", "Other than SNA, 27K Bump is only available on pre-authorized routes, when needed to carry payload, with dispatch and load agent concurrence.", "red");
        act("Confirm 27K Bump authorization (SNA, or dispatch and load agent concurrence) or select another rating.");
      }
    }
    if (s.flaps25) {
      if (s.aircraft === "NG") {
        max(1);
        if (!["26K", "27K"].includes(s.rating)) {
          why("Flaps 25 Takeoff Thrust", "-NG flaps 25 takeoff data is only available for 26K or 27K Bump at maximum thrust.", "red");
          act("Request a new TPS for flaps 25 at 26K or 27K Bump maximum thrust.");
        } else {
          why("Flaps 25 Takeoff Thrust", "-NG flaps 25: TPS limits to maximum thrust only (no standard thrust).", s.plan === "STD" ? "amber" : "go");
        }
      } else {
        why("Flaps 25 Takeoff Thrust", "-MAX 8 flaps 25 data may be available for all ratings and may be used with standard thrust.");
      }
    }

    // --- Runway surface
    if (s.runway === "WET") {
      if (!s.tpsWet) {
        why("Takeoff on Wet Runways", "Runway is wet but the TPS header does not specify “WET.” Wet-runway takeoffs require TPS data labeled WET.", "red");
        act("Request a new TPS based on a wet runway.");
        if (!R.speedsOnly) R.speedsOnly = "From the new wet-runway TPS";
      } else {
        why("Takeoff on Wet Runways", "TPS header specifies WET, so all TPS data including Airport Analysis is wet-runway data.");
      }
      if (s.trInop) caution("Thrust reverser inoperative on a wet runway: the MEL wet-runway penalty must be applied.");
    }
    if (s.runway === "DRY" && s.tpsWet) {
      why("Takeoff on Wet Runways", "Runway is dry: taking off with wet-runway data is permissible.");
    }

    // --- Limitations that require maximum thrust
    const penalty = [], noPenalty = [];
    if (s.runway === "CONTAM") {
      max(2); penalty.push("contaminated runway");
      R.speedsOnly = "CRC/MEL message V-speeds only";
      R.noQRH.push("Contaminated runway — only V-speeds from the CRC/MEL message");
      R.thrustOverride = "Maximum: 26K, 27K Bump, or TO (as listed on the CRC/MEL message)";
      const OL = "Operational Limitations - Contaminated Runways";
      const noGo = (text) => { R.noGo = true; why(OL, text, "red"); };
      why(OL, "Maximum 26K, 27K Bump or TO thrust, whichever is listed on the CRC/MEL message, must be used. 22K, 24K, TO2, TO1 or standard thrust at any rating is not authorized.", "amber");
      act("Contact Dispatch for contaminated runway data (CRC/MEL message). Dispatch normally selects BLD ON; request BLD OFF if needed to maximize the weight.");
      act("Use the CRC/MEL message for maximum weight, thrust rating and V-speeds.");
      const lvl = CONTAM.find(([k]) => k === s.contam);
      if (!lvl) R.missing.push("Contaminant type and depth (Conditions step)");
      else if (s.contam === "OVERWET" || s.contam === "OVERDRY") noGo("Takeoff is not authorized with more than ½ inch of wet snow, slush or standing water, or more than 4 inches of dry snow.");
      else why("Takeoff on Contaminated Runways · Data Usage", `Use the contaminated runway data for ${lvl[1]}.`);
      if (s.contamChunks) noGo("Takeoff is not authorized with chunks of hardened snow or ice.");
      if (s.antiSkidInop) noGo("The anti-skid system must be operative.");
      if (s.trInop) noGo("Both thrust reversers must be operative.");
      if (s.ip) noGo("Use of Improved Performance is not authorized.");
      caution("Flaps 15 is recommended on contaminated runways to minimize takeoff speeds. Try flaps 15 first; if the maximum weight is insufficient, try another flap setting.");
      caution("If runway conditions change, or the actual takeoff weight exceeds PTOW by more than 2,000 lb, request new data from Dispatch.");
    }
    if (s.crcmel && s.runway !== "CONTAM") {
      max(2); penalty.push("CRC/MEL data");
      R.speedsOnly = "CRC/MEL message V-speeds only";
      R.thrustOverride = "Maximum: 26K, 27K Bump, or TO (as listed on the CRC/MEL message)";
      why("Use of Standard Thrust not authorized", "Takeoff data from the CRC/MEL message for an MEL/CDL item requires maximum thrust.", "amber");
    }
    if (s.ip) {
      max(2);
      R.noQRH.push("Improved Performance — only TPS V-speeds can be used");
      if (!R.speedsOnly) R.speedsOnly = "TPS Thrust/V-speed section only";
      why("Use of Standard Thrust not authorized", `Improved Performance requires maximum thrust at ${s.aircraft === "MAX8" ? "TO" : "26K or 27K Bump"}.`, s.plan === "STD" ? "amber" : "go");
    }
    if (s.windshear) {
      max(2); noPenalty.push("windshear"); R.speedChange = true;
      why("Use of Standard Thrust not authorized", `Windshear reported or expected (including advisories): maximum thrust at ${s.aircraft === "MAX8" ? "TO" : "26K (27K at KSNA or other airports with a planned 27K TPS)"}.`, "amber");
      caution(`Windshear: if able, use flaps ${s.aircraft === "MAX8" ? "5, 10" : "5"} or 15 for takeoff.`);
    }
    if (s.adv7) {
      max(2); noPenalty.push("airport ops advisory");
      why("Use of Standard Thrust not authorized", "Airport ops advisory (##-7) page requires maximum thrust.", s.plan === "STD" ? "amber" : "go");
    }
    if (s.antiIce && !s.tpsAntiIce) {
      max(1); penalty.push("engine anti-ice"); R.speedChange = true;
      why("Use of Standard Thrust not authorized", "Engine anti-ice is used and the TPS Thrust/V-speed section does not indicate ANTI-ICE ON: maximum thrust at the planned rating.", "amber");
      act("Request a new TPS with anti-ice, or check Airport Analysis (corrected for anti-ice).");
    }
    if (s.melWt && !s.melAuto) {
      max(1); penalty.push("MEL/CDL weight correction");
      R.noQRH.push("MEL/CDL V-speed correction — use V-speeds corrected by TPS or manually corrected");
      if (!R.speedsOnly) R.speedsOnly = "V-speeds corrected by TPS or manually corrected (no FMC QRH)";
      why("Use of Standard Thrust not authorized", "MEL/CDL item with a takeoff weight correction that TPS (TPAS) did not apply automatically: maximum thrust; do not use QRH V-speeds.", "amber");
    }
    if (s.eecAlt) R.noQRH.push("EECs in Alternate mode");

    // Standard planned but a limitation requires maximum thrust.
    // ATOW is PTOW + 2,000 lb on every TPS (AOM 1p.3.2), so only PTOW is entered.
    const tow = wnum(s.tow), ptow = wnum(s.ptow), mtow = wnum(s.mtow);
    const atow = ptow != null ? ptow + 2000 : null;
    const oat = num(s.oat), at = num(s.at), plan = num(s.planTemp);
    if (s.plan === "STD" && (penalty.length || noPenalty.length)) {
      R.speedChange = true;
      if (penalty.length) {
        why("Standard Thrust Planned, Maximum Required", `Limitation with a weight penalty (${penalty.join(", ")}): takeoff weight must not exceed the Airport Analysis maximum including penalties. Standard-thrust V-speeds on the TPS may not be valid.`, "amber");
        act("Check AIRPORT ANALYSIS DATA: confirm takeoff weight does not exceed maximum takeoff weight with all applicable weight penalties.");
      } else if (tow != null && atow != null && oat != null && at != null && tow <= atow && oat <= at) {
        why("Standard Thrust Planned, Maximum Required", "No-weight-penalty limitation, takeoff weight ≤ ATOW and temperature ≤ AT: no further maximum-weight check is necessary.");
      } else {
        why("Standard Thrust Planned, Maximum Required", "Takeoff weight or temperature exceeds the TPS assumed values: check maximum weight in Airport Analysis.", "amber");
        act("Check AIRPORT ANALYSIS DATA for maximum takeoff weight.");
      }
    }
    if (R.thrust === 2 && !contamOrCRC && s.rating && !high.includes(s.rating)) {
      why("Takeoff Thrust Ratings", `Maximum thrust at ${need} is required, but the TPS rating is ${rating}. Using any rating other than the current TPS rating requires a new TPS.`, "red");
      act(`Request a new TPS at ${need} maximum thrust.`);
    }

    // Gusts / crosswind (recommendation)
    const w = windCalc(s);
    if (w.ok && (w.gi > 10 || w.xw > 15)) {
      caution(`Gust increment ${w.gi} kt / crosswind ${w.xw} kt: ${need} maximum thrust is recommended to maximize available runway.`);
    }

    // --- 1. Weight variation
    const aaPath = (ctx, pendingLvl = "red", prompt = "Check the AIRPORT ANALYSIS DATA section for a Flap/Bleed/Temp combination (corrected for wind/anti-ice) that allows the takeoff — answer below.") => {
      R.needAA = true;
      if (s.aa === "NOIP") {
        max(1); R.speedChange = true;
        why(ctx, "Airport Analysis: weight can be accommodated without Improved Performance. Use MAX thrust with FMC QRH V-speeds or AOM 6p.7 V-speeds.", "amber");
      } else if (s.aa === "IP") {
        why(ctx, "Airport Analysis: weight can be accommodated only with Improved Performance.", "red");
        act("Request a new TPS (Improved Performance).");
      } else if (s.aa === "NO") {
        why(ctx, "Airport Analysis: weight cannot be accommodated.", "red");
        act("Contact Dispatch.");
      } else {
        why(ctx, prompt, pendingLvl);
        R.missing.push("Airport Analysis result");
      }
    };
    const overMTOW = (ctx) => {
      if (["E", "L", "D"].includes(s.mtowCode)) {
        why(ctx, `Takeoff weight exceeds MTOW and the TPS is ${{ E: "Enroute", L: "Landing", D: "Dispatch" }[s.mtowCode]} weight limited.`, "red");
        act("Contact Dispatch.");
      } else {
        why(ctx, "Takeoff weight is heavier than MTOW in the Thrust/V-speed section.", "red");
        aaPath(ctx);
      }
    };
    const WV = "Weight Variation";
    if (s.plan === "STD") {
      if (tow == null || ptow == null || mtow == null) R.missing.push("Weights (TOW, PTOW, MTOW)");
      else if (tow <= atow) why(WV, `Takeoff weight ${fmtW(tow)} is lighter than or equal to ATOW ${fmtW(atow)} (PTOW + 2,000 lb): standard thrust is authorized.`);
      else if (tow <= mtow) {
        R.stdHeavy = true; max(1); R.speedChange = true;
        why("Weight Variation · AOM 1p.4.1", `Takeoff weight is ${fmt(tow - atow)} lb heavier than ATOW ${fmtW(atow)} and within MTOW ${fmtW(mtow)}: use MAX thrust at the planned rating with FMC QRH V-speeds or AOM 6p.7 V-speeds.`, "amber");
        R.alts.push("Request a new TPS authorizing standard thrust at the actual takeoff weight.");
        aaPath("Maximum Thrust Required by a Limitation · AOM 1p.4.10", "amber",
          "TOW above ATOW is a limitation with a weight penalty: confirm in the AIRPORT ANALYSIS DATA section that a Flap/BLD/Temp combination at the current temperature (corrected for wind/anti-ice) allows the takeoff — answer below.");
      } else overMTOW(WV);
    } else if (s.plan === "MAX") {
      if (tow == null || ptow == null || mtow == null) R.missing.push("Weights (TOW, PTOW, MTOW)");
      else if (tow <= ptow) why(WV, `Takeoff weight ${fmtW(tow)} is lighter than or equal to PTOW ${fmtW(ptow)}: use MAX thrust.`);
      else if (tow <= ptow + 2000 && tow <= mtow) {
        why(WV, `Takeoff weight exceeds PTOW by ${fmt(tow - ptow)} lb (≤ 2,000) and is within MTOW: use the TPS Thrust/V-speed section data for the runway.`);
        if (s.ip) caution("Improved Performance: TOW must also not exceed the Improved Performance maximum takeoff weight in Airport Analysis.");
      } else if (tow <= mtow) {
        if (s.ip) {
          why(WV, "Improved Performance TPS and takeoff weight exceeds PTOW by more than 2,000 lb: TPS V-speeds are no longer valid and QRH V-speeds may not be used.", "red");
          act("Request a new TPS.");
        } else {
          R.speedChange = true;
          why(WV, `Takeoff weight exceeds ATOW (PTOW + 2,000 lb = ${fmtW(ptow + 2000)}) and is within MTOW: use MAX thrust with FMC QRH V-speeds or AOM 6p.7 V-speeds.`, "amber");
        }
      } else overMTOW(WV);
    }

    if (s.runway === "CONTAM" && tow != null && ptow != null && tow > ptow + 2000) {
      why("Takeoff on Contaminated Runways", `Takeoff weight exceeds PTOW by ${fmt(tow - ptow)} lb (more than 2,000).`, "red");
      act("Request new contaminated runway data from Dispatch.");
    }

    // --- 2. Temperature variation
    const TV = "Temperature Variation";
    if (s.plan === "STD") {
      if (R.stdHeavy) why(TV, "Takeoff weight is above ATOW, so maximum thrust is used and the assumed temperature (AT) no longer applies. The Airport Analysis check at the current temperature covers temperature.");
      else if (oat == null || at == null) R.missing.push("Temperatures (current, AT)");
      else if (oat <= at) why(TV, `Current temperature ${oat}°C is colder than or equal to AT ${at}°C.`);
      else {
        why(TV, `Current temperature ${oat}°C is warmer than the assumed temperature ${at}°C.`, "red");
        act("Request a new TPS.");
      }
    } else if (s.plan === "MAX") {
      if (oat == null || plan == null) R.missing.push("Temperatures (current, plan)");
      else if (oat <= plan) why(TV, `Current temperature ${oat}°C is colder than or equal to plan temperature ${plan}°C.`);
      else if (oat - plan <= 2 && s.ip) {
        const IPS = "Improved Performance · AOM 1p.2.7";
        if (tow != null && ptow != null && tow <= ptow + 2000) {
          why(IPS, `Improved Performance TPS, ${r1(oat - plan)}°C warmer than plan (2°C or less) and takeoff weight within PTOW + 2,000 lb: the Thrust/V-speed section V-speeds may still be used.`, "amber");
          act("Confirm in the Airport Analysis that takeoff weight does not exceed the Improved Performance maximum takeoff weight.");
        } else if (tow != null && ptow != null) {
          why(IPS, "Improved Performance TPS and takeoff weight exceeds PTOW + 2,000 lb: the TPS V-speeds are no longer valid.", "red");
          act("Request a new TPS.");
        }
      } else if (oat - plan <= 2) {
        if (s.aa) R.alts.push("Request a new TPS (warmer than plan temperature).");
        else act("Request a new TPS, or complete the Airport Analysis check above.");
        aaPath(TV + ` (+${r1(oat - plan)}°C)`);
      } else {
        why(TV + " · AOM 1p.2.7", `Current temperature is ${r1(oat - plan)}°C warmer than plan (more than 2°C): new takeoff data must be obtained.`, "red");
        act("Request a new TPS by ACARS or voice call.");
      }
    }

    // --- 3. Wind variation
    const WIND = "Wind Variation";
    // Actual wind worse than the TPS wind: the card's three options (only the dispatcher route with Improved Performance).
    const windOptions = (kind) => {
      const change = `Ask the dispatcher or load planner to change the planned ${kind} and request a new TPS (required for Improved Performance).`;
      if (!R.speedsOnly) R.speedsOnly = s.ip ? "From the new TPS" : "From the new TPS or the manual calculation";
      if (s.ip) { act(change); return; }
      act("Request a new TPS with updated wind.");
      R.alts.push(change);
      R.alts.push("Manually compute takeoff data with AOM 1p.4.8 Manual Takeoff Calculation (steps below).");
      R.showManual = true;
    };
    if (!w.ok) R.missing.push("Wind (runway, direction, speed)");
    else {
      const tpsKt = num(s.tpsWindKt) || 0;
      if (w.hw >= 0) {
        if (s.tpsWind !== "HEAD") {
          why(WIND, `Headwind component ${w.hw} kt; the TPS Thrust/V-speed section shows ${s.tpsWind === "TAIL" ? "a tailwind" : "no wind"}: the wind is acceptable as planned.`);
        } else if (w.hw >= tpsKt) {
          why(WIND, `Actual headwind ${w.hw} kt is greater than or equal to the TPS wind ${tpsKt} kt: the wind is acceptable as planned.`);
        } else {
          why(WIND, `Actual headwind ${w.hw} kt is less than the TPS headwind ${tpsKt} kt.`, "red");
          windOptions("headwind");
        }
      } else {
        const tail = r1(-w.hw);
        const UT = "Unplanned Tailwind Takeoff";
        if (s.runway === "CONTAM") {
          R.noGo = true;
          why("Operational Limitations - Contaminated Runways", `Takeoff is not authorized with a tailwind (${tail} kt) on a contaminated runway.`, "red");
        } else if (s.tpsWind === "TAIL" && tail <= tpsKt) {
          why(WIND, `Actual tailwind ${tail} kt is less than or equal to the TPS tailwind ${tpsKt} kt: the wind is acceptable as planned.`);
        } else if (s.tpsWind === "TAIL") {
          why(WIND, `Actual tailwind ${tail} kt is greater than the TPS tailwind ${tpsKt} kt.`, "red");
          windOptions("tailwind");
        } else {
          const zw = wnum(s.zwMax), corr = num(s.twCorr);
          const lim = zw != null && corr != null ? zw - corr * tail : null;
          const T = R.tail = {
            tail, lim, zw, corr, ip: !!s.ip, m2: false,
            basis: s.tpsWind === "HEAD" ? "a headwind" : "zero wind",
            ok: lim != null && tow != null ? tow <= lim : null,
          };
          if (s.ip || s.twMethod === "M1") {
            why(UT, s.ip
              ? `Unplanned tailwind ${tail} kt with Improved Performance required: Method 1 must be used.`
              : `Unplanned tailwind ${tail} kt: Method 1 selected.`, "red");
            act("Request a TPS based on the tailwind via ACARS, or contact Dispatch.");
            if (!R.speedsOnly) R.speedsOnly = "From the new tailwind TPS";
          } else {
            max(1); R.speedChange = true;
            if (T.ok === true) {
              T.m2 = true;
              why(UT, `Method 2: max allowable weight ${fmtW(zw)} − (${fmt(corr)} lb × ${tail} kt) = ${fmtW(lim)}. Takeoff weight ${fmtW(tow)} is within it. Use maximum thrust for the rating.`, "amber");
            } else if (T.ok === false) {
              why(UT, `Method 2: max allowable weight is ${fmtW(lim)}; takeoff weight ${fmtW(tow)} is ${fmt(tow - lim)} lb heavier. Method 2 cannot be used.`, "red");
              act("Use Method 1: request a TPS based on the tailwind via ACARS, or contact Dispatch.");
              if (!R.speedsOnly) R.speedsOnly = "From the new tailwind TPS";
            } else {
              why(UT, `Unplanned tailwind ${tail} kt: the TPS was based on ${T.basis}. Use Method 1 or Method 2 below.`, "amber");
              R.missing.push(s.twMethod === "M2" ? "Airport Analysis values for Method 2 (Wind step)" : "Tailwind method (Method 1 or Method 2)");
            }
          }
        }
      }
    }

    // --- Speeds
    let speeds;
    let qrhSteps = false;
    if (R.speedsOnly) speeds = R.speedsOnly;
    else if (R.tail && R.tail.m2) {
      R.tail.forceAOM = R.noQRH.length > 0;
      speeds = R.tail.forceAOM || s.twSpeeds === "AOM"
        ? "AOM Takeoff chapter, V1 corrected for tailwind"
        : "FMC QRH V-speeds with tailwind entered";
    }
    else if (!R.speedChange) speeds = "Uplinked, FMC QRH, or TPS Thrust/V-speed section";
    else if (R.noQRH.length) speeds = "AOM 6p.7 Takeoff Data (FMC QRH not permitted)";
    else { speeds = "FMC QRH V-speeds (or AOM 6p.7 Takeoff Data)"; qrhSteps = true; }

    let thrust;
    if (R.thrustOverride) thrust = R.thrustOverride;
    else if (R.thrust === 0) thrust = `Standard (assumed temperature) at ${rating}`;
    else if (R.thrust === 1) thrust = `Maximum at ${rating}`;
    else thrust = high.includes(s.rating) ? `Maximum at ${rating}` : `Maximum at ${need} (new TPS)`;

    if (R.noGo) {
      thrust = "Not authorized";
      speeds = "Not authorized";
      qrhSteps = false;
      R.actions = ["Do not take off under these conditions. Contact Dispatch."];
      R.alts = [];
      R.showManual = false;
    }
    if (R.missing.length && R.status !== "red") R.status = "pending";
    R.showAcars = [...R.actions, ...R.alts].some((a) => /\bTPS\b/.test(a));
    return { ...R, speeds, thrust, qrhSteps, wind: w };
  }

  root.TakeoffRules = { RATINGS, HIGH, MAXRATING, CONTAM, blank, num, fmt, r1, wnum, fmtW, rwyHeading, windCalc, evaluate };
})(typeof window !== "undefined" ? window : globalThis);
