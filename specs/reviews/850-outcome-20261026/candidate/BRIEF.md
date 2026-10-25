# #850 Rectangle Area II — author brief

Status: author self-check complete; independent lesson review pending. No acceptance,
submission, deployment, or actual novice learning result claimed. This author run
owns only leetcode/850. Approved reuse: specs/reviews/leetcode-all-hard-design-review.md
and dispatcher adjudication. Website-design skill applied; no new layout proposed.
Category computing / collection leetcode; stage university. Reader knows basic
Python loops, lists and sorting. Job: calculate union area, reconstruct a sweep
with interval merging, implement the official Python callable.

Official source: https://leetcode.com/problems/rectangle-area-ii/ ; public GraphQL
capture tests/evidence/official.json (UTC date in capture). Python3 selector gives
Solution.rectangleArea(self, rectangles: list[list[int]]) -> int. 1..200 rectangles,
4 coordinates each, coordinates 0..10^9, nonzero area. Return union area mod
1,000,000,007. Official examples 6 and 49. Source prose has non-strict coordinate
inequalities but explicitly excludes zero area. Empty input not required.

Product verdict reuse: five sections, shared locale/nav/source pattern, local SVG
geometry. No framework, services or shared edits. P0: causal hand example, honest
trace, prediction, source and all bilingual states, verification. Highest-return
slice: visible slab ledger with y intervals. P1: boundary presets and code mapping.
P2/deferred: segment tree (unnecessary at n=200), arbitrary input editor (validation
scope), animation (no learning need). No ambient motion.

Exact token contract: shared ../style.css :root unmodified: bg #0d1117, panel
#161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Reuse system font,
shared max widths, radii 8/14px, spacing 8/12/16/20/24px. Local control minimum
48px, disabled opacity 1, focus 3px accent2 offset 4px. SVG uses same tokens,
no new palette. No shadows or movement.

## Steps (five required fields each)
0. Known: rectangle area. Question: how much floor is painted at least once?
Input/output: A=[0,0,2,2], B=[1,0,3,1], union 5. Action: toggle B, observe
retained cells and area 4→5, not 6. Condition: integer grid is a tiny baseline,
not feasible for 10^9 coordinates.
1. Known: overlap must count once. Question: where can coverage change?
Input/output: same rectangles, x edges [0,1,2,3], slab contributions 2,2,1.
Action: read numeric decomposition then compare the shared trace. Condition:
axis alignment and cutting at every x edge. Baseline compressed cells scans n
rectangles for O(n³); sweep avoids rescanning each y cell.
2. Known: slabs and interval merging. Question: what was added by this slab?
Input/output: preset rectangles; active intervals, merged intervals, width,
covered height, delta and prefix area. Action next/back/reset/range, presets
restart only this experiment; retained ledger shows contributions. Condition:
frame is AFTER one complete slab; no hidden update events or skipped slabs.
3. Known: sorted-merge invariant. Question: do gaps and nesting count twice?
Input/output: fresh y intervals [0,2],[1,3],[5,6] across width 2; choose 12/8/10.
Action choose then reveal, change clears feedback, locale retains choice/reveal.
Condition: independent transfer problem; no answer-derived content before reveal.
4. Known: decomposition. Question: how does this become executable Python?
Input/output: exact official callable, mapping, proof and costs. Action source,
copy, fallback selection, download; condition code executes separately from JS
simulation. Python exact integers; modulo only at return. Input unmodified.

## New-term dependencies / first use
Union: step0, points covered at least once. Grid cell: step0 unit square.
Compression: step1 cut at existing edge coordinates, keep actual lengths.
Slab: step1 vertical strip between consecutive x edges. Active: step1 rectangle
covering an entire slab. Interval: step1 y range [lo,hi). Half-open: step1 lower
included, upper excluded, shared edge zero area. Merge: step1 combine overlapping
or touching ranges. Invariant: step1 property maintained by each merge.
Each term is locally restated when needed in later sections.

Simulation limits: SVG/JS traces all slabs of small integer presets, snapshots
consume more space than Python. Geometry labels are exact coordinates; highlight
is an outline, not added covered area. Python uses arbitrary precision; browser
presets stay within safe integer arithmetic. Large modulus example tested in
Python, not inaccurately animated. No runtime network needed. Offline source
mirror is exact canonical source. Loading/auth/reconnect are inapplicable to this
static page; clipboard denied and storage denied are applicable recovery states.

Verification and freeze receipt: see tests/evidence/SELF-CHECK.md and manifest.json.
Independent review must be dispatched in a separate run; this run cannot grant it.

## Author verification receipt

Commands: `python3 -B leetcode/850/tests/test_solution.py` (2,169 cases pass);
`node leetcode/850/tests/test_core.cjs` (1,006 cases / 3,860 intermediate frames pass);
`node leetcode/850/tests/browser.cjs` (both locales / all six presets pass).
Metadata: `python3 -B scripts/register_leetcode_lesson.py 850 --validate-only`
from repository root returned exit 0, no output; tests/evidence/preflight.json
records the actual command and result. Final candidate identity is in
tests/evidence/manifest.json. This is author self-check, not separate acceptance.
