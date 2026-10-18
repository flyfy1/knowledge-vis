# #51 · N-Queens implementation brief

Author candidate, 2026-10-18. Independent lesson review pending.
Product-fit verdict: reuse the existing LeetCode collection, category computing,
stage university. The reader knows Python loops/lists and wants to reconstruct
backtracking and return every board. One loop: hand-check a placement → inspect
reject/place/undo → predict an unseen continuation → implement Python.
Approved design: `specs/reviews/leetcode-all-hard-design-review.md`, dispatcher
adjudication 2026-10-18. This page does not reopen the shared product contract.

## Source contract
Verified 2026-10-18 through https://leetcode.com/problems/n-queens/ and public
GraphQL `question(titleSlug:"n-queens") { questionFrontendId title difficulty
codeSnippets { langSlug code } }`: #51, Hard, integer 1≤n≤9; all distinct boards,
any order; Q and .; examples n=4 produces two boards and n=1 produces [["Q"]].
Python3 stub: `class Solution: def solveNQueens(self, n: int) -> list[list[str]]`.
No mutation requirement. Reflections remain distinct boards. This is enumeration,
not #52's integer count. Source prose is paraphrased.

## Five fields per step
| Step | Known | Single question | Input → desired | Action → visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | Rows/columns | What counts as a different solution? | n=4 → two boards | Read column vectors and expand row strings | One queen per row; all boards required |
| 1 | Attacks | Which prefix can be discarded? | placed rows + candidate → legality | Calculate c, r−c, r+c; compare equal keys | Queens attack along rows, columns, diagonals |
| 2 | Constraint keys | How does undo preserve alternatives? | n=1…4 → complete event trace | Step/back/reset; reject then place/undo; accumulated board ledger | Complete bounded teaching trace, no omission; JS simulation |
| 3 | Legal prefix | Which next column remains? | unseen n=5 prefix [0,2] → legal row-2 columns | Choose, reveal, change choice | Independent from trace; answer hidden initially |
| 4 | Search invariant | How do we enumerate safely in Python? | integer n → list of board strings | Inspect mapping, copy/download, compare oracle | n≤9; average O(1) hash operations |

## Terms, state and correctness
Row r and column c are zero-based (step 0). Column vector stores one column per
row (step 0). Prefix = already-filled consecutive rows; pruning = abandoning a
prefix that cannot be completed (step 1). Diagonal keys r−c and r+c are defined
with numeric examples in step 1 and repeated in step 2. Backtracking = restoring
all sets and placement after exploring one choice (steps 1,2,4). A solution leaf
has exactly n legal rows (steps 2,4). The invariant and completeness/uniqueness
proof accompany the code. A baseline permutation oracle checks diagonals using
pairwise absolute differences, independently of the set-based implementation.

## Tokens and lifecycle
Reuse exact `../style.css` tokens: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93. Existing system font, body 16px/1.75; title clamp
28px–46px, section 23px–32px. Spacing 8/10/12/14/16/20/24/32/44/64px inherited;
local board gap 4px and cell min-height 40px are noninteractive diagram geometry.
Controls ≥48px; focus 3px accent2 with 4px offset; no motion or shadows added.
Local states use token colors and text Q / × / ?. No color-only distinctions.
Locale rerenders board text and feedback but preserves n, event, radio, reveal,
disclosures and focus. Presets explicitly restart only the trace. Reset clears
trace/ledger; independent prediction remains unchanged. There is no loading,
network fetch, reconnect, async trace, or autoplay state. Clipboard success/failure
and storage denial are applicable. Initial/end disabled buttons stay legible.

## Priorities
Highest-return 20%: actual undo with old/new constraint sets and accumulated boards.
P0: five causal steps, complete reversible n≤4 trace, bilingual accessible controls,
canonical source parity, oracle tests, fresh prediction, browser and contrast checks.
P1: previous snapshot and complete event history, exact Python operation mapping.
P2: none. Deferred: animation (no learning benefit established), n>4 UI traces
(exponential frame growth), Python execution in browser (unnecessary runtime),
shared queen framework (ownership boundary), publication (independent review gate).
Tutorial snapshots cost O(F·n + F·S·n²) in this small implementation; they are
separate from submission O(n) auxiliary storage and O(S·n²) returned output.

## Verification boundary
Self-checks and screenshots are recorded in SELF-CHECK.md. No LeetCode submission,
independent acceptance, real learner comprehension, hardware test, or public
deployment is claimed. This lesson is ready only for the next independent review.
