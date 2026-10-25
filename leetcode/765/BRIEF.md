# #765 · Couples Holding Hands — author brief

Category: leetcode / computing. Stage: university. Audience: knows Python lists,
loops and swapping; no graph prerequisites. Verdict: reuse the approved lesson
shell and exact shared tokens, with a local seat-pair renderer, no new framework.
Design authority: specs/reviews/leetcode-all-hard-design-review.md, dispatcher
adjudication. This is an author candidate, independent lesson review pending.

Official contract verified 2026-10-25 from public GraphQL; full response and all
observed submission snippets in provenance/official.json. Python3 explicitly
provides Solution.minSwapsCouples(self, row: list[int]) -> int. Prefer Python.
There are n couples, 2 <= n <= 30, row is a permutation of 0..2n-1. Couples are
(0,1),(2,3),…; seat pairs are positions (0,1),(2,3),… . Any two people may swap;
return minimum swaps. Examples [0,2,1,3] -> 1; [3,2,0,1] -> 0. No empty/duplicate
input within contract. Either order within a couple is allowed. This solution
mutates row, which is permitted; no requirement to return the arrangement.

Learning loop: hand-swap four people → recognize repeated partner search →
observe a growing fixed prefix and direct position lookup → prove optimality
using cycles → predict a new case → map to actual Python.

## Sequence (five required fields per section)

| Step | Already known | Single question | Input / desired quantity | Action / visible observation | Conditions |
|---|---|---|---|---|---|
|0|IDs and seats|What counts as one swap?|[0,2,1,3] / minimum exchanges|Reveal then undo swap 1↔2; both seat pairs change|Any two people may exchange; fixed seat pairs|
|1|Hand exchange|What work does a plain implementation repeat?|Same row / partner search cost|Read runnable baseline and four-cycle wrong-rule example|Valid permutations; n is couples; scan baseline O(n²)|
|2|Partner and seat-pair distinction|How can we repair each pair once?|Five complete small presets / row, fixed prefix, position map, swaps|Forward/back/end/reset; see before/after and retained ledger, check pos updates|At most eight people in teaching UI; no omitted events|
|3|Fixed prefix and couple labels|Why is this also the minimum?|Four-couple cycles / lower bound n-c|Predict independent row, reveal components and explanation, change answer|Degree two multigraph with loops/multiple edges, arbitrary swaps|
|4|Invariant and bound|How does the Python implement it?|Canonical source / submission and costs|Read, copy, manual fallback, download; map lookup and updates|Python3 interface; O(n) time, O(n) extra space; mutates row|

## First-use dependency table

| Term | First use | Plain definition / dependency |
|---|---|---|
|Person ID / seat index|0|Value is a person; index is a position, both zero-based|
|Couple / seat pair|0|IDs 2k and 2k+1 belong together; seats 2k and 2k+1 form one block|
|Partner, XOR|1|x^1 toggles last bit: even x+1, odd x-1|
|Position map pos|2|pos[x] is current seat holding person x; needs IDs|
|Invariant / fixed prefix|2|A statement true after each processed pair: earlier blocks contain couples and map stays exact|
|Vertex / edge / component / cycle|3|Couple label; one seat block joining labels; connected group; closed chain, including loop/two parallel edges|
|Lower bound|3|Number no valid algorithm can beat, from at most one new component per swap|

Each step restates essential local meanings; graph proof follows concrete data,
not a presumed knowledge of union-find. Graph is proof-only, not a hidden extra
algorithm in the submitted solution. Counterexample to ceil(bad blocks/2):
[0,2,3,4,5,6,7,1] has 4 bad blocks but requires 3 swaps. Distinguish feasibility
(prefix invariant) from optimality (component lower bound and matching action).
Fresh transfer: [4,1,2,7,0,5,6,3], components {0,2},{1,3}, answer 2.

## UI/state and visual contract

Shared ../common.js handles locale; ../style.css supplies exact tokens:
--bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547,
--text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454,
--good #7ee2a8, --bad #ff7a93. No new color literals. System font and shared
spacing/radius/type scale. Local controls minimum 48px; disabled opacity 1,
muted text; 3px offset accent2 focus including textarea. No animation.
Seat pairs reflow as intact blocks; values, seats and completed/pending labels
are textual. Frames are initial or after one complete seat-block decision,
including pos update. Before/after rows and cumulative action ledger retained.
Reset restores all trace quantities; preset explicitly restarts only trace;
hand and quiz independent. Locale preserves all selections, reveal, disclosure,
manual-copy visibility and focus. Quiz answer change clears feedback. Initial,
skip, swap, final, both endpoints, hidden/revealed/changed quiz, copy success /
denial fallback, storage denial are applicable branches in both languages.
No loading/reconnect/async execution states: page has no runtime fetch or service.
Simulation is not Python execution. n is couple count; snapshot storage O(n²)
for O(n) frames each containing O(n) items, separate from submission O(n) memory.

P0/highest-return slice: accurate before/after seat blocks, exact position map,
prefix invariant, proof and transfer, bilingual source parity, actual browser
and independent-oracle tests. P1: sticky active section and precise related
anchors. P2: no decoration planned. Deferred: custom large input (bounded
complete presets suffice), autoplay (manual causality is clearer), online code
execution (unneeded service), novice mastery claims (no learner study).

## Verification plan

Execute Python against BFS all-swaps oracle (independent of greedy/cycle count),
small exhaustive permutations, seeded cases, max n=30 and trace intermediate
invariants. Browser core checked against separately exported oracle fixtures.
Real Chromium via preview root, all presets and endpoints/rewind, both locales,
quiz/copy/fallback/keyboard/download, local requests, widths 320/390/736/1440,
200% browser zoom, measured calibrated contrast and screenshot inspection.
Tests accept OUTPUT_DIR for generated evidence. Run non-mutating registration
preflight only. Related links point to actual rendered #41 placement and local proof/trace anchors; shared files untouched.

Chinese title is an authored translation; official English title and interface are captured.

## 2026-10-25 margin repair candidate

Dispatcher-adopted scope: `765-MAC-MARGIN-01` in
`specs/reviews/765-review-mac-margin-repair-request-20261025.md`, following the
independent Mac diagnosis. Reuse the approved design and all five preset identities.
The learner still compares partner swaps on the eight-person counterexample.
P0/highest-return change: English preset 3 becomes `8 people: counterexample`;
bump only the copy asset reference. Chinese meaning, tokens, font, padding,
algorithm, trace and original 24px-reserve assertion stay unchanged.
P1/P2: none. Deferred: font/layout changes, because the adopted label repair
requires neither. Self-check mapping and verification limits are appended in
`tests/SELF-CHECK.md`; candidate hashes are in
`tests/evidence/margin-repair-20261025/candidate.json`.
This is a new repair candidate, not independent acceptance. Native Mac full-suite
verification is still required; Linux and synthetic font checks cannot replace it.
