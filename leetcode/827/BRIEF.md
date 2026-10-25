# #827 Making A Large Island — author brief

Status: author self-checked candidate; independent lesson review pending. No acceptance,
submission, deployment, registration, or learner-outcome claim. Candidate r1.
Uses the approved reusable lesson pattern and dispatcher adjudication in
specs/reviews/leetcode-all-hard-design-review.md; follows website-design skill.
Product verdict: reuse the collection page boundary; a local island renderer.
Category algorithms/computing; stage university. Reader knows Python loops,
lists, sets and basic graph traversal. Outcome: reconstruct why distinct adjacent
components suffice and implement iterative flood fill plus candidate scan.

Official verification: tests/evidence/official.json captures public GraphQL on
2026-10-26, exact official URL, full statement, examples and language snippets.
Python3 selector snippet: Solution.largestIsland(self, grid: list[list[int]]) -> int.
Internal questionId 854 differs from public frontend ID 827. n square, 1..500,
binary entries; at most one zero changes; only horizontal/vertical connectivity.
Examples yield 3,4,4. No empty grid; all land requires no flip. No required input
mutation; our submission preserves input with a separate label matrix.

Highest-return slice: distinguish neighboring cells from neighboring islands.
P0: concrete hand flip, baseline, distinct-ID invariant and proof, complete bounded
trace, fresh prediction, canonical source and tests, bilingual accessible states.
P1: reversal, boundary presets, native clipboard fallback evidence. P2: none.
Deferred: animation, arbitrary large browser inputs and Python browser runtime
(no learning need; maximum inputs tested offline). No live data/loading states.

Exact shared tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font,
14px card/8px control radii; shared 8/12/16/20/24 spacing. No new colors.
48px targets, 3px accent2 focus; solid navigation; readable disabled overrides.

|Step|Already known|Single question|Input → output|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|0 water, 1 land|What can one flip connect?|diagonal 2×2 → largest area|toggle either zero then undo; 1+1+1=3|four directions; one flip|
|1|area count|What work repeats?|same grid → brute force answer|inspect baseline code; same islands recounted for each zero|O(n⁴) worst case, O(n²) space|
|2|flood fill groups land|What summary is reusable?|grid → labels/areas/candidates|next/back/end; retain labels and candidate ledger|one zero; distinct IDs only|
|3|distinct-ID sum|Does it transfer?|fresh 3×3 center → area|predict, reveal, change; 7 vs 5 vs 13|question asks center flip, not arbitrary flip|
|4|invariant|How does code realize it?|Python interface → integer|source/copy/download; map concrete center case|O(n²) time/space; stack avoids recursion depth|

Term dependency: step0 island = orthogonally connected land, area = cell count,
coordinates zero-based (row,column). Step1 flood fill = repeatedly visit reachable
land. Step2 component = whole island, ID = unique integer ≥2, area[id] = its count,
seen = set of distinct neighboring IDs, best = maximum tested or original area.
Reintroduce terms locally at each jump target. Step3 restates distinct whole-island
count; step4 restates labels/areas/seen and explicit stack (pending cells).

Simulation: small presets only; component frames follow complete flood fills,
not individual pushes/pops; no skipped components or candidate zeros. Immutable
snapshots retain labels, areas, tested candidates and best. Diagram IDs are not
input values. Orange border marks candidate only, never a real extra flip.
Manual and prediction experiments are independent. Locale preserves all state,
focus and disclosure; preset resets only trace. Prediction change clears reveal.
Source-copy success and denial fallback are distinct bilingual branches.
Tests/evidence record author self-check only. Separate reviewer must cold-walk
this frozen candidate under six-dimension rubric before acceptance.

Author evidence: SELF-CHECK.md and tests/evidence/*.json. Metadata preflight
`python3 -B scripts/register_leetcode_lesson.py 827 --validate-only` passed
(exit 0; no output). Candidate r1 freezes these metadata and source bytes for
a new separate review. No historical acceptance was changed.
