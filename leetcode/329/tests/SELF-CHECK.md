# Author self-check — candidate 1

Scope: one #329 lesson, author run only. Independent lesson review is pending.
The reused product/design contract was approved before this run; this report
neither repeats that approval nor claims independent acceptance of this lesson.

## Observed evidence

- Official public LeetCode page and GraphQL inspected on 2026-10-25 Singapore
  time. `evidence/official.json` preserves statement, bounds, all three examples,
  paidOnly=false and actual Python3 `Solution.longestIncreasingPath` interface.
- `python3 -B leetcode/329/tests/test_algorithm.py`: passed 1,095 small cases,
  including exhaustive ternary 1x1, 1x3, 2x2, 2x3 grids and 250 seeded random
  grids. An uncached independent route enumeration checks submission outputs.
  Input preservation verified. Also passed 200x200 snake (40,000), 200x200 equal
  values (1), row/column (200), zero and maximum integer cases.
- 3,845 browser-core snapshots audited independently against per-cell path
  lengths. Every boundary checks finalized values, remaining larger-neighbor
  counts, next-ready membership, round history and decrement adjacency/direction.
- `node leetcode/329/tests/browser.cjs`: actual Chromium at the existing preview.
  Both languages, all six presets, complete forward/back/reset/end, exact replay,
  hand reveal, all three prediction choices, reveal/change/locale combinations.
  Source rendering, clipboard API success, rejection/manual selection, and actual
  downloaded bytes match canonical solution.py including final newline.
  Storage get/set failures and offline source rendering tested separately.
- Keyboard Enter/Tab operations and computed 3px focus outline verified.
  320,390,736,1440 CSS-pixel widths in both locales, plus 200% CSS zoom in both
  locales: no page overflow, equal readable cell columns, no cell text overflow,
  visible controls at least 48px high. Reduced-motion preference exercised in
  the final complete browser run; a prior complete run used normal motion.
  Internal links/anchor landing checked; requests stay local; no JS/asset errors.
- Measured token text contrasts are 6.45:1 through 16.09:1 on used surfaces.
  Accent/focus pairs exceed 8.9:1; disabled content uses opaque muted text.
  Shared + local CSS totals 11,274 bytes, below 25,000.
- Safe root command `python3 -B scripts/register_leetcode_lesson.py 329
  --validate-only` passed with exit 0, empty stdout/stderr. Exact receipt is
  `evidence/preflight.json`. No registration or shared-file mutation performed.

## Visual and teaching inspection (author, not independent learner evidence)

Inspected screenshots: English/Chinese 320px focused intermediate grids,
desktop grid, full narrow English page, header, revealed transfer exercise and
200% zoom grid. Cell coordinates, original values, out/L labels, ready/fixed
markers, accumulated ledger and wrapping controls remain distinct. Focused
captures were positioned below the sticky navigation; full-page sticky placement
is capture-dependent and must not be interpreted as persistent overlapping UI.

Author reconstruction of each step: (0) count four cells, not three moves;
(1) reuse a cell's suffix and wait for every larger neighbor;
(2) decrement counts only toward smaller neighbors and freeze the current batch;
(3) take max, not min, at the fresh branching case, yielding five;
(4) each cell enters/departs the queue once, with four-neighbor scans and linear
auxiliary memory. These are author checks, not actual novice teach-back.

Initial self-check failures were fixed before freezing: shared .btn specificity
kept buttons at 44px; code-block manual selection could drop the trailing newline;
implicit favicon request returned 404. Local 48px rules, an exact-source read-only
manual-copy textarea and a data favicon resolve these. Test development also fixed
an unquoted numeric CSS selector and capture scroll stabilization. No historical
independent result was rewritten; none exists for this candidate.

## Limits and next action

No LeetCode submission was made. Chromium viewport emulation/CSS zoom is not a
physical-device or browser-toolbar-zoom claim. No public deployment, independent
lesson review, novice study, or collection registration. Dispatcher should give
the frozen candidate and rubric to a fresh reviewer without this author rationale
for the initial cold walkthrough. `evidence/candidate-1-sha256.json` identifies the
reviewable source, metadata and tests. The lesson stays unregistered until the
independent review gate is met.
