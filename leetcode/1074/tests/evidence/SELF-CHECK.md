# #1074 author self-check — candidate 1

Date: 2026-10-26. Author: Codex, exact model identifier unavailable.
Status: self-checked candidate ready for a separate independent review.
Reviewer/run: pending. Independent acceptance: not claimed. Publication: not
performed. No LeetCode submission or observed learner result is claimed.
Candidate identity: `candidate-manifest.json` contains SHA-256 file identities.

## Official provenance and language

`official.json` contains the complete public unauthenticated GraphQL result,
query, access timestamp, constraints, all three examples and all observed code
selectors. The official HTML page fetch returned UnexpectedStatusCode through
the web tool; public GraphQL returned HTTP 200 with full statement and Python3
interface. Frontend ID 1074 differs from internal question ID 1145. Python is
preferred and faithfully implements `Solution.numSubmatrixSumTarget`. No language
exception or non-Python contract is needed. Official URL matches metadata.

## Executed checks

From repository root:

- `python3 -B leetcode/1074/tests/test_solution.py` — PASS: 11,435 actual Python
  callable comparisons, including exhaustive matrices over −1/0/1 through 2×3
  and 3×2, all targets −3…3, 500 seeded cases, official examples, all-zero 100×100,
  one-row/column 100, extreme ±1000 cells, ±10⁸ targets, and full ±10⁷ rectangle.
  Matrix mutation checks, executable direct-cell baseline, exact mirror including
  final LF, unique copy keys and two-string bilingual shapes passed.
- `node leetcode/1074/tests/test_core.cjs` — PASS: 3,902 cases and 45,170 snapshots.
  Independent direct-cell oracle checks every compressed value, matching left
  boundary, old/new dictionary, subtotal, global total and retained ledger.
  Snapshot independence checked. Fresh transfer: current endpoint 2, entire row 4.
- `node leetcode/1074/tests/browser.cjs` — PASS: 22 grouped real-Chromium checks,
  both locales, all seven presets and every operation including rewind/replay,
  reset/jump/endpoints. All choices exercised before reveal; changing selection
  clears feedback. Language preserves selection, revealed feedback and trace.
  Clipboard success, exact native manual Control+C transfer on Linux with fresh
  verified non-source sentinel before EACH locale attempt, and downloaded bytes
  all equal canonical solution including final LF. Blocked storage falls back.
  Offline source remains available from its mirror. All asset requests local;
  zero console/page errors, zero failed or HTTP-error asset requests.
- `python3 -B scripts/register_leetcode_lesson.py 1074 --validate-only` — PASS,
  exit code 0, stdout/stderr empty; lesson files unchanged. Command and timestamp
  in `preflight.json`. No registration, campaign state, shared asset or report
  was modified. `lesson-entry.json` complexity is a single time/space string.

All artifact-emitting tests support OUTPUT_DIR for external reviewer reruns.
Commands and environment usage are in `../README.md`. Raw numerical and browser
reports retain the actual counts and observed localized state text.

## Visual inspection and accessibility

Headless screenshots were opened and visually inspected, not just generated:
all eight `board-{en,zh}-{320,390,736,1440}.png` show readable captions and axes,
equal columns, input values, active-band cyan borders and active-column orange
borders without squeezing. The orange cell remains explicitly defined as inside
the band in the localized legend. `cols-en-320.png` shows legible wrapping of
compressed columns. `stage-en-320.png`, `stage-zh-390.png` and
`stage-en-1440.png` show the dictionary/readout/control/ledger associations.

Long stage/section element screenshots can capture the sticky navigation over
an intermediate slice; this is a screenshot-position artifact, not missing data.
The final focused board captures explicitly scroll the entire board below the
sticky nav and show complete captions and rows. Table history intentionally has
contained horizontal scrolling on phones, with headers and a focusable region;
it does not squeeze six numeric columns into 226px. Document overflow checks
and 48px control checks passed at all four widths in both locales.

`hand-en.png` and `hand-zh.png` show coordinate-bound rectangles and retained
five-item list; `prediction-before-en.png` hides all derived feedback while an
answer is selected; `prediction-after-zh.png` displays the two-boundary derivation.
`zoom200-en.png` and `zoom200-zh.png` show readable board/data at 200% CSS zoom.
`keyboard-focus.png` shows a 3px orange focus ring on Next distinct from current
matrix-cell borders. `forced-colors.png` preserves current/band outlines and
focus. Native Enter advances and Tab reaches Reset; keyboard deep navigation
settles with the heading below the sticky nav. `fallback-en.png` and
`fallback-zh.png` show focused selected complete source for manual copying.

Computed rendered color pairs in `browser-results.json`: normal explanation
12.62:1, readout/formula 13.40:1, primary action 13.10:1, hint 7.08:1,
disabled control 6.45:1. Exhaustive shared text-role/surface combinations tested
are ≥6.45:1. Focus orange and cyan state borders measured against solid panels.
Shared+local shipped CSS = 12,042 bytes (<25,000). No external fonts or images.
Reduced motion and forced colors tested. No perpetual animation or timer exists.

## Semantic observations and navigation

Both locales' actual formula operands match the full prefix-difference equation.
For hand preset operation 5 (band [0,1], column 1), observed old dictionary {0:2},
new dictionary {0:3}, matched left boundaries [0,1], band subtotal 3 and global
subtotal 4; this is distinct from final matrix answer 5. Negative preset operation
1 explains no earlier boundary matches, rather than displaying clipboard copy.
Fresh prediction feedback explains both lost multiplicity and the illegal empty
interval. Actual texts and input/state/locale identities are in browser-results.
Clipboard fallback uses its separate localized key and correct instructions.

Related anchors were followed using actual keyboard activation in both locales:
`327/#step1` explains P[j]−P[i] and prefix boundary indices;
`363/#step1` explains fixed row-band column compression. The observed served
texts and resolved local URLs are recorded. These are related techniques, with
precise labels, not claims of identical solutions. Target source hashes are in
the manifest; publication inclusion/public verification remain dispatcher duties.

## Harness history and limits

`browser-failure.txt` preserves the initial 200ms smooth-scroll sampling failure.
The harness now waits for the destination to settle at 68…100px from the top;
subsequent runs passed. A redundant disabled-button trial was removed. No runtime
change was made to address that test timing. Before candidate freeze, prose was
refined to define the two-dimensional prefix table and the code's prefix state;
the final Python/core/browser checks reran against this final copy.

No physical mobile device, OS-level browser UI zoom, screen-reader session,
production delivery or capacity test is claimed. Zoom evidence uses CSS 200%.
These author checks establish computational and browser behavior, not independent
teaching acceptance. Next action: dispatcher assigns a fresh-context independent
review of the frozen candidate under the existing six-dimension rubric.
