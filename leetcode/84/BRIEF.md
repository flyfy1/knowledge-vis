# #84 · Largest Rectangle in Histogram

Author candidate, independent lesson review pending. Reuse verdict: extend the approved
LeetCode lesson pattern; product/design review and dispatcher adjudication in
`../../specs/reviews/leetcode-all-hard-design-review.md` govern this implementation.
No new platform, registry writes, agent delegation, or release.

Audience: basic Python reader. Category computing / algorithms; stage university.
Job: infer rectangle width when a shorter bar arrives, explain the stack invariant,
then reconstruct a faithful Python solution. Learning loop: hand interval → observe
closing rectangle → predict a new pop → map to code → independent oracle checks.

## Official contract (2026-10-18)
https://leetcode.com/problems/largest-rectangle-in-histogram/
Public page and public GraphQL inspected; raw response with date retained in
`evidence/official-graphql.json`. Python3 selector entry explicitly provides
`class Solution: largestRectangleArea(self, heights: list[int]) -> int`.
Input 1…100000 bars, integer heights 0…10000, every bar width 1; return integer
maximum area. Examples [2,1,5,6,2,3] → 10 and [2,4] → 4. No required mutation;
solution leaves input unchanged. Empty input is outside contract (implementation
returns 0 defensively). Zeros and repeated heights are allowed. No special exceptions.

## Approved exact tokens and layout
Load ../style.css and ../common.js; no shared edits. Colors exactly inherited:
bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4,
muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93.
Use shared type system and 1000/952px widths, 8/14px radii, 8/12/16/20/24px gaps.
Local overrides restore 48px controls, opaque disabled text, muted field boundaries,
3px orange focus. No ambient motion or new palette. One static inset dark separator and outer outline around the candidate rectangle make its orange border readable against cyan bars; this is a functional contrast boundary, not decoration. No canvas required:
CSS histogram with visible numeric heights and indices, outlined candidate rectangle.

## Step contract (five fields per step)
| Step | Already known | One question | Input → sought quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0 hand and baseline|unit rectangles|Which adjacent bars form the largest rectangle?|[2,1,2] → area|choose left/right endpoints → minimum and multiplication change; [0,2] gives 1×3|rectangle sits on baseline, all widths 1|
|1 derive state|interval minimum limits height|When can we finalize a height?|same three bars → first closing boundary|read concrete pop sequence and wrong tallest-bar example|nonnegative heights; equal heights retained|
|2 reversible trace|shorter bar closes taller pending bars|What does this one push/pop prove?|preset array → pending indices and finalized candidates|forward/back/slider/reset → histogram outline, stack before/after, cumulative ledger|small complete simulation, no omitted events; preset resets only trace|
|3 transfer|pop width excludes new left boundary|What width survives a cascade of pops?|fresh [1,4,5,3] at i=3 → height-4 candidate|choose, reveal, change → explained correctness; answer hidden before reveal|independent of worked trace, same > pop rule|
|4 code and proof|pending heights never decrease|Why does every possible best rectangle get covered?|canonical Python → integer area|inspect/copy/download exact source and code mapping|O(n) time, O(n) auxiliary; simulator snapshots cost O(n²)|

## New terms / dependencies
Step 0: histogram = adjoining width-1 bars; interval [l,r] = consecutive indices,
minimum = shortest selected height, area = height × width in square units.
Step 1: pending = no strictly shorter right boundary yet; stack = last-in first-out
list of indices; nondecreasing = next height never lower. Pop removes last index.
Step 2 repeats stack, pending, best-so-far and index/boundary meanings locally.
Virtual height -1 at i=n = artificial end marker, not a real bar; left=-1 = excluded
position before input, distinct from that artificial height. Step 3 defines width
and excluded left boundary again. Step 4 repeats invariant and amortized reasoning.

## Causal obligations
Tallest-only fails [2,1,2]: 2 versus 3. Baseline enumerates all n(n+1)/2
intervals with running minima, O(n²), O(1) extra. In [2,1,2], arriving height1
finalizes index0 width1; final marker closes index2 width1 then index1 width3.
The stack contains increasing indices, nondecreasing heights. After a pop, the
new stack top is the previous height <= popped height: all intervening bars are
at least popped height, and the current shorter bar is excluded. Equal previous
heights may limit this one candidate; the oldest equal index later owns the full
span. E.g. [2,2] widths1 then2 at flush. Proof uses leftmost minimum of any
optimal interval; its pop candidate covers that interval, so maximum cannot be missed.

## State and simulation
Baseline endpoint experiment independent of trace. Trace presets [2,1,2], official
example, [2,4], [2,2,2], [0,0], [1,2,3,4], [4,3,2,1], [0], [10000]. Every frame
is immediately after one push/pop or final completion, deep immutable snapshots.
Ledger retains every popped rectangle. No user data discarded: only presets.
Language preserves all state, focus and disclosures. Prediction state is isolated;
changing choice clears feedback. Clipboard failure exposes selected exact text.
No loading/reconnect states (no runtime requests); storage denial handled by common.js.
Trace is browser simulation, Python executed only by offline tests.

## Priorities and evidence
P0/highest-return 20%: verified contract, hand width/minimum, causal pop/width,
truthful reversible diagram + ledger, fresh prediction, faithful source, bilingual
access and oracle/browser evidence. P1: nine targeted presets and deep links.
P2: none. Deferred: arbitrary-input editor (presets cover core cases), autoplay
(stepwise causal observation is clearer), execution service (unneeded runtime),
actual novice results/independent acceptance/publication (separate authorized runs).
Only this folder is owned; concept-map/registry additions are deferred to dispatcher.
Tests accept LESSON_OUTPUT_DIR for generated evidence. Evidence is author self-check,
not LeetCode acceptance or independent teaching review.
