# #882 lesson brief — candidate 1

Author: Codex; exact model identifier unavailable. Author run only. Independent review pending; no acceptance, submission or publication claim.

## Contract and placement
Reuse the approved `/leetcode/<id>/` lesson pattern from specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Apply website-design SKILL.md. Category leetcode; stage university. Reader knows Python loops, lists and basic graphs; explain heap APIs locally. Outcome: derive weighted shortest paths and capped edge contributions, predict a fresh overlap case, map to official Python callable.

Official URL: https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/ . Public GraphQL captured 2026-10-26 in tests/evidence/official.json, including full statement, examples, metadata and actual codeSnippets. Python3 signature `Solution.reachableNodes(self, edges: list[list[int]], maxMoves: int, n: int) -> int` verified. No mutation requirement; solution leaves input unchanged. Nodes 0..n-1, undirected simple graph, 0<=u<v<n, n=1..3000, m=0..min(n(n-1)/2,10000), cnt=0..10000, M=0..1e9. Empty edges valid. Examples 13,23,1. No modulus or exceptional return; start counts even with zero budget.

## Learning loop and priorities
Hand-walk a single subdivided edge → expanded BFS baseline → compressed shortest distances → union of two prefixes → predict a new overlap → Python. Five sections serve this actual mechanism.
P0/highest-return slice: causal worked chain, reversible distance/edge ledger, capped-union proof, both languages, exact source and browser checks. P1: official examples and boundary presets. P2: decoration omitted. Deferred: arbitrary graph editing and heap animation (would obscure the edge-counting mechanism); real device/novice tests and public delivery require later independent/release work.

## Exact tokens
Import ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared font stack and typography/layout retained. Local controls 48px; disabled opacity 1 with muted ink; focus 3px accent2 +4px offset. No new palette. Local wrapping chain cells use shared panel2/text and accent borders plus textual symbols. No ambient animation.

## Step plan (five required fields per step)
|Step|Already known|Single question|Input → quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Walk one link per move|Which nodes count?|[0,1,3], M → reachable nodes|Change M, see retained chain with ✓/· and distances; M=2 gives 3|Undirected unit expanded links, node0 included|
|1|Expanded chain distances|Why avoid expansion?|n,m,c → work/storage|Read runnable BFS baseline; compare c+1 cost, 1e8 possible insertions|Small graph oracle only; full expansion expensive|
|2|Weighted edge length|How count without expansion?|original graph,M → d and edge ledger|Preset resets; settle forward/back, retain finalized nodes and contribution rows; cap overlap|Positive weights; each edge's inserted nodes unique|
|3|Two prefix union|Does adding two reaches overcount?|fresh triangle → total|Choose before reveal; changing choice clears feedback; locale preserves|Same invariant, no trace answers exposed|
|4|d and capped union|How implement and bound costs?|official callable → int|Inspect/copy/download exact Python; inspect line mapping|Heap lazy entries and full adjacency included in cost|

## First-use dependency table
Graph/node/edge: step0 as dots and links. Subdivision/cnt: step0 number of inserted dots. Distance d: step0 smallest number of links from 0. BFS: step1 layer-by-layer traversal with deque API explained. Weighted edge: step1 length cnt+1. Dijkstra: step2 minimum tentative distance finalization; relaxation is trying a shorter route. Remaining budget a,b: step2 max(0,M-d). Prefix union: step2 first a / last b positions on one edge. Heap: step4 minimum-pair queue, push/pop explained. Terms repeated locally where used.

## Simulation and states
Browser is a deterministic teaching simulation, not execution of solution.py. Min-scan finalization models Dijkstra; internal heap sift/stale pops omitted explicitly. All selected-node relaxations complete per settlement frame; edge accounting starts after all reachable originals finalized. Frames deep-cloned, no truncation, small fixed presets only. Snapshots are tutorial overhead. Hand experiment and trace/prediction independent. All labels/feedback in copy.js pairs. Initial/end disabled states, empty-edge terminal accounting, disconnected, zero budget, copy success/manual fallback and storage denial applicable; loading/reconnect inapplicable (local static assets).

## Verification and review handoff
Run tests/test_solution.py (expanded BFS independent oracle, exhaustive/seeded, invariant checks and max fixtures), tests/browser.cjs (real Chromium, locales, controls, geometry, clipboard and parity), registration validate-only. Tests support OUTPUT_DIR. Evidence and candidate hashes in tests/evidence. These are author self-checks only. Separate reviewer must cold-walk frozen runtime and apply six-dimension >=85 and >=3 each, zero required findings. No agents spawned by author.

## Author completion record
Candidate 2 freezes the repaired narrow preset label and completed causal/bilingual lesson. Numerical and rendered author checks pass; see tests/evidence/SELF-CHECK.md and JSON results. The local select-clipping finding is author-fixed and self-verified, awaiting separate review like the rest of the candidate. Reproducible instructions are in tests/README.md. `python3 -B scripts/register_leetcode_lesson.py 882 --validate-only` passed from repository root (exit 0); no registration ran. Independent reviewer/run, score, acceptance and deployed revision remain pending/not performed. Do not treat the author test suite as an independent reviewer.
