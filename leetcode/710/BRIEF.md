# #710 Random Pick with Blacklist — author candidate v1

Author run, 2026-10-25. Independent lesson review pending. Reuse verdict: this is
one computing/university lesson in the existing collection, for readers who know
Python lists, loops and dictionaries. Immediate job: turn a uniform random integer
into an equally likely allowed value, with one random API call per pick. Approved
product/design authority: specs/reviews/leetcode-all-hard-design-review.md and
its dispatcher adjudication; no new layout or service. Follow WORKFLOW,
UI-I18N-SPEC and all four lesson/trace/review/render contracts. Ownership is only
leetcode/710; registration and shared concept-map writes deferred to dispatcher.

## Verified official contract
Source https://leetcode.com/problems/random-pick-with-blacklist/ . Public GraphQL
capture provenance/official.json includes access timestamp, exact query, full
statement, sole example and every observed starter interface. Python3 explicitly
provides Solution.__init__(self,n:int,blacklist:list[int]) and pick(self)->int.
Python chosen by preference; JS/TS also observed, no exception needed. n in
[1,10^9], blacklist unique in [0,n), length b <= min(10^5,n-1), at most 20000
pick calls. At least one legal output; blacklist may be empty. Each call returns
an allowed value with equal probability; repetition is legal. Minimize calls to
built-in randomness. Official n=7, B=[2,3,5] permits {0,1,4,6}; its seven outputs
[0,4,1,6,1,0,4] are a possible sequence, not a deterministic requirement. No
modulus or mandated input mutation; solution does not mutate caller's list.

## Five-field sequence
|Step|Known|One question|Input → desired quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Integers and excluded numbers|How can three equally likely tickets cover three allowed values?|n=5,B=[1,3], tickets 0,1,2 → outputs 0,4,2|Select a ticket; see its row and output while all pairings remain visible|Uniform ticket selection; repeats allowed|
|1|Hand mapping and equal probability|Why not list all values or keep retrying?|Same n=5,B; baseline legal list and rejected draws → work and bias|Read executable baseline, count preimages for tempting next-allowed rule|Valid unique blacklist; n huge, b comparatively small|
|2|Only low blocked tickets need repair|Why are there exactly enough unused high legal values?|m=n-b; low [0,m), high [m,n) → dictionary and complete ticket coverage|Step/rewind/reset/end; presets restart; retain skipped high candidates and map ledger; select ticket only after construction|Complete blacklist set; high cursor advances monotonically; full tiny traces, no omitted operations|
|3|One-to-one mapping invariant|Can the invariant determine a fresh result and probability?|n=9,B=[1,3,6,8], given 1→5 → output of ticket3|Predict then reveal; change clears feedback; locale preserves selection/reveal|Fixed ascending high candidates, input blacklist order as written|
|4|Bijection and cursor proof|Which code lines implement it and what do they cost?|Official class → initialization and pick|Source/copy/manual fallback/download exact Python|Hash operations expected O(1); uniform randrange contract|

## Terms and causal bridges
Step0: blacklist=excluded values; ticket=random input label; uniform=each label
has same probability. Define m as allowed count where first used. Step1: preimage
is explained as number of starting draws reaching a result, not used as jargon.
Step2: low/high are intervals split at m; hole=blocked low ticket; map=stored
replacement; cursor high=next candidate; invariant=claim remaining true after
each assignment. Repeat definitions locally for direct navigation. Step4 repeats
b, m, remap, high, k names next to code. No metaphor substitutes for a formula.

Derive with 5,[1,3]: legal 0,2,4; ticket1 cannot return1; 0 and2 already have a
ticket, so use4. Wrong wrap-to-next-allowed on original draws0..4 gives counts
0:1,2:2,4:2 (bias). Wrong low1→2 duplicates output2, loses4. Baseline materializes
allowed values in O(n+b) time O(n+b) storage (temporary set included), pick O(1).
Rejection with set is unbiased but expects n/m random calls and has no finite
worst-case draw count; n=100001,b=100000 is legal and costs 100001 calls on
average. Remap uses one randrange(m) API call (its internal implementation can
consume several random bits; no claim of one hardware draw).

