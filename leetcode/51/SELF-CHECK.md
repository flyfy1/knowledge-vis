# #51 author self-check — 2026-10-18

Status: complete candidate for independent review. This report is author evidence,
not independent acceptance. Preview: http://127.0.0.1:18771/leetcode/51/ on the Mac.
No registry/shared assets edited; no submission, commit, deployment, or real-learner
validation performed by this author run.

## Source and numerical checks

Official statement and public GraphQL verified on 2026-10-18: #51 N-Queens, Hard,
1≤n≤9, return all distinct Q/. boards in any order; n=4 has two boards, n=1 one.
Python3 interface is `Solution.solveNQueens(self, n: int) -> list[list[str]]`.
URL: https://leetcode.com/problems/n-queens/ . Exact query is recorded in BRIEF.

Run `python3 leetcode/51/tests/algorithm.py` from repository root.

- n=1…8: exact complete output sets match an independent permutations/pairwise
  absolute-distance oracle. Counts 1,0,0,2,10,4,40,92.
- Maximum n=9: 352 distinct boards; every row/column and every queen pair checked.
- Every one of the 120 snapshots across n=1…4 checked: placement, all three sets,
  rejection reasons, legal append, undo, saved-board preservation, final state.
- Python canonical source and embedded source match exactly.
- All teaching traces are complete: n=1 5 frames, n=2 10, n=3 25, n=4 80.

## Real browser checks

Run `node leetcode/51/tests/browser.cjs`. Optional `LESSON_URL` changes preview;
`NODE_PATH` may locate Playwright, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is
honored. The fallback package path is the installed Mac bundled dependency.
For immutable review runs, set `LESSON_TEST_OUTPUT_DIR=/tmp/lesson51-review` to
redirect all generated PNGs and JSON outside this lesson. The Python test disables
bytecode writes. Example: `LESSON_TEST_OUTPUT_DIR=/tmp/lesson51-review node
leetcode/51/tests/browser.cjs`.
Machine-readable result: `tests/browser-results.json` (159 assertions).

Both English and Chinese were exercised: every preset, every forward/back event,
both disabled endpoints, reset, range jump, exact replay, all three predictions,
explicit reveal, feedback clearing after changed choice, locale after reveal,
locale preserving trace/selection/disclosures, keyboard activation and focus,
clipboard success via browser API stub and denied-clipboard manual selection,
displayed/downloaded Python parity, blocked localStorage, internal link targets,
local-only resource requests, zero page exceptions and zero failed asset requests.
Clipboard write stubbing validates UI behavior, not OS clipboard integration.

Viewport checks: 320,390,736,1440 CSS pixels in both languages; no page overflow.
Controls measured ≥48px high; keyboard focus 3px. Browser CSS zoom 200% at 640px
checks effective 320px layout. This is Chromium layout evidence, not a physical
mobile device or every OS-level zoom implementation. Forced-colors focus and
reduced-motion mode were exercised. Sticky deep-link target clears the nav.

Contrast measured from computed foreground/background pairs (both locales):
body, explanation, muted hint, primary/disabled buttons, board cells/headers,
incorrect prediction feedback, selected locale. Every measured pair ≥4.5:1;
ratios and exact RGB values are in browser-results.json. Core text exceeds 7:1;
muted text meets AA. Total shipped CSS: 9,425 shared + 2,819 local = 12,244 bytes.
No fonts, remote images, external scripts, timers, or autoplay are added.

## Visual inspection

Author inspected all four real Chromium images:
`tests/en-mobile.png`, `tests/zh-mobile.png` show event 13’s rejected square with
Q/× labels, axes, wrapping controls and readable progress at 390px.
`tests/en-desktop.png`, `tests/zh-desktop.png` show final empty working board,
empty constraint sets and the truthful two-board accumulated count at 1440px.
No board clipping or overlapping controls observed. During inspection, a stale
active step chip was found for long sections and fixed by deriving the active
section from current geometry; the browser suite was rerun afterward.

## Applicable state matrix and limits

Both locales cover initial, placed, rejected, undone, saved solution, terminal
with zero/one/two boards, disabled start/end controls, quiz unanswered/selected/
revealed/changed, copy success/fallback, locale persistence/failure, and reset.
Loading/reconnect/expired are inapplicable: the page is synchronous and local.
No n>4 UI trace is offered; n≤9 Python correctness checks are distinct evidence.
Screenshots demonstrate layout, not novice comprehension or independent review.
Independent cold walkthrough, review finding closure, public delivery and actual
LeetCode submission remain outside this author check.

## Required-finding fix self-check — 51-R1, 2026-10-18

