# #85 Maximal Rectangle — author brief

Contract: reuse the approved collection lesson pattern and dispatcher adjudication in
`specs/reviews/leetcode-all-hard-design-review.md`; no new layout/product gate.
Category computing / collection leetcode; stage university. Audience: knows Python
lists and loops, has not learned monotonic stacks. Outcome: derive heights, settle
widths, predict an unseen pop, and implement the official Python callable.

Official verification: 2026-10-18, https://leetcode.com/problems/maximal-rectangle/.
Full public GraphQL response in evidence/official.json records statement, examples,
metadata and complete observed code selector. Python3 template is
`class Solution: def maximalRectangle(self, matrix: list[list[str]]) -> int`.
Rows and columns 1..200; rectangular character matrix, cells '0'/'1'; return integer
area. Examples 6, 0, 1. No mutation requirement, no special exceptions. Empty input
is outside constraints; implementation tolerates it as 0. No LeetCode submission.

## Learning loop and steps

| Step | Already known | Single question | Input → desired output | Action → visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | Grid cells | What counts as one rectangle? | 101 / 111 → area 3 | Hand count contiguous cells; compare 3 vs disconnected 5 | Axis-aligned, all cells one |
| 1 | Rectangle width × height | When does a shorter bar determine width? | Same grid → heights [2,1,2] | Work pop at i=1 and terminal zero; see width 3 for height 1 | Same bottom row, contiguous columns |
| 2 | Heights and excluded bounds | What did one push/pop establish? | Small preset matrix → complete event trace | Forward/back/slider/reset; grid bottom row, histogram units, stack and cumulative pop ledger agree | Each frame after one operation; no omitted events |
| 3 | Stack boundary invariant | Which width survives a new smaller bar? | Fresh [2,4,3,1] → two settled rectangles | Choose before reveal; change clears feedback; locale preserves | Strict > pop; equal heights remain |
| 4 | Settled widths | Why is every candidate covered at linear row cost? | Official matrix → canonical Python | Inspect/copy/download exact file | O(rows×cols) time, O(cols) auxiliary, input unchanged |

## Term dependencies, local definitions

Rectangle/area: step 0, contiguous rows and columns, number of cells.
Height h[c]: step 1, consecutive ones ending at current row; zero resets.
Histogram: step 1, one bar per column with this height.
Stack: step 1, list removing only its last entry; stores pending column indices.
Nondecreasing: step 1, heights never go down from stack bottom to top.
Sentinel: step 1, extra zero at column cols to finish pending positive bars.
Excluded bounds L/i and width i-L-1: step 1, restated in steps 2, 3, 4.
Every step restates its local state/quantity. Diagram column numbers are zero-based.

## Reasoning and wrong rule

Baseline enumerates every top/bottom/left/right rectangle and checks every cell;
O(R³C³), O(1) extra. Independent oracle uses enumeration with zero-prefix sums.
Heights preserve exactly the rectangles with each bottom row. At a shorter bar,
all taller pending bars must end before i. After popping j, new top L excludes
left boundary; remaining interval L+1..i-1 supports height h[j]. Equal heights may
remain: a later equal entry gets a narrower candidate, earliest gets full span.
Example 101/111 rejects treating all five ones as one rectangle. Heights [2,1,2]
reject tallest-bar-only rule (2 vs 3). Quiz distractors use inclusive boundaries
and global tallest-only logic.

## UI/state and token contract

Exact shared tokens: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547,
text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8,
bad #ff7a93. Existing system font stack, 1.75 line height, 1000px header/952px
content, shared 8/14px radii, 8/12/16/20/24 spacing; no shadows/motion/assets.
Local minimum 48px controls, disabled opacity 1, solid sticky navigation,
3px accent2 focus with 4px offset. Borders use muted for controls.
State matrix both locales: start, update, push, pop, row done, terminal; preset
restarts only lab; answer unchosen/chosen/revealed/changed; copy success/fallback;
locale preserves index/preset/answer/reveal/focus/disclosure. No network loading,
sending, reconnect or async animation lifecycle exists. No manual matrix editing.

## Simulation and costs

Browser runs a bounded JavaScript teaching simulation, not Python execution.
Presets at most 4×5, complete trace with deep snapshots and all settled rectangles
retained in ledger. This stored tutorial history is larger than submission O(C)
space. Python is tested separately against an independently derived oracle.

## Priorities / evidence

P0/highest-return 20%: causal hand example, honest snapshots and ledger, bilingual
controls, exact source parity, oracle and browser tests. P1: seeded/exhaustive
invariants, locale and accessibility edge checks. P2: none. Deferred: arbitrary
large input editor (trace volume), playback (no need), cross-page registry and
concept-map edits (outside author ownership), deployment/independent review
(separate runs). Existing related lesson anchors are checked; lesson-entry.json
provides registration metadata to dispatcher.

Author checks record actual results in evidence/SELF-CHECK.md. Separate independent
review and real learner comprehension remain pending; self-check does not accept.
