# #466 Count The Repetitions — author brief

Product verdict: reuse the approved LeetCode lesson shell and local trace pattern;
no new layout/platform. Contract: specs/reviews/leetcode-all-hard-design-review.md
and dispatcher adjudication. Independent lesson review remains pending.
Category computing (collection: leetcode); stage university. Reader: knows loops
and strings, learning why a repeated boundary state permits a safe jump.
Highest-return slice: hand scan → retained boundary history → cycle arithmetic.
P0: five bilingual sections, reversible simulation, fresh prediction, canonical
Python, oracle/browser evidence. P1: keyboard and source recovery. P2: none.
Deferred: custom arbitrary-input editor and autoplay (unneeded scope/lifecycle).

## Verified source
Official URL https://leetcode.com/problems/count-the-repetitions/ ; public GraphQL
capture in provenance/official.json, retrieved 2026-10-25 (timestamp in capture).
Nonpaid; both lengths 1..100; lowercase English; n1,n2 1..1,000,000.
Examples (acb,4,ab,2)→2 and (acb,1,acb,1)→1. Python3 selector supplies
Solution.getMaxRepetitions(self,s1:str,n1:int,s2:str,n2:int)->int. No mutation,
modulus, empty-input or special native-runtime requirements. Use Python.

## Exact token contract
Reuse ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93; inherited system fonts/line-height 1.75.
Local controls 48px; focus accent2 3px/4px; radius 8/14px; 8/12/16/20/24px
spacing; max content 952px; 560px stack breakpoint; no motion/shadows/assets.
Disabled uses opaque muted on panel2. Diagram uses text plus borders, never hue only.

## Sequence (five required fields per step)
|Step|Already known|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Strings, deletion|What does one answer unit mean?|acb twice, ab → two ab copies|Read character ledger and hand calculation|Deletion preserves order; groups contain n2 copies|
|1|Greedy next character|What survives a block boundary?|ab repeated, aba target → j and completed copies|Compare boundary (j,C) rows; inspect wrong per-block count|Always take earliest usable character; repeated s1 blocks|
|2|Boundary state j|When can scans be skipped?|Preset → character/boundary/jump snapshots|Next/back/reset/end/slider; retain all processed ledger entries|Same j and same next s1 block; skip only whole cycles, never tail|
|3|Equal j repeats future gains|Can the rule transfer?|Fresh ba,7,aba,2 → grouped result|Choose then reveal; change clears feedback; locale preserves|Same block transition; floor only after all s2 copies counted|
|4|Cycle arithmetic|How does this become a submission?|State and counts → executable Python|Inspect/copy/download; map variables to trace|Official valid domain; costs exclude stored teaching snapshots|

## Term dependency / first use
Step0: [s,n] = n concatenations; subsequence = deletion without reordering;
C = finished s2 copies; answer unit = n2 copies. Step1: j = zero-based next
needed s2 character, cycle = repeated boundary j and block gain; repeat locally
in steps2–4. Step2: block = one s1 scan, L = cycle blocks, G = gained copies,
q = number of whole cycles fitting unprocessed blocks. Step3 redefines j,C and
block. Step4 seen[j]=(block,C); jumped permits exactly one skip calculation.

## Simulation / states
Browser is a separate deterministic simulation, not Python execution. Each frame
is after one character, block boundary, or explicitly labeled whole-cycle jump.
History retains all events; jump marks omitted identical scans with exact counts.
No capped traces in presets. Rewind restores snapshots. Presets restart only the
trace; prediction remains independent. Initial/final/disabled, copy success/manual
fallback and unrevealed/revealed/changed answers are localized. No loading/auth/
network execution branch exists. Source is offline embedded.

## Proof and checks
Earliest-match exchange: any valid next match can be replaced by the earliest
one, leaving at least as much suffix. Thus greedy C is maximal and j describes
its unfinished next copy. Equal boundary j sees identical future characters,
so a cycle contributes the same L,G repeatedly; C itself cannot change matching.
At most |s2| distinct j values; first repeated boundary within |s2| blocks.
One jump leaves less than L blocks. Costs O(|s1| min(n1,|s2|)) time,
O(min(n1,|s2|)) auxiliary space (integer-word model). Stored tutorial histories
are extra. Test original Python via independent reachable-prefix DP, exhaustive
and seeded cases, maximum limits, per-character states and JS/Python parity.
Browser: both locales, all controls/options/presets, source/copy/download,
storage failure, 320/390/736/1440, 200% zoom, focus, contrast and local assets.
No LeetCode acceptance or learner outcome claimed.
