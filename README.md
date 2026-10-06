# B737 Takeoff Guide — demonstration prototype

A step-by-step guide built from the B737 Takeoff Card (rev. 24 JUN 26). It walks
a pilot through the card's TPS Quick Reference Guide in the required order —
weight, then temperature, then wind — and returns the thrust setting, the
permitted V-speed source, required actions, and the card section behind each
finding.

**Demonstration only. Not approved for operational use.**

This prototype is separate from the Project North Star website. It is a single
self-contained HTML file with no dependencies and no network calls, so it works
offline.

## Install on an iPad (works offline)

The app is published with GitHub Pages from the `gh-pages` branch:
https://captaintimbennett-coder.github.io/Project-North-Star/

1. Open that address in Safari or Chrome while online.
2. Tap Share → Add to Home Screen → Add.
3. Open it once from the new icon. It then works with no connection.

It checks for a new version whenever it opens online. The installed version
is shown at the bottom of the Result screen.

## Files

- `index.html` — the whole app
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
| Heavier than ATOW | Max thrust at planned rating, FMC QRH V-speeds |
| Windshear advisory | Max 26K, QRH V-speeds, flap advice |
| Gusty crosswind (card example) | Authorized, 26K/TO max recommended |
| Warmer than plan temperature | New TPS or Airport Analysis check |
| Unplanned tailwind | Method 2 weight check, QRH V-speeds |
| Tailwind beyond the TPS | New TPS, dispatch change, or manual calculation |
| Wet runway, dry TPS | New TPS required |
| Contaminated runway | CRC/MEL message thrust and V-speeds only, limits checked |

## What is covered

- Takeoff thrust ratings and conditions that require maximum thrust
- 27K Bump and Flaps 25 restrictions
- Weight, temperature and wind variation flowcharts
- Unplanned tailwind (Methods 1 and 2)
- Standard thrust planned but maximum thrust required by a limitation
- When FMC QRH V-speeds may and may never be used
- FMC QRH V-speed entry steps as a tap-through checklist
- Wet runway rules

## Open items

All panels of the card (rev. 24 JUN 26) are now modeled, including the full
Wind Variation chart, ACARS Takeoff Data Request, Manual Takeoff Calculation,
and contaminated runway data usage and limitations. Still open:

- One interpretation to confirm with the card owner: with standard thrust
  planned and takeoff weight above ATOW but within MTOW, the guide offers max
  thrust at the planned rating with FMC QRH V-speeds, or a new TPS.
- Not reviewed or approved for line use.

## Next steps toward a product

- Move the rules into a versioned data file reviewed by the card's owner.
- Add automated tests for every path through the decision tree.
- Deploy through the company's managed iPad system instead of GitHub Pages.
