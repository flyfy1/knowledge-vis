# Problem 296 — Best Meeting Point (blocked author brief)

## Product fit and scope
- User: a LeetCode learner studying a hard algorithms problem.
- Immediate job: understand and implement the official submission contract for #296.
- Smallest useful outcome: a bilingual interactive lesson that proves the official interface and algorithm with an independent oracle.
- Category: algorithms. Stage: university.
- Approved reused lesson pattern and shared tokens are applicable, but implementation is gated on official-source verification.

## Five required fields per step (planned, not implemented)
The lesson cannot safely define steps until the paid statement and selector/interface are accessible.

| Step | Known | Unique question | Input / desired quantity | Control / expected observation | Applicability |
|---|---|---|---|---|---|
| 1 | Official binary-grid contract and distance definition | What quantity is minimized? | Official grid and return value | Tiny hand-calculation trace | Only after official statement verification |
| 2 | Verified objective | Why do row and column contributions separate? | Same grid | Reversible meeting-point experiment | Only under verified Manhattan-distance rules |
| 3 | Verified baseline | Why is exhaustive search too expensive? | Official constraints | Compare candidate cells and totals | Only under verified bounds |
| 4 | Verified one-dimensional reduction | Why does a median minimize absolute deviations? | Extracted coordinates | Predict-before-reveal median experiment | Only after coordinate semantics are confirmed |
| 5 | Canonical implementation | How does the official callable interface map to code? | Exact selector/interface | Source mapping, copy/download parity | Requires official language selector and source |

## New-terms table (planned)
- Manhattan distance — must be defined from the official statement before use.
- Meeting point — must be defined from the official statement before use.
- Median — may be introduced only after the verified objective and coordinate lists.

## Verification gate
The official URL is premium-locked. Public GraphQL returns `content: null` and `codeSnippets: null`; see `tests/evidence/official-access-2026-10-24.txt`. Therefore the canonical language, supported interfaces, constraints, exception behavior, and exact statement cannot be verified. Per the task contract, implementation is blocked and no presumed title or third-party transcription is used as the official contract.

Next needed input: an authorized LeetCode session/capture exposing the official statement, constraints, examples, and language selector/code snippets (or an official public GraphQL response containing those fields). Once supplied, freeze the evidence and implement the full lesson under `leetcode/296/`.
