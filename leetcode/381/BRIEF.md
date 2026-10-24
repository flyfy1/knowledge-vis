# #381 author brief — frozen lesson pattern

Product verdict: reuse the approved LeetCode lesson surface at /leetcode/381/.
Design authority: specs/reviews/leetcode-all-hard-design-review.md, dispatcher
adjudication D3/D6/D8. No new layout family or design review is claimed.
Category: leetcode / algorithms. Stage: university. Reader: knows Python lists,
dictionaries and sets, wants to implement a mutable duplicate-aware collection.
Smallest outcome: explain why sampling positions weights duplicates correctly,
and reconstruct swap-with-tail deletion including the same-value case.
Loop: calculate [4,4,9] → reject uniform distinct-value sampling → remove a slot
without shifting → repair its reverse index → predict a new same-value move → code.

## Verified original contract
Official URL: https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed/
Public GraphQL accessed 2026-10-25; raw response and timestamp in
 tests/evidence/official.json. Python3 codeSnippets explicitly supplies
RandomizedCollection.__init__, insert(val:int)->bool, remove(val:int)->bool,
getRandom()->int. Python is the preferred faithful interface. No exception needed.
Empty constructor; insert always adds and reports prior absence; remove deletes
one occurrence if present and reports success. Sampling is proportional to current
multiplicity. Values are signed 32-bit integers; at most 200,000 total calls.
getRandom is guaranteed nonempty. Average O(1) operations required.
Official example inserts 1,1,2 (True,False,True), samples 2 (a possible outcome),
removes 1 (True), samples 1 (a possible outcome); probabilities change 2/3,1/3
into 1/2,1/2. Outputs of random calls are possibilities, not fixed requirements.

## Exact shared token contract
Reuse ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack inherited.
Shared spacing 8/12/16/20/24/32/64px, 8px controls, 14px stage radius,
952px content. Local controls raise minimum size to 48px, disabled opacity 1;
use muted on panel2 with a dashed boundary, no new palette. 3px accent2 focus.
No animation or external assets. Shared + local CSS must be <25,000 bytes.

## Five step contracts
| Step | Already known | Single question | Input → desired quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0 Weight of a copy|Three physical slips 4,4,9|What does a fair draw return?|Three slots → probabilities and method results|Choose slot 0/1/2; see two slots return 4; reveal hand result|Nonempty, uniform positions; selector is enumeration, not randomness|
|1 Saved work|List represents copies|How can deletion avoid shifting?|[4,4,9], remove4 at0 → [9,4]|Read aligned before/after and linear baseline; compare distinct-value counterexample|Order unobservable; average hash operations; one occurrence removed|
|2 Maintained state|Tail can fill a hole|Which index entries must change?|preset operations → completed array + reverse-index sets|Step/back/end/reset; compare old/new, inspect removal repair and retained ledger|Invariant only at completed operations; deterministic smallest-index simulation differs from arbitrary Python set.pop|
|3 Transfer|pos maps each value to all its slots|Does moving an equal tail still need repair?|fresh [8,3,8,8], remove8 at0 → select final map|Predict before reveal; changing choice clears feedback, locale preserves it|Given chosen hole0; implementation may choose any occurrence|
|4 Implementation|Position invariant and equal-slot sampling|How does each line preserve the contract?|Canonical Python → executable class and honest cost|Copy/download; map i,j,last repairs to trace|Expected hash work, amortized list growth; no guaranteed worst-case O(1)|

## First-use terms / dependencies
Step0: multiset = collection retaining repeated copies; multiplicity = number of
copies; probability = favorable equally likely slots / total slots. Step1:
index = zero-based list position; baseline = simple correct implementation;
hash map = key-to-value lookup expected O(1), set = unique members.
Step2 locally redefines nums, pos, index, i (hole), j (old tail index), last
(old tail value); invariant = condition true after every completed operation.
Step3 locally redefines pos and slot numbers. Step4 locally defines n=current
copies and expected/amortized cost. No assumption of reading only sequentially.

## Simulation and state
All frames are completed operations, including fixed-index illustrative getRandom.
No omitted frames. State snapshots contain before/after arrays, maps, operation,
result, i/j/last where relevant; history retained. Reverse restores full snapshot.
Presets: official; equal moved value; tail/singleton/absent/reinsert; signed extrema.
Preset replacement explicitly restarts only trace. Prediction independent.
Empty diagram has explicit text, sampling never performed empty. No fetch/loading,
server or reconnect state; source is embedded. Clipboard success/failure and
blocked localStorage have localized fallbacks. Locale preserves focus and state.
Tutorial copies snapshots and sorts sets for display; these are not solution costs.

## Scope and verification
P0/highest-return 20%: causal derivation, truthful before/after reverse indices,
fresh retrieval, Python parity, bilingual keyboard/mobile access and real tests.
P1: retained readable ledger and source mapping, included. P2: decoration omitted.
Deferred: arbitrary operation editor and autoplay (extra validation, no needed
learning outcome); framework and live submission service (no product need).
Tests: independent list/Counter oracle; exhaustive short sequences; seeded streams;
intermediate bidirectional invariant; deterministic enumeration of sampling slots;
200,000-call case; browser-model oracle; all controls/locales/widths/zoom/focus,
clipboard branches, blocked storage, code/download parity, contrast and screenshots.
Evidence is author self-check only; separate review, actual novice outcomes,
LeetCode acceptance and production delivery remain unclaimed.
