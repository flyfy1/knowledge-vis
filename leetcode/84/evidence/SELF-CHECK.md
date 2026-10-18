# #84 author self-check — 2026-10-18

Status: complete author candidate, ready for a separate lesson review.
No independent lesson acceptance, LeetCode submission, deployment, or novice
learning outcome is claimed. No shared files or registry entries were changed.

## Contract and implementation

The official public problem page and public GraphQL response were accessed on
2026-10-18. `official-graphql.json` preserves the exact observed response, URL,
endpoint and timezone-qualified access timestamp. The observed Python3 selector
stub is `Solution.largestRectangleArea(self, heights: list[int]) -> int`.
Canonical `solution.py` uses that interface, does not mutate the input, and has
an exact JSON-string mirror in `python-code.js`.

The five sections start with a concrete width/minimum calculation and a correct
quadratic baseline, derive the first shorter right boundary, teach nondecreasing
pending stack heights and excluded boundaries, require a fresh cascade-pop
prediction, and map that reasoning to the full Python solution and proof.
Equal heights are handled explicitly: the oldest equal-height bar receives the
widest candidate. The final marker height −1 is distinguished from the excluded
left position −1. Browser snapshots are labeled a simulation, with their O(n²)
worst-case storage separated from the submission's O(n) auxiliary space.

## Executed numerical checks

Commands and redirectable output configuration are in `../tests/README.md`.

- `test_solution.py`: 22,845 exhaustive/seeded cases (all arrays of length 0…7
  over heights 0…3 plus 1,000 fixed-seed arrays); nine official/fresh/large cases.
  Includes 100,000 maximum-height bars with expected area 1,000,000,000,
  100,000 zeros, increasing/decreasing closed-form checks, a split at zero,
  exact source mirror, metadata compatibility, and input nonmutation.
- Python oracle recomputes every interval minimum from scratch, independently
  of the submission's stack and baseline's running-minimum implementation.
- `test_core.cjs`: 5,869 cases, 78,854 frames checked against a separate
  height-threshold contiguous-run oracle. Checks intermediate stack order,
  pending-height invariant, rectangle validity and excluded endpoints, area,
  best-so-far, one push/pop per bar, complete flush, deep snapshots and replay.
- Results: `python-results.json`, `core-results.json`, both pass.
  Empty arrays are defensive implementation checks, outside the official input.

## Executed browser checks

`browser-results.json` records the actual Chromium run at
http://127.0.0.1:18774/leetcode/84/ using the pre-existing preview service.

| State/branch | Chinese | English | Observation |
|---|---|---|---|
| Start, middle push/pop, final flush | pass | pass | all nine presets, forward/back to both ends; 244 primary navigation operations |
| Rewind / forward / reset / slider | pass | pass | stack, rectangle, ledger and best restore consistently |
| Hand interval selection | pass | pass | fixed input, chosen minimum × width; crossed endpoints stay valid |
| Prediction each option / reveal / change | pass | pass | no answer feedback until check, correct and incorrect explanations, stale feedback clears |
| Locale after interaction | pass | pass | preset, cursor, selected answer, revealed feedback and source disclosure retained |
| Copy / denied-copy fallback / download | pass | pass | exact canonical bytes, selected fallback textarea; status retranslated |
| Storage denied / local-file opening | pass | pass | locale and trace still work, embedded source needs no HTTP fetch |
| Keyboard and forced colors | pass | pass | native controls work; 3px focus outline remains available |
| 320, 390, 736, 1440px | pass | pass | no document overflow; equal-width chart columns, labels at least 14px |
| 200% CSS layout zoom | pass | pass | real Chromium layout zoom at 1440px; readable populated histogram and stack |

No runtime external requests, local asset failures, or console/page errors were
observed. Related anchors resolve to existing `#step1` targets in lessons 42 and
32. Source display, clipboard, fallback field, and actual downloaded file all
match `solution.py` exactly. Combined shared plus local CSS: 12,137 bytes.
Measured body contrast 12.62:1, chart labels 14.70:1, indices/table headings
7.08:1, disabled control text 6.45:1, incorrect feedback 6.35:1, primary control
13.10:1, focus against its surface 8.94:1. Orange rectangle boundary is separated
from cyan with the existing dark background token: contrast 10.73:1.

## Visual inspection performed by the author

Viewed the stored PNGs, not only their existence or overflow numbers. Inspected
both locale headers, hand experiment, derivation, before/after prediction,
canonical code/fallback, and populated histogram at 320/390/736/1440px plus 200%
layout zoom. `state-*-390.png` shows the causal state: official input at i=4,
popping height 5 at j=2; stack `1(1), 2(5)` becomes `1(1)`, candidate [2,3]
has width 2, area 10, best 10. The rectangle outline covers only that valid
height/width; the height-6 bar remains visibly taller. Its height/index labels
stay legible. The hand endpoint controls are grouped with their own labels
and reflow into rows on phones.

Full section element captures can contain the sticky navigation overlaid at the
capture's current scroll position (a screenshot artifact documented in the shared
trace specification). Normal viewport screenshots and actual anchor clicks were
also inspected/tested: section targets land below the navigation. Tables and
source code have contained horizontal scrolling rather than shrinking text.

During test development, fixed asynchronous clipboard assertions to await actual
completion, used real keyboard navigation for `:focus-visible`, scoped the
rectangle locator to the trace rather than both independent experiments, and
changed an answer before asserting feedback clearing. Re-selecting the same
radio choice correctly preserves its existing revealed feedback. These were
harness corrections; no failures are represented as passing executions.

Limits: 200% uses CSS layout zoom in Chromium, not desktop toolbar automation.
Physical mobile devices, assistive-technology sessions, public production delivery,
actual novice teach-back and independent pedagogical acceptance remain unverified.
The separate reviewer should cold-walk the frozen candidate before reading this
brief/evidence. Candidate hashes are recorded in `candidate-sha256.json`.
