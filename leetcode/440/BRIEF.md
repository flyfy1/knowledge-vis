# #440 author brief — candidate 1

Product verdict: reuse the approved LeetCode lesson pattern, as adjudicated in
specs/reviews/leetcode-all-hard-design-review.md. No new layout system or shared
runtime. Category: computing / algorithms. Stage: university. Audience: a reader
who knows Python loops and decimal notation, but not prefix counting.

Source: https://leetcode.com/problems/k-th-smallest-in-lexicographical-order/
Verified 2026-10-25 using public GraphQL (provenance/official-response.json and
request receipt). Free Hard problem, integers 1 <= k <= n <= 10^9; inclusive
1..n, one-based k, no leading zeros. Official examples (13,2)->10 and (1,1)->1.
Observed Python3 starter: Solution.findKthNumber(self, n: int, k: int) -> int.
Also observed Python, TypeScript, JavaScript and other native starters in capture.
Python is the preferred faithful submission. No mutation, empty-input, modulus,
or special runtime requirements. Browser trace is a simulation, never Python execution.

Learning loop: manually order decimal labels; observe contiguous prefix groups;
count them by clipped numeric intervals; decide skip versus descend; predict a
fresh rank; map the invariant to the canonical Python. Expected outcome is a
reconstructable implementation, not a claimed learner result.

## Exact design contract
Reuse ../style.css tokens: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font, title clamp
28px/5vw/46px, body 16px and 1.75 line height, stage radius 14px,
controls 8px, spacing 8/12/16/20/24/64px, max inner width 952px.
Local accessibility overrides use those exact tokens: 48px controls, visible
muted disabled state, 3px accent2 focus, solid sticky nav, no motion or shadows.
Numeric interval table scrolls within a named focusable region; state cards stack.

## Five steps and five required fields

### step0 — Decimal labels, not numerical size
Known: ordinary integers and strings. Question: which label is rank k?
Input/output: n=13, then n=23 k=14; ordered labels and answer 21.
Action/observation: inspect explicit numbered labels and hand count the two groups.
Conditions: positive integers, ordinary decimal notation without leading zeros.
Baseline: sort 1..n by str; O(n D log n) worst-case time, O(nD) storage,
D decimal digits. Numeric sort fails already at (13,2): returns 2 instead of 10.

### step1 — Count a prefix without listing its members
Known: decimal order. Question: how many labels start with p?
Input/output: n=23, p=1 or 2; counts 11 and 5.
Action/observation: read per-depth half-open intervals, especially [20,30)
clipped to [20,24), which contributes 4 rather than 10.
Conditions: p is a positive valid prefix; n+1 is the excluded upper bound.

### step2 — Reversible skip/descend experiment
Known: interval count. Question: where does the target remain after one move?
Input/output: presets (23,14), (13,2), (13,6), (1,1), (100,10), (10^9,10^9).
Action/observation: next/back/reset/end/slider; see before/after state, the
current count decomposition, and retained operation history. Presets restart
only this experiment; locale preserves it and the separate prediction.
Conditions: every stored frame is at loop entry or terminal; r is moves AFTER p,
not one-based local rank. Invariant: p is the first candidate, target is r
positions after it in the remaining lexicographic traversal. S<=r skips S nodes;
S>r descends after consuming p. r=0 returns p. Valid rank prevents running off
the sibling chain; if no child existed, S=1 and r>0 would force a skip.

### step3 — Fresh transfer
Known: invariant and counting. Question: answer for n=35,k=20?
Input/output: choices 20/27/28, hidden explanation until selection and reveal.
Action/observation: choose then reveal; feedback explains off-by-one and skipped
prefix mistakes; change choice clears feedback. Locale preserves both.
Conditions: independent of presets; no answer visible before reveal.

### step4 — Canonical Python, proof, limits
Known: p/r/S transitions. Question: how does this become a faithful submission?
Input/output: displayed/copied/downloaded solution.py, code mapping and costs.
Action/observation: open source, copy or use selectable fallback, download.
Conditions: Python integer arithmetic under official bounds, O(D^2) time / O(1)
auxiliary space in the word-RAM model. At most 9 sibling skips per digit and D
 descents; each count uses at most D levels. Tutorial stores snapshots and
history separately, O(D^2) numeric cells at worst, not solution auxiliary space.

## First-use dependencies (also restated locally)
- step0 lexicographical: compare decimal strings left-to-right; shorter initial
  string first. Rank: one-based place. Depends on decimal labels.
- step1 prefix p: starting digits; group includes p itself. Half-open [a,b): a
  included, b excluded. Depth d: digits appended. Depends on decimal order.
- step2 p/r/S: first remaining label / moves after it / prefix-group size.
  Invariant: statement that remains true after each move. Skip and descend
  defined by before/after numbers, not a metaphor.
- step4 D: number of decimal digits in n; auxiliary space excludes tutorial frames.

## Scope, states, priorities
Highest-return slice/P0: correct count decomposition, invariant, complete reversible
trace, bilingual causality, source parity, keyboard/mobile/contrast and actual
Python/oracle execution. P1: fresh transfer and concept links (included).
P2/deferred: animation and free-form huge inputs; no learning need beyond complete
bounded presets. No generic visual framework. No backend or Python runner.
Branch matrix in both locales: initial / intermediate / final / each preset;
quiz unselected / selected / revealed correct or incorrect / changed;
copy success / clipboard denial with manual selection; storage denied; source
collapsed / expanded. No loading, account or reconnect lifecycle exists locally.

Validation: independent sorting oracle for exhaustive/seeded small cases; a distinct
iterative lexicographic successor oracle for larger ranks; intermediate counts
and rank invariant; official and maximum cases; real Chromium all presets and
controls, widths 320/390/736/1440, 200% zoom, keyboard, both locales, blocked storage,
clipboard paths, source/download parity, local network, contrast, screenshots
visually inspected. Tests accept OUTPUT_DIR. Author self-check only; separate
review and actual learner teach-back remain pending. Ownership only leetcode/440/.
