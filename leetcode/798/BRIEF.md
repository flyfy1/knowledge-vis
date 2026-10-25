# #798 author brief

Approved pattern: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Apply website-design SKILL; reuse lesson surface, no new layout platform. Build within leetcode/798 only. Independent review pending.

Product fit: university Computing & AI learner who knows arrays/loops. Smallest useful outcome: reconstruct losing intervals, difference events and earliest-minimum scan. Learning loop: rotate by hand → inspect one value → predict interval → scan events → map to Python.

Official contract verified 2026-10-25 via public LeetCode GraphQL (capture provenance/official-graphql.json) and official page. Frontend #798 has internal questionId 814. Python3 selector provides Solution.bestRotation(self, nums: list[int]) -> int. Nonnegative values less than n, n=1..100000. No premium access needed. Official examples return 3 and 0.

## Steps (five required fields)
0. Known: zero-based array positions. Question: which entries earn a point after a left rotation? Input/output: [1,0,2], k, individual points/score. Action: forward/back/reset/end; observe index/value comparisons and retained score history. Conditions: 0<=k<n; presets explicitly restart all shared diagrams.
1. Known: score rule. Question: why not score every rotation? Input/output: n candidates, earliest maximum. Action: compare baseline to retained hand table. Conditions: O(n²) time, O(1) extra for direct indexing; no array slices.
2. Known: original index i and new index j=(i-k+n)%n. Question: which rotations lose one chosen value's point? Input/output: i,v, losing mask, interval endpoints and aggregate difference array. Action: select each item; observe wrap and zero boundaries. Conditions: v<n; v=0 loses nowhere, inclusive bad arc l..i; split wrap into two linear intervals.
3. Known: interval start/end events. Question: how recover scores without revisiting every item? Input/output: diff, prefix bad, score n-bad, earliest best. Action: reversible scan with retained ledger; then separate fresh prediction on n=5,i=0,v=3. Conditions: frame k is after applying diff[k]; unscanned ledger cells not revealed; quiz answer only after selection/reveal, changes clear feedback.
4. Known: interval/prefix invariant. Question: how implement the proof? Input/output: canonical Python and exact source transfer. Action: inspect, copy (manual fallback), download. Conditions: official input contract; simulation is not Python execution.

## Concept dependency / first appearance
step0: left rotation k means moving first k entries to end; index is zero-based; score counts values <= index.
step1: baseline means direct independent calculation, n means array length.
step2: modulo means remainder wrapped to 0..n-1; bad means value > new index; inclusive interval includes both ends; difference array records changes, not counts.
step3: prefix sum adds all events through k; invariant = active bad intervals count equals losing entries; best-so-far includes only scanned k. Re-explain each locally.
step4: sentinel diff[n] closes final interval beyond queried rotations; strict comparison preserves earliest tie.

## Token/state contract
Exact shared tokens from ../style.css: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared font stack and radius 8/14px. Local spacing 8/12/16/20px, 48px controls, 3px accent2 focus. No animation, external assets or added palette. Disabled opacity restored to 1. Selected/correct states have textual labels. Sticky shared navigation retained.
All branches in zh/en: initial/middle/end/rewind, preset restart, zero/no-bad/wrap/nonwrap, quiz pending/selected/revealed/changed, copy pending/success/fallback. Locale preserves state and focus. No network operations during runtime; loading/reconnect inapplicable.

P0: causal explanations, honest interval renderer, bilingual controls, numerical/browser checks and exact source parity. Highest-return slice is interval mask plus prefix ledger. P1: related links and source fallback. P2/deferred: decoration, autoplay, free input, universal renderer (unnecessary scope). Simulation snapshots cost O(n²) for tiny presets; submission O(n) time/space. No actual learner, submission acceptance or public release claims.
