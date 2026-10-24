# #330 Patching Array — author brief

## Product boundary and approved design
Reuse the bilingual static lesson pattern approved in specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. User: a reader who knows arrays, sums and loops. Job: derive and implement the minimum-patch algorithm. Smallest outcome: explain why the first missing sum is the best patch and transfer it to a fresh case. Category: algorithms / computing; stage: university. This is one local lesson, not a framework. Independent lesson review is pending; this author run is not acceptance.

## Verified contract
Source: https://leetcode.com/problems/patching-array/; public https://leetcode.com/graphql/, captured with timezone/date in tests/evidence/official.json. Actual codeSnippets includes Python3 `Solution.minPatches(self, nums: list[int], n: int) -> int`, legacy Python, TypeScript, JavaScript, and other native languages. Select Python3 by preference. Sorted positive nums, 1 <= length <= 1000, values <= 10000, 1 <= n <= 2^31-1. Each occurrence can be chosen once per subset; repeated equal values are distinct available elements. Return number of insertions, not the inserted values. No empty official input, no mutation requirement; implementation leaves nums unchanged. Examples: [1,3],6 → 1; [1,5,10],20 → 2; [1,2,2],5 → 0. No paid access needed. Evidence is review material, never loaded at runtime.

## Learning loop and per-step contract
1. Known: addition, choosing items. Question: which sums are absent from [1,3]? Input/output: [1,3], target 6, minimum insertions. Action: select one trial patch; observe each sum 1..6 and its subset witness, including gaps. Conditions: each element once, all positive. A small-input baseline.py enumerates patch multisets and subset sums; its exact source is displayed in a localized disclosure and checked against the BFS oracle; tiny exhaustive search is correct but cannot scale to n=2^31-1.
2. Known: attainable sums in the tiny example. Question: how does one new value extend uninterrupted coverage? Inputs: processed [1,2], coverage 0..3, candidate x in 1..6. Action: change x and see old interval [0,3] and shifted [x,x+3], plus exact attainable sums. Observe no gap iff x<=4, largest safe extension at x=4. Conditions: complete old interval, positive x. Define miss and derive invariant; prove sorted-next exclusion and greedy exchange/dominance.
3. Known: coverage and patch rule. Question: what does each actual greedy iteration change? Input: six bounded presets including official examples and maximum n. Action: forward/back/reset/end, preset restarts trace; inspect exact before/after interval cards and cumulative ledger. Conditions: positive sorted input. Each frame is after one complete consume/patch operation; initial frame before loop. All operations retained; numeric interval summaries avoid giant arrays. Simulation, not Python execution. No autoplay.
4. Known: invariant. Question: with [1,2,7], n=10, what patch count is necessary? Action: choose 0/2/1, then reveal. Correct 1 via patch4 → miss8, consume7 → miss15. Distractors: total sum alone / patching every initially missing number. Changing choice clears feedback, locale preserves it. Independent from worked trace.
5. Known: both branches. Question: how does the reasoning become the official Python callable? Input/output: official signature. Action: inspect source, copy or manual fallback, download exact source; map miss/i/patches, loop guard and branches. Conditions/cost: O(m+log n) time, O(1) auxiliary space for fixed official integer bounds; at most 31 patches. Tutorial snapshots cost O(T²) retained ledger entries, separate from submission. Boundaries: missing1, duplicates, exhausted array, n1, target already covered, 32-bit overflow in other languages. Related anchors point to existing explanations.

## First-use dependency table
| Term | First use / local definition | Depends on |
|---|---|---|
| subset sum | step0: sum of chosen occurrences, each at most once | addition |
| patch | step0: one inserted positive integer | array |
| complete coverage | step1: every integer in an interval is attainable | subset sum |
| miss | step1, redefined step2/4: first sum not covered, [0,miss) covered | complete coverage |
| invariant | step1: fact true before/after every loop iteration | miss |
| greedy | step1: choose best immediate safe extension; prove exchange | two intervals |
| i / patches | step2 and step4: consumed original count / inserted count | scan |

## Tokens and layout
Use ../style.css exact tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Reuse system font and shared geometry: 1000/952px container, 24/16px gutters, 14px stage, 8px controls, spacing 8/12/16/20/24. Local CSS only for responsive sum tiles and interval cards, 48px controls, opaque legible disabled states, 3px focus; no new color literals. No animations. Measured contrast and total CSS recorded in evidence.

## State and scope
P0/highest-return slice: causal two-interval derivation, exact snapshots, bilingual feedback, canonical code and independent oracle, browser/accessibility checks. P1: subset witnesses and complete ledger. P2: none. Deferred: arbitrary large UI inputs, automated animation, accounts, runtime Python and learner claims (no demonstrated need/evidence). Static page has no loading/reconnect states. Applicable states: initial, partial, terminal, rewind, preset change, selected/unrevealed/revealed/changed prediction, clipboard success/denial, storage denial, both locales. Locale changes text only, preserving focus and data. Missing assets are caught during browser testing. Model difference: browser JS simulates transitions and witnesses; canonical Python is separately executed by tests. No external assets. No real-device, production, independent review, LeetCode acceptance or actual learner outcome claimed.

## Verification plan
Run independent BFS over reachable-sum sets with all possible patch values on exhaustive/seeded small inputs; execute canonical Python; audit intermediate complete coverage and snapshot replay, official/max boundaries and immutability. Test JS trace separately against oracle fixtures. Real Playwright Chromium: all controls/presets/options, both locales, storage denial, clipboard success/fallback, exact display/copy/download parity; 320/390/736/1440px and 200% zoom, keyboard, anchors, errors, contrast, screenshot inspection. Tests accept LESSON_TEST_OUTPUT_DIR. Finish safe root metadata preflight. Freeze file hashes after checks for later independent review.
