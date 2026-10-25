# #903 · Valid Permutations for DI Sequence

Author candidate; separate review pending. Reuse approved collection lesson pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md. Apply website-design skill. Boundary: only this lesson, no shared runtime changes. Category computing / leetcode; stage university. Reader: basic Python, unfamiliar with rank-based counting. Outcome: reconstruct the rank recurrence, predict one cell, implement rolling prefix/suffix sums.

Official verification: provenance/official.json, public GraphQL accessed 2026-10-25; canonical URL https://leetcode.com/problems/valid-permutations-for-di-sequence/. Public statement n=1..200, I/D only, permutation of 0..n, modulus 10^9+7; examples DID=5 and D=1. Python3 selector snippet: Solution.numPermsDISequence(self, s: str) -> int. No mutation or special exceptions. Empty string is only the internal DP base, not an official input. Chinese title is an authored translation.

## Sequence (five fields per step)
| Step | Known | Single question | Input → desired quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Strict comparisons|What counts as a different answer?|DI → valid orders of 0,1,2|Inspect the two orders and rejected order; read exhaustive baseline|All values distinct; each used once|
|1|Counting orders|What past information decides an extension?|Old last rank k, appended rank j → contributing states|Hand compute D then I; compare old/new ranks|Standardize old values; labels shift at j|
|2|Rank recurrence|Which old cells contribute to one new cell?|Preset and completed cell → exact sum|Forward/back/reset, pick preset; retained table and contribution list show each addition|Small complete simulation, no submission execution; preset restarts trace|
|3|Invariant|Can the rule transfer to a new row?|II followed by D, j=1 → cell count|Predict, reveal, change; explanation names included/excluded k|Independent of trace; answer hidden before explicit reveal|
|4|Cell sums|How do we compute them without repeated work?|n comparisons → modular answer|Read/copy/download exact Python; follow code mapping|Rolling arrays O(n) space; trace history excluded|

## Terms at first use (redefined locally per step)
Permutation step0 = every integer once. Rank step1 = number of smaller values, zero-based. Standardization step1 = replace values by ranks preserving comparisons. DP step1 = store counts by prefix length and final rank. Prefix/suffix sums step4 = cumulative counts from left/right. Modulo step0 = remainder after division. i = processed comparisons; row length i+1; k = old rank; j = new rank. Unknown cells are ·, not zero.

## Tokens and states
Reuse exact ../style.css tokens: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93; existing system stack, 14px stage radius, 8px controls, 952px content, shared spacing/type scale. Local controls 48px min, disabled opacity 1 with muted text, 3px accent2 focus. No animation or new palette. Native select values short; local minimum select width 120px reserves space for DDDD and the native arrow. Table first column uses 30% with the compact Prefix / j heading, leaving every tiny-preset rank visible. Solid surfaces only.

Branches × both locales: initial/middle/end/rewind; each preset; unanswered/selected/revealed/changed prediction; clipboard success/manual fallback; locale roundtrip retaining state; unavailable storage. No async computation/loading/reconnect state applies. Source display is local. Browser verification and source transfer stored under tests/evidence; real devices and production are unverified.

P0/highest-return 20%: exact state definition, concrete relabeling example, contribution cells, bilingual feedback, code parity and independent oracle. P1: keyboard table scrolling and related reading. P2: none. Deferred: custom large input (would obscure complete trace), autoplay (no learning need), general renderer (one consumer), publication and independent acceptance (separate authorized runs).

Related links: #115 step1 explains prefix-state counting and disjoint choices; #327 step1 explains subtracting prefix sums for intervals. Check served anchors and content in tests. Simulation retains O(n²) cells/history for tiny presets; submission only two O(n) arrays.
