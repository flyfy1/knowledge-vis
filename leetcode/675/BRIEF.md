# #675 · Cut Off Trees for Golf Event

Author candidate; independent teaching review pending. Reuse the approved collection pattern and dispatcher adjudication in specs/reviews/leetcode-all-hard-design-review.md; no new product or framework. Category computing, stage university. Reader knows Python loops and grids; smallest outcome: reconstruct why sorted targets and shortest legs yield a globally shortest legal walk.

Official source: https://leetcode.com/problems/cut-off-trees-for-golf-event/ . Public GraphQL captured with timezone-qualified access date in provenance/official.json, including actual Python3 selector template `Solution.cutOffTree(self, forest: list[list[int]]) -> int`. Python is canonical. Official examples yield 6, -1, 6. Dimensions 1..50, values 0..10^9, distinct tree heights, at least one tree. Four orthogonal moves; trees are walkable before cutting; cutting costs no walking steps and changes the cell to 1. Start (0,0) can contain a tree or a blocked cell. No input mutation required by interface; solution preserves forest. Empty/no-tree inputs are outside contract.

## Learning loop / five fields per step

|Step|Already known|Single question|Input → quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Grid values and four moves defined locally|Why walk past a taller tree?|[1,3,2] → minimum walking steps|Toggle route reveal → positions 0→1→2→1 and 2+1=3|Cutting order, not visiting order|
|1|Tiny route|Why can legs be solved independently?|Sorted unique targets → lower bound and attainable total|Read concrete detour and baseline comparison|All positive cells stay passable; no path-dependent cost|
|2|A leg is travel between consecutive required cuts|How do we find the shortest leg?|Preset grid → distance layers, completed-leg ledger|Next layer/cut, back, end, reset; preset restarts only trace → accumulated distance cells and cuts persist|Unit-cost orthogonal moves, zero cells blocked|
|3|Shortest-leg invariant defined again|Can the rule transfer to a new forest?|[[1,5,2],[0,0,3]] → full minimum|Choose 3/5/7 then reveal; change choice clears feedback|Independent exercise; locale preserves selection/reveal|
|4|Queue and distance defined locally|How does the proof become a submission?|Canonical source → callable and costs|Open, copy/fallback, download → exact source|Python3 official interface; simulation is not execution|

## Term dependency / local definitions

Step 0: cell (row,column, zero based), height, walk vs cut. Step 1: leg (travel between required cuts), lower bound (unavoidable minimum), baseline (simple correct reference), graph (positive cells linked by legal moves). Step 2: BFS (breadth-first search expands cells by distance), layer (cells at one distance), frontier (current layer), queue (first in first out), discovered (distance first assigned), invariant (fact retained after each layer). Step 3 repeats walkability and leg rule. Step 4 repeats queue, seen (discovered cells), T (tree count), V=m*n (cell count).

## Exact token contract

Use ../style.css roles unchanged: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing system font, title clamp(28px,5vw,46px), body line-height 1.75. Existing spacing 8/12/16/20/24/64px, control radius 8px, stage radius 14px. Local board uses those values only; boundaries use --muted for contrast, focus 3px --accent2 offset 4px. Disabled controls opaque with muted text. No shadow, animation, or external assets. Local override shared minimum 44→48px per adopted D8.

## State / simulation contract

Deterministic full snapshots after initialization, after completing one BFS distance layer, after recording a reached target's cut, or after proving unreachable. Board retains original heights and labeled discovered distances; cuts use a visible × and legend. Current target uses an outlined T; frontier uses F. A frame describes one instant; current leg distance is not completed walking total. Ledger retains completed legs; impossible final answer is -1 even if completed total is positive. Back restores every quantity. All presets are tiny and untruncated. Tutorial snapshot memory differs from submission space. Locale only relabels existing state; no autoplay. Source display is immediately available offline. Clipboard error has manual focused full-source textarea; no fake copy success.

Branch matrix, both locales: initial, layer, cut, success, unreachable, first/last disabled; prediction none/selected/revealed/change/reset; clipboard success/manual fallback; storage unavailable. Loading/reconnect/expiry inapplicable to static local simulation. Browser and Python self-check evidence stays local; no actual novice results, independent acceptance, LeetCode submission or deployment claim.

## Priorities

P0: causal route, independent-leg proof, reversible BFS board+ledger, fresh prediction, equivalent bilingual copy, executable Python and exact source parity, device/access tests. Highest-return 20%: taller-tree crossing plus retained distance layers exposes the key mechanism. P1: related concept anchors and reproducible oracle evidence. P2: none. Deferred: autoplay, arbitrary grid editor, general renderer and decoration; they add state without improving this small observation task. No registry or concept-map mutation in author scope.
