# Author self-check — #803 — 2026-10-25

Status: complete author candidate, ready for a separate independent cold review.
No independent acceptance, LeetCode submission, deployment, real device testing,
or measured learner comprehension is claimed. All authored changes are within
leetcode/803/. Shared assets, registry and campaign/review history are untouched.

Official statement and Python3 interface were verified via the public official
page and public GraphQL. See provenance/verification.md and official.json for
capture date, full content, all observed selector labels and exact templates.
The canonical source is solution.py; python-code.js is its exact JSON mirror.

## Observed checks

- `OUTPUT_DIR=leetcode/803/tests/evidence python3 -B leetcode/803/tests/check.py`
  passed: 11,746 oracle cases; 388 real Python DSU intermediate checks;
  49,573 simulation frames checked; 200×200 / 40,000-hit closed-form case;
  long-column and initial-floating boundaries; mutation and byte parity checks.
- `OUTPUT_DIR=leetcode/803/tests/evidence node leetcode/803/tests/browser.cjs`
  passed on Chromium/Linux against the already-running preview. 38 recorded
  state summaries plus all individual-frame assertions; no console/page/asset
  errors. Every preset in both locales, all prediction choices, state-preserving
  locale switches, keyboard activation, deep targets, offline and denied storage.
- Clipboard: native read-back equals source; two manual fallback attempts per
  locale each began with a distinct non-source sentinel that was written AND
  read back before forced automatic-write denial. Control+C transferred the
  selected textarea content; actual clipboard read-back matched every character,
  including the final newline. Display, mirror and both downloads match source.
- Responsive checks: 320/390/736/1440 pixels, each at 100% and CSS 200% zoom,
  both languages, populated reverse trace and revealed prediction. No page
  overflow. At extreme narrow zoom, grids and source intentionally scroll inside
  keyboard-focusable containers. Captions remain visible independently.
- Screenshots were opened and visually inspected: all 16 trace captures, eight
  full-page captures, and four focused zoom/scroll captures. Full-page images are
  useful for hierarchy; focused images confirm readable cells, separate labels,
  solid/dashed status markers and visible focus at natural pixel scale. Trace
  element captures hide sticky navigation only while capturing to avoid screenshot
  compositor overlays; native viewport images retain it.
- Measured rendered contrast in tests/evidence/browser.json: body 16.09:1;
  captions/headers at least 7.08:1; S 10.00:1; U 8.94:1; disabled control text
  6.45:1; active locale focus ring 13.10:1. The active cyan locale uses the exact
  shared bg token for its inset focus ring. Forced-colors/reduced-motion exercised.
- Total shared + local shipped CSS: 11,635 uncompressed bytes (<25,000).
  Runtime requests are all local; provenance and test captures are not assets.
- 95 translation pairs; duplicate object keys checked with an AST before evaluation.
  Rendered formula reads `result[i] = max(0, R_after − R_before − 1)` in English
  and `result[i] = max(0, R后 − R前 − 1)` in Chinese, not a truncated lookup value.
  Example 1 shows R 2→5, result [2]. Later-fallen-hit preset shows R 2→2 then
  2→5, result [2,0]. Fresh prediction explains R 2→6 and result [3,0]. Incorrect
  choices explain missing or extra bricks, distinct from manual clipboard advice.

## Author fixes discovered while checking

The first extreme-zoom check found uncontained static example tables. They now
use the same focusable contained scrolling as the dynamic grids. Subsequent
visual inspection found captions could scroll offscreen, so they were moved to
separate labeled text. The new wrapper needed min-width:0 to contain its table;
this was fixed and the full browser check rerun. Active locale focus was given
a dark inset outline to contrast against cyan. Final evidence corresponds to the
fixed candidate. overflow-before.png records an earlier author-only failure;
it is not an independent finding or final-candidate screenshot.

## Metadata / candidate identity

`python3 -B scripts/register_leetcode_lesson.py 803 --validate-only`
was run from the repository root and exited 0 with no output. The final repeated
run and metadata hash preservation are recorded in tests/evidence/preflight.json.
No registration was run. complexity is one nonempty time-and-space string.
Candidate identity is recorded in tests/evidence/candidate-sha256.json, including
shared read-only dependencies, runtime, metadata, source, tests and provenance.

Next gate: a separate author-independent run performs the frozen-candidate cold
walkthrough and source/oracle audit. This report supplies no rubric score or
reviewer endorsement. Public deployment and physical-device/browser-chrome zoom
checks remain outside the observed author evidence.
