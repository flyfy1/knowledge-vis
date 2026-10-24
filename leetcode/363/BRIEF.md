# #363 author brief

Product: reuse the approved LeetCode lesson surface and adjudication in
specs/reviews/leetcode-all-hard-design-review.md. Category leetcode; stage university.
Audience: readers who can sum a small grid and read Python loops. Job: reconstruct
row-band compression and the eligible-prefix rule, including its negative-value trap.
Loop: calculate → inspect a band → advance prefix decisions → predict → inspect code.
P0: complete bilingual causal lesson, reversible ledger, canonical Python, oracle and browser checks.
P1: source fallback and boundary presets. P2/deferred: animation and custom input;
no demonstrated need beyond the bounded trace. Highest-return slice: visible eligible
prefixes with previous/current sums. No platform or new shared component.

## Verified contract
Official URL https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/
Accessed 2026-10-25 using public GraphQL; full statement and selector snippets are in
provenance/official-graphql.json. Python3 officially exposes
Solution.maxSumSubmatrix(self, matrix: list[list[int]], k: int) -> int.
Nonempty m×n grid, 1≤m,n≤100, values −100…100, k −100000…100000.
A feasible nonempty axis-aligned contiguous rectangle is guaranteed. Examples:
[[1,0,1],[0,-2,3]],2 →2; [[2,2,-1]],3 →3. No mutation requirement.
Follow-up tall matrices handled by viewing the smaller dimension as band rows.

## Exact visual contract
Reuse ../style.css tokens: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack inherited;
body 16px/1.75; shared heading clamp; space 8/12/16/20/24; radii 8/14px.
No shadows or motion. Local overrides only readable 48px controls and diagram layout.

## Steps (five fields each)
0. Known: cell addition. Question: which rectangle stays ≤2? Input: 2×3 official
example; desired maximum. Action: reveal four-cell sum 0+1−2+3=2. Observe equality
meets upper bound. Applies to nonempty contiguous rectangles; not arbitrary cells.
1. Known: rectangle boundaries. Question: what work repeats? Input: same grid;
output band sums [1,−2,4]. Action: compare visible baseline with band formula.
Observe adding a row updates each column once. Applies to each fixed top/bottom pair.
2. Known: band sum array and prefix definition. Question: which earlier prefix
makes best legal ending sum? Input: selected preset and band. Action: advance,
rewind, reset/end; inspect persistent ledger and matrix row marks. Observe query
before insertion, eligible threshold, candidate and running best. Applies to all
nonempty ending intervals; band selection restarts trace, independent quiz retained.
3. Known: eligible-prefix invariant. Question: choose a prefix for a fresh case?
Input [3,−2,4], k=4 at final endpoint. Action: predict then reveal; changing choice
clears feedback, locale preserves it. Observe smallest qualifying prefix, not largest
or forbidden zero. Applies to this ending point, not full matrix best.
4. Known: invariant. Question: how does code realize it and what does it cost?
Input canonical source; output maximum. Action: copy/download or manual fallback.
Observe mapping and actual list-insertion cost. Applies to official input guarantee.

## Dependencies / first definitions
Rectangle: step0 contiguous rows and columns. Band: step1 fixed contiguous row range.
Compressed column sum: step1 vertical sum inside band. Prefix P: step2 sum before
an endpoint, with initial zero. Earlier prefix q: step2 sum before interval starts.
Threshold P−k: step2 minimum legal q. bisect_left: step2 first value ≥ threshold.
Sorted list: step2 earlier prefixes ordered by value, duplicates retained.
Every section repeats definitions needed for jumping directly in.

Simulation: browser JS computes educational snapshots, not Python execution.
It retains all events for one selected band, not the whole matrix search; no omitted
band events are animated. Canonical Python visits all bands, transposing logically
without allocating a matrix. Snapshot history costs extra tutorial memory.
States: initial/partial/final; feasible/none yet; answer pending/revealed/changed;
copy success/manual fallback; locale both. No remote loading, auth or reconnect flow.
Self-check is author evidence only; independent acceptance and publication pending.
