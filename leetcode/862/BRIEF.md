# #862 author brief — candidate r1

Author implementation and self-check only; separate lesson review pending. No
independent acceptance, LeetCode submission or publication claimed. Scope 862/.
Apply website-design skill; reuse approved contract in
../../specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication.
Product verdict: reuse existing lesson surface. Category computing; stage university.
Reader knows Python loops, lists and addition. Goal: calculate a shortest interval,
derive two safe candidate removals, predict a new trace and implement the deque.

Official URL: https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/
Verified public page and public GraphQL on 2026-10-26; complete capture with UTC
access time and request in tests/evidence/official-graphql.json. Python3 selector
explicitly provides Solution.shortestSubarray(self, nums: list[int], k: int)->int.
Python selected by policy; no exception. Nonempty contiguous subarray, sum >=k,
return shortest length else -1. n 1..100000; values -100000..100000; k 1..1e9.
Official examples [1],1→1; [1,2],4→-1; [2,-1,2],3→3. No mutation required;
implementation preserves nums. Empty input and k<=0 outside official contract.

## Design contract / scope
Exact shared colors: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547,
text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93; no new colors. Shared font, spacing and radii.
Controls >=48px; disabled opacity 1; focus 3px accent2 offset 4px.
Highest-return 20%: tiny hand sum, visible per-removal reason and cumulative ledger.
P0: complete bilingual causal explanation, reversible trace, fresh quiz, source
parity, official and oracle/browser checks. P1: related existing deep links.
P2: none. Deferred custom inputs and autoplay: bounded complete presets expose
mechanism without validation or timing complexity. No new general renderer.

## Step contract
|Step|Known|One question|Input / sought|Action / observation|Conditions|
|---|---|---|---|---|---|
|0|Addition|Which contiguous segment qualifies?|[2,-1,2],k3 / minimum length|Choose singleton/pair/triple; sums 2,1,3 with validity|Nonempty, contiguous|
|1|Hand result|Why ordinary sliding window fails?|Same case then [1,-1,3],k3 / safe candidates|Inspect prefix accumulation and baseline; see missed singleton|Negative values permitted|
|2|Prefix subtraction|Which starts can safely disappear?|Prefix sequence / deque and best|Next/back/end/reset; one event per removal/append; retain history|k>0; comparisons before append|
|3|Two removal rules|Can you apply domination and settlement?|[3,-2,5],k5 / deque and shortest|Predict then reveal; changing answer clears feedback|Fresh case isolated from trace|
|4|Invariant|How implement with linear total work?|State names / Python|Source, copy, manual fallback, download|Each prefix enters once, exits at most once|

## New terms at first use
Step0 subarray=contiguous nonempty part; length=count of elements.
Step1 prefix P[j]=sum first j elements, exclusive end j; P[0]=0; accumulator
numeric 0+2=2, 2-1=1, 1+2=3. Baseline running sum defined locally.
Step2 deque=both-end queue storing prefix indices; front/back; domination=
newer prefix with no larger sum; invariant=condition after each completed j.
All steps restate relevant index and prefix definitions locally; step4 explains
enumerate, deque methods, truthiness, short circuit, infinity and min.

## Proof/state and simulation
At completed j, indices and prefix values strictly increase; best covers settled
starts. Front pops record feasible [i,j), then no future end can shorten that
start's first feasible segment. Back pops remove i when j>i and P[j]<=P[i]: any
future end feasible for i is feasible and shorter for j. All removed starts are
therefore safely accounted for, so a globally optimal interval cannot be lost.
Keep front settlement before back dominance and before append to exclude empty
intervals. Every event snapshots q,best,best pair and tested operands after the
named operation; intermediate events need not yet satisfy the completed invariant.
Trace JS is a teaching simulation, not Python execution. Complete bounded presets;
history and copied snapshots are additional teaching memory. No runtime network.
Branches: initial, front pop, back pop, append, done/no solution, selected/revealed/
changed quiz, copied/fallback; both locales preserve state. Loading/auth/reconnect
not applicable. Evidence under tests, OUTPUT_DIR supports nonmutating reruns.
Self-check does not establish novice learning or independent review.

## Final author evidence / freeze
Author self-check complete for r1; separate review remains pending. See
 tests/evidence/SELF-CHECK.md, algorithm-results.json and browser-results.json.
Compact preset identifiers A–H keep the native selected value complete at
320px/200% CSS zoom; full scenario inputs/results appear directly below.
Final tests: 5574 small algorithm cases, 1700 intermediate traces, four maximum
boundaries, all bilingual browser controls and 16 layout states pass. CSS 11294
bytes. Preflight `python3 -B scripts/register_leetcode_lesson.py 862 --validate-only`
from repository root exited 0; no registration performed. Final served runtime
and metadata hashes are recorded in browser-results.json; candidate-manifest.json
also identifies the author materials and reproducible checks. No metadata was
changed after the final preflight. A related #239 favicon 404 is explicitly
recorded as a sibling warning; no #862 asset errors. No acceptance is inferred.
