# #996 · Number of Squareful Arrays

Author run only; independent lesson review pending. No acceptance, submission,
publication, or learner outcome is claimed. Candidate identity: tests/evidence/manifest.json.
Approved reused product/design contract: specs/reviews/leetcode-all-hard-design-review.md
and dispatcher adjudication. Website-design skill applied; reuse verdict.
Scope: leetcode/996 only. Category computing; stage university. Reader knows
Python loops, lists and functions; recursion is introduced through concrete calls.
Useful outcome: enumerate distinct value sequences and reconstruct count-based
backtracking. No new shared framework or registry edits.

## Exact token and layout contract
Use ../style.css variables unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. System font stack inherited;
shared 1000/952px header/body, 14px stage and 8px control radii; no shadows.
Local controls min 48px; disabled opacity 1, muted text. Focus 3px accent2/4px.
No motion; finite manual trace only. Local style only fixes wrapping and states.
P0: causal example, frequency invariant, reversible ledger, bilingual retrieval,
source parity, oracle and browser evidence. Highest return: show duplicate copies
as one value choice and undo count visibly. P1: six boundary presets. P2: none.
Deferred: free input (unbounded factorial trace), animation (no learning need),
execution backend (static product). Reconsider only with a concrete need.

## Official contract
Verified 2026-10-26 via public official URL and GraphQL; provenance/official.json
retains full statement, examples and actual language snippets. Free, Hard, frontend
996 (internal question ID 1038). Python3 supports Solution.numSquarefulPerms(self,
nums: list[int]) -> int. Prefer Python; no language exception required.
1 <= n <= 12; 0 <= value <= 10^9. Adjacent sum must be an integer square;
zero is a square; distinct means different values at some position, not copy IDs.
One element has no adjacent pair and counts once. No modulus or mutation requirement.
Official examples [1,17,8] -> 2 and [2,2,2] -> 1.

## Learning sequence (five fields per step)
| Step | Already known | Single question | Input → quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|addition|Which orderings work?|[1,17,8] → legal permutations|reveal → all six with pair sums|nonnegative integer values|
|1|value equality|Why not permute copy IDs?|[2,2,2] → distinct count|read baseline and counterexample → 6 labeled vs 1 distinct|equal values indistinguishable|
|2|legal pairs and counts|How can each sequence appear once?|preset multiset → valid leaves|choose preset (restart), advance/rewind → chosen path, remaining counts, accept ledger, undo|small full traces, no omitted branches|
|3|count invariant|Can a repeated value be reused?|fresh [0,1,1] → count|predict then reveal; change clears feedback|independent of trace|
|4|backtracking|How does code preserve counts?|official nums → integer answer|source copy/download; mapping|Python3, original bounds|

## First-use concepts and dependencies
Step0: permutation = reordering all entries; squareful = every adjacent sum is
an integer square. Step1: baseline = correct exhaustive comparison; set = unique
tuples. Step2: prefix = chosen beginning; remaining count = unused copies per value;
backtracking = try one value then restore the parent's counts; invariant = condition
true at every call. Each term is defined again locally when needed. Step4 repeats
remaining-count/undo meaning beside code. No memoization is claimed.

## Simulation/state contract
Browser JavaScript simulates full small DFS, not Python execution. Each frame is
a deep snapshot AFTER the labeled choose/reject/accept/undo event. Reject leaves
path/counts unchanged; accept adds one distinct full value sequence to the ledger;
undo restores parent counts. Rewind restores ledger too. All presets <=4 values;
no event omissions; tutorial snapshots/ledger have separate space from submission.
Preset resets trace only. Language preserves trace, revealed hand calculation,
choice/reveal and clipboard fallback. Prediction selection clears feedback.
Copy success/failure/manual fallback are localized. Static app: no loading,
account/reconnect/expired state applies; endpoint disabled states do apply.

## Proof and costs
Invariant: path has legal adjacent sums and remaining counts equal original minus
path multiplicities. Each positive compatible value has exactly one child; consume
one then restore. Induction yields every valid sequence exactly once. Empty
remaining counts accept once. Pruning cannot exclude a legal extension. Baseline
set(permutations) has O(n*n!) time and space upper bound; final search O(n*n! + k²)
time, O(n+k²) auxiliary space for k distinct values, recursion and compatibility.
No polynomial guarantee; all n! remains a conservative worst-case bound.

## Validation and remaining gates
Reproducible tests accept EVIDENCE_DIR. Self-check evidence records Python vs
independent permutation oracle, every browser-core event invariant, official and
boundary results, real Chromium interactions, source transfer, layouts and contrast.
Separate independent cold review remains next action; physical devices, actual
learner teach-back, LeetCode acceptance and deployment are unverified.
