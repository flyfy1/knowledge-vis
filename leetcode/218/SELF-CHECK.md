# #218 author self-check — final author candidate

Date: 2026-10-18. Author work only. Independent review: pending.
One lesson authored and self-checked; zero independently accepted or published
by this run. No LeetCode submission was made. No real learner results are claimed.

## Official contract
Public page and public GraphQL verified title, Hard/free status, both examples,
constraints, sorted-left guarantee, final ground point, merged equal-height
segments and actual Python3 selector stub. Full dated query/response is retained
in tests/evidence/official.json. Python is the faithful preferred submission
language; no fallback-language contract is needed. Chinese title is an authored
translation. No external runtime asset or official image is shipped.

## Executed checks
All commands below ran from the repository root and finished with exit code 0:

- `python3 -B leetcode/218/tests/test_solution.py`: 6,962 cases, including exhaustive
  multisets through three small buildings, 1,500 seeded random cases, both official
  examples, max integer coordinate/height, duplicate 10,000 buildings, 10,000
  disconnected buildings and 10,000 nested buildings. Independent endpoint scans
  and unit-cell painting. Input immutability checked. Python line instrumentation
  checked insertion coverage, heap ordering, valid root and maximum at 5,315 rounds.
- `node leetcode/218/tests/core.cjs`: 306 cases / 1,342 completed endpoint frames;
  checks old/new heights, output prefix, heap order, active-entry multiplicity,
  lazy expired entries, deterministic deep snapshots and exact source mirror.
  Python cell-oracle cases cross-check the browser model.
- `node leetcode/218/tests/browser.cjs`: real Chromium on the supplied running
  preview. All six presets in EN and zh, every forward/back endpoint, replay,
  reset/end, range, all prediction options, selection/change/reveal, independent
  quiz preservation, locale preservation (preset, position, selection, reveal,
  source disclosure and focus), source/clipboard/download exact parity, denied
  clipboard with selected manual source, keyboard buttons/range/radios, actual
  keyboard horizontal diagram scroll, step-anchor landing and related anchors.
  File opening with denied storage preserves bilingual controls and source.
  No browser errors, failed assets or external requests. Forced colors and reduced
  motion checked. All 16 combinations of EN/zh × 320/390/736/1440 × 100%/200%
  CSS zoom passed document and control geometry checks. Explicit diagram/ledger
  scrolling preserves coordinates; heap text reflows rather than shrinking.
- `python3 -B scripts/register_leetcode_lesson.py 218 --validate-only`: exit 0,
  no stdout/stderr. Final record in tests/evidence/preflight.json. Complexity is
  one nonempty string. This did not register or alter acceptance/campaign state.

Rerun commands with a separate OUTPUT_DIR are in tests/README.md. Tests generate
results/screenshots only under that directory; the candidate need not change.
The canonical code is actually executed Python; the JS visualization is explicitly
labeled a simulation in both languages. History-storage cost is disclosed separately.

## Visual and access checks
Visually inspected focused screenshots, including final en-1440-z1-diagram,
zh-320-z1-heap, en-390-z2-diagram, diagram-right-edge, copy-fallback and
forced-colors-focus. Also inspected EN/zh phone/desktop and 320px zoomed heap
states during development. Heap slots and (-height,right) values remain associated;
expired entries carry visible words. Current x is a dashed marker; accumulated
contour and history remain visible. Scrolling reveals the final x tick with a
separate x-axis label. Screenshot regions deliberately show only the visible
portion of wide diagrams/tables; these are keyboard-scrollable regions.

Author checks found and corrected an input-heading overflow at 320px/200% by
allowing long headings to wrap, and a final-tick/x-label collision by moving the
axis label. The early overflow capture is retained as zoom-overflow-before.png;
it is not final passing evidence. Two harness corrections ensured radio answers
actually changed before expecting cleared feedback and used keyboard modality
before asserting :focus-visible. Final browser suite passed after these changes.

Measured final shared+local CSS: 11,757 bytes. Exact shared palette reused.
Rendered core text contrast: 13.40–14.70:1; muted progress 7.08:1; disabled control
text 6.45:1; primary control 13.10:1. Focus against adjacent dark surfaces:
8.94–10.73:1. Muted field/scroll boundaries against page: 7.74:1. Disabled controls
use native disabled semantics with opaque legible text. Color pairs and geometry
are in tests/evidence/browser-results.json.

## Freeze and remaining gates
candidate-manifest.json identifies final authored assets, metadata, test scripts
and official evidence by SHA-256. No metadata changes followed final preflight.
Separate independent cold teaching review and adjudication remain required.
Real devices, assistive-technology sessions, novice transfer and public deployment
were not tested. Nothing was committed, registered, pushed or deployed.
