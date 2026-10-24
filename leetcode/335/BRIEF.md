# #335 Self Crossing — author brief

## Contract and scope
Reuse approved shell and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md (D3, D6, D8). Build one local geometry lesson; no shared framework or registry edits. Category computing; stage university. Reader knows arrays, comparisons and Cartesian coordinates. Smallest useful outcome: hand-draw a turn sequence, derive three inclusive intersection tests, then implement the supported Python method.

Official source: https://leetcode.com/problems/self-crossing/, public GraphQL captured in provenance/official.json on 2026-10-25 (capture contains exact timezone timestamp). Observed Python3 starter: `class Solution: def isSelfCrossing(self, distance: list[int]) -> bool`. n in 1…100000; every distance in 1…100000; start (0,0), turn north/west/south/east repeatedly. Official examples [2,1,1,2] true, [1,2,3,4] false, [1,1,1,2,1] true. Touching/overlap are intersections; normal adjacent shared vertices do not count. No mutation required, no empty-array contract. Chinese title is authored translation.

Learning loop: calculate → compare geometric spans → predict → reveal → map predicates to code. Five sections fit this concrete causal sequence, not an imposed optimization narrative.

## Exact token and lifecycle contract
Use ../style.css and ../common.js unchanged. Colors: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Inherited explain #c9d4e2 and alternating #0a0e14. System font stack inherited; body 1rem/1.75, heading clamp inherited; local 16/24px spacing, 8/14px radii, no shadows or motion. Inherited low disabled opacity replaced with opaque muted text/panel2; 48px minimum controls, 3px accent2 focus. No new palette. Forced-colors uses system Canvas/CanvasText/Highlight for the SVG background, labels and strokes. Local SVG uses these exact tokens, numbered segment labels and a coordinate ledger, so color is redundant.

State: deterministic bounded presets (at most 7 segments), at=completed segment count, stop at first crossing, retain whole prefix. Previous/Next/Reset/End are reversible; preset or final-length change visibly restarts only trace. Locale preserves all state, prediction, source disclosure and focus. No timers, network fetches, loading or reconnect branches. Clipboard success/denial and storage denial are applicable. Prediction is independent, reveal requires a choice, changing answer clears feedback. Source is embedded exact canonical bytes.

## Steps — five required fields each
|Step|Already known|Single question|Input → requested value|Action → visible observation|Validity|
|---|---|---|---|---|---|
|0 Hand drawing and baseline|Lengths and turns|What counts as a crossing?|[2,1,1,2] → first intersecting pair|Read endpoint arithmetic, follow trace link → segment 3 hits segment 0 at (0,1)|Positive lengths; adjacent join excluded, nonadjacent touch included|
|1 Derive local tests|Coordinate spans|Which old segments can the first crossing reach?|Last six lengths → three predicates|Read normalized coordinates and boundary proof; compare wrong i−3-only rule|Only while earlier prefix is simple; all turns left, positive lengths|
|2 Reversible experiment|Three cases|Which inclusive inequality changes the result?|Preset and final length 1…6 → completed path and predicate values|Change final length, step/end/rewind → full retained prefix, tested pair and actual numeric inequalities|Small complete simulation, no skipped events; Python execution is separate|
|3 Transfer|First-crossing invariant|Can a fifth-back contact be found without a third-back crossing?|[1,1,3,2,2,1] → earliest collision and pair|Choose before reveal → compare pair 5/0 with distractors; change choice clears reveal|New case not one of trace presets; touching counts|
|4 Implementation and costs|Predicates and first crossing proof|How do tests become a submission?|Python source → bool|Open/copy/download exact source; map A/B/C comments|Official n/length limits; no input mutation; linear time/constant auxiliary storage|

## Term dependencies and first appearances
- Step0: segment = one straight move; x east/y north in meters; index = zero-based move number; closed span includes endpoints. Baseline = compare each new segment with all nonadjacent older ones.
- Step1 (redefined locally): first crossing = earliest move intersecting an older nonadjacent move; invariant = fact true before every loop iteration (prefix has no intersection); spiral = left-turn path whose successive same-direction sides expand or contract; exposed boundary = old sides reachable without crossing a nearer old side. a…f are six recent lengths, i current index.
- Step2: completed count k, segment i=k−1, A/B/C = i−3/i−4/i−5 tests. SVG axes and ordinal labels defined beside plot; numeric pair table is textual equivalent.
- Step3: first-crossing invariant and nonadjacent contact are restated.
- Step4: auxiliary space = extra submission storage, distinct from input and browser prefix snapshots.

## Proof and experiments
Derive predicates from current segment (0,0)→(f,0), previous start (0,e), then older vertices (d,e), (d,e−c), (d−b,e−c), (d−b,e−c+a). Explain why 1-back and 2-back cannot be new crossings, and why, before the first crossing, exposed spiral boundary reduces to 3/4/5-back (outward, equal transition, inward). Do not present any single inequality as sufficient. Wrong rule: only inspect i−3 misses [1,1,2,1,1] overlap with i−4. The independent oracle instead uses coordinates and generic closed segment intersections against every nonadjacent old segment; exhaustive tests also check the first event and the existence of a 3/4/5-back contact. A first crossing can simultaneously meet an even older side at a shared vertex; the local tests need only detect a contact, not enumerate all of them.

## Priorities and limits
P0/highest-return slice: causal three-case derivation, genuine geometry rendering with coordinate text, bilingual reversible controls, exact Python, independent oracle and real browser evidence. P1: final-length boundary experiment and measured accessibility. P2: none. Deferred: free-form unbounded drawing (unnecessary validation burden), automatic playback (manual causal comparison suffices), universal geometry engine, backend execution and learner mastery claims. No actual novice results, independent acceptance, LeetCode submission or public deployment claimed. Separate reviewer receives frozen candidate and evidence after cold walkthrough.
