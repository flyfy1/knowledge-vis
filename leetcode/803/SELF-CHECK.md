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

## Required-review repair — 803-R1 — 2026-10-25

Status: **fixed awaiting independent review**, not independently accepted.
Historical report: ../../specs/reviews/803-review-1-0c724915.md, reviewed candidate
3960c91f27e095983bfe639fede452427eb5bc62. This repair's checkout base is
d52d2560d8d6df9b36852e48b33ebdffe66e2600; the new uncommitted candidate is frozen
by tests/evidence/repair-r1/candidate-sha256.json. No commit or registration made.
The earlier self-check's overflow assertions missed selected glyph clipping;
the independent report remains unchanged historical evidence.

Finding mapping:

- **803-R1:** native selects cannot reliably wrap long selected text. The 96 CSS
  px control showed only “D · Hit” at 320/200%, while its English text alone
  measured 145.9523 CSS px. The new selected-label regression failed before
  runtime edits (exit 1); see repair-r1/red/result.json, observed metrics and
  selected-en-320-z2.png. The native options now show complete stable A–E
  identities, with the original full localized name immediately below in wrapping
  text. Both that name and the unchanged forward-hit description are associated
  with the control via aria-describedby. No input meaning is removed. The native
  keyboard control, reset-on-preset-change and state-preserving locale switches
  continue to work. app.js changes only the selected-name rendering.
- **803-A1 (optional):** deferred. The parent/size teaching table was advisory;
  this candidate repairs the required selected-control finding only.

Commands from repository root, all exit 0 after repair:

```bash
OUTPUT_DIR=leetcode/803/tests/evidence/repair-r1/green node leetcode/803/tests/selected-label.cjs
OUTPUT_DIR=leetcode/803/tests/evidence/repair-r1/full python3 -B leetcode/803/tests/check.py
OUTPUT_DIR=leetcode/803/tests/evidence/repair-r1/full node leetcode/803/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 803 --validate-only
```

Observed evidence:

- selected-label.json: 20 selected identities across all five presets, EN/ZH,
  320/390 × CSS zoom 2. D at first restoration preserves [?,0] through locale
  switches and ends at [2,0]. All full localized names wrap without overflow.
  At 320 the repaired D text measures 11.68 CSS px in an 88 CSS px client width,
  with 30 px padding plus the unchanged conservative 24 px test arrow budget.
  This budget is a Chromium test predicate, not a measured universal arrow size.
- Opened and inspected all eight green selected-control viewport screenshots
  (both widths/locales, middle/end), alongside the original red capture. Full
  names and forward-hit descriptions remain readable. Captures retain sticky
  navigation, with the control deliberately scrolled below it. Chromium
  156.0.8078.4, Linux; computed 16px PingFang SC / Microsoft YaHei / system-ui /
  sans-serif stack. Exact resolved fallback font is unverified. CSS zoom is not
  a claim of browser-chrome zoom or physical-device testing.
- full/numerical.json: actual canonical Python executed, 11,746 oracle cases,
  388 DSU intermediate checks, 49,573 connectivity frames, maximum dimensions
  and 40,000 hits, input preservation and exact mirror parity.
- full/browser.json: 38 recorded states, all presets and transitions, prediction
  choices/reveal/invalidation/locale retention, keyboard use, offline/blocked
  storage, local links, sampled contrast, zero console/page/asset errors. All
  320/390/736/1440 layouts at CSS zoom 1/2 in both locales pass. CSS 11,718 bytes.
- Rendered-state contract: added exact bilingual formula assertions, completed-hit
  progress and ledger-length checks at initial/middle/end and rewind/replay, and
  hand-calculated D binding (i=1, cell (1,2), R 2→2, no growth). Existing board
  before/after and original-order result assertions remain. There is no cumulative
  comparison-work counter; ledger length is completed restorations plus its seed,
  distinct from fallen-brick output. The fresh prediction remains independent of
  presets; changing selection hides old feedback and locales retain its meaning.
- Exact-source regressions retain displayed textContent, decoded PYTHON_SOURCE,
  downloaded source in both locales, native clipboard and four manual fallback
  transfers, each with a fresh verified clipboard sentinel. No source regeneration
  was necessary: canonical solution.py and python-code.js are unchanged.
- Read scripts/register_leetcode_lesson.py LANGUAGE_FILES: Python maps to
  solution.py / python-code.js / PYTHON_SOURCE. Retained official.json contains
  faithful Python3 and TypeScript templates. The actual canonical callable is
  Solution.hitBricks(self, grid: list[list[int]], hits: list[list[int]]) -> list[int].
  Python is selected, so no non-Python contract or supportedLanguages list omits
  an available preferred interface.
- repair-r1/preflight.json: exact required validate-only command exited 0 with
  empty stdout/stderr, preserving the metadata SHA-256. Complexity is still the
  single nonempty time-and-space string, not an object. No metadata fix needed.

Freeze identity and served-byte comparisons are in repair-r1/candidate-sha256.json.
Next action: separate reviewer rechecks 803-R1 on that candidate and records
closure or further findings. This self-check grants no reviewer acceptance,
deployment approval, real-device result, or novice-comprehension claim.
