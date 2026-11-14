# B737 Takeoff Data & Runway Change: prototype

Two things in one generic app:

- **Runway change:** the B737 Runway/Departure Change procedure, AOM 5.4.1
  (pages 5-14 to 5-16, 24 JUN 26), item by item in AOM wording and order. At item
  2 the crew answers the takeoff data questions for the new runway, and the
  Takeoff Card rules choose the AOM option (Use Uplinked Takeoff Data, Request
  new TPS, or Use FMS QRH V-Speeds), with the reason. The crew can override it.
  The Performance Review is filled in from the answers.
- **Check takeoff data:** the Takeoff Card check on its own (is the TPS still
  valid for the conditions?), with thrust, V-speeds, actions and the card section
  behind each finding.

It holds no airport, flight or aircraft data: the crew enters every value from
the TPS, Load Closeout and ATIS. The TPS planned wind is the wind the data was
built for (zero wind when the Thrust/V-speed section shows no wind correction);
the app compares the reported wind's headwind or tailwind on the runway with it.

**Not approved for operational use.** Line use would need company review and
approval as an EFB application.

## Use
- Tap an item, or the large button at the bottom, to check off the next item.
- Section 2: switch on intersection data if needed, then choose one of the three
  takeoff performance options. Only that option's items are shown.
- Undo steps back; Reset clears the checklist. A checklist in progress is kept on
  the device for 2 hours.

## Files
- `checklist.js` — the AOM 5.4.1 procedure as data, with no screen code
- `rules.js` — the Takeoff Guide rules engine (an exact copy of
  `prototypes/b737-takeoff-guide/rules.js`; a test fails if they differ)
- `decide.js` — maps the rules engine's finding to the AOM option, and fills in
  the Performance Review
- `index.html` — the screens
- `tests/checklist.test.mjs` — item-by-item check against the AOM pages, and that
  the data is generic; `tests/decide.test.mjs` — one test per scenario for the
  option the app picks; run with `node --test prototypes/b737-runway-change/tests/*.mjs`
- `sw.js`, `manifest.webmanifest`, `icons/` — offline use and Home Screen install

Bump `VERSION` in `sw.js` and `APP_VERSION` in `index.html` together on every change.
