# Author self-check — #827 candidate r1

Author: Codex, exact model identifier unavailable. Separate review: pending.
No LeetCode submission, learner study, registration, deployment or acceptance.
Only leetcode/827/ is owned. Candidate hashes are in candidate.json.
Approved design reuse: specs/reviews/leetcode-all-hard-design-review.md.

Official verification is saved in tests/evidence/official.json: public statement,
all code snippets, access timestamps, official URL, and secondary public frontend
ID/difficulty/interface metadata verification. Python3 supports the exact
Solution.largestIsland(self, grid: list[list[int]]) -> int signature used here.
The website and GraphQL agree on examples 3,4,4, n=1..500 and optional one flip.

Commands (from repository root):

- `python3 -B leetcode/827/tests/test_solution.py`: pass, all 530 binary inputs
  of sizes 1..3 plus 350 seeded random inputs; independent actual-flip/recount
  oracle. Four maximum 500×500 fixtures: all land, all water, checkerboard,
  and one long connected serpentine island. Input preservation checked.
- `node leetcode/827/tests/test_core.cjs`: pass, 880 cases, 9,388 frames;
  complete connected label membership and exact area counts, candidate sums
  against an independent actual-flip reachability traversal, maximum-so-far
  identity, fixed labels during tests, snapshot independence, mirror parity,
  localized pair shapes and source-level duplicate-key rejection.
- `node leetcode/827/tests/browser.cjs`: pass, real headless Chromium at the
  supplied preview. 26 semantic/state records and 14 layout/zoom records. Both
  locales, all eight presets, every forward/back transition and endpoint,
  resets, manual flips/undo, prediction pending/reveal/change and each option,
  preserved language state, full visible formula and duplicate-ID sum binding.
  Original Python source matches embedded, displayed textContent, downloaded
  bytes, successful copy and native Linux Control+C fallback exactly including
  final newline. Two fallback attempts in EACH locale each verify a fresh
  non-source clipboard sentinel before denial and exact source readback after
  the real shortcut. Denied storage, offline file loading, local assets, links,
  keyboard Enter/Tab/focus, forced colors, long strings, 48px targets and CSS
  byte budget checked.
- `node leetcode/827/tests/zoom.cjs`: focused keyboard scroll evidence for
  320px/200% CSS zoom; both locales. Rightmost coordinates remain available
  through a focusable horizontal grid scroller and the textual row equivalent.
- `node leetcode/827/tests/state.cjs`: pass; both locales show duplicate
  neighbor IDs contributing area 3 only once. A separate non-last-optimum check
  shows current candidate (2,2) with area 1 alongside best-so-far 4; candidate
  identity is attached to its own value. Current-candidate images inspected.
- `python3 -B scripts/register_leetcode_lesson.py 827 --validate-only`: pass,
  exit 0, no output; non-mutating metadata validation. Complexity is one string
  covering time and auxiliary space. No shared registry/concept map edits.

Measured total shared+local CSS: 12,312 bytes. Actual solid rendered text pairs
range from 6.449:1 (muted/disabled on panel2) to 16.087:1 (main body).
Focus/panel2 is 8.937:1; cell boundaries/panel2 are 6.449:1. Exact values and
rendered colors are in browser-results.json. Normal text exceeds 4.5:1.

Visual inspection: desktop introduction, both narrow trace languages, complete
ring labels/coordinates and controls, candidate ledger, prediction and zoom
captures were opened as images. Early narrow navigation compressed pill text;
local flex-shrink:0 now gives a scrollable strip with readable labels. Zoom
keeps 48px grid columns and allows local keyboard scrolling rather than shrinking
coordinates. The selected preset is repeated in wrapping text below its native
select, so a narrow native field cannot hide its meaning.

During authoring, the independent browser test caught the hand readout using
optimal future-flip area. It now reads only original component areas of the
CURRENT displayed grid; both manual flips and undo pass in both languages.
A maximum snake fixture initially expected +3; its original land is already
one connected island, so the independently derived correct flip gain is +1.
A screenshot harness initially used End (which also scrolls the document);
its focused rerun uses ArrowRight and captures the grid after bringing it into
view. A newly added numeric CSS attribute selector required quotes; corrected
in the test harness. These are pre-freeze self-check corrections, not reviews.

Limits: CSS zoom:2 tested, not browser-chrome zoom or physical phones. No actual
novice teach-back, screen-reader session, or public delivery verification.
The diagram batches whole component fills and omits internal stack operations;
submission Python is executed offline, not by the browser simulation. A separate
reviewer must apply the frozen six-dimension rubric and record independent
acceptance before any release. This run cannot grant that acceptance.
