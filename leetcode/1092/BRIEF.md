# #1092 Shortest Common Supersequence — author brief

Status: author implementation run; independent review pending. No independent acceptance, learner study, LeetCode submission or publication claimed. Candidate identity will be recorded by tests/evidence/candidate.json. Only this lesson directory is owned.

## Product and design contract
Reuse the approved collection lesson pattern per specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Applied /home/songyy/Documents/agent-skills/website-design/SKILL.md. Category algorithms (collection: leetcode); stage university. Reader knows basic Python loops, indexing and lists. Goal: reconstruct a shortest string, not merely its length. Five sections expose hand calculation, repeated subproblems, reversible DP/reconstruction, fresh prediction and actual Python.

Official contract: provenance/official-verification.md and official-graphql.json, accessed 2026-10-26. Both nonempty lowercase strings length 1..1000; any shortest output allowed; inputs unchanged. Python3 selector provides Solution.shortestCommonSupersequence(self, str1: str, str2: str) -> str. Python is canonical. Empty suffixes are internal boundaries, empty original input is outside official constraints.

P0/high-return slice: concrete causal recurrence, table values, output history, source parity, bilingual state and accessible controls with actual checks. P1: multiple preset mechanisms and related deep links. P2: none. Deferred: freeform large inputs/animation; bounded teaching tables keep state legible and no speculative framework is needed.

## Exact design tokens
Use ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93; inherited even-step #0a0e14 and pre #090e16. Existing font stack, 1000/952px widths, 14px stage/8px controls, 24/16px gutters; local controls 48px minimum. No new colors, shadows or motion. Unknown cells show ·, completed cells show values, current cell has a textual ★ as well as border. Reconstruction retains emitted text and path ledger.

## Learning loop and steps (five required fields)
|Step|Already known|Single question|Input → wanted|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|1|Strings and order|Can one a serve ab and ac?|ab,ac → shortest string|Advance three hand emissions; a serves both then b,c; rewind restores|Subsequence preserves order, permits gaps; multiple answers|
|2|Hand solution|What repeated work can be saved?|Suffix positions → minimal remaining length|Inspect recursion and aab/baa greedy counterexample; same suffix pair reused|Baseline returns length only; no claimed submission parity|
|3|Suffix definition|Why does each table value justify an emitted letter?|Preset suffixes → filled dp then output|Next/back/reset/end; inspect dependencies, table retained, reconstruction path/output|Each frame is after one operation; all small preset events retained|
|4|Optimal suffix invariant|What length for aba,bab?|Fresh strings → chosen length|Predict then reveal; change clears feedback, locale retains it|Different valid shortest outputs allowed|
|5|Recurrence and reconstruction|How do the values become real Python?|Official strings → actual returned string|Expand/copy/download exact source; inspect mapping and bounds|UI is JS simulation; Python executed only by tests|

## First-use dependency table
Subsequence step1: delete characters without reordering. Supersequence step1: contains both inputs as subsequences. Suffix step2: characters from a position to the end. State dp[i][j] step2/3: minimum output length for suffix pair. Dynamic programming step2: compute each state once. i,j step3: numbers consumed (zero-based next positions). m,n step3/5: input lengths. Invariant step3: fact preserved at each operation, with induction proof. Each section locally repeats needed definitions.

## Simulation and state contract
JS teaching simulation reproduces suffix DP and reconstruction; does not execute Python. Presets share table and reconstruction; preset changes restart only trace. Hand calculation and prediction independent. Base row/column already filled initially; interior unknown; each fill frame stores a deep snapshot. Reconstruct after fill, choose str1 on ties. Every frame stores i,j, output, table, history and precise operation. No omitted frames. Simulation snapshots use more memory than the submission. Both locales preserve all state and focus; localStorage denial falls back through common.js. Offline mirror requires no fetch.

## Correctness and verification
Any shortest completion starts with a needed first character (other leading characters can be removed). If equal, use one copy for both, because both embeddings may start at the first occurrence. Otherwise first output character consumes one side; residual is feasible and at least its optimal length. Conversely prepend that character to an optimal residual to attain candidate cost; minimum over two candidates is exact. Induction on remaining length proves table. Reconstruction maintains emitted length + dp[i][j] = dp[0][0], while consumed prefixes embed in emitted output. Base suffix exhaustion appends remaining letters. Tests use independent breadth-first enumeration of supersequence strings for small cases and LCS length oracle for larger cases, not production recurrence. Self-checks remain distinct from independent review.

## Author completion record
Author candidate c1, finalized 2026-10-26. Built by Codex; exact model identifier unavailable. Self-check only; reviewer/run/acceptance/deployment remain pending/not performed. Candidate and shared-policy hashes: tests/evidence/candidate.json. Official metadata capture additionally confirms frontend ID 1092, Hard, free.

All three reproducible test commands in tests/README.md passed. Python: 900 exhaustive pairs plus 168 official/seeded/boundary cases; simulation: 129 cases / 3,096 frames. Real Chromium: both locales, seven presets, every event rewind/replay, three predictions, source copy/manual-copy/download parity, blocked storage, offline opening, keyboard/focus/forced colors, 16 width/zoom layouts, no runtime/asset errors. CSS total 11,403 bytes; measured minimum tested text contrast 7.07885:1. Full rendered-state evidence and limits are in tests/evidence/self-check.md.

Metadata preflight from repository root: `python3 -B scripts/register_leetcode_lesson.py 1092 --validate-only` → exit 0, no stdout. No registration or shared state changes. This finalized metadata is part of the new frozen candidate and awaits independent review; no prior acceptance is changed.
