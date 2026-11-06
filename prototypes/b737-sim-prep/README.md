# B737 Sim Prep — study aid

Step-by-step study blocks for B737 sim training. Block 1 is **FMS Preflight**,
built from AOM 3.5 Preflight Tasks, pages 3-18 to 3-32 (IRS alignment, initial
data, ACARS uplink or manual entry, RNAV/EO SID, route, legs and performance
verification).

**Study aid only. Not for operational use. Always use the current AOM.**

The content follows the airline's AOM closely. Decide where it is hosted before
publishing it anywhere public.

## Modes

- **Step by step** — set the ship number range, ACARS or manual, and options
  (takeoff data uplink, intersection, forecast winds, CPDLC, RNAV SID, EO SID).
  One step per screen, with the line select key or CDU key lit on a CDU drawing.
- **Practice** — "What comes next?" quiz from the same flow.
- **Overview** — the whole flow on one page.

## Files

- `procedure.js` — the steps, each tied to its AOM page; shown only for the
  setups the AOM applies them to
- `index.html` — the screens and the CDU drawing
- `tests/procedure.test.mjs` — `node --test prototypes/b737-sim-prep/tests/procedure.test.mjs`
- `manifest.webmanifest`, `sw.js`, `icons/` — Home Screen install and offline use

Bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` together on every change.

## Open items

- The CDU drawing follows a generic 737 CDU photo, not the airline's CDU. The
  AOM's ACARS step 16 names a VNAV key that photo doesn't have.
- Page names are shown only where the AOM states them.
