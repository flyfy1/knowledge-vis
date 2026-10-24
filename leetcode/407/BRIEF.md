# #407 · Trapping Rain Water II — author brief

Product verdict: reuse the approved bilingual lesson pattern and navigation, with a problem-local elevation table and heap trace. Category computing; stage university. Reader knows loops, matrices and a queue but not minimax paths. Immediate job: derive escape levels, then implement the supported Python submission. No independent acceptance claimed.

Approval contract: specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. Website-design skill applied from ~/Documents/agent-skills/website-design/SKILL.md. No new layout/platform review is requested: the approved sequential explanation, local experiment, retrieval check and source panel are reused.

Official verification: provenance/official.json is the dated, unauthenticated public GraphQL response (statement, both examples, complete language snippets). Python3 explicitly offers `class Solution: def trapRainWater(self, heightMap: list[list[int]]) -> int`. Prefer Python. Nonempty rectangular m×n, 1≤m,n≤200, integer heights 0…20000, unit cell area; return trapped volume, no modulus. No mutation requirement, our solution preserves input. One/two rows or columns have no enclosed cell. Four orthogonal neighbors; exterior is reached through the perimeter. No empty-input requirement; do not invent one. Examples return 4 and 10.

Learning loop: hand-count one cell → see a bent escape route defeat independent rows/columns → flood by integer layers as baseline → share escape information using the lowest frontier → predict a new bottleneck → map to Python.

## Step contract (each has all five fields)
| Step | Already known | Single question | Input → desired quantity | Action → visible observation | Valid conditions |
|---|---|---|---|---|---|
|0|Unit squares and integer heights|How much fits above the center?|3×3 border 3, center 1 → volume|Reveal hand calculation → 3−1=2 cubic units|Open exterior, four-neighbor flow, unit area|
|1|Water needs an escape route|Why do straight row/column walls fail?|Bent corridor of height 1 ending at gate 2 → retained water|Read coordinate route; compare wrong level 5 with actual 2; inspect baseline layers|Paths may turn; no diagonal edges|
|2|A path's tallest ground limits its escape level|Which boundary can safely expand next?|Same tiny/bent maps and four boundary presets → fixed levels and accumulated volume|Step pop, rewind, reset/end, change preset/gate → accumulated H/L/W, frontier and causal ledger|Frames after a full heap pop and all first discoveries; small complete simulations only|
|3|Lowest-frontier proof|Can an internal ridge raise the level beyond an outer gate?|Fresh 3×5 map → two interior water depths and total|Choose, explicitly reveal, then change answer → feedback clears; language preserves choice|Same four-neighbor, nonnegative integer contract|
|4|Level transition and invariant|How does the visible expansion become submission code?|Python source → callable solution and justified costs|Inspect, copy/fallback, download; related anchors|Official Python3; tests execute Python separately from simulation|

## First-use dependencies (redefined locally in each step)
- height / volume (0): ground altitude / unit-area depth sum.
- escape route and bottleneck (1): orthogonal path to edge / largest ground on path.
- escape level L (1): minimum bottleneck over all such paths; depth L−H.
- layer baseline (1): flood each integer layer from open edge; unconnected cells retain one unit.
- frontier (2): discovered but not yet popped cells with already fixed escape level.
- min-heap (2): queue removing least L; internal tree order need not be fully sorted.
- visited/seen (2): fixed at first discovery; proof explains why no later improvement exists.

## Visual/state semantics
Simulation, not execution of Python. H is immutable ground; L and W are shown only once discovered; W=L−H, B boundary, D discovered, P most recently popped. Borders/letters indicate activity, never fake water. Grid coordinates zero-based top-to-bottom / left-to-right. Heap panel is sorted for reading, not literal heap-array order. Each frame is a deep snapshot after one pop plus its neighbor discoveries. No skipped operations. History retains all pops and all contributions; small presets ≤25 cells, official first example 18. Gate changes actual terrain for bent preset only and explicitly restart that trace. Other preset changes restart trace; independent hand reveal and prediction preserved. No timer or autoplay. Initial/terminal controls disabled natively. Language rerenders data without replacing focused controls. No loading/auth/network runtime branches.

## Exact token contract
Reuse leetcode/style.css tokens: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack inherited; source ui-monospace. Existing 8/14px radii, 8/12/16/20/24px spacing, 1000/952px content widths. No new color literals. Local overrides: min control height 48px, disabled opacity 1, 3px focus, fixed readable cell minimum with explicit keyboard scroll on narrow grids. No decorative motion/shadows/assets. Shared + local CSS <25000 bytes. Contrast measured from actual pairs in tests.

P0/highest-return 20%: causal path example, invariant, reversible accumulated trace, bilingual feedback, canonical parity and independent oracle. Done when numerical and real-browser self-checks pass. P1: all official presets, gate experiment and keyboard scrolling (included). P2: decoration (none). Deferred: universal grid framework, autoplay, backend execution, learner analytics, registry/CONCEPT-MAP edits (outside ownership); metadata provides local anchors for dispatcher. Independent teaching acceptance, LeetCode submission, production and actual learner outcomes remain unverified.

## Verification plan
Independent layer-flood oracle vs Python and JS per-cell escape levels; exhaustive 3×3 ternary maps, seeded rectangles, official examples, flat/thin/all-zero/max bowl and input immutability. Snapshot invariants: unique boundary seeds, nondecreasing pops, discovered levels equal oracle, sum of known depths equals accumulated volume, unique queue/visited cells and parent transition. Real Playwright both languages, all presets/endpoints, gate, prediction choices/change, clipboard success/denial, blocked storage, offline source, download parity, 320/390/736/1440 and zoom, keyboard/focus/deep links/assets and contrast. Tests accept OUTPUT_DIR. Evidence is self-check only.
