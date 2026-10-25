# #757 — author brief

Build/reuse verdict: reuse the approved bilingual LeetCode lesson shell, shared locale and exact tokens. Product/design authority: specs/reviews/leetcode-all-hard-design-review.md, dispatcher D3/D6/D8; no new layout or shared abstraction. Category leetcode/computing; stage university. Reader: knows arrays and sorting, new to greedy proofs. Outcome: calculate a minimum two-point cover, explain the two-largest-point invariant and implement the official Python callable.

Official verification: 2026-10-25, exact URL https://leetcode.com/problems/set-intersection-size-at-least-two/ and public GraphQL, capture tests/evidence/official.json. Public frontend ID 757 (internal questionId 759). Python3 selector: class Solution, intersectionSizeTwo(self, intervals: list[list[int]]) -> int. Inclusive integer endpoints, 1..3000 rows, 0 <= l < r <= 10^8; duplicates/nesting permitted, empty input outside contract. Return a size, not the selected set. No required input mutation. Three official examples return 5, 3, 5. Python faithfully supported; no language fallback.

Learning loop: select integers by hand → see waste in leftmost choices → sort by deadlines and retain two largest → predict a new transition → map it to source. Five sections fit this causal sequence.

| Step | Already knows | Single question | Input → output | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|integer membership|Can two intervals share points?|[1,3],[3,5] → smallest size|toggle 1..5; membership counts persist; see 3 is necessary|distinct inclusive integers|
|1|valid cover|Why choose rightmost?|same input → choices and baseline|inspect exhaustive baseline and leftmost counterexample|finite tiny coordinate universe only|
|2|rightmost choices|How little state can certify coverage?|sorted intervals → after-interval snapshots|next/back/presets/reset/end; full row history and selected points persist|sort (right ascending,left descending)|
|3|two-largest summary|What happens when only one point survives?|fresh [0,2],[2,4],[3,6] → next addition|choose then reveal, change clears feedback|separate exercise, no trace resets|
|4|transition and proof|How does it become Python?|official callable → minimum count|inspect/copy/download exact source|valid official domain; sorting costs included|

First-use dependencies: step0 inclusive interval and containing set = at least two distinct integers per interval. Step1 baseline = enumerate all subsets; greedy = commit locally to rightmost needed points. Step2 l/r = current endpoints, p/q = two largest selected points, invariant = fact retained after every interval, sentinel -1 = below all valid endpoints. Step3 repeats p/q definitions. Step4 repeats variable meanings and n = interval count.

Trace: simulation, not Python execution; frame 0 before work, frame k after exactly k sorted intervals. No omissions. Full selected set and before/added/after ledger retained; canonical solution retains only p,q,count. Scope: tiny presets only, no unbounded generation. Locale preserves all state/focus. Preset explicitly restarts trace only. No timers/loading/network runtime. Applicable branches: initial/middle/end, 0/1/2 new points, quiz pending/revealed/changed, copy pending/success/fallback, storage unavailable; all EN/zh. No reconnect states needed.

Tokens: exact shared --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. System font stack inherited. Shared 8px control/14px stage radii, 24px desktop/16px mobile gutters, max content 952px; 48px controls; 3px accent2 focus offset 4px; disabled opacity restored to 1. No motion, imagery, shadows, new color literals. Core text uses --text; secondary --muted measured. Table scroll only if needed and keyboard accessible.

P0: causal explanation, exact source, bilingual states, reversible trace, independently derived oracle and browser evidence. Highest-return 20%: hand counts + two-largest branch history + exchange proof. P1: useful related deep links. P2: none. Deferred: automatic playback (unnecessary), custom input (bounded presets make complete traces inspectable), universal renderer and in-browser Python (no product need). Independent lesson acceptance and production release remain pending, never implied by self-check.
