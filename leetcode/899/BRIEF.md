# #899 Orderly Queue — author brief

Status: author implementation; independent lesson review pending. No independent acceptance, deployment, LeetCode submission or learner results claimed. This is the author run only. Candidate identity will be recorded by SHA-256 manifest in tests/evidence after checks.

## Approved placement and scope
Reuse the lesson pattern approved and adjudicated in specs/reviews/leetcode-all-hard-design-review.md. Website-design skill read at /home/songyy/Documents/agent-skills/website-design/SKILL.md. No new layout/product or design gate requested. category: leetcode (computing subject); stage: university. Reader: knows Python loops, strings, sets and lists; no group theory assumed. Smallest outcome: distinguish rotations from arbitrary rearrangements, prove both cases, implement the official Python interface. One loop: calculate cba → compare k=1/2 → inspect legal moves → transfer the circular-order invariant to a fresh string → map to source.

Official verification: provenance/official.json captures public GraphQL on 2026-10-26 with exact statement, constraints, examples and all observed codeSnippets. Catalog frontend ID is 899; internal GraphQL questionId is 935. Public, Hard. Python3 is explicitly supported, so canonical Python selected. Interface returns a string, does not mutate the input; zero moves allowed. 1 <= k <= len(s) <= 1000; lowercase English letters only. No empty input or Unicode extension claimed. Official examples cba,1 → acb; baaca,3 → aaabc. Official URL: https://leetcode.com/problems/orderly-queue/ . No non-Python language-contract required.

## Teaching steps (five fields each)
| Step | Already known | Single question | Input / sought quantity | Action / observation | Conditions |
|---|---|---|---|---|---|
|0|String letters, alphabetical comparison|What is one legal move and what is smallest?|cba, k=1 / smallest reachable string|Hand trace cba → bac → acb, compare first differing letter|Lowercase, fixed length; zero or more moves|
|1|Move and comparison|Which states can k=1 reach?|Same cba / complete rotation set|Read BFS baseline; enumerate cba,bac,acb, back to cba; see why abc is excluded|k=1, circular order preserved|
|2|Rotations and their limitation|Why does k=2 remove the limitation?|Same cba, then general x y R / attainable permutations|Switch preset (explicit restart); forward/back/end/reset through real legal move path with accumulated history; inspect static abc → acb → cba → bac adjacent-swap proof|k>=2 permits positions 1 and 2; illustrative path is not the Python algorithm|
|3|Circular order and adjacent swaps|Can a fresh k=1 string be globally sorted?|bdac,1 / minimum reachable string|Choose then reveal; changing choice clears feedback, language retains state; compare four rotations|Independent exercise; answer hidden before reveal|
|4|Two reachability classes|Which Python operations implement the proof, and at what cost?|s,k / official return string|View/copy/download exact source; map slicing, comparison, sorting; follow related anchors|n<=1000; k=1 O(n²), k>=2 O(n log n), O(n) auxiliary for both|

## First-use dependency table
| Term | First use and definition | Dependencies |
|---|---|---|
|lexicographic order|0: compare first unequal letter, smaller letter wins|alphabet|
|rotation|1: move first letter to end, shifting the starting point|legal move|
|reachable state|1: string obtainable by finitely many legal moves|legal move|
|BFS / breadth-first search|1: explore all next moves, store each distinct string once|sets, lists|
|invariant|1: a property unchanged by every legal move; circular order for k=1|rotation|
|adjacent swap|2: exchange two neighboring letters, keep the rest in order|positions|
|R|2: unchanged remaining suffix after first two letters|strings|
|n,i,best,candidate|4: length, cut position, best tested string, current rotation|slicing|

## Design/token and state contract
Exact shared ../style.css tokens: bg #0d1117; panel #161b22; panel2 #1c2330; line #2b3547; text #e8edf4; muted #9aa7b8; accent #6ee7ff; accent2 #ffb454; good #7ee2a8; bad #ff7a93. Inherit typography/system stack, 952px content, 14px panel radius, 8px controls, spacing 8/12/16/20/24, 48px local control minimum. Local disabled override opacity 1, muted text on panel2. Focus shared 3px accent2, 4px offset. No new colors, motion, assets, fonts or universal renderer.
Branch matrix: trace start/middle/end × zh/en; six presets × zh/en; prediction unselected/selected/revealed correct/revealed wrong/changed × zh/en; copy success/manual fallback/repeated fallback × zh/en; source disclosure preserved on locale switch. No loading, network execution, auth or background timer, hence no such transient branches. Native controls and live text. Preset resets trace only; reset rewinds all trace values; quiz independent. Language preserves frame, preset, answer, reveal, disclosure and focus.

Simulation limits: browser builds a short legal path via breadth-first exploration of preset strings only (<=5 characters), or a full rotation cycle for k=1. Every path move is shown; other search branches are not displayed, explicitly labeled. Trace snapshots/history consume additional memory unrelated to Python's O(n) space. No browser execution of Python, no solver service. Canonical algorithm enumerates rotations or sorts; it does not search for a move sequence.

P0: exact official contract, causal two-case proof, bilingual accessible interaction, executable source and reproducible independent-oracle/browser self-checks. Highest-return slice: reachability proof plus cba k comparison and fresh bdac quiz. P1: endpoint, rewind, source parity, measured contrast and narrow-label evidence included. P2: no decoration planned. Deferred: arbitrary large-string move construction (factorial search), automatic animation (no demonstrated benefit), shared framework (no consumer), registration/concept-map changes (outside owned scope), physical devices/native browser chrome zoom/novice study/deployment (not authorized or observed). Related learning links use existing rendered destinations; record meaning and hashes in evidence.

## Validation and review handoff
Self-checks only: BFS oracle independently explores full state graph for small strings; exhaustive and seeded Python tests, intermediate legal-move/invariant checks, maximum n, core/source parity. Browser tests use current preview, both locales and all presets, controls, prediction, successful and denied clipboard with fresh sentinels/native Linux shortcut, downloads, offline display, blocked storage, keyboard/focus, forced colors/reduced motion, 320/390/736/1440 and CSS 200% zoom, actual selected-label budgets, contrast calibration and rendered pair measurements. OUTPUT_DIR supported in evidence-writing runners. Required preflight: python3 -B scripts/register_leetcode_lesson.py 899 --validate-only. Results and limits will be appended after execution. A separate reviewer must cold-walk the frozen candidate and apply the existing six-dimension rubric; no score assigned here.

## Author outcome — 2026-10-26
Candidate 899-author-v1 is self-checked, ready for the separate independent review run, and not independently accepted. All commands and observed limits are recorded in tests/evidence/SELF-CHECK.md; machine results in logic-result.json, browser-result.json and preflight.json. Safe preflight `python3 -B scripts/register_leetcode_lesson.py 899 --validate-only` completed from repository root, exit 0 with no output. No registration or publication. Runtime/test/metadata hashes in tests/evidence/candidate.json freeze this candidate; a subsequent runtime or metadata fix requires a new candidate and independent review. Model identity unavailable; reviewer identity/run pending. No score assigned.
