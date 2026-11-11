# #857 author brief — r1

Status: author implementation; independent lesson review pending. No acceptance,
submission or publication claimed. Scope only leetcode/857. Author: Codex;
exact model identifier unavailable. Reused design approval and dispatcher:
../../specs/reviews/leetcode-all-hard-design-review.md. Applied website-design
skill at /home/songyy/Documents/agent-skills/website-design/SKILL.md.

Product verdict: reuse the collection lesson pattern. Category computing;
stage university. Reader knows basic Python loops/lists, not heaps. Outcome:
calculate proportional pay, derive the rate sweep, reconstruct its invariant,
predict an eviction, and map it to canonical Python.

Official source: https://leetcode.com/problems/minimum-cost-to-hire-k-workers/
Verified 2026-10-26 using public GET GraphQL (saved complete response and request
URL in tests/evidence/official-graphql.json). Direct page request returned 403;
public GraphQL returned 200. Python3 selector snippet observed:
class Solution: def mincostToHireWorkers(self, quality: list[int], wage: list[int], k: int) -> float.
Statement: exactly k, proportional pay, every minimum met; tolerance 1e-5.
n <= 10000, 1 <= k <= n, quality/wage in [1,10000]. Examples 105 and
30.66667. No mutation requirement; our solution preserves inputs. Empty input
and k=0 are outside contract. No non-Python language exception applies.

## Exact visual contract
Reuse ../style.css variables: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack,
shared spacing, 8/14px radii; no new colors, shadows or ambient motion.
48px controls; disabled opacity restored to 1. Focus 3px accent2 / 4px offset.
Highest-return slice: hand math + complete eviction history + fresh prediction.
P0: bilingual causal flow, trace, code, all checks. P1: related concept anchors.
P2: none. Deferred: custom inputs (bounded complete presets suffice), automatic
playback and real Python execution in browser (unneeded runtime complexity).

## Sequence: five fields per step
|Step|Already knows|Single question|Input → sought value|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Basic multiplication|Why not pay each minimum?|A(2,6), B(3,6), C(1,4), k2 → pair bill|Switch pairs: AB15, AC12, BC16; see each pay and max threshold|Positive qualities, shared rate|
|1|Pair bill = max(w/q) times sum(q)|How avoid all combinations?|Same three workers → eligible prefix|Read pair ledger and baseline, counterexample wages-first chooses BC|Exactly k, all thresholds considered|
|2|A rate makes some workers eligible|Which quality can be discarded?|Preset workers → k smallest qualities in processed prefix|Forward/back/reset/end; see before/add/remove/after and full ledger|Frames after completed insertion/eviction; equal rates safe|
|3|Invariant from step2|Does low quality always mean low total cost?|Fresh q=[4,2,3], w=[8,6,12], k2 → minimum|Choose then reveal; changing choice clears feedback|Independent of trace; no answer before explicit reveal|
|4|Sorted scan + retained quality sum|How does Python realize it?|Named quantities → canonical source|Read/copy/download exact bytes, inspect line mapping|O(n log n+n log(k+1)) time, O(n+k) space|

## First-use dependencies
Step0 quality q = proportional pay weight; wage w = minimum acceptable pay;
rate r = money per quality; threshold w/q = minimum permitted rate.
Step1 subset = selected k indices; combinations enumerates these; local definitions
repeat when needed. Step2 prefix = processed beginning of rate order; heap =
priority collection exposing largest quality via negatives; invariant = true
condition after every round. Step3 restates rate/quality objective. Step4 explains
zip, sorted, tuple unpacking, negative heap root and all stored names.

## Simulation and state
DOM simulation uses bounded presets and complete snapshots after one worker is
processed, not executing Python. Canonical Python uses a real heap; simulation
uses sorting of small retained lists and shows membership, not heap internals.
History stores old sum, insertion, removed identity, new sum, current candidate,
and best candidate identity/value. Displayed decimals are rounded to 5 places;
internal arithmetic is floating point. Snapshot storage is separate from solution
space. Locale preserves all state, selection/reveal, focus and disclosures.
No loading/reconnect states: all runtime data is local. Start/end disabled,
pending prediction, correct/incorrect, changed prediction, successful copy and
manual copy fallback are applicable branches. Storage denial falls back in memory.

## Proof obligations and evidence plan
At each rate prefix keep min(k,prefix length) smallest qualities. Push then remove
largest maintains it. Any retained k are feasible at current rate. At an optimal
group's largest ratio, all its members are eligible; retained sum is no greater,
so candidate <= optimum and feasible candidate >= optimum. Ties may be processed
in any order; final tied prefix covers every tied member. Test exact Fraction
subset oracle, intermediate membership/sums/candidate/best identities, exhaustive
small cases, random, official, ties, k1, kn and maximum n. Browser both locales,
all presets/endpoints, prediction branches, clipboard sentinel/fallback, widths,
zoom, keyboard, local links/assets and calibrated contrast. Evidence under tests;
OUTPUT_DIR allows reruns outside candidate. Preflight required before readiness.
Review status belongs here and SELF-CHECK.md, never learner UI.
