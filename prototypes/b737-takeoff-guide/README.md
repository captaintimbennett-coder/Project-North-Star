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

## Run it

Open `index.html` in any browser. On an iPad, open it in Safari and use
Share → Add to Home Screen for a full-screen app.

Use **Demo scenarios** to load pre-filled takeoffs for a walkthrough:

| Scenario | Expected result |
|---|---|
| Routine standard-thrust takeoff | Authorized, standard thrust |
| Heavier than ATOW | Max thrust at planned rating, FMC QRH V-speeds |
| Windshear advisory | Max 26K, QRH V-speeds, flap advice |
| Gusty crosswind (card example) | Authorized, 26K/TO max recommended |
| Warmer than plan temperature | New TPS or Airport Analysis check |
| Unplanned tailwind | Method 2 weight check, QRH V-speeds |
| Wet runway, dry TPS | New TPS required |
| Contaminated runway | CRC/MEL message thrust and V-speeds only |

## What is covered

- Takeoff thrust ratings and conditions that require maximum thrust
- 27K Bump and Flaps 25 restrictions
- Weight, temperature and wind variation flowcharts
- Unplanned tailwind (Methods 1 and 2)
- Standard thrust planned but maximum thrust required by a limitation
- When FMC QRH V-speeds may and may never be used
- FMC QRH V-speed entry steps as a tap-through checklist
- Wet runway rules

## Known gaps

The supplied card scan cropped the right-hand panel of each page. These are
not yet fully modeled:

- The tailwind branch of the Wind Variation chart
- ACARS Takeoff Data Request and Manual Takeoff Calculation
- Contaminated runway data usage and operational limitations

## Next steps toward a product

- Fill the gaps above from a complete copy of the card.
- Move the rules into a versioned data file reviewed by the card's owner.
- Add automated tests for every path through the decision tree.
- Add a service worker and manifest for managed EFB deployment.
