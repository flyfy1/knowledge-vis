# #850 author self-check — final candidate

Author: Codex, exact model identifier unavailable. Role: implementation and
self-check only. Independent reviewer/run: pending. Independent acceptance:
not claimed. Release/deployment: not performed. No LeetCode submission made.
Final source/policy hashes and freeze timestamp: manifest.json.

## Official contract

Public LeetCode GraphQL was fetched without authentication or paywall workarounds
at 2026-10-25T21:17:44.855365+00:00 (2026-10-26 in Asia/Singapore).
`official.json` stores the exact response, query, endpoint, official problem URL,
statement, constraints, examples, frontend ID 850 (internal question ID 880), and
complete observed codeSnippets. The Python3 snippet is:

```python
class Solution:
    def rectangleArea(self, rectangles: list[list[int]]) -> int:
```

Python is a faithful supported interface and the preferred canonical language.
No non-Python language exception or language-contract.json is needed. Official
examples were verified as 6 and 49; zero-area rectangles are explicitly excluded
although coordinate inequalities in the source are non-strict. The lesson
paraphrases the contract and links the original instead of using the official
illustration as a runtime asset.

## Reproducible checks

- `python3 -B leetcode/850/tests/test_solution.py`: PASS, 2,169 cases.
  Unit-cell set oracle and separate inclusion-exclusion oracle. Exhaustive
  multisets on the 0..2 lattice, 1,200 seeded raster cases, 250 large-coordinate
  cases, official examples, 200 duplicates, 200 disjoint rectangles with 400
  unique x boundaries, fresh transfer area 8, input immutability, exact mirror,
  and duplicate localization key detection before JS parsing. The local
  max-boundary run took about 0.004 seconds; this is a test observation, not a
  platform-independent performance promise or LeetCode timing claim.
- `node leetcode/850/tests/test_core.cjs`: PASS, 1,006 cases / 3,860 intermediate
  frames. Independent unit-cell sets verify every delta, prefix sum, width ×
  height and disjoint merged ranges. Preset totals: 5, 6, 4, 4, 4, 2.
- `node leetcode/850/tests/browser.cjs`: PASS, real Chromium 156.0.8078.4 on Linux arm64,
  already-running http://127.0.0.1:18770. Both locales and all six presets;
  forward/back endpoints, reset, range Home/End, replay snapshot identity,
  hand toggle, literal independently calculated per-strip contributions,
  prediction all options, reveal then change, locale preserving preset/cursor/
  answer/reveal/source disclosure, keyboard Enter/Tab/focus, local links and
  anchor targets, source display, successful clipboard writes, native fallback
  transfers, exact downloaded bytes, denied storage, and file-open offline use.
  Primary page console/page errors, failed asset responses and external runtime
  requests: zero. Full details: browser-results.json.
- `python3 -B scripts/register_leetcode_lesson.py 850 --validate-only`: PASS,
  repository root, exit 0, empty stdout/stderr. Receipt: preflight.json. This
  non-mutating command was run; registration was not run.

All emitting tests accept LESSON_OUTPUT_DIR so separate reviewers can rerun
without overwriting this candidate. Browser launcher respects the configured
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and NODE_PATH. See ../README.md.

## Rendered state / locale meaning

The initial trace is before any slab; no contribution rows and area 0. Default
A+B at slab 2 renders sorted [0,1), [0,2), merged [0,2), width 1, height 2,
delta 2, prefix 2→4. The official example at slab 2 renders [0,1), [0,2),
[0,3), merged [0,3), delta 3, prefix 2→5, with two ledger rows. Final totals
are distinguished from in-progress prefix totals by the completion readout.
Back/forward returns identical ranges, metric and rows. The outline marks the
current strip and does not fill previously empty cells. A/B/C labels distinguish
rectangle membership independently of color. The ledger retains history.

The fresh prediction has width 2 and intervals [0,2), [1,3), [5,6). Correct
union length is 4 and area is 8. Counting the whole span gives 12 (adds gap
[3,5)); summing lengths gives 10 (counts [1,2) twice). Feedback is absent before
selection plus explicit reveal, changes invalidate it, and language switches
preserve its meaning and selected option. Both wrong feedback paths explain the
same input and quantity, separate from the clipboard recovery copy. Representative
visible strings for both languages are captured in browser-results.json.

