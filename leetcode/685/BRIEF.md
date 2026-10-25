# #685 Redundant Connection II — author brief

Candidate: author v1, 2026-10-25. Independent acceptance pending.
Product verdict: reuse the existing bilingual LeetCode lesson, shared common.js and
style.css. Design authority: specs/reviews/leetcode-all-hard-design-review.md,
dispatcher D1–D10. No new layout or product. Category computing; stage university.
Reader: knows Python lists and basic graph traversal, wants to explain and implement
one repair of an ordered directed tree-plus-edge graph.
Smallest useful outcome: manually reject a bad deletion, derive the two-parent/cycle
split, predict a fresh answer, map it to the executable Python submission.
Official contract and Python3 starter captured in provenance/official.json from
public GraphQL on 2026-10-25. Official URL:
https://leetcode.com/problems/redundant-connection-ii/ . Both examples and all
constraints retained. n=len(edges), 3<=n<=1000, labels 1..n, distinct endpoints,
no duplicate added edge, original rooted directed tree plus exactly one edge.
Return latest removable edge by input order; no mutation required. Python3 supported.

## Sequence and five fields

|Step|Known|One question|Input → desired quantity|Action → observation|Condition|
|---|---|---|---|---|---|
|0|An arrow names a parent and child|Which arrow may we remove?|[[1,2],[1,3],[2,3]] → rooted tree|Try each deletion; compare incoming counts, root and reachable nodes; both valid repairs retained in prose|Tree plus one extra directed edge; choose latest valid|
|1|Rooted-tree definition|How can we verify a candidate without a clever rule?|Each possible deletion → validity|Read executable baseline; compare wrong always-later rule against four-node counterexample|Traversal checks all n nodes and one root|
|2|Deletion baseline, two parents, cycle|Which of at most two candidates must go?|Ordered edges → earlier/later parent, forest components, rejected closure, answer|Change preset (explicit restart), step scan, rewind, end/reset; history and graph retain accepted arrows; compare groups before/after|At most one extra edge; ignore direction only after incoming-edge filtering|
|3|The filtered-forest invariant|Does skipping the later parent remove the cycle?|Fresh [[3,2],[4,2],[2,3],[1,4]] → removable edge|Choose before reveal; reveal specific why; change answer clears feedback; locale preserves it|Different from all worked presets|
|4|The three decision cases|How does the proof become submittable Python?|Same invariant → exact Python and actual cost|Inspect source; copy, fallback selection, download|Official valid-input contract only; no browser execution claim|

## Terms: first appearance and local definitions
Rooted tree, root, parent/child and reachability: step0, repeated at baseline.
Incoming count (indegree): step0 concrete count per child; two-parent conflict: step1/2.
Cycle: step1 closed arrow path; undirected cycle distinguished in step2.
Forest, component: step2, collection of cycle-free connected groups ignoring direction.
Disjoint-set union (DSU), representative, path halving, union by size: step2/4,
with explicit distinction from graph parents. earlier/later: input edge indices,
zero-based in code, one-based display rows. α(n): step4 inverse Ackermann cost.

## State and recovery
Hand deletion is independent of trace and quiz. Trace frames are complete snapshots
after one incoming scan or one DSU edge test; initial and final frames explicit.
Graph always depicts the original directed input. Pending, retained, skipped and
cycle-closing edges have text in a table in addition to stroke styles. No omitted
operations for teaching presets (3–5 nodes). Snapshot storage is teaching overhead,
not canonical O(n) auxiliary memory. Rewind is snapshot selection. Preset resets only
trace. Quiz answer change clears reveal; locale preserves all state and focus.
No network fetch at runtime; no loading/reconnect/async states apply. Copy failure
opens complete readonly selectable source; storage failure falls back to memory.
No autoplay, no motion, no new framework. Empty/invalid inputs outside contract.

## Exact tokens and geometry
Use shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font stack,
1.75 line height, 952px inner max, 24px/16px gutters, 8px control radius,
14px stage radius, 48px control floor, 3px focus with 4px offset. No shadows,
new colors or animation. Shared 13px/14px/19px sizes; SVG labels 18px with a
minimum rendered width 248px. SVG is paired with full textual edge table.
Local overrides remove disabled opacity, increase control/focus legibility.

## Priorities and verification
P0 / highest-return 20%: hand-deletion feedback, two-parent filtering and retained
union history, correct three-case proof, bilingual state fidelity, exact Python.
P1: related deep links and download convenience within approved shell.
P2: none. Deferred: arbitrary graph editor (invalid-input contract distraction),
autoplay (no causal benefit), universal graph engine (one concrete consumer).
Tests: independent reverse-deletion DFS oracle, exhaustive valid n=3/4 graphs,
seeded random trees+edge and max n=1000, canonical Python execution and no mutation,
JS simulation intermediate parent/count/partition invariants, browser both locales,
all presets/endpoints/replay, quiz every option, copy native/fallback, source parity,
320/390/736/1440 widths, 200% zoom, keyboard, forced colors/reduced motion,
storage denial, local links/assets, contrast and screenshots visually inspected.
All evidence is author self-check, not independent review or novice teach-back.
Shared registry/concept map remain untouched per ownership; registration deferred.

## R1 repair candidate — 2026-10-25

Finding 685-R1-001 is fixed awaiting independent re-review. Reuse the approved
surface and tokens; shorten only preset 3's English label to “Answer before last
row,” preserving input-order meaning and 16px type. Bump the local copy asset
query. No new feature/layout or teaching/algorithm change is required.
P0 and highest-return slice: complete closed selected text at 320/390px, both
locales and EN→ZH→EN. P1/P2: none. Deferred: broader UI changes have no finding
or demonstrated need. Regression and source/runtime checks are recorded in
`tests/evidence/r1-fix/self-check.md`; the prior review remains historical evidence.
