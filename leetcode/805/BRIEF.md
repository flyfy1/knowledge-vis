# #805 Split Array With Same Average — author brief

Reuse verdict: one lesson in the existing LeetCode collection, with the approved
shared page pattern (specs/reviews/leetcode-all-hard-design-review.md and dispatcher
D3/D6/D8). The website-design skill is applied; no new layout or review claim.
Category computing (collection leetcode), stage university. Reader knows sums,
fractions, Python sets and loops. Outcome: derive a fixed-size target sum, explain
why splitting the search is complete, predict a new case, implement Python.
Author self-check only; independent lesson review and publication remain pending.

Official contract: provenance/official.json is the public GraphQL capture dated
2026-10-25, exact official URL, full statement, examples, constraints and observed
language snippets. Python3 supports Solution.splitArraySameAverage(self,
nums: list[int]) -> bool. n=1..30, values=0..10000. Both groups nonempty; move every
position exactly once; arbitrary subsets, not contiguous slices or equal sizes.
No mutation required. Examples [1..8] true and [3,1] false. Prefer supported Python.

## Five-field sequence
|Step|Already known|Single question|Input → quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|Sums and division|Can three numbered tiles form equal averages?|[1,2,3] → bool|Reveal [2] vs [1,3], both 2|Both groups nonempty; positions indivisible|
|1|Averages need not mean equal sizes|Which subset sizes and sums can work?|Same tiles → k,S,n,target|Read algebra and executable mask baseline; compare [1,1,4]|1≤k≤floor(n/2); exact integer arithmetic|
|2|Fixed k needs exact target|How can two short searches cover all subsets?|Same tiles plus presets → sets and matches|Advance construction then probes; rewind restores old sets; retain operation ledger|Sets indexed by selected count; halves disjoint, cover all input|
|3|Every subset has a unique split between halves|Can the invariant decide a fresh case?|[1,2,4,5,6,6] → possible sizes and bool|Choose/reveal/change; independent from trace|Do not infer existence from divisibility alone|
|4|Set construction and complement checks|How does the proof map to official Python?|nums → bool|Read/copy/download byte-identical solution|Official range; no accepted-submission claim|

## First-use terms / dependencies
0: average = sum divided by count; partition = assign every position once.
1: n total count, S total sum, k selected count, s selected sum; complement =
remaining positions. Necessary = cannot succeed without it, not a guarantee.
2: half = fixed block of input positions; L[i]/R[j] sets of all sums from exactly
i/j positions; empty subset count 0 sum 0; meet in the middle = pair half sums.
3/4 repeat local meanings of k, S, n and count-indexed sum sets.

## Causal bridge and state contract
For [1,2,3], n=3 S=6; k=1 target=2. Left [1]: L[0]={0}, L[1]={1}.
Right starts R[0]={0}; append 2 gives R[1]={2}; append 3 keeps 2, adds 3
and R[2]={5}. Test i=0,j=1: a=0 needs 2 in R[1], so true.
Each construction frame completes one value using old sets (skip or take once).
Each probe frame tests every left sum for one eligible k,i pair. All candidates
are listed, and the first matching one is labeled. Stop at first success.
Initial and final frames explicit; no omitted operations for small presets.
Sets and complete prior operation history persist. A trace is a browser simulation,
not execution of the canonical source. Full snapshots cost extra teaching memory.
The canonical loops use list expansion into a new immutable construction state.
The tutorial displays deduplicated sorted sums; it does not depict hash internals.

## Exact tokens / states / scope
Reuse ../style.css palette: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared font stack and sizes;
radius 8/14px; spacing 8/12/16/20/24px. No new colors. Controls ≥48px;
disabled uses muted on panel2 at opacity 1. Focus 3px accent2, offset 4px.
Sum rows wrap instead of shrinking. Native select uses compact numerical labels
and full localized preset descriptions below. Locale preserves all state/focus.
Normal, initial, building, probing, true, false, selected/unrevealed/revealed,
copy-success/manual-fallback are bilingual. No timers, loading, server or reconnect.
P0/highest-return: hand calculation, complete reversible causal trace, proof,
fresh exercise, actual Python and independent checks, accessible bilingual states.
P1: deep links and source parity; P2 none. Deferred: arbitrary input editor,
auto-play, code execution service and framework (no demonstrated need).

## Verification plan / boundary
Exhaustive small arrays and seeded arrays against a direct partition oracle;
official examples, n=1, zeros, duplicates, maximum n/values and mutation checks.
Independent subset enumeration of every half-set snapshot and every probe.
Chromium both locales, all presets/frames/endpoints/rewind, exercise cross-paths,
copy success and fresh-sentinel native manual fallback per locale, download/source,
320/390/736/1440 plus 200% CSS zoom, keyboard/focus, deep anchors, blocked storage,
offline assets, contrast. Tests accept OUTPUT_DIR. Screenshots visually inspected.
No actual learner study, independent acceptance, LeetCode submission or public
release is inferred. Metadata preflight runs without registration.
