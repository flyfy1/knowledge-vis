# #801 author brief

Build/reuse verdict: reuse the approved bilingual LeetCode lesson surface and local DOM trace, under specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication. No new layout/framework or independent acceptance is claimed. Applying website-design skill. Category: computing / LeetCode; stage: university. Reader: knows arrays and loops, learning dynamic programming. Immediate job: reconstruct a minimum-swap algorithm and submit Python. Highest-return slice: see why retaining two possible endings avoids a greedy mistake.

Official contract verified 2026-10-26 from the public official GraphQL and URL, saved in provenance/official.json (full statement and actual codeSnippets). Python3 supports Solution.minSwap(self, nums1: list[int], nums2: list[int]) -> int. n=2..100000; equal lengths; values 0..200000; feasibility guaranteed. Only same-index swaps; strictly increasing means every adjacent value grows. No empty input or impossible-input return contract. Both official examples retained as trace presets. Our implementation reads inputs without mutation.

Learning loop: toggle actual column swaps → compare legal histories → retain two cheapest endings → step the recurrence → predict a fresh prefix → map to Python. Trace is a JavaScript simulation, never Python execution. All small preset transitions are retained; no omitted frames.

## Exact tokens and behavior
Use ../style.css unchanged: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing system font stack and type hierarchy, 8/14px control/card radii, 8/12/16/20/24px spacing. Local overrides: minimum 48px actions, opaque disabled muted text, solid sticky nav, text wrapping; no new palette or motion. Focus: 3px accent2 with 4px offset. Trace ledger cards reflow, never shrink numerical labels.

State inventory × both locales: hand mask 0..15, valid/invalid; trace initial/middle/end, allowed/blocked candidate edges (∞); five presets restart only trace; independent prediction unselected/selected/revealed correct/revealed incorrect/change/reset; copy success/manual fallback; locale preserves all state and focus. No loading/account/network state: assets and source local, no request-driven interactions. No autoplay. Storage denial falls back through common.js.

## Steps (five fields each)
0. Known: two rows and adjacent comparisons. Question: which columns should exchange? Input/output: [0,4,3,4] and [0,2,5,6], seek minimum count. Action: toggle i=1, see both rows become increasing with one exchange; toggle back. Conditions: swap only vertically; count currently swapped indices, not button clicks.
1. Known: a swap mask chooses an orientation for every column. Question: why not keep any currently valid column? Input/output: same rows, compare greedy cost 2 with optimum 1. Action: return to hand experiment, try i=2 and i=3 versus i=1. Observation: both valid but different costs. Conditions: exhaustive baseline checks all 2^n masks, O(n*2^n) time O(n) temporary arrays, only practical for tiny n.
2. Known: two orientations per column. Question: what information can replace a full history? Input/output: original adjacent values and old keep/swap costs, obtain new costs. Action: step and rewind full prefix ledger, compare four candidate edges and actual inequalities. Conditions: valid prefix, retain cheapest cost for each last orientation; two guards are independent. ∞ means no valid history, not a large measured cost.
3. Known: prefix ending determines last values. Question: why are two minimum costs enough, and can you transfer them? Input/output: fresh [0,5,4,8,7], [1,2,6,5,9], predict final keep/swap (2,2). Action: select then reveal, change selection clears feedback; locale preserves it. Conditions: all legal histories split by last two orientations; a more expensive history with the same endpoint can never help later.
4. Known: recurrence/proof. Question: how does code implement it within constraints? Input/output: verified Python signature to integer answer. Action: open/copy/download exact source, inspect line mapping, follow related links. Conditions: guaranteed feasible inputs, O(n) time/O(1) auxiliary memory; tutorial ledger O(n) is not submission memory.

## First-use dependencies
- Strictly increasing (step0): each next value is larger, equality fails.
- Index i (step0): zero-based vertical column.
- Mask (step1): one bit per column, 1 means exchanged; depends on column.
- Prefix (step2): columns 0..i already processed.
- keep/swap (step2 and redefined step3): minimum operations on valid prefix ending unchanged/exchanged.
- Guard S/C (step2): same/cross adjacent inequalities on original values; show all operands.
- Invariant (step3): a claim true after every processed column, defined locally.
- Infinity (step2): impossible endpoint, not unknown; pending columns are absent from ledger.

P0: complete bilingual causal story, reversible hand and ledger, Python/oracle tests, browser/source/contrast checks. P1: precise local related anchors and two served related lessons. P2: none. Deferred: custom arbitrary inputs (preset scope sufficient), animations (manual causal inspection), browser Python runtime (not needed), registry and concept-map writes (dispatcher ownership), independent teaching review (separate run required).

Evidence limits: author self-check only; no actual novice study, LeetCode submission, physical device or deployment verification. Candidate identity will be frozen in tests/evidence/candidate.json after checks.
