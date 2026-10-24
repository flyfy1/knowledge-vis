# #391 Perfect Rectangle — author candidate

## Contract and placement
Reuse the approved lesson shell and dispatcher adjudication in
`specs/reviews/leetcode-all-hard-design-review.md` (D3, D6, D8).
Product verdict: reuse; one local lesson, no shared framework or registry edits.
Category: computing / algorithms. Stage: university. Reader: knows rectangles,
loops and sets; should reconstruct an exact-cover test and its sufficiency proof.
Loop: hand-count a 2×2 tiling → compare independent coverage baseline → derive
odd-corner state → reversible trace → unseen prediction → executable Python.
This author self-check is not independent acceptance or learner evidence.

## Verified source
Official URL: https://leetcode.com/problems/perfect-rectangle/
Access: 2026-10-25, public page plus public GraphQL; full captured response in
`tests/evidence/official.json`, including exact selector codeSnippets.
Python3 observed: `class Solution: def isRectangleCover(self, rectangles: list[list[int]]) -> bool`.
Canonical language Python; TypeScript/JavaScript also observed, no exception applies.
Input nonempty: 1..20,000 positive-area axis-aligned integer rectangles [x,y,a,b];
−100,000 ≤ x < a ≤ 100,000 and likewise y < b. Output bool: exact rectangular
cover, no positive-area gaps/overlaps; touching edges/corners allowed. No modulus,
mutation requirement or empty-input case. Official examples: true, false (gap),
false (overlap), all retained in oracle tests. No submission/acceptance claim.

## Steps (five fields each)
| Step | Already known | Single question | Input → output | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0 hand|Coordinates and area|Do three tiles cover a 2×2 square once?|[0,0,1,2], [1,0,2,1], [1,1,2,2] → bool|Reveal hand calculation: areas 2+1+1=4; four cells each 1|Integer positive-area tiles; shared seams permitted|
|1 baseline|Cover means count 1 everywhere|Why isn't area alone enough?|Same tiles; duplicate-left counterexample → coverage grid|Read baseline and compare counts [2,0] with equal area|Unit-grid baseline correct for official integer inputs but coordinate-span dependent|
|2 invariant and trace|Corners and counts|What summary detects uncovered regions without visiting them?|Preset rectangles → prefix area and odd corner set|Next toggles each corner; grid, before/after set and retained ledger accumulate; rewind restores snapshots|Oddness plus area only checked after all tiles; trace is simulation|
|3 transfer|Both tests needed|Which test rejects a fresh balanced gap/overlap?|[0,0,3,1], [0,1,1,2], [2,1,3,2], [0,1,1,2] → choose|Predict, reveal explanation, change clears feedback|Answer fixed by full odd-corner set; isolated from trace|
|4 implementation|Invariant and proof|How does the proof become Python?|Official signature → exact source and costs|Copy/download code, follow variable mapping|Expected hash-set costs, O(n) space; no input mutation|

## First-use dependency table
Coordinates [x,y,a,b], axis-aligned and exact cover: step0, locally defined.
Area (square units): step0; bounding box (min/max outer rectangle): step1.
Coverage count (number of tiles containing an interior point): step1, repeated step2.
Odd corner set (coordinates seen an odd number of times), toggle (add/remove): step2.
Invariant (claim true after each rectangle): step2; parity (odd/even): step2 proof.
Prefix XOR (odd number of selected points southwest of cell): step2, defined in prose.
area, corners, min_x/max_x/min_y/max_y: step4 mapping, redefined locally.

## Mechanism and proof obligations
Sum area alone fails: two copies of [0,0,1,2] plus [2,0,3,2] fill area 6
inside a 3×2 box but leave middle empty and cover left twice.
Odd corners alone fail: three copies of [0,0,1,1] leave only outer corners but area 3≠1.
Maintain total area and symmetric difference of all corner coordinates. For a cell
between all input x/y lines, count the odd corners southwest of an interior point:
each tile contributes 1 mod 2 exactly when that point is inside it (0 outside,
2 or 4 otherwise). Matching box corners therefore forces odd positive coverage
inside the box. Equal area then eliminates all counts 3,5,…; hence count=1.
Necessity follows from single coverage and the same invertible prefix parity rule
(or local corner configurations: 1 outside, 2 at a T-junction, 4 at a cross).
Proof applies to interiors; rectangles are closed, finite, axis-aligned, so shared
boundaries do not constitute gaps/overlaps of positive area.

## Visual/state contract
Local SVG unit grid: x right, y up; numbers are coverage counts, dot+coordinate
labels are odd corners; bounding box dashed. Presets at most 5 tiles and spans 4;
no omissions, no free-text parsing. Every prefix is a completed rectangle (four
toggles atomically); before/after sets, individual toggle table and cumulative
history expose transitions. Grid uses full preset bounds; readout explicitly uses
processed-prefix bounds. Empty prefix has no box. Simulation does not run Python.
All controls native, 48px minimum, disabled endpoints legible, no timers/motion.
Locale preserves all state, choice/reveal and focus. Clipboard rejection exposes
selectable exact source. No network/loading/reconnect state needed for static UI.

## Exact reused tokens and layout
Shared style.css: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547,
text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93. No additional palette. Same system font stack,
body line-height 1.75, max content 952px, sections 64px/24px (mobile 44px/16px),
card radius 14px, control radius 8px. No shadows or animation. Focus 3px accent2
with 4px offset. Local overrides: disabled opacity 1, 48px controls, SVG labels
16px at fixed minimum width with keyboard-accessible contained scrolling.

## Priorities and validation
P0/highest-return 20%: truthful corner/coverage diagram, causal sufficiency proof,
source parity, both locales, exact controls and reproducible oracle/browser checks.
P1: retained toggle/history ledger, related existing anchors.
P2: none. Deferred: arbitrary huge diagrams (UI-thread cost), auto-play (no need),
external runtimes/accounts (outside task). No new product/design review required
for this approved reused layout; separate independent teaching review still pending.

Tests: independent unit-cell coverage oracle; exhaustive small multisets; seeded
random rectangles; official/boundary/max cases; prefix area/oddness and snapshot
reversibility; browser both locales/presets/endpoints/reveal/copy/fallback/storage;
320/390/736/1440, 200% zoom, keyboard/focus/forced colors, links, local requests,
measured contrast, visually inspected screenshots. Tests accept OUTPUT_DIR.
Candidate hashes and actual results recorded in SELF-CHECK.md and evidence.