Status: **fixed awaiting review**, ready for separate focused re-review. This
appendix is author self-check evidence and does not close the independent finding.
Original report: `specs/reviews/51-review-1-b84a663e.md` (unchanged).
Preview used for this run: http://127.0.0.1:18770/leetcode/51/ . Candidate is the
uncommitted lesson-local diff on base `b6e4342697efeb4e21f451f207a977ed34666d8e`;
exact served asset identities are in
`tests/evidence/51-r1-after/candidate-assets.json`. All seven lesson assets matched
the preview bytes. No commit, publication, service or shared-file change.

| Finding | Cause and correction | Evidence / next action |
| --- | --- | --- |
| 51-R1 | A viewport breakpoint kept two grid tracks despite reduced available space at CSS zoom. Equal fixed table columns also split the long axis label. Auto-fit grid tracks now have an 18rem minimum bounded by available width; the fixed table reserves 5.5em for the axis and wraps at word boundaries, preserving equal queen columns. The stylesheet URL is versioned. | Focused red/green regression and screenshots below; separate reviewer must recheck and close the finding. |

The website-design skill was read and applied within the existing reviewed
contract. The diagnosing-bugs skill's feedback discipline was also used: establish
a failing browser loop before edits, then rank and probe falsifiable hypotheses.
Before edits, `LESSON_TEST_OUTPUT_DIR=leetcode/51/tests/evidence/51-r1-before node
leetcode/51/tests/zoom-layout.cjs` exited 1 with 30 failures: clipped/split Q and
axis labels in both zoomed locales, missing stacked layout, and English Column
splits at narrow normal widths. Its original JSON and screenshots are retained
under `51-r1-before/`; the final regression adds padding and equal-width checks.

Ranked hypotheses were stated before probes: available-width grid reflow would
restore marker room; intrinsic axis sizing would fix split words; shrinking text
alone would leave the layout fault. One-variable browser CSS probes are recorded
in `51-r1-before/hypotheses.json`: baseline tracks 103/103 CSS px, board 206
rendered px; reflow alone gave one 230 CSS-px track and 460 rendered-px board.
Automatic table sizing alone kept two tracks and produced uneven cell widths;
smaller text retained the 206px board. The final fix therefore retains fixed equal
queen columns and enlarged text, reserves axis space, and uses content-based
reflow. No diagnostic hooks remain in shipped code.

Final commands (from repository root; browser uses installed NODE_PATH package
and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH):

- `PYTHONDONTWRITEBYTECODE=1 python3 leetcode/51/tests/algorithm.py`: passed n=1…8
  exact oracle sets, n=9 validity/uniqueness/count 352, all 120 n=1…4 snapshots,
  transitions and sets, and exact Python mirror parity. Python files did not
  change, so regeneration was unnecessary.
- `LESSON_TEST_OUTPUT_DIR=leetcode/51/tests/evidence/51-r1-after node
  leetcode/51/tests/zoom-layout.cjs`: passed all 10 cases, no failures or page
  errors. English/Chinese, n=4 event 32, current and expanded previous boards,
  widths 320/390/736/1440 at 100%, plus 640×1000 at CSS zoom 2. DOM ranges assert
  each marker/axis word fits inside cell padding without splitting; queen column
  widths agree within 1px; zoomed state is stacked; page does not overflow;
  placement [1,3,0], event 32 and one saved board are retained. At zoom the board
  is 460 rendered px wide, with queen cells about 59px wide in both locales.
- `LESSON_URL=http://127.0.0.1:18770/leetcode/51/
  LESSON_TEST_OUTPUT_DIR=leetcode/51/tests/evidence/51-r1-after node
  leetcode/51/tests/browser.cjs`: passed 159 assertions, zero page/HTTP errors;
  full trace/replay/presets, quiz/reveal/change, locale preservation, clipboard
  success stub/fallback, source/download parity, keyboard/focus, contrast,
  forced-colors/reduced-motion, links, storage denial and normal-width layouts.
  Total shipped CSS is 12,345 bytes (9,425 shared + 2,920 local).
- `git diff --check`: passed. Changed paths are confined to `leetcode/51/`.

Machine-readable results: `tests/evidence/51-r1-after/zoom-results.json` and
`browser-results.json`. Visually inspected all ten focused layout screenshots
(`en`/`zh` × 320/390/736/1440/640-zoom2), plus the full suite's four mobile and
desktop screenshots. Axis words and Q/? markers remain readable; board columns
are equal; phone/zoom layouts stack and desktop layouts remain side by side.
The focused tall-element screenshots hide only the sticky nav during capture to
avoid it covering the table header; geometry assertions run with normal nav.
The full-suite screenshots preserve normal navigation.

Limits: Chromium viewport/CSS-zoom checks, not native OS zoom or physical-device
certification. Clipboard success is stubbed. No new independent acceptance,
learner-comprehension claim or LeetCode submission. Next action: a separate
reviewer checks this candidate against 51-R1 and records closure in their report.
