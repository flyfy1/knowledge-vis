# #741 Cherry Pickup — implementation brief

Author run only; independent lesson review and release pending. Reuses the approved
all-Hard design review and dispatcher adjudication in
`specs/reviews/leetcode-all-hard-design-review.md`; no new shared layout/framework.
Category: leetcode / computing; stage: university. Reader: knows loops, arrays and
basic Python, has not seen synchronized path DP. Outcome: calculate a union of two
paths, derive the time-layer invariant, predict overlap, and implement the verified
Python3 `Solution.cherryPickup(self, grid: list[list[int]]) -> int` interface.
Official capture: `provenance/official.json`, public GraphQL, dated within capture.
No paywall; n=1..50 square grid, -1/0/1, unblocked endpoints, no path returns 0.
Both official examples retained in the presets. No required input mutation.

## Product fit and scope
Reuse one collection lesson. The learning loop is calculate → reverse return path
→ synchronize → inspect four predecessors → predict → map to Python.
Highest-return slice: hand union + inspectable DP dependencies + canonical source.
P0: full bilingual teaching, reversible state, independent oracle, source fidelity,
48px controls, accessibility and browser evidence. P1: alternate obstacle and
single-cell cases. P2: none. Deferred: animation, editable arbitrary grids and
execution backend, which add state and runtime without helping this bounded loop.

## Exact tokens and lifecycle
Reuse `../style.css`: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93; inherited alternate #0a0e14.
No new palette. System font stack inherited; body 1rem/1.75, titles inherited.
Spacing 8/12/16/20/24/48/64px, 8px controls and 14px panels, max width 952px.
No shadows or animation. Local CSS restores opacity=1 for disabled controls,
min-height 48px, min-width 48px, 3px accent2 focus with 4px offset.
Static page retains controls and focus across locale. Only diagram, tables,
ledger and readouts rerender. No timers, loading, server state or reconnect branch.
Normal, unreachable, first/final, quiz hidden/revealed/changed and copy success/
denial branches use both locales; localStorage denial falls back to memory.
Preset restarts trace only; locale retains all state; quiz is independent.
Simulation represents completed whole DP layers, not Python execution. Stored
teaching paths/tables are excluded from canonical rolling O(n²) space.

## Steps (five required fields)
|Step|Already known|Single question|Input → quantity|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0 Count a round trip|grid values|How many distinct cherries?|2×2 all ones → union count|Change second path; same path gives 3, split gives 4; cells retain A/B visits|Only right/down forward and reversed return; collect each cell once|
|1 Reverse and enumerate|union count|Why choose both paths jointly?|same grid and 4×4 greedy counterexample → best union|Read concrete paths and enumeration baseline; compare 8 vs 9|Return reverses to legal forward path; baseline exponential|
|2 Synchronize and compress|two forward paths|What history is sufficient?|layer t and r1,r2 → best union|Advance one completed layer; inspect matrix state, four predecessors, path union and cumulative ledger; rewind exactly|Both have r+c=t; -∞ unreachable; same coordinate once|
|3 Transfer|state invariant|What is a fresh layer's value?|new 3×3 grid, specified predecessor/current pair → value|Choose before reveal; change clears; locale preserves|Use prior best plus distinct current cherries, not two copies|
|4 Implement|derived transition|How does this become executable Python?|official interface → integer result|View, copy, download exact canonical source|O(n³) time, O(n²) auxiliary space; tests distinct from execution simulation|

## Concept dependencies and first local definitions
Step 0: coordinates = zero-based row/column; union = cells visited by either path.
Step 1: reversed return = the return cells read backward; path pair = two forward
paths; baseline = enumerate all path pairs; DP link uses an existing deep anchor.
Step 2 (redefines locally): t = moves made by each traveler; r1/r2 rows;
c1=t-r1/c2=t-r2 columns; DP = retain best total for equal endpoints;
-∞ = impossible, not zero; gain = newly entered distinct cell values;
invariant = best union over all legal path prefixes reaching these endpoints.
Step 3 repeats t, rows, columns, gain and unreachable meaning as needed.
Step 4 dp/ndp = previous/current layer; p1/p2 = predecessor rows.

## Proof and tests planned
A cell's r+c is fixed, so a cell cannot occur in different time layers. Every
legal prefix pair has one of four legal predecessor pairs and is bounded by that
predecessor optimum plus current gain. Conversely every finite predecessor
optimum extends to a legal pair and attains that total. Thus no earlier visited
set is needed. Start counts grid[0][0] once, terminal max(0,dp[n-1][n-1]).
Independent baseline enumerates forward paths and unions coordinate sets; test
exhaustive n≤2, all 3×3 binary grids, seeded obstacles up to n=5, n=50 all ones,
zeros, no path, forced corridor and n=1. Check every intermediate state against
independent prefix-pair unions, JS trace and canonical Python.
Real headless browser: both locales, all presets/cells, rewind/reset/endpoints,
all quiz answers, locale retention, copy and native-key manual fallback,
source/download parity, blocked storage, 320/390/736/1440 and CSS 200% zoom,
keyboard/focus, local assets, deep links, contrast. Screenshots inspected by
author; no novice study, independent acceptance or LeetCode submission claim.

## Review repair 741-R1 (2026-10-25)

Required P0: the closed English official-example-2 selector must retain example
identity, no-path scope and result at 320px, including a locale roundtrip. Shorten
only its English label to “Official 2: no path → 0”; retain the existing 16px font,
native select, layout and tokens. Bump the changed copy asset reference. P1/P2:
none; no new layout or interaction. Existing algorithm and teaching sequence stay
within the original brief. Regression: reproduce the old clipping, measure the
actual text/control/padding with a bounded Linux Chromium arrow allowance, inspect
settled screenshots, and verify both locales at 320/390px plus existing tests.
Evidence: `tests/evidence/fix-r1/`; independent closure remains pending.