Let a be blocked low values. High interval length b has b-a blocked values,
therefore a legal targets. Keep legal low values fixed. Pair each low hole with
one unused legal high value: disjoint range, no collisions, exhaustion impossible.
Initially none assigned; skip blocked high candidates; assignment consumes one
new target; increment high prevents reuse. At end m tickets map one-to-one onto
m legal outputs, so each probability is 1/m. Initialization visits b blacklist
entries and at most b high positions in total, expected O(b+1) time/space;
pick expected O(1), one random API invocation. No scanning n positions.

## Render/state matrix
Step0 uses a separate fixed hand case. Step2 snapshots are after initial setup,
a skipped upper blacklist entry, one skipped high blocked value, or an assignment
(including high increment); a final completion event enables the ticket probe.
Each event records current b, old/new high, before/after map; cumulative ledger
retained. Cursor n means past-the-end, never a chosen target. Domain cells label
value and allowed/blocked plus low/high; table labels ticket and output separately.
Initial pending holes are not falsely valid outputs. Six small complete presets:
hand case, official, empty blacklist, consecutive high skips, sole allowed output,
all blacklist entries high. Numeric model is browser simulation, not execution of
Python. Exhaustive ticket probe is deterministic illustration, not empirical
random sampling or statistical proof. Tutorial full snapshots cost more than
submission memory. Quiz separate from presets, no leakage before reveal. Choice
change hides feedback; locale preserves experiment/quiz/source/focus state.
Clipboard pending/success/manual states bilingual; storage denied stays in memory.
No fetch, timers, autoplay, loading or reconnect branches in static runtime.

## Exact design tokens and priorities
Shared style.css/common.js, exact --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. No new palette, shadows or
motion. Shared font stack, body 1.75, 952px content; 24/16px gutters, 8px controls,
14px stage. Locally ensure 48px controls, opacity1 disabled text, accent2 3px focus
with 4px offset. Responsive wrapping domain cells/table, no shrinking labels;
source alone has intentional scroll. Total shipped CSS <25000 bytes.
P0 / highest-return20%: concrete ticket coverage, visible skips/assignments,
bijection proof, bilingual state truth, canonical Python and exact transfer.
P1: source convenience and related links. P2 none. Deferred: arbitrary editor
(validation complexity), empirical sampling histogram (cannot prove uniformity),
general visualization engine (no need), motion (no explanatory benefit), shared
registry edits (outside ownership). No scope reduction of core verification.

## Self-check plan and boundary
Independent oracle enumerates allowed integers and counts forced-ticket outputs;
all blacklists for n<=9, permutations/seeded input order, every intermediate
snapshot, maximum n and b, 20000 calls and official valid set. Exact source mirror
and no mutation. Browser real Chromium both locales, all presets, all transitions,
endpoints/reset/rewind, quiz choices/reveal/change, locale retention, clipboard
success and native manual fallback with distinct sentinel/readback, download,
storage-denied, keyboard/focus, links, 320/390/736/1440 widths and 200% zoom,
forced colors/reduced motion, contrast and local assets. Runners accept
LESSON_OUTPUT_DIR. Inspect screenshots. Run root metadata --validate-only, freeze
candidate hashes. Evidence is author self-check, not independent acceptance,
actual novice results, LeetCode submission, real-device or deployed verification.

## Author candidate v3 (pre-review)

v2 shortened the high-skip preset label after a real 320px clipping measurement;
the complete input remains next to the selector. v3 names the Python loop item
`value` to distinguish it from the mathematical length b, and uses shared --text
for blocked numeric values with a shared --bad strikethrough, raising essential
number contrast above 7:1. No new palette or behavior. All runtime assets use v3
query versions. Metadata is unchanged from the initial candidate. Final checks
and file hashes are in tests/evidence/ and tests/candidate-sha256.json. These are
author revisions, with independent review still pending.

v4 fixes disabled primary-button specificity so the endpoint Next button uses the
same muted-on-panel disabled treatment as End; native disabled behavior was
already correct. Its initial-state sentence also explicitly permits zero low
holes. All asset queries are v4; the canonical Python and metadata stay unchanged
from v3. Browser and accessibility checks rerun against this final candidate.
