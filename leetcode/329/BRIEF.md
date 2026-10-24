# #329 author brief — candidate 1

Product verdict: reuse the approved collection lesson contract, per
specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Category computing / algorithms; stage university. Reader knows loops and grids.
Job: derive and implement the longest strictly increasing orthogonal path.
Smallest useful outcome: hand-calculate a path, explain peak-removal rounds,
predict a fresh branching example, map a round to executable Python.
No new layout family, framework, shared state or services.

Official contract verified 2026-10-25 via public LeetCode GraphQL and official
page. Full response and actual Python3 selector snippet saved in
 tests/evidence/official.json. Interface: Solution.longestIncreasingPath(self,
matrix: list[list[int]]) -> int. Nonempty rectangular grid, 1<=m,n<=200,
values 0..2^31-1; orthogonal moves, no wrapping/diagonal/equal step. Length counts
cells. Examples yield 4,4,1. No mutation required; implementation preserves input.
Python is supported and preferred. No paid access needed.

## Learning loop / five fields per step
|Step|Already known|Single question|Input → desired quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|orthogonal cells|What does length count?|[[1,2],[4,3]] → maximum length|reveal hand path → four cells, three moves|strict increase, in bounds|
|1|legal paths|What reusable fact avoids repeated suffix searches?|same matrix → L at each cell|read common suffix and compare greedy counterexample|finite grid, edges strictly increase|
|2|L=1+max larger-neighbor L|How compute without recursive depth risk?|preset → round snapshots|next/back/reset/end and preset change → retained L and remaining counts|remove entire frozen round before processing next|
|3|round invariant|max or min at a branch?|fresh [[1,2,7],[6,3,4]] → L at 1|predict then reveal; change answer clears feedback|same strict orthogonal rules|
|4|round removal|How does the official callable realize this?|matrix → int|source/copy/download and mapping|official bounds; queue O(mn)|

## Terms / causal dependency
step0 path = sequence of side-adjacent cells; length = cells, not moves.
step1 suffix = remaining path from a cell; L(c) = longest path starting there;
directed edge = legal smaller-to-larger step; cycle = returning to a cell;
invariant = statement preserved at each boundary. No cycle because value must
strictly increase each move. Repeat local definitions when jumping to trace.
step2 out[r][c] = number of larger neighbors not yet removed; queue = ordered
list of ready cells; round = frozen current queue batch. Label both values and
remaining counts; removed cells retain L labels. No data conveyed by color alone.
step3 defines L locally again. step4 repeats out, queue and rounds near source.

Derivation: naive DFS tries every increasing continuation from every start;
branches can share suffixes. Greedy largest adjacent value fails on
[[1,9,10],[2,3,4]]: 1,9,10 loses to 1,2,3,4,10. L(c) depends only on larger
neighbors, not entry route. Peaks have L=1. A cell becomes ready only after ALL
larger neighbors are removed; the last one is removed in their maximum round,
so it enters the next round, exactly 1+max L. Each edge is decremented once.
This proves termination, local correctness by induction, and global max length.

## Simulation / state contract
Browser simulation, not Python execution. Complete tiny presets; no truncation.
Each frame is AFTER one whole round, with accumulated finalized L, remaining
out counts, next ready set and a round ledger. Back restores a snapshot, reset
returns frame zero only; preset restarts only trace. Hand reveal and fresh quiz
are independent. Language changes preserve all state and focus. No timers.
Static local assets mean loading/reconnect/auth states inapplicable. Copy failure
shows localized manual selection guidance; no fake success.

## Exact tokens and scope
Reuse ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System fonts, body 1.75,
stage radius14px, controls8px, 48px targets; focus3px accent2 offset4px.
Local CSS only grid/reflow and opaque disabled controls; no new colors.
P0/highest-return20%: actual grid values, remaining-neighbor counts and retained
round labels, proof and bilingual state consistency. P1: reversible controls,
source parity, independent oracle and browser checks. P2: no decoration needed.
Deferred: arbitrary large input animation (bounded presets expose complete rounds),
real-device and actual learner studies (need participants/devices). Independent
lesson review and registration are dispatcher work; no acceptance claimed here.

## Validation plan
Execute Python against uncached exhaustive path enumeration, exhaustive ternary
small grids, seeded random grids, official cases and maximum 200x200 snake.
Validate every browser frame against independent per-cell suffix lengths and
remaining-edge counts. Real Chromium bilingual preset/endpoints/replay/quiz,
clipboard success/failure, blocked storage, keyboard, source/download, 320/390/
736/1440 and 200% zoom, local requests and contrast. Tests use OUTPUT_DIR.
