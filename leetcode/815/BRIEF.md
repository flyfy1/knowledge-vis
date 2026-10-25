# #815 Bus Routes — author brief

## Contract and product verdict
Reuse the approved bilingual LeetCode lesson at `/leetcode/815/`; category computing / collection leetcode, stage university. Reader: knows Python lists, sets and loops, new to shortest-path search. Job: reconstruct a minimum-bus algorithm and transfer its invariant to an unseen trip. Learning loop: hand-board routes → distinguish stops from buses → avoid pairwise route intersections → inspect cumulative BFS layers → predict → map to executable Python.
Design authority: `specs/reviews/leetcode-all-hard-design-review.md`, including dispatcher adjudication; no new layout or product requested. Website-design skill applied. This is author work, independent lesson review pending.

## Official verification
2026-10-26: https://leetcode.com/problems/bus-routes/ and public https://leetcode.com/graphql/; full response in `tests/evidence/official.json`, including Python3 selector snippet. Verified callable: `class Solution: numBusesToDestination(self, routes: list[list[int]], source: int, target: int) -> int`.
Buses repeat their routes forever; traveler starts off-bus; only bus travel allowed; minimize buses taken; impossible returns -1. If source equals target, zero boarding suffices even if absent from routes. Examples: [[1,2,7],[3,6,7]], 1→6 gives 2; [[7,12],[4,5,15],[6],[15,19],[9,12,13]], 15→12 gives -1. Constraints: 1..500 routes, each length 1..100000, total length ≤100000, unique stops within each route, stop/source/target IDs in [0,1000000). Empty route arrays are outside the contract. Python is supported and selected; no non-Python contract needed. No actual submission/acceptance claimed.

## Five steps, each with five fields
|Step|Already known|Single question|Input / desired output|Action / expected observation|Conditions|
|---|---|---|---|---|---|
|0 Hand trip|Lists contain stop IDs|How many boardings take 1 to 6?|A=[1,7], B=[7,6], source1 target6 / boardings|Board A, then B; reachable chips accumulate 1,7 then6. Undo restores everything.|Board only a route intersecting reached stops; no time limit; manual count is this journey, not promised optimal.|
|1 Baseline|One boarding unlocks an entire route|What should a search edge cost?|Routes / minimum boardings|Inspect wrong stop-count rule and pairwise-route baseline; compare 3 hops on one route vs two hops via two buses.|Infinite cyclic travel makes route order irrelevant to boarding count. Baseline is correct but pairwise intersections cost O(RM+R²).|
|2 Layers|Boarding unlocks stops|Why can a route be scanned just once?|Presets / minimum first-discovery bus distance|Next expands one complete layer; retain route ledger and discovered-stop distances; back/reset/end/preset. Watch a shared route skipped after first use.|Uniform boarding cost, FIFO layers; index built once; no schedules or walking. Simulation completes layers, Python may stop during discovery.|
|3 Transfer|First discovery is minimum|Does a long ride beat two short rides?|Fresh [2,4,9,11],[2,8],[8,11], 2→11 / min buses|Choose 0/2/1 then reveal; change clears feedback; language preserves choice and reveal.|No hop/time objective; exact same invariant.|
|4 Code|Layer invariant|Where is the saved work in Python?|Canonical source / implementation and cost|Source disclosure, exact copy, manual fallback, download; map route/stop sets to proof.|Expected O(M+R) hash-based time and auxiliary space; snapshots are extra tutorial storage.|

## First-use terms and dependencies
- Stop: numbered place a bus visits; route: cyclic list visited by one bus (step0).
- Boarding: getting on a bus, the unit of the requested answer (step0).
- Route graph: one node per bus, edge if buses share a stop; BFS: expand all possibilities with the same number of boardings before the next count (step1).
- Inverted index `by_stop`: maps stop to buses serving it; frontier: newly reached stops with the same minimum boarding count (step2).
- `seen_stops`: already discovered stop IDs; `used_routes`: routes already expanded; both locally defined at step2/4.
- R: route count; M: total route entries; O notation: growth bound (steps1/4).

## Invariant and visible state
At entry to layer d, frontier stops have minimum boarding count d; all stops at lower distance were expanded. Scanning an unused route touching frontier reaches each of its stops in at most d+1. Any trip with d+1 boardings has a last route reached after at most d, so the search cannot miss it. If an earlier route expansion already exposed every stop, expanding it later adds nothing. Mark on enqueue, not dequeue, to avoid duplicates. Empty frontier means no bus-only trip remains. Trace retains immutable cumulative stop distances, route activation layers and per-layer causes. Initial source is distance0; no buses activated. Target=source is immediately terminal.

## Exact reused tokens and UI contract
Use `../style.css` and `../common.js`. Palette exactly --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font stack, body 1.75 line-height; inherited clamp headings; spacings 8/12/16/20/24/32/64px; radius8/14px. Local override disabled opacity1, controls ≥48px, focus3px accent2 offset4px. Inherited secondary section #0a0e14 and explanatory ink #c9d4e2 are also retained exactly. No new colors, shadows or animation. Solid backgrounds; no ambient motion.
Language uses knowledge-lang with guarded storage; preserve experiment state and focus. Text, system feedback and accessible labels bilingual. Native selects use short names plus full visible input below; no long clipped option contract. Reflow route rows and chips at320/390/736/1440 and CSS zoom2.
States: manual initial/boarded/unavailable/undo; trace initial/middle/found/exhausted/equal-source-target; prediction unselected/selected/revealed-correct/revealed-wrong/changed; copy success/fallback. Both locales cover all; loading/auth/reconnect are inapplicable to this static local page. Reset/presets affect only their own experiment. No timers.

## Priorities and scope
P0 / highest-return20%: actual route expansion, cumulative distances, causal proof, bilingual truthful states, canonical code and independent oracle/browser evidence. P1: related BFS deep links and cost comparison. P2: none. Deferred: editable arbitrary networks, automatic animation, universal graph renderer and performance charts (not needed for the invariant). No shared edits, registration, deployment or acceptance claims.

## Validation plan
Independent route-intersection Floyd-Warshall oracle, exhaustive tiny route families, seeded cases, official examples, maximum M/R, intermediate trace distance/route invariants and source mirror parity. Real Chromium both locales and every preset, reversibility and endpoints; prediction reveal/change/locale, keyboard, copy sentinel/native fallback each locale, download, offline/blocked storage, local links/assets, measured contrast and widths/zoom. Evidence runners accept EVIDENCE_DIR. Visually inspect screenshots. Metadata validate-only preflight from root; freeze hashes only after fixes. No real learner or independent acceptance implied.

Author layout refinement: narrow step/stage/route padding8px; solid nav --bg; language targets min-width48px; summary and related links min-height48px. These preserve shared tokens.
