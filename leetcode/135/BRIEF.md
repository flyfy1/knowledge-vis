# #135 Candy — author candidate brief

Product verdict: reuse the approved LeetCode lesson shell and exact shared tokens.
Contract: specs/reviews/leetcode-all-hard-design-review.md, dispatcher adjudication;
WORKFLOW.md, UI-I18N-SPEC.md, explainer/trace/review specifications; website-design
skill read at ~/Documents/agent-skills/website-design/SKILL.md. This is an author
run; independent lesson review and learner outcomes are pending.

Category: leetcode (computing); stage: university. Reader knows arrays, loops,
Python functions. Immediate job: reconstruct why two one-sided lower bounds give
the least total. Learning loop: hand allocation → failed one-direction rule →
reversible directional trace → fresh prediction → executable Python.

Official verification: 2026-10-18; https://leetcode.com/problems/candy/ and public
GraphQL, captured in provenance/official.json with all observed code snippets.
Python3 selector: class Solution, candy(self, ratings: list[int]) -> int.
Nonempty ratings, n <= 50000, ratings 0..50000; no mutation required; return the
minimum total, not an allocation. Higher rating than an adjacent child requires
strictly more candies; equal ratings impose no candy equality. Official examples
[1,0,2]→5 and [1,2,2]→4. No extra exceptions observed. Canonical Python selected.

## Sequence (five sections earn their place)

| Step | Already known | One question | Input → output | Action and expected observation | Conditions |
|---|---|---|---|---|---|
|0|Integer comparisons|How many candies for three descending ratings?|[3,2,1] → [3,2,1], total6|Read each forced neighbor inequality, compare official equal-rating example|Only adjacent comparisons, at least1|
|1|Both neighbor rules|Why does a correct baseline repeat work?|Repeated synchronous repairs → feasible minimum|Compare round0 [1,1,1], round1 [2,2,1], round2 [3,2,1]; inspect left-only failure|Small baseline; n−1 rounds sufficient|
|2|Chains force increasing candy counts|What does each directional pass prove?|Small preset ratings → L, R, max allocation|Next/previous/end/reset/scrub; change a preset (explicit reset) or middle rating; retain L/R/C and full operation ledger|Simulation only, complete bounded traces n≤6; no truncation|
|3|Directional lower bounds|What happens when the descending side is longer?|Fresh [1,2,3,2,1,0] → predicted minimum|Choose then reveal; incorrect options expose left-only or additive errors; changing choice clears feedback|Independent of trace; locale preserves state|
|4|All transitions and prediction|Why is max feasible and minimal, and where is it in code?|Proof → exact official Python submission|Copy/download source; inspect mapping and boundary costs; related deep links|O(n) time, O(n) auxiliary space, no claimed LeetCode acceptance|

## First-use dependencies (redefined locally when needed)

- step0 rating: given integer, not candy count; neighbor: immediately adjacent.
- step1 baseline: slow correct reference; round: simultaneous repair from previous
  vector; lower bound: amount every valid allocation must reach (introduced step2).
- step2 L[i]: least candies needed from comparisons on the left only; R[i]: same
  from right; C[i]: final max(L[i],R[i]); i: zero-based child position. Unknown C
  displayed as ?, initialized L/R as provisional ones. Invariant: a statement that
  stays true after each completed operation; processed directional entries are exact.
- step4 componentwise minimum: no valid allocation can lower any one component;
  n: number of children; auxiliary space: extra submission storage excluding input.

## Visual and state contract

Exact shared CSS palette: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font stack,
14px stage radius, 8px controls/readouts, shared max widths and spacing. Local
styles only reflow the lesson and restore 48px controls and readable disabled
states. 3px orange focus outline, offset4px; no motion beyond shared scroll.
Table is a literal allocation ledger; orange outlined cell marks the operation,
never a candy amount. History remains visible. Deep snapshots ensure exact rewind.
No automatic execution. Submission allocates three arrays; tutorial snapshots use
O(n²) cells and are confined to n≤6; this is distinct from Python's O(n) storage.

Branches × languages: initial/partial/final/rewound, all six presets and custom
middle value; unselected/selected/revealed/changed prediction; copy success/manual
fallback; storage failure. Every branch translated. Locale retains all state.
No loading/reconnect/server states: entirely local static lesson. Numerical trace
is a simulation; Python execution exists only in offline tests.

P0/highest-return20%: causal lower-bound explanation, truthful directional table,
state recovery, bilingual copy, exact source and independent-oracle checks.
P1: bounded middle-rating experiment and operation ledger. P2: none.
Deferred: autoplay (no educational need), arbitrary 50000-item browser inputs
(unreadable and wasteful snapshots), constant-space slope method (different proof).
Only leetcode/135 is owned. Concept links are supplied through lesson-entry.json;
shared CONCEPT-MAP/registry edits are reserved for the authorized dispatcher.

Verification: tests accept LESSON_TEST_OUTPUT_DIR. Python exhaustive allocation
oracle and independent rating-ordered oracle, max-size boundaries, JS intermediate
state invariants; browser locales/controls/presets/copy/download/mobile/zoom/focus/
contrast/assets. Author evidence is not independent review or actual learner data.
