# B737 Takeoff Guide — demonstration prototype

A step-by-step guide built from the B737 Takeoff Card (rev. 24 JUN 26). It walks
a pilot through the card's TPS Quick Reference Guide in the required order —
weight, then temperature, then wind — and returns the thrust setting, the
permitted V-speed source, required actions, and the card section behind each
finding.

**Demonstration only. Not approved for operational use.**

This prototype is separate from the Project North Star website. It has no
dependencies and makes no network calls, so it works offline.

## Install on an iPad (works offline)

The app is published with GitHub Pages from the `gh-pages` branch:
https://captaintimbennett-coder.github.io/Project-North-Star/

1. Open that address in Safari or Chrome while online.
2. Tap Share → Add to Home Screen → Add.
3. Open it once from the new icon. It then works with no connection.

It checks for a new version whenever it opens online. The installed version
is shown at the bottom of the Result screen.

## Files

- `index.html` — the screens
- `rules.js` — the takeoff rules, with no screen code, each citing its card or AOM section
- `tests/rules.test.mjs` — one test per path through the card; run with
  `node --test prototypes/b737-takeoff-guide/tests/rules.test.mjs`
- `manifest.webmanifest` — Home Screen name, icon and full-screen display
- `sw.js` — service worker that saves the app for offline use
- `icons/` — Home Screen icons
- `vercel.json` — stops Vercel from trying to build the `gh-pages` branch

When changing any file, bump `VERSION` in `sw.js` and `APP_VERSION` in
`index.html` together, then republish the `gh-pages` branch:

```bash
git subtree split --prefix prototypes/b737-takeoff-guide -b gh-pages-build
git push -f origin gh-pages-build:gh-pages
```

Opening `index.html` directly from disk also works on a computer, without
offline support.

Use **Demo scenarios** to load pre-filled takeoffs for a walkthrough:

| Scenario | Expected result |
|---|---|
| Routine standard-thrust takeoff | Authorized, standard thrust |
| Heavier than ATOW | Max thrust at planned rating, FMC QRH V-speeds, Airport Analysis check |
| Heavier and warmer | Same; the assumed temperature no longer applies |
| Windshear advisory | Max 26K, QRH V-speeds, flap advice |
| Gusty crosswind (card example) | Authorized, 26K/TO max recommended |
| Warmer than plan temperature | New TPS or Airport Analysis check |
| Unplanned tailwind | Method 2 weight check, QRH V-speeds |
| Tailwind beyond the TPS | New TPS, dispatch change, or manual calculation |
| Wet runway, dry TPS | New TPS required |
| Contaminated runway | CRC/MEL message thrust and V-speeds only, limits checked |

## What is covered

- Takeoff thrust ratings by aircraft (-NG 22K/24K/26K/27K Bump, -MAX 8 TO2/TO1/TO)
  and conditions that require maximum thrust (26K on the -NG, TO on the -MAX 8)
- 27K Bump and Flaps 25 restrictions
- Weight, temperature and wind variation flowcharts
- Unplanned tailwind (Methods 1 and 2)
- Standard thrust planned but maximum thrust required by a limitation
- When FMC QRH V-speeds may and may never be used
- FMC QRH V-speed entry steps as a tap-through checklist
- Wet runway rules
- Runway heading entered from the Jeppesen airport chart for the wind components
- Entry checks: implausible weights, temperatures or winds stop the result until fixed
- The current takeoff is kept on the device for 12 hours if the app is closed or
  reloaded, and cleared by New takeoff or Restart

## Open items

All panels of the card (rev. 24 JUN 26) are modeled. AOM passages confirmed via
the crew's manuals: 1p.3.2 (ATOW = PTOW + 2,000 lb, so only PTOW is entered),
1p.4.1 (weight and temperature variation), 1p.2.7 (Improved Performance within
2°C of plan) and 1p.4.10 (TOW above ATOW is a weight-penalty limitation).

Still open:

- My reading of 1p.4.1 with 1p.4.10 for a standard-thrust TPS with TOW above
  ATOW: max thrust and QRH V-speeds, plus an Airport Analysis check at the
  current temperature in place of the AT comparison. Confirm with the card owner.
- Whether the TPS wind is a component or the reported wind.
- Not reviewed or approved for line use.

## Next steps toward a product

- Move the rules into a versioned data file reviewed by the card's owner.
- Have the card owner sign off the test matrix in `tests/`.
- Deploy through the company's managed iPad system instead of GitHub Pages.
