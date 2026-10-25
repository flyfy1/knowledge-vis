# #778 Swim in Rising Water — author brief

Product fit: reuse the approved LeetCode collection lesson pattern, as adjudicated
in specs/reviews/leetcode-all-hard-design-review.md (D3, D6, D8). No new shared
framework. Category: computing / collection leetcode; stage: university.
Audience: a reader who knows Python loops, lists and coordinates. Outcome:
derive minimum-maximum path relaxation, predict a new grid, implement the official
Python interface. This candidate is author work; independent review is pending.

Official verification: provenance/official.json captures the public GraphQL response,
access timestamp, statement, constraints, both examples and actual codeSnippets.
Frontend ID is 778 (internal questionId 794). Python3 supports
Solution.swimInWater(self, grid: list[list[int]]) -> int. No mutation requirement;
implementation preserves grid. Square, nonempty, n=1..50; unique heights in
0..n²−1. Four directions, both endpoints submerged, travel takes zero time.

## Sequence (five fields per step)

|Step|Already known|Single question|Input → desired quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Coordinates, rising water|When can we first cross this 2×2?|[[0,2],[1,3]] → earliest t|Reveal hand calculation → both routes need height 3|Four directions, instant travel|
|1|Path cost is largest height|What work can a simple correct algorithm repeat?|Same grid → first connected threshold|Read executable threshold flood baseline; compare irreversible lowest-neighbor walk on 3×3|Unique bounded integer heights; no diagonal|
|2|A path extends by taking max|Which tentative value can become permanent?|Same grid plus presets → final minimum threshold|Pop/relax, rewind, endpoint, reset → retained settled cells, complete history, candidate old/new values|Nonnegative heights; extension never lowers cost|
|3|Settled minima cannot improve|Can the invariant solve a fresh grid?|New 3×3 → earliest t|Choose then reveal, change answer → invalidated feedback|Exercise independent of trace|
|4|Relaxation and finality|How does this become official Python?|dist, heap, grid → int|Read/copy/download exact source → code mapping|Valid official inputs, no mutation|

## Terms and dependencies
- Step 0: elevation = cell height; t = water level/time; path = adjacent cells.
- Step 1: bottleneck = maximum height on one path, threshold = tested t;
  flood search = enumerate cells reachable at a fixed threshold.
- Step 2: dist[r][c] = best discovered path bottleneck, ∞ = undiscovered;
  settled = proven minimum; frontier = discovered pending candidates;
  relaxation = replace a larger tentative value; min-heap = structure extracting
  least key. Each is explained locally again in the code section as needed.
- Step 3: repeat bottleneck definition and permanent-minimum rule locally.

## State and rendering
Each frame is after one non-stale minimum pop and all its legal relaxations,
except target-pop which returns immediately, exactly as canonical source.
Frame zero has only start tentative. Stable tie order: cost,row,column.
Grid shows row/column headers, H (height), D (tentative), text status and outline.
Retain all settled cells and full operation history. Sorted frontier is a logical
simulation of heap extraction; heap sifts/stale pops are not animated. All presets
are small (n≤5); no trace truncation. Snapshot storage is teaching overhead,
not the O(n²) submission storage. Locale preserves every state and focus.
Prediction is independent; preset changes explicitly restart only the trace.
No automatic playback, async fetch or loading/reconnect states.

## Tokens / scope
Exact shared palette and typography from ../style.css; no new color literals.
Local role overrides: controls 48px; disabled opacity 1 with muted text; visible
3px accent2 focus; panel/panel2 grid; accent outline for current. Shared radius
8/14px, spacing 8/12/16/20/24px. System font stack and shared type scale.
P0 / highest-return slice: causal hand example, reversible complete trace, fresh
exercise, exact canonical source, bilingual accessible states, executable checks.
P1: related deep links and max-size correctness check. P2: none.
Deferred: custom grid editor (presets cover teaching), automatic animation,
execution service and universal renderer (unneeded scope).

## Evidence plan and limits
Independent threshold-flood oracle: exhaustive all 2×2 permutations; seeded 3×3
through larger grids; official cases; n=1 and n=50; input immutability. Independently
verify every settled dist and relaxation in JS snapshots. Real Chromium at
320/390/736/1440, both locales, all controls, prediction cross-paths, source and
clipboard fallback, blocked storage, offline, zoom, focus and contrast. Tests
accept OUTPUT_DIR. No claim of actual novice outcomes, LeetCode submission,
independent acceptance or production publication.
