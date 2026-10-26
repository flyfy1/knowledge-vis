# #956 Tallest Billboard — author candidate

Product fit: reuse the existing bilingual LeetCode lesson, category leetcode,
stage university. Reader: knows loops and dictionaries, new to difference DP.
Smallest outcome: derive three choices per rod, compress by absolute difference,
explain shorter-side dominance and implement the official Python method.
Design authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher
adjudication; no new product or shared framework. Independent lesson review pending.
Website-design skill read at /home/songyy/Documents/agent-skills/website-design/SKILL.md.

## Verified official contract
2026-10-26, https://leetcode.com/problems/tallest-billboard/ and public
https://leetcode.com/graphql/ questionData(titleSlug: tallest-billboard).
Full unmodified response: tests/evidence/official.json. questionId 993 is the
internal ID; frontend problem ID is 956. Free Hard. Two disjoint subsets of rods
must have equal sum; unused rods allowed; maximize one support's height, or 0.
1 <= n <= 20; 1 <= rods[i] <= 1000; total S <= 5000. No empty input in official
domain. No mutation required. Examples [1,2,3,6]=>6, [1,2,3,4,5,6]=>10, [1,2]=>0.
Observed Python3 interface: class Solution: def tallestBillboard(self, rods:
list[int]) -> int. Python selected by preference; TypeScript and JavaScript also
observed, alongside other languages in capture. No language exception applies.
Authored Chinese title: 最高的广告牌. Source is a submission candidate, not an
assertion of LeetCode acceptance. Browser simulation never executes Python.

## Learning loop and five fields per step
| Step | Already known | Single question | Input / desired output | Action / observation | Conditions |
|---|---|---|---|---|---|
|0|Addition|What height is counted?|[1,2,3], equal supports|Reveal/hide welding 1+2=3; output 3 not 6|Each rod used once or unused|
|1|Three rod destinations|Why avoid full enumeration?|n rods / highest equal sum|Read runnable baseline; manually follow descending greedy 11 vs10|Enumeration 3^n; greedy lacks future knowledge|
|2|Gap and shorter height|Which histories can we safely forget?|Prefix rods / best shorter height at each gap|Change x on fixed (2,1), inspect crossing; advance/rewind presets, choose gap, inspect candidates and witness|Equal gaps share all future options; keep maximum h; read only old row|
|3|Gap-state invariant|Can you transfer the merge rule?|Two states (3,2),(3,5), next x=4 / best short at gap1|Choose then reveal, change clears feedback|Independent exercise, not changed by trace reset|
|4|Transitions|How does the proof become executable code?|Official signature / int|Inspect, copy, download exact Python|O(nS) expected dictionary time, O(S) auxiliary space|

## First-use terms / dependencies
Rod: indivisible input length (0). Support: sum of chosen rods (0).
Disjoint: no rod index belongs to both supports (0).
Baseline: enumerate all three destinations (1), depends on rod exclusivity.
Gap d: absolute support-height difference; shorter height h: min height (2).
State dp[d]: maximum h for a fixed processed prefix (2), depends on gap.
Dominance: at equal gap larger h can match all future choices with no worse
result (2). Snapshot: immutable old-prefix map (2). Locally repeat meanings in
exercise/code sections. S and n defined beside cost in step4.

## Rendering and lifecycle contract
Exact shared palette --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Reuse shared system font
and scales, 14px stage/8px control radii; 8/12/16/20/24/32/48/64px spacing.
Local changes: controls minimum 48px; disabled opacity1 with muted ink;
focus 3px accent2 outline, 4px offset; no animation/shadows/assets.
Table rows stack/read naturally at 320px; code alone may scroll.

Trace: frame k means exactly first k rods completed. Old/new maps and incoming
candidate ledger refer to that same rod. All gaps are shown in the selector;
selected gap shows actual construction plus every incoming transition, including
losing ties. A history ledger retains gap0 values per completed prefix. No omitted
rounds; presets bounded to six rods. Main preset resets trace and selected gap,
not exercise or hand reveal. Back/forward/reset/end restores complete snapshots.
Changing gap changes inspection only. Branch lab fixed d=2,h=1; x only changes
one rod length. No timestamps, async process or playback. Locale changes only
labels, preserving all teaching state, disclosures and focus. Copy success,
manual denied fallback, pre-answer/reveal/change, initial/end disabled are tested
in both locales. Storage denial uses shared in-memory fallback. Network loading,
reconnect and server errors are inapplicable to this static offline lesson.

## Proof and costs
Enumerate skip/taller/shorter, with shorter crossing handled by min(d,x).
All feasible assignments extend exactly one old state; each candidate is attainable.
Equal d, larger h dominates under identical future moves; induction from {0:0}
therefore retains exactly the optimal h per d. Return dp[0]. Use old.items and
new=dp.copy to prevent reuse of the current rod. Baseline O(3^n) time/O(n)
recursive space. Canonical O(nS) expected time/O(S) space for positive S.
Tutorial stores O(nS) state entries and O(n²S) witness indices (small presets only), not the submission's memory.

## Priorities and verification boundary
Highest-return 20%: concrete crossing arithmetic + old/new maps + dominance proof.
P0: complete bilingual reasoning, canonical source parity, exhaustive oracle,
all controls and accessible phone/zoom states; observable done criteria in tests.
P1: incoming candidate witness and retained prefix history, included.
P2/deferred: automatic animation, arbitrary large input, general renderer,
accounts and runtime Python; no learning need and unnecessary runtime cost.
Related links target existing #805 subset-sum and #920 counting-state explanation;
verify their actual section meaning before finalizing labels.
Author checks only. Separate reviewer, real learner outcomes, official submission,
real-device behavior and public deployment remain unverified/out of this run.

## 2026-10-26 · 956-COPY-R1 revision candidate

Owner-selected narrow repair; reuse the approved lesson and tokens. The seven
runtime files matched historical accepted base
`61c1660d36c3e2b77aa2249c0daeeb60133cb0ae` before editing. Only the zh/en
`foot` values change: remove transient author/review prefixes and retain exactly
`本地模拟，无上传、无在线提交。` / `Local simulation, no upload or online submission.`
The footer element and binding remain. P0: preserve algorithm, interface, source
and teaching state byte-for-byte; P1/highest-return slice: this exact bilingual
correction with rendered proof. P2: none. Deferred: unrelated teaching/copy/layout
work, because this request explicitly freezes those semantics and assets.

New candidate `956-copy-r1-20261026` is identified by
`tests/evidence/copy-r1/candidate.json`, with before/after hashes and focused
checks in `tests/SELF-CHECK.md`. No metadata fix was needed: complexity already
is one time-and-space string, and the required non-mutating preflight passed.
Finding **956-COPY-R1: fixed awaiting separate review**. Historical acceptance
and reports are unchanged; this candidate has no independent acceptance or
publication claim. No new feature/layout or independent design gate is opened.
