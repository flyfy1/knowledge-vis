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