Before EACH denied-clipboard attempt, the test writes and reads a fresh distinct
non-source sentinel. It then invokes the actual Copy control, confirms textarea
focus and whole-source selection, sends Linux Control+C, and reads the actual
clipboard back exactly equal to source, including final newline. Both locales
passed. Displayed, embedded, automatically copied and downloaded sources also
match the canonical file exactly. No source text is injected into the clipboard
as a substitute for the native fallback action.

## Visual inspection and accessibility

Author visually inspected focused en-320 and zh-390 diagrams, both 200% ledger
views, zh-320 prediction, English fallback, final forced-colors diagram, and the
contact sheets covering both locales at 320/390/736/1440. Grid proportions and
unit labels remain distinct; A/AB/ABC membership is readable; current dashed
outline remains distinguishable. Wide diagrams use the same units and values.
Prediction feedback wraps with the correct 12/8/10 options; no stale answer or
layout overlap was observed. Source is deliberately horizontally scrollable.
Narrow navigation is deliberately scrollable and links reach their target below
the sticky bar. No document-level horizontal overflow in the tested layouts.

200% is real browser rendering with CSS zoom: 1280px physical viewport, 640px
layout. Large diagrams require ordinary vertical scrolling. Separate diagram-top
and ledger captures distinguish viewport capture boundaries from component
clipping. This is not physical-device or browser-toolbar zoom evidence.
All visible buttons are at least 48×48 CSS px. Closed selected option widths
were measured in the actual browser font environment for every preset at every
width; a conservative 24px arrow allowance passed after widening. Font stack is
shared system fonts; no exact resolved-font or cross-platform fit claim.

Measured rendered text contrasts range 7.0789:1 (muted / panel, including the
disabled rewind button) to 16.087:1. Body explanatory text 12.616:1, primary
button 13.101:1. 3px orange focus outline exceeds 3:1 against the panel.
Forced-colors mode uses CanvasText/Canvas and HighlightText/Highlight for SVG;
axes and membership labels remain visible. Reduced-motion browser context is
used; no autoplay, loops, timers, or entry effects exist. CSS is 9,425 shared +
1,933 local = 11,358 bytes, below 25,000. There are no shipped bitmap assets,
external fonts or runtime requests.

## Corrections during author work (not independent findings)

1. An initial test arbitrarily required >80 translation keys although there are
   78. Removed the unrelated count threshold; duplicate/key-shape checks remain.
2. A browser expectation assumed [0,2),[0,1) order for equal starts, but tuple
   sorting gives [0,1),[0,2). Corrected the assertion and aligned the numeric
   merge example to canonical order.
3. Initial selector budget 185px was smaller than 134.112px text + 30px padding
   + 24px conservative arrow reserve. Inspection of select-before-width-fix.png
   showed the actual label complete. This was a failed conservative predicate,
   not demonstrated clipping. Widened locally and reran the unchanged budget.
4. Language control height was 48px but one width was below 48px. Added local
   min-width:48px and reran the actual geometry assertion.
5. Content inspection found that original transfer intervals produced equal
   wrong-rule results and an incorrect distractor explanation. Changed only
   the fresh case to [0,2),[1,3),[5,6), verified the answer independently, and
   reran both locales' options/reveal paths. Final feedback is documented above.
6. Initial forced-colors SVG axes retained light normal-theme fill against a
   white background. Added semantic system-color overrides and verified the
   final focused screenshot, with ≥7:1 axis text contrast.

These occurred before the final freeze; no earlier independent review report,
acceptance or campaign record exists for this candidate or was rewritten.

## Evidence boundary / next action

This is author self-check with independent computational oracles, not an
independent teaching review. No actual novice teach-back, real phone hardware,
physical display, production delivery, server load claim, or accepted LeetCode
submission is established. Next action: dispatch a separate fresh-context review
of the frozen candidate, using the rubric in specs/leetcode-review-gates.md.
Reviewer should begin with the lesson rather than this document or the BRIEF.
