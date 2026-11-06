# B737 Sim Prep — study aid

Step-by-step study blocks for B737 sim training. Block 1 is **FMS Preflight**,
built from AOM 3.5 Preflight Tasks, pages 3-18 to 3-32 (IRS alignment, initial
data, ACARS uplink or manual entry, RNAV/EO SID, route, legs and performance
verification).

**Study aid only. Not for operational use. Always use the current AOM.**

The content follows the airline's AOM closely. Decide where it is hosted before
publishing it anywhere public.

## Study blocks

1. **FMS Preflight** (AOM 3-18 to 3-32): step by step, practice quiz, overview.
2. **Performance check** (AOM 3-32), using the RNO–SFO training flight
   (AAL1080) TPS and flight plan for the 737-800 (3LE) and MAX 8 (3RS), RWY 17R
   or 17L: *Learn* shows each item's correct value and where it is on the
   paperwork; *Drill* plants one or two mistakes in the FMC entries to find.

## FMS Preflight modes

- **Step by step** — set the ship number range, ACARS or manual, and options
  (takeoff data uplink, intersection, forecast winds, CPDLC, RNAV SID, EO SID).
  One step per screen, with the line select key or CDU key lit on a CDU drawing.
- **Practice** — "What comes next?" quiz from the same flow.
- **Overview** — the whole flow on one page.

## Files

- `perf.js` — performance check values from the training paperwork, and the drill
- `procedure.js` — the steps, each tied to its AOM page; shown only for the
  setups the AOM applies them to
- `index.html` — the screens and the CDU drawing
- `tests/` — `node --test prototypes/b737-sim-prep/tests/procedure.test.mjs prototypes/b737-sim-prep/tests/perf.test.mjs`
- `manifest.webmanifest`, `sw.js`, `icons/` — Home Screen install and offline use

Bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` together on every change.

## Open items

- The CDU drawing follows the AA "B737 CDU Load Closeout and Performance Guide"
  (AOM Rev 10 pictures): INIT REF, RTE, DEP ARR, ATC, VNAV / FIX, LEGS, HOLD,
  FMC COMM, PROG, EXEC / MENU, N1 LIMIT / PREV PAGE, NEXT PAGE. Page layouts are
  drawn from the same pictures (labels and prompts only). The N1 LIMIT layout is
  the -800 one; MAX pages show only the prompt used.
- ACARS AOC AAL prompt: AOM 21d.2.2 and the guide picture show [2R]; AOM 5-14
  lists [1R]. The app shows [2R] with a note.
- Page names are shown only where the AOM states them.
