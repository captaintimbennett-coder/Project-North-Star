// B737 Runway/Departure Change: from "is the takeoff data legal?" to the AOM's "choose one".
// Takes the Takeoff Guide rules engine result (rules.js, TakeoffRules.evaluate) and picks the
// AOM 5.4.1 item 2 option: Use Uplinked Takeoff Data, Request new TPS, or Use FMS QRH V-Speeds.
// It never decides anything the rules engine didn't: it only maps the engine's finding to an option.
// Pure functions with no DOM, shared by index.html and tests/.
(function (root) {
  "use strict";

  const NEW_TPS = /new TPS|TPS based on the tailwind|new wet-runway/i;

  // E: TakeoffRules.evaluate(...) result. ctx: { onTps: "first4" | "notFirst4" | "notOn", uplink: true | false }.
  // Returns { option, why, kind } where kind is "ok" | "pending" | "stop" | "dispatch", and option is
  // "uplink" | "newTps" | "qrh" | null. manualSpeeds is set when FMC QRH V-speeds may not be used.
  function decide(E, ctx = {}) {
    if (ctx.onTps === "notFirst4" || ctx.onTps === "notOn") {
      return { kind: "ok", option: "newTps", why: "The new runway is not one of the first four or not on the TPS (AOM 5-14)." };
    }
    if (!E) return { kind: "pending", option: null, why: "Enter the takeoff data." };
    if (E.invalid && E.invalid.length) return { kind: "pending", option: null, why: "Check the entries marked in red." };
    if (E.noGo) return { kind: "stop", option: null, why: "Takeoff is not authorized under these conditions. Contact Dispatch." };
    if (E.status === "pending") return { kind: "pending", option: null, why: `Still needed: ${E.missing.join("; ")}.` };

    const reds = E.reasons.filter((r) => r.lvl === "red");
    // Contaminated runway or an MEL/CDL item with CRC/MEL data: the data comes from Dispatch.
    if (/CRC\/MEL/.test(E.speeds) && !reds.some((r) => /Load Closeout/.test(r.text))) {
      return { kind: "dispatch", option: null, why: "Use the CRC/MEL message from Dispatch for maximum weight, thrust and V-speeds.", };
    }
    if (E.status === "red") {
      if (E.actions.some((a) => NEW_TPS.test(a))) {
        return { kind: "ok", option: "newTps", why: reds.length ? reds[0].text : "A new TPS is required." };
      }
      return { kind: "stop", option: null, why: `${reds.map((r) => r.text).join(" ")} ${E.actions.join(" ")}`.trim() };
    }
    // Valid TPS data (including Improved Performance within 2°C: TPS Thrust/V-speed section only).
    if (/^(Uplinked|TPS Thrust\/V-speed section)/.test(E.speeds)) {
      return ctx.uplink === false
        ? { kind: "ok", option: "qrh", why: "The TPS data is valid, but uplinked data is not desired or unavailable." }
        : { kind: "ok", option: "uplink", why: "The TPS data is valid for the current conditions." };
    }
    // Maximum thrust with V-speeds from the FMC QRH, the AOM, or manually corrected.
    const manualSpeeds = !/^FMC QRH/.test(E.speeds);
    const amber = E.reasons.filter((r) => r.lvl === "amber");
    return {
      kind: "ok", option: "qrh", manualSpeeds,
      why: `${amber.length ? amber[0].text + " " : ""}V-speeds: ${E.speeds}.`,
    };
  }

  // The 7 Performance Review items, filled in from the entries and the finding.
  function review(s, E) {
    const R = root.TakeoffRules, w = E && E.wind;
    const n = (v) => (v === "" || v == null ? null : Number(v));
    const kw = (v) => (R.wnum(v) == null ? "—" : R.fmtW(R.wnum(v)));
    const tpsWind = s.tpsWind === "HEAD" ? `${s.tpsWindKt || 0} kt headwind` : s.tpsWind === "TAIL" ? `${s.tpsWindKt || 0} kt tailwind` : "zero wind";
    const wind = !w || !w.ok ? "—" : w.calm ? `Calm; TPS: ${tpsWind}`
      : `${w.hw >= 0 ? `${w.hw} kt headwind` : `${R.r1(-w.hw)} kt tailwind`}, ${w.xw} kt crosswind${w.gi ? `, gusts +${w.gi}` : ""}; TPS: ${tpsWind}`;
    const surface = s.runway === "CONTAM" ? "Contaminated runway, CRC/MEL data" : `${s.runway === "WET" ? "Wet" : "Dry"} runway, ${s.tpsWet ? "wet" : "dry"} TPS`;
    const temp = s.plan === "MAX"
      ? `${n(s.oat) ?? "—"}°C, plan temperature ${n(s.planTemp) ?? "—"}°C`
      : `${n(s.oat) ?? "—"}°C, assumed temperature ${n(s.at) ?? "—"}°C`;
    const atow = R.wnum(s.ptow) != null ? R.fmtW(R.wnum(s.ptow) + 2000) : "—";
    return [
      ["Wind", wind],
      ["Runway conditions", surface],
      ["Temperature", temp],
      ["Weights", `TOW ${kw(s.tow)} · PTOW ${kw(s.ptow)} · ATOW ${atow} · MTOW ${kw(s.mtow)}`],
      ["Flaps", "As on the TPS line for the runway"],
      ["Thrust", `${E ? E.thrust : "—"}; N1 within ± 0.5% of the TPS N1`],
      ["Runway", s.rwy ? `${s.rwy}` : "—"],
    ];
  }

  root.TakeoffDecide = { decide, review };
})(typeof window !== "undefined" ? window : globalThis);
