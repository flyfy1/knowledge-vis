# #440 — author self-check, candidate 440-author-v1

Status: complete author candidate, ready for a separate independent review.
Author: this Codex run; precise runtime model/run identifier unavailable.
Independent reviewer: pending. No LeetCode submission, learner study, production
release, registration, or independent acceptance is claimed.

Preview: http://127.0.0.1:18770/leetcode/440/
Official source/interface: provenance/official-request.json and
provenance/official-response.json, fetched anonymously from public GraphQL.
Python3 explicitly supplies Solution.findKthNumber(self, n: int, k: int) -> int.
The actual executable canonical source is solution.py. The browser is a local
JavaScript simulation, separately tested; it does not execute the submission.

## Reproduce from the repository root

```bash
python3 -B leetcode/440/tests/check_algorithm.py
node leetcode/440/tests/check_core.cjs
node leetcode/440/tests/check_browser.cjs
node leetcode/440/tests/check_reading.cjs
python3 -B scripts/register_leetcode_lesson.py 440 --validate-only
```

All four test programs accept `OUTPUT_DIR` to redirect generated evidence to a
reviewer-selected directory without modifying the frozen candidate. Run the
algorithm test first, then core, using the same output directory: core reads its
independently rank-checked fixtures. Browser tests use existing `NODE_PATH` and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. `PREVIEW_ROOT` can override the
existing preview origin. No service is started by the tests.

## Actual results

- `tests/evidence/algorithm.json`: 32,504 final-answer cases passed, including
  every k for n=1..250, 120 seeded successor-oracle cases, official examples,
  digit boundaries, and 1,009 independent digit-DP rank cases through 10^9.
  The digit DP counts decimal strings by length with bound/comparison states;
  it does not reuse the solution's clipped-prefix counting or skip decisions.
  It is itself exhaustively checked against sorting through n=250.
- Python tracing audited **the canonical solution itself** at loop entry/return:
  9,341 rank invariants and 6,791 group counts passed. Intermediate partial
  assignment lines are deliberately not mislabeled as full loop states.
- `tests/evidence/core.json`: 117,524 simulation frames passed independent
  rank/group/interval membership checks for every k through n=160. All 1,009
  independently checked Python answers match the JavaScript trace endpoint.
  Exact source mirror parity and invalid-argument checks pass. Bilingual copy
  keys are unique and both languages have aligned placeholders.
- `tests/evidence/browser.json`: real headless Chromium exercised both locales,
  every complete preset forward/back sequence, reset/end/slider endpoints,
  cumulative rows, all prediction options, reveal/change/locale combinations,
  experiment isolation, clipboard success and selected manual fallback, denied
  localStorage, exact displayed/copied/downloaded source, actual keyboard
  activation/focus, and actual section-navigation geometry. Related lesson
  anchors were checked through successful HTML requests; those lessons' own
  runtimes are outside this candidate's asset-error scope.
- Widths 320/390/736/1440 passed, including separate label/value geometry checks.
  Current count tables intentionally scroll inside named keyboard-focusable
  regions; left/right views and maximum-input rows were captured. Visible hints
  explain scrolling. No lesson JavaScript errors, failed assets, or external
  runtime requests were observed.
- `tests/evidence/reading.json`: both languages' header, hand calculation,
  interval explanation and predict-before/after layouts captured at 390px;
  200% CSS layout zoom also checked at 390px. Main browser checks cover 200%
  CSS layout zoom at 1440px. This is layout zoom in real Chromium, not a claim
  about physical phones or browser toolbar zoom. Long 120-character Latin/CJK
  text, forced colors, and reduced-motion keyboard focus were checked.
- Measured rendered contrasts: primary body 16.09:1, explanatory copy 12.62:1,
  muted state/disabled content 6.45:1 (lowest tested text pair; exceeds AA),
  focus orange against panel2 8.94:1. Shared + local CSS = **11,933 bytes**.
- `tests/evidence/served-assets.json`: all nine runtime/source dependencies
  fetched from the requested preview match local bytes, including shared CSS
  and locale. Official captures are review evidence, never runtime assets.
- `tests/evidence/preflight.json` records the final command
  `python3 -B scripts/register_leetcode_lesson.py 440 --validate-only`, exit **0**,
  no stdout/stderr. No registration was performed.

## Visual inspection and limits

The author visually inspected all 46 test screenshots using the archived
`inspection-*.jpg` contact sheets plus individual narrow/zoom/state captures.
The views show readable wrapping, separated state labels/values, retained history,
large-number labels, scrollable interval columns, source selection, and preserved
selected/correct prediction state. Tall element screenshots can include the sticky
navigation at a capture-dependent vertical position; separate focused captures
and real navigation geometry checks distinguish that screenshot artifact from
content clipping. All raw PNGs are retained for independent inspection.

Numerical proof: group contiguity and exact per-length counts preserve the rank
invariant. Tutorial snapshots use O(D²) numeric cells (O(D) moves, at most O(D)
count rows each); this is separate from the canonical O(1) auxiliary space.

Evidence establishes these author checks only. Independent cold walkthrough,
six-dimension scoring and actual novice teach-back remain pending. The candidate
manifest freezes the final metadata/runtime/test bytes for the next review.
