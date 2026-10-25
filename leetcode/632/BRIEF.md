# #632 author brief — candidate 1

Reuse verdict: extend the approved collection lesson, no shared changes. The
product/design approval is specs/reviews/leetcode-all-hard-design-review.md and
its dispatcher adjudication. Website-design skill read before this brief.
Category: leetcode (computing); stage: university. Reader: comfortable with
Python lists, seeking a reconstructable min-heap algorithm. Smallest outcome:
calculate a covering range, justify advancing the minimum, transfer to Python.

Official verification: 2026-10-25, official URL
https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/ .
Public GraphQL response stored in provenance/official-graphql.json includes
statement, both examples, codeSnippets and metaData. Python3 Solution.smallestRange
is officially offered. k=1..3500, row lengths 1..50, values -100000..100000,
non-decreasing rows (duplicates legal); no empty rows/input in contract. Inclusive
coverage, width b-a, ties choose smaller a; return two integers. No mutation required.
Direct requests HTML returned 403, but public GraphQL GET returned 200; web open
also supplied the full public statement. No paywall bypass or submission claim.

Learning loop: tiny hand range -> enumerate row choices -> discard only a
minimum -> reversible complete trace -> fresh prediction -> canonical source.

|Step|Already known|Single question|Input / desired quantity|Action / visible observation|Conditions|
|---|---|---|---|---|---|
|0|Integers, sorted rows|What counts as covering all rows?|[1,5],[2,6],[4,7]; compare ranges|Toggle hand candidates; see explicit included values and width|Inclusive endpoints; ties use left endpoint|
|1|Coverage and width|Which choice can safely be discarded?|Same rows; best range|Read enumerating baseline and min-advance counterexample/proof|Rows sorted, each nonempty|
|2|Safe discard proof|What changes after advancing one row?|Presets; candidate and best so far|Advance/rewind/reset/end; selected row cells, candidate and cumulative ledger agree|Frames after candidate evaluation, no omitted states|
|3|Invariant|Can it transfer to unseen rows?|[2,8],[4,9],[6,10]; final range|Predict then reveal; changing answer clears explanation|Independent exercise; same tie rule|
|4|Trace state|How do Python statements maintain it?|Official signature; executable source|Open/copy/download exact source; map one transition|Official input constraints|

First terms: step0 range=[a,b] includes endpoints, width=b-a, cover=one value
per row; step1 candidate=range of selected values, invariant=property preserved
by every advance; step2 heap=structure exposing minimum, pointers=row indices,
M=largest selected value, best=best evaluated range. Repeat definitions locally.

Correctness: for minimum selected value x, retaining x while advancing other
rows cannot lower the maximum because rows are sorted. Current [x,M] already
beats or ties all such future choices. Discard x; only its successor can help.
Thus each discarded family is dominated by an evaluated candidate. At exhaustion,
all combinations left would retain that exhausted value or a discarded prefix;
none can improve. Equal minima processed one at a time; tuple tie handling explicit.

Tokens: exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing system font stack,
body 16px/1.75, shared heading clamps, 8/14px control/panel radius; local spacing
8/12/16/24px. No new colors, shadow or motion. Controls >=48px; disabled
opacity removed and text --muted; 3px --accent2 focus offset4px.

State matrix (both zh/en): initial/middle/end/rewind/preset reset; unselected,
selected, revealed-correct/incorrect, changed-answer; copy success/denied fallback;
locale preserves all state and focus. No loading/network/empty input runtime:
all preset data and code embedded. Storage denial falls back through common.js.
Trace is JS simulation, not execution of Python. It stores O(Nk+N²) teaching
snapshots/ledger for tiny presets; Python uses O(k) auxiliary space.

P0: causal explanation, complete trace, bilingual feedback, executable Python,
independent product-choice oracle, source parity and real browser evidence.
Highest-return 20%: actual values with safe-discard reason and persistent ledger.
P1: related links to existing heap lessons. P2: none. Deferred: custom unbounded
input, animation, Python browser runtime (unnecessary complexity), deployment,
registration and independent acceptance (separate owner/reviewer duties).
