# #871 Minimum Number of Refueling Stops — author brief

Status: author implementation; independent review pending. No acceptance, submission,
publication or novice-learning claim. Author: Codex (exact model identifier unavailable).
Approved reused pattern: specs/reviews/leetcode-all-hard-design-review.md and dispatcher
adjudication. Scope only leetcode/871. Category computing / algorithms; stage university.
Target: reader comfortable with loops, arrays and functions, new to greedy heaps.

Official verification: 2026-10-26, official problem URL and public GraphQL query.
provenance/official-graphql.json contains actual statement, constraints, examples and
language snippets. Python3 list[list[int]] -> int method observed; choose Python.
The direct HTML capture is a Cloudflare challenge, retained honestly; GraphQL succeeded.
Unlimited tank, full station transfer, 1 liter/mile, equality permits arrival. n<=500,
target/startFuel 1..10^9, strictly increasing positive positions below target,
positive fuel <10^9. No mutation requirement; canonical solution preserves inputs.

Learning loop: hand journey -> enumerate legal stop subsets -> reuse farthest reach ->
reversible heap simulation -> fresh prediction -> map proof to executable Python.
Expected output: explain why only reachable unchosen stations qualify, why maximum fuel
is safe, why empty pool means impossible, and reproduce the callable method.

## Steps (five required fields)
|Step|Already knows|Single question|Input -> desired quantity|Action -> observation|Conditions|
|0|Fuel is consumed while driving|How many stops are needed?|25,10,[[10,15]] -> 1|Read arithmetic: tank 0 at 10, add 15, arrive 25|Unlimited tank; equality reachable|
|1|Legal stop sequence|How can we find a correct baseline?|Same case -> minimum subset size|Inspect subset code and earliest-stop counterexample|Ordered stations, positive fuel|
|2|Reach = starting fuel + chosen supplies|Which available supply should extend reach?|Preset -> completed admission/selection snapshots|Next/back/end/reset and preset -> retained table and history, old/new reach|All candidates pos<=reach; stop immediately at target|
|3|Largest eligible supply can replace a smaller one|Can the invariant solve a new journey?|75,25,[[10,10],[25,30],[50,20]] -> predicted minimum|Choose then reveal; changing choice clears feedback|No answer visible before reveal; independent from trace|
|4|Greedy exchange and reach state|How do we implement and bound it?|Canonical Python -> min stops or -1|Open/copy/download exact source|Heap stores negatives; each station admitted/popped at most once|

## Concept dependencies and local definitions
Reach / step0 and step2: farthest position fuel collected could cover, not remaining tank.
Subset / step1: selected station indices; feasibility needs every selected station reachable.
Invariant / step2: a fact retained after every operation; reach equals start plus selected
fuel, pool contains exactly admitted unchosen stations, only positions <=reach admitted.
Greedy / step2: choose the largest currently available fuel supply. Max-heap / step4:
structure exposing largest value using negatives in Python's min-heap. Every section
redefines necessary terms locally. No new notation appears without a local definition.

Simulation: local JavaScript deterministic complete frames, not execution of Python.
All UI presets <=4 stations, no truncated search. Full history snapshots cost O(n²)
for this teaching trace, separate from submission O(n) auxiliary space.
Baseline enumerates subsets O(n*2^n) time, O(n) space, intended only for tiny checks.
Canonical: O(n log(n+1)) time, O(n) space. Oracle: stop-count dynamic programming,
independent of greedy; maximum-size tests outside browser.

## Design/state contract
Reuse exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. No new palette.
System stack, shared typography and spacing, local 48px controls, disabled opacity 1,
3px accent2 focus. No ambient animation, no external assets, native tables/controls.
P0/highest-return: concrete causal bridge, visible candidates and history, bilingual
state, exact source and computational/browser verification. P1: related deep links.
P2: none. Deferred: custom arbitrary-input editor (presets isolate one complication),
autoplay (no educational need), Python runtime (static simulation adequate).
State branches: initial/admit/choose/success/impossible; prediction unselected/selected/
revealed/changed; copy success/manual fallback; storage denied. All bilingual.
No loading/reconnect/account states apply to this self-contained static page.
Locale preserves preset, frame, disclosure, choice, feedback and focus.

Review gate: separate cold walkthrough against six dimensions, >=85/100, each >=3/4,
zero required findings. This author run does not perform or claim that review.

## Final author status
Author candidate 871-author-v1: self-checked; independent lesson review pending.
See tests/evidence/SELF-CHECK.md, browser-result.json, python-result.json,
core-result.json, preflight.json and candidate-sha256.json. Metadata uses one
nonempty complexity string and the exact Python language preference. Safe root
preflight `python3 -B scripts/register_leetcode_lesson.py 871 --validate-only`
passed with exit 0. Frozen file hashes identify this candidate; later changes
must be reviewed as a new candidate. No registry, other lesson, campaign record,
service, credential, Git configuration or deployment was changed by this run.
