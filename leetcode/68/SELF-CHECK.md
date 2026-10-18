# #68 author self-check — 2026-10-18

Status: complete author candidate, ready for a separate independent review.
This is not independent acceptance, a LeetCode submission result, novice
teach-back evidence or public delivery verification. No commits, registry/shared
asset changes, deployment, services or other agents were used.

## Official contract

See [tests/OFFICIAL-EVIDENCE.md](tests/OFFICIAL-EVIDENCE.md) and the complete public
GraphQL response. Official Python3 snippet was observed, rather than inferred
from the category. Canonical interface is `Solution.fullJustify(words, maxWidth)`.
The direct page request was 403; ordinary public GraphQL and the web reader
succeeded. No restricted access was attempted.

## Reproduce

From repository root (already-running preview required):

```sh
export LESSON_TEST_OUTPUT_DIR="$PWD/leetcode/68/tests/evidence"
python3 leetcode/68/tests/test_solution.py
node leetcode/68/tests/test_core.cjs
node leetcode/68/tests/browser.cjs
node leetcode/68/tests/supplement.cjs
node leetcode/68/tests/capture.cjs
```

Use another output directory to preserve this evidence. `test_core.cjs` consumes
the fixtures written by `test_solution.py` in that output directory. Browser
scripts honor NODE_PATH, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and optional
LESSON_PREVIEW_URL (default http://127.0.0.1:18772/leetcode/68/). No persistent
server is started. Tests use only Python stdlib and the installed Playwright.

## Recorded results

- 2,753 executed canonical Python cases. Three exact official outputs, all
  length sequences 1–3 for 1–5 words at feasible widths through 8, 500 seed-68
  random inputs, and maximum word-count/word-length/width boundaries. Input
  immutability, exact line lengths and word conservation checked.
- Independent small oracle enumerates all feasible group endpoints and all
  positive gap compositions, selecting minimum spread and larger left gaps.
  Large cases use the separately implemented per-space round-robin baseline.
  Neither relies on the canonical quotient/remainder construction.
- 2,760 simulation cases and 240,632 snapshots checked against executed Python
  fixtures, including cumulative output, exact letter sums, fit inequality,
  rejection maximality, space totals, remainder bounds and deterministic replay.
- Real Chromium: both locales, seven presets, every forward/backward transition,
  reset and slider endpoints, width changes, all three predictions before reveal,
  changed-answer feedback clearing, language-preserved trace and quiz state.
- Source display, copied text (both native granted clipboard and controlled
  success/failure), selected fallback textarea and actual downloaded bytes match
  solution.py. The JSON source mirror matches exactly. Source display works
  without fetching the Python file. Blocked localStorage falls back to memory.
- Keyboard Enter, range Home/End, focus outlines, reduced motion and forced
  colors checked. All buttons/selectors measure at least 48×48 CSS px. Related
  URLs and their exact anchors exist; actual step navigation clears sticky nav.
- EN/ZH at 320, 390, 736 and 1440px: no document overflow. 200% CSS zoom at a
  780px viewport: no document overflow. Width-100 output scrolls inside a focused,
  labeled container in both locales. No failed asset responses or page errors.
- Shared + local CSS: 11,089 uncompressed bytes. Rendered normal text contrast
  16.09:1, stage hints 7.08:1, readout 13.40:1, primary/selected 13.10:1,
  disabled 6.45:1. Orange focus versus panel2 8.94:1. Exact shared colors reused.
  Numeric details and measured control geometry are in browser-results.json.

## Visual inspection and correction

Visually inspected headless screenshots `focused-en-390.png`,
`focused-zh-320.png`, `focused-en-1440.png`, `focused-en-zoom200.png` and
`focused-zh-zoom200.png`: legible word chips, fit arithmetic and output spaces;
mobile controls wrap; remainder example shows aa··b·cc; output remains in a
separate retained-history region. The full-page viewport/locale screenshots
are also retained for the reviewer. Navigation scrolls horizontally within its
own region on phones; it does not widen the document.

The first browser pass caught shared `.btn` specificity leaving buttons 46px
high. Local `.btn` overrides now enforce 48px; the complete browser suite was
rerun. Final copy also defines S/g/q/r locally in the proof and L/g locally in
prediction feedback; final browser evidence follows that change and the addition of first-use concept links.

Limits: synthetic browser/device viewports, CSS zoom rather than an observed
physical-device/browser-toolbar zoom session, and author visual inspection.
No physical devices, actual learners, independent reviewer, production origin or
online judge acceptance were observed. The dispatcher must arrange the separate
review against this candidate. `tests/candidate-sha256.json` identifies source,
lesson and reproducible test files; it is not a review receipt.
