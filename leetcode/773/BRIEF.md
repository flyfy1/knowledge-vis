# #773 Sliding Puzzle — author brief

Product verdict: reuse the approved LeetCode lesson pattern, per
specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Category computing / algorithms; stage university. Reader knows Python lists,
sets and loops. Job: derive minimum moves from legal swaps, then implement BFS.
Highest-return slice: a reversible board and complete search layers with retained
counts. P0: official contract, causal proof, bilingual states, source parity and
browser/oracle checks. P1: explicit neighbor admission ledger. P2: none.
Deferred: animation, arbitrary board editor, execution service (no learning need).
No new layout or shared framework; all ownership is local.

## Official contract
Verified 2026-10-25 through public official GraphQL. Full response and language
selector snippets: tests/evidence/official.json. URL:
https://leetcode.com/problems/sliding-puzzle/ . Hard, not paid. Board is exactly
2 by 3, each integer 0..5 occurs once. Only orthogonal swaps with zero count as
moves. Goal [[1,2,3],[4,5,0]]. Return minimum moves or -1. Official examples:
123405 → 1; 123540 → -1; 412503 → 5. Python3 officially provides
`class Solution: def slidingPuzzle(self, board: list[list[int]]) -> int`.
No extra input exceptions are promised. Canonical code does not mutate input.

## Learning loop and five-field steps
| Step | Already known | Single question | Input → output | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Rows, columns|What counts as a move?|123405 → goal|Click 5, then undo/reset; retain boards|Only zero's orthogonal neighbors|
|1|Legal swap|Why not just try moves forever?|Same board → finite search|Inspect 123405→123450→123405 counterexample and baseline|Finite state graph, equal move costs|
|2|States and visited set|Why is the first goal shortest?|Preset → BFS layers|Next/back/end; see frontier boards, cumulative layer ledger and first-parent candidate decisions|Mark on discovery; finish full layers in simulation|
|3|Layer invariant|What can be concluded before exploring deeper?|Fresh frontier facts → minimum|Choose, reveal, change; feedback clears|All shallower layers exhausted|
|4|BFS proof|How does this become Python?|Board → integer|Inspect/copy/download exact canonical code|Fixed official 2×3 contract|

## Concept dependency / first occurrence
Move and blank: step0, swap zero with orthogonal neighbor. State: step1, complete
six-value arrangement. Edge: step1, one legal move between states. Baseline:
step1, repeatedly relax all state distances until stable. BFS, frontier, visited:
step2, explore by move count; same-distance newly found states; boards already
found. Queue: step4, first-in-first-out pending states. Every jumped-to section
redefines its terms locally.

## State / visual contract
Manual board and search presets are independent. Manual undo restores a prior
board; reset restores 123405 and empties move history. Preset changes restart
search explicitly. Search frames represent the start of a layer, after the
previous full layer was expanded; the candidate ledger describes the expansion
that produced this frame. Initial frame has no expansion. Goal is tested before
expansion. Exhaustion gets an empty frontier terminal frame. All layers and all
frontier boards are shown, no truncation. Simulation is JS, not Python execution;
Python uses a FIFO queue and may stop within a layer. Snapshot storage is teaching
cost, separate from submission space. No timers or automatic motion.
Prediction independent of trace; selection/reveal retained on locale switch,
changed selection clears reveal. Copy failure exposes/selects exact source.
Applicable branches: initial/middle/solved/exhausted × both languages; prediction
unselected/selected/revealed/changed; copy success/fallback; storage unavailable.
Loading/reconnect not applicable: all assets static and local.

## Exact tokens
Reuse ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. No new color values.
System font stack inherited, body line-height 1.75; shared clamp title/heading.
Spacing 8/12/16/20/24; radius 8/14; max content 952px. Local controls 48px,
disabled opacity 1 with muted ink; focus 3px accent2 offset4. No shadows/motion.

## Verification / limitations
Independent oracle: reverse priority-queue shortest paths using coordinate-based
neighbors, all 720 permutations; also independent relaxation baseline. Check all
trace layers/edges/discovery counts. Browser tests output to EVIDENCE_DIR; both
locales, presets, endpoints, prediction, transfer, storage, responsive/zoom and
contrast. Record actual results separately. Author checks do not establish novice
learning, LeetCode acceptance, independent review, or public deployment.
