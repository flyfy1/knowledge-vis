# #403 Frog Jump — author brief

Product verdict: reuse the approved bilingual lesson pattern in specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. No new layout/service or independent approval claimed. Author scope is this folder only. Category computing / collection leetcode; stage university. Audience: a reader who knows loops, sets and functions. Job: reconstruct why arrival jump length belongs in the state, then implement and verify canCross.

Official contract verified 2026-10-25 via public LeetCode GraphQL; full statement and actual codeSnippets in tests/evidence/official.json. Python3 selector provides `class Solution: def canCross(self, stones: list[int]) -> bool`. No paid access. Stones sorted strictly increasing, first 0, length 2..2000, coordinate 0..2^31-1. First jump exactly 1, later positive forward jumps k-1/k/k+1, landing only on stones. Both official examples retained in presets. Return bool, no required mutation. Empty or singleton inputs are outside the contract.

Learning loop: calculate [0,1,3], add an alternate route in [0,1,2,3,6], process (position,last jump) pairs, predict a fresh crossing, map to Python. Browser trace is a separate simulation, never live execution of Python. It retains full deep snapshots; submission keeps only sets. No automatic playback, omissions or trace truncation.

## Five steps (each five required fields)
|Step|Known|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Lengths in units|Can the frog land on 3?|[0,1,3] → bool|Reveal hand calculation; see +1 then +2|First jump 1, forward only|
|1|Legal jumps depend on last jump|Can a reached-stone flag decide the future?|[0,1,2,3,6] → necessary memory|Compare two arrivals at 3; k=1 fails to reach6, k=2 permits it|Keep all distinct last lengths, not one route|
|2|Pairs determine future|Which pairs are actually reachable?|Preset stones → cumulative sets|Next processes one pair, see all three candidate reasons and accumulated sets; back restores snapshot|Ascending stones, strictly positive moves; initial (0,0) is artificial|
|3|Reachable pair invariant|Does a fresh sequence cross?|[0,1,2,4,7,11] → prediction|Choose then reveal; change clears feedback; locale preserves|Separate exercise, never reset by trace|
|4|Pair recurrence|How does this become a submission?|Canonical source → bool and costs|Copy/download exact Python; map one update to trace|Expected constant-time hashing; O(n²) states; no recursion|

## First-use dependencies (repeated locally per step)
Jump length k: distance of the previous hop (0,1,2,3,4). State (x,k): stone coordinate and last hop (1,2,3,4). R[x]: set of possible last lengths at coordinate x (2,4). Invariant: statement true after every operation (2,3,4). Baseline: enumerate paths without reusing work (1). DP: retain answers for identical future situations (2). n: number of stones (1,4). Artificial initial k=0 enables only positive candidate1 (2,4).

## Exact tokens and surfaces
Reuse ../style.css verbatim: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared alternate background #0a0e14 and explanatory text #c9d4e2. Body system stack and line-height1.75; shared title clamp28px/5vw/46px; step title23px/3.5vw/32px; content952px; shared spacings8/10/12/14/16/20/24/32/64px, card radius14px/control8px. Local CSS only reuses these values: controls48px, disabled opacity1 with muted text/panel2, focus3px accent2 offset4px. No shadows, animation, decorative assets or new palette. Card diagram uses ordered wrapping cards (auto-fit, minimum 125px; two equal columns on narrow screens), explicitly not spatial distance. Candidate table reserves 25% for each numeric column so English headings wrap at word boundaries. Tables wrap on narrow screens. Source alone scrolls horizontally.

## Priority and lifecycle
Highest-return 20%: show both k=1 and k=2 at stone3 and the different futures. P0: bilingual causal explanation, reversible cumulative trace, fresh prediction, canonical source and reproducible oracle/browser tests. P1: official examples and boundaries in presets, recent candidate ledger. P2: none. Deferred: custom input and autoplay (unneeded validation/timing complexity), universal visual framework (one consumer), deployment/registration and independent review (dispatcher-owned).

States: initial/current/end, success and failure presets, candidate blocked/nonpositive/duplicate/new, unanswered/chosen/revealed/changed prediction, clipboard success/manual fallback; all bilingual. Locale changes preserve index, preset, choice, reveal and feedback, with storage failures caught by shared locale. No loading/auth/network runtime branch: assets and source are local. Reset applies only to trace, explicitly stated. Real-device, learner outcomes, LeetCode submission and independent acceptance remain unverified.
