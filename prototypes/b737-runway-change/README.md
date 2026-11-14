# B737 Runway/Departure Change: checklist prototype

A generic, item-by-item checklist for the B737 Runway/Departure Change procedure,
AOM 5.4.1 (pages 5-14 to 5-16, 24 JUN 26). Wording and order follow the AOM. It
holds no airport, flight or aircraft data: the crew takes every value from the
TPS and ATIS, as the AOM requires.

**Not approved for operational use.** Line use would need company review and
approval as an EFB application.

## Use
- Tap an item, or the large button at the bottom, to check off the next item.
- Section 2: switch on intersection data if needed, then choose one of the three
  takeoff performance options. Only that option's items are shown.
- Undo steps back; Reset clears the checklist. A checklist in progress is kept on
  the device for 2 hours.

## Files
- `checklist.js` — the procedure as data, with no screen code
- `index.html` — the checklist screen
- `tests/checklist.test.mjs` — item-by-item check against the AOM pages, and that
  the data is generic; run with `node --test prototypes/b737-runway-change/tests/*.mjs`
- `sw.js`, `manifest.webmanifest`, `icons/` — offline use and Home Screen install

Bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` together on every change.
