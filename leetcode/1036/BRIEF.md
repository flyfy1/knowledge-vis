# #1036 Escape a Large Maze — author brief

Author run: Codex, exact model identifier unavailable. Candidate: 1036-v1.
Status: author implementation and self-check; independent lesson review pending.
No independent acceptance, learner trial, submission, or deployment is claimed.
Reused product/design contract: specs/reviews/leetcode-all-hard-design-review.md,
including dispatcher adjudication. website-design skill read at its requested path.
Scope: only leetcode/1036/. Category computing; stage university. Reader knows
Python lists, sets, loops and functions; introduce FIFO queue and deque locally.
Product verdict: reuse collection shell and exact shared style/locale tokens.
One loop: hand-count reachable cells → prove a conservative bound → trace both
searches → predict a new case → map proof into canonical Python.

## Official evidence
Official URL https://leetcode.com/problems/escape-a-large-maze/ accessed 2026-10-26.
Full public GraphQL statement, constraints, examples and selector snippets saved
in tests/evidence/official.json. Python3 interface observed:
Solution.isEscapePossible(self, blocked: list[list[int]], source: list[int], target: list[int]) -> bool.
Grid coordinates 0..999999, four orthogonal moves, 0..200 blockers; endpoints
distinct and unblocked. No modulo, path-length output or wraparound. Both official
examples verified. Duplicate blocker behavior is not specified; sets safely deduplicate.
Chinese title is an authored translation.

## Priority and token contract
P0: all five sections, bilingual controls, reversible bounded-search trace,
independent oracle, executable Python, accessible source transfer and proof.
P1: both-endpoint counterexample and clean-row proof overlay in prose.
P2: none. Highest-return slice: bounded reachable-cell diagram with retained history.
Deferred: arbitrary grid editor and automatic playback (unneeded state/complexity),
exact triangular budget (conservative b² proves sufficient and is easier to derive).
Use shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8,
--accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93.
System font shared; 48px controls; 3px accent2 focus; spacing 8/12/16/20/24/64px;
8px controls, 14px panels; no new colors, shadows, fonts or motion.

## Section contract (five required fields each)
1. Known: orthogonal moves. Question: can the corner leave? Input/output:
[0,0], blockers [0,1],[1,0], target [0,2] → false. Action: step trace in
section 3 using matching preset; observe one reached cell and no legal move.
Condition: boundaries prohibit negative coordinates; diagonal moves forbidden.
2. Known: reachable set from 1. Question: how much must we explore? Input/output:
b blockers → budget b². Action: inspect row/column argument and baseline.
Observation: clean lines connect all large regions. Condition: b < grid side.
3. Known: bound. Question: what certifies each endpoint? Input/output: preset,
visited set, queue, result. Action: next/back/reset/end and preset; observe newly
reached cells and accumulated discovered coordinates, then reverse search.
Condition: simulation uses official million-square bounds, cropped viewport,
no omitted search operations; snapshots after complete node expansion.
4. Known: two endpoint tests. Question: does an escaped source suffice? Input:
fresh three-cell pocket; output prediction. Action: select/reveal/change;
observation: direct reach before budget suffices. Condition: target in same pocket.
5. Known: proof and trace. Question: how does code preserve it? Input/output:
canonical Python bool contract; copy/download. Action: inspect code/mapping.
Observation: seen-on-enqueue, queue exhaustion versus >budget. Condition:
expected O(n+(b+1)²) hash-set time and O((b+1)²) space, n=input blocker entries; b=0 still costs O(1).

## Terms / dependencies
Section 1: reachable = connected by legal moves; cell coordinates x horizontal,
y vertical. Section 2: component = all cells reachable from one cell; clean row/
column = no blocked cells; b = number of distinct blockers; budget L=b²;
queue = first-in first-out pending cells; BFS = expanding that queue.
Section 3 redefines queue, seen and L beside diagram; source/target flags distinct
from seen and current expansion marker. Section 4 repeats budget and seen meanings.
Section 5 explains deque.popleft, tuples/set and short-circuit and.

## Model / proof
Canonical and browser use conservative b² bound, not the common tighter b(b−1)/2.
All clean rows/columns are connected since at least one of each exists. Every
cell outside this component must have both a dirty row and dirty column: ≤b².
Thus two searches both reaching >b² are in that same component. Direct reach
also proves connectivity, even inside a small pocket. Exhaustion without target
proves disconnection. Full-grid BFS is a correct but infeasible O(W²) baseline.
Simulation does not execute Python; only visible presets and their full bounded
search snapshots stored. Cropped drawing is not a wall. Snapshot history is extra
teaching memory, excluded from canonical O((b+1)²) space.

## Validation plan / independent review boundary
Execute canonical Python against an independent coordinate-compressed full reachability
oracle, exhaustive small blocker choices and seeded full-range cases; brute finite
grids independently check generalized theorem; verify intermediate JS snapshots.
Real Playwright, both locales/presets/controls, 320/390/736/1440 and 200% CSS zoom,
keyboard/focus, per-attempt native clipboard sentinel fallback, downloads, blocked
storage, assets, contrast, screenshots visually inspected. Tests honor OUTPUT_DIR.
Run non-mutating registration preflight, record actual results in evidence/self-check.md.
Freeze runtime/source/metadata hashes for separate reviewer. No registry or shared edits.

## Frozen author outcome
Candidate 1036-v1 is complete and author self-checked; independent review remains
pending. Commands and actual results, visual inspections, pre-freeze author fixes,
contrast measurements and limitations are in tests/evidence/self-check.md.
Non-mutating preflight `python3 -B scripts/register_leetcode_lesson.py 1036 --validate-only`
passed with exit 0 and no output. Metadata title omits ID; H1 retains #1036 in
both locales. Final complexity includes input scan n as well as distinct blockers b.
Candidate hashes are recorded in tests/evidence/candidate.json. No prior review
result exists for this candidate; no acceptance or campaign record was changed.
