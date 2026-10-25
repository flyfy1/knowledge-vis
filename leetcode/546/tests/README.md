# Reproduce the author checks

From the repository root, with the existing preview serving this checkout:

```bash
python3 -B leetcode/546/tests/check.py
node leetcode/546/tests/check-core.cjs
node leetcode/546/tests/browser.cjs
node leetcode/546/tests/screenshots.cjs
python3 -B scripts/register_leetcode_lesson.py 546 --validate-only
```

All evidence-producing tests accept `OUTPUT_DIR`. For a frozen-candidate review,
set it to a new absolute directory for **each** of the first four commands. The
Python check produces `fixtures.json` for the core check; use the same output
directory for both. Browser scripts accept `PREVIEW_URL` (full lesson URL), use
Playwright via `NODE_PATH`, and honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
They do not launch a web server or modify lesson sources. Screenshots are evidence,
not an automated assertion of visual quality; inspect them separately.

`check.py`: canonical Python method against a remaining-sequence oracle that tries
all legal same-color subsegments; exhaustive/seeded/official/max-length tests;
nonmutation and actual nested-call invariants.

`check-core.cjs`: shipped JS numerical core against Python-oracle fixtures;
legal removal adjacency, identity conservation, reward totals, carry states;
AST-based duplicate dictionary keys, bilingual pair shapes and exact source mirror.

`browser.cjs`: real Chromium UI in both locales; all presets/modes and every move;
root candidates, rewind/reset/end, prediction/reveal/change, locale persistence,
native clipboard round trip, denial fallback and selected full source, downloads,
narrow screens, CSS zoom 200%, keyboard, forced colors/reduced motion, local links,
asset errors, measured contrast, and blocked storage.

`screenshots.cjs`: populated middle states, both locales at 320/390/desktop;
source-code keyboard scrolling; headers and source captures.

This is author self-check material. Independent teaching review, actual learner
outcomes, official judge submission and production deployment are separate.
