# #410 Split Array Largest Sum — author brief

Status: author candidate; independent lesson review pending. Product fit: reuse the
existing LeetCode collection page and approved five-part shell, per
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
Website-design skill applied. No new layout, service, runtime, registry or shared assets.
Category: leetcode / computing; stage: university. Reader: knows arrays, loops,
and integer comparisons. Job: derive a correct partition algorithm and implement it.
Highest-return slice: see a cap fail at 17 and pass at 18, then justify discarding
half an integer interval without enumerating all cuts.

## Verified contract
Official URL: https://leetcode.com/problems/split-array-largest-sum/
Public GraphQL capture: `tests/evidence/official.json`, access timestamp recorded
inside it (2026-10-25 Singapore / 2026-10-24 UTC). Hard, free. Python3 selector
snippet is `class Solution: def splitArray(self, nums: list[int], k: int) -> int`.
Canonical solution uses exactly that interface. No mutation or extra output required.
Input length 1..1000; values 0..10^6; 1 <= k <= min(50,n). Exactly k nonempty
contiguous groups; return minimized largest group sum. Examples: [7,2,5,10,8],2 ->18;
[1,2,3,4,5],2 ->9. No empty-input or negative-value case is in the contract.

## Learning loop / five fields per section
| Step | Already known | Single question | Input → sought quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0 Hand cuts|Addition, array order|Which of two cuts is better?|[2,3,4],k=2 → minimum largest sum|Choose each cut; see both sums and max 7 vs 5|Nonempty contiguous groups; exactly k|
|1 Fixed cap|What is minimized|Can all group sums stay at most B?|Same [2,3,4],B=5 then 4 → minimum groups|Change cap; step each item; see 2+3=5 then 5+4>5 causes a cut, retain ledger|B>=max(nums), nonnegative values|
|2 Search|Greedy gives minimum group count|Which caps can be discarded?|Same input; then official and boundary presets → smallest feasible cap|Advance binary search; retain old bounds, tested midpoint, groups, next bounds|Feasible iff count<=k; exact k follows by splitting; integers|
|3 Transfer|Greedy and search invariant|Can B=9 work for [4,4,4,4],k=3?|Fresh case → feasibility and new lower bound|Select prediction then reveal; change clears result; locale preserves it|Nonnegative, B>=largest element|
|4 Code/cost|Both proofs|How do observations become submission code?|Verified Python callable → answer|Inspect/copy/download exact source; map loop to cut ledger|Official limits; no claimed LeetCode acceptance|

## Causal content and terms
Step0: subarray = consecutive elements; group sum; objective = largest group sum,
then choose the smallest such largest sum. Step1 redefines cap B, running sum,
greedy = extend a group until next value would exceed B. Derive minimum-group
property by comparing first endpoints, then all prefix endpoints. Show equal-length
cuts fail on [1,1,1,9],k=2 (10 vs 9); fixed average bound need not be feasible
([2,3,4],k=2 average lower bound 5, while B=4 needs 3 groups).
Step2: feasible = can use exactly k groups under cap; monotone = raising cap
never destroys a valid partition; binary search = repeatedly halve the integer
candidate interval [lo,hi]; invariant = smallest feasible cap stays in interval.
Define mid and repeat local term explanations. At most k vs exactly k bridge:
if fewer groups, split some multi-item group until k; nonnegative values prevent
new parts exceeding the old sum; k<=n guarantees enough items.
Step3 repeats cap, feasibility and interval meanings beside question. Step4 names
n and S=sum(nums), explains inclusive bounds and max(nums)<=answer<=S. All-zero
range already terminal; k=1 => S; k=n => max(nums). Negatives invalidate greedy
argument and lower bound; [5,-4] is outside the contract.

## Simulation and state contract
Step1 and step2 share preset input/k but independent positions. Preset changes
explicitly restart both traces. Cap edits restart the item scan only. Search events
are complete feasibility scans, not Python execution and not individual item events.
No omitted rounds or scan items. Text groups encode actual contiguous values and
sums, not decorative bars; all prior scan and search events remain visible.
Back restores deterministic snapshots. No autoplay or asynchronous computation.
Fresh prediction independent of traces. Hand cut independent too. Python tests
execute the canonical solution; browser renders local JS simulation. Full tutorial
snapshots are extra memory and not included in O(1) submission workspace.

## Exact design tokens / lifecycle
Reuse `../style.css` and `../common.js` unchanged. Palette: bg #0d1117,
panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing alternate
section background #0a0e14 and source background #090e16 remain inherited.
System font stack, 1.75 line height; inherited title clamp(28px,5vw,46px),
section title clamp(23px,3.5vw,32px). Local spacing uses inherited 8/12/16/20/24px;
radii 8px; 48px controls. No shadow or motion. Focus 3px accent2, offset 4px.
Disabled opacity overridden to 1 with muted text and border on panel2. Local CSS
only; measure total bytes and color pairs. Retain language control upper right,
sticky step navigation, official link and collection backlink. Textual diagrams
wrap at 320px; semantic fieldset, native range/select/buttons. Rebuild only outputs;
controls retain DOM identity and focus. Locale preserves every model state.

Branch matrix, both locales: initial / scan append / scan cut / scan ended;
search pass / fail / converged / initially converged; hand unrevealed/revealed;
prediction empty/chosen/revealed correct or incorrect/changed; copy success/manual
fallback; storage unavailable. Loading, reconnect, cancellation are inapplicable:
there is no runtime request or process. Source remains local/offline.

P0: complete causal path, both locales, reversible traces, independent oracle,
real-browser checks, source parity, measured contrast, metadata preflight.
P1: cross-links to existing binary search and DP lessons, candidate hashes.
P2: none. Deferred: general trace engine, animation, custom array editor, deployment,
registry updates and mastery claims; no demonstrated need or author authorization.
Validation: exhaustive cut enumeration, DP oracle for seeded larger cases, per-prefix
greedy optimality, per-round search invariant, official and max cases; UI at
320/390/736/1440 and 200% zoom. No self-check is independent acceptance, actual
learner evidence or public delivery verification.
