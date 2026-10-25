# #629 · K Inverse Pairs Array — author brief

Author candidate; independent lesson review pending. Category: computing / algorithms; stage: university. Chinese title is an authored translation. Reuse verdict: extend the approved LeetCode lesson shell, shared locale, exact shared CSS tokens and native controls; no new product or renderer framework. Authority: specs/reviews/leetcode-all-hard-design-review.md, dispatcher adjudication; website-design skill read before this brief.

Reader: knows loops, arrays and basic Python. Job: reconstruct a counting algorithm from a three-card permutation, then explain why a rolling sum counts each arrangement once. Learning loop: count pairs → insert the largest card → sum disjoint cases → slide the sum → predict a fresh case → map to executable Python.

## Verified official contract

Source: https://leetcode.com/problems/k-inverse-pairs-array/ accessed 2026-10-25; retained complete public GraphQL response and exact starter interfaces in provenance/official-graphql.json. Free, Hard. A permutation of 1…n, each value once; count index pairs 0 ≤ a < b < n with nums[a] > nums[b]. Return number with exactly k pairs modulo 1,000,000,007. Bounds 1 ≤ n ≤ 1000, 0 ≤ k ≤ 1000. Examples (3,0) → 1; (3,1) → 2. No input array, mutation, duplicates, empty official n, or special exception. Official Python3 starter: class Solution, kInversePairs(self, n: int, k: int) -> int. Python is preferred and supported; no non-Python exception. This is local execution evidence, not an accepted submission.

## Sequence and five fields per step

| Step | Known | Single question | Input → wanted | Action → visible observation | Conditions |
|---|---|---|---|---|---|
| 0 Count | ordered distinct cards | Which earlier/later positions count? | permutations of 1,2,3 → all inversion pairs | select each permutation; pair ledger and count change together | strict >, all index pairs, not only neighbors |
| 1 Insert | inversion definition | How many new pairs does inserting largest i create? | old [2,1], inserted 3 → new permutation and count | change x from 0 to 2; old pair retained, exactly x new pairs shown | x is cards to the right; unique maximum and deletion give bijection |
| 2 Slide | insertion partition | Can neighboring sums share work? | n,k presets → DP cells and answer | forward/back/reset/end/slider; retained table, old sum, entering/leaving terms and source indices remain visible | each frame is after one full cell update; modulo counts; bounded teaching n≤5,k≤6 |
| 3 Transfer | sum invariant | For n=5,k=2 which previous counts contribute? | fixed fresh question → chosen number, explicit reveal | choose, reveal, change; stale feedback clears; locale preserves selection/reveal | previous counts supplied; no answer or derived sum before reveal |
| 4 Implement | rolling invariant | Which Python variables preserve the proof? | official scalar n,k → integer modulo M | expand/copy/download exact canonical source; manual fallback if denied | k≥0,n≥1 official inputs; unreachable targets short-circuit |

## Concept dependencies and first appearances

Step 0: permutation = each card 1…n once; inversion = earlier larger card and later smaller card; modulo = remainder after division. Baseline = enumerate all permutations and test all pairs, O(n! n²) time, O(n) extra working space with streaming permutations (not retained output).
Step 1: i = largest inserted value; x = number of smaller cards to its right; j = desired pair count; D[i][j] = number of permutations 1…i with j inversions. D[0][0]=1 is the empty construction, not a new official input. Dynamic programming = store these smaller counts. Direct sum O(nk min(n,k+1)) for k≥1; more uniformly O(n(k+1)min(n,k+1)), O(k+1) rolling space.
Step 2: prev = completed i−1 row, cur = i row; window = sum of previous-row cells with indices max(0,j−i+1)…j; out-of-range cells are zero. Remainders are stored. Unknown '?' is uncomputed, distinct from numeric zero. Every step locally redefines needed quantities. After j: window equals D[i][j] modulo M; cur[0…j] complete. Row completion swaps prev=cur; no in-place overwrite.
Step 3 locally defines prior counts and x; Step 4 locally restates prev/cur/window and modulo semantics.

## Causal proof and wrong rules

[3,1,2] has two pairs although only one adjacent descent. Inserting 3 into [2,1] produces [2,1,3] with 1, [2,3,1] with 2, [3,2,1] with 3. Old pair (2,1) persists. Removing the unique largest value recovers a unique old permutation and x, proving disjoint/exhaustive cases. D[3] is [1,2,2,1]. For i=3, j=2 window prev[0…2]=1+1+0=2; j=3 adds prev[3]=0 and drops prev[0]=1, obtaining 1. Adding without dropping falsely gives 2, and dropping j−i+1 rather than j−i is an off-by-one. Deleting largest proves no missed/duplicate permutations; algebra proves rolling sum; induction and base row prove algorithm. Target above n(n−1)/2 is impossible.

## Design tokens and states

Exact inherited palette: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. No extra colors. Inherited system stack, 1.75 line height, title clamp(28px,5vw,46px), 14px stage radius, 8px control radius, 952px content; inherited 8/12/16/20/24/64px spacing; no animation. Local controls 48px, borders muted, disabled text opaque muted, focus 3px accent2 offset 4px. Native radio with localized legend; DP table scrolls in a named focusable region with sticky row headers. Selected/current uses border + text markers, not color alone. Local style plus shared CSS must stay under 25KB.

States × both locales: permutation selection; all 3 insertions; initial/middle/row-boundary/terminal trace; zero/unreachable count; start/end disabled; every preset restarts only trace; unanswered/selected/revealed/changed quiz; copied/manual selected fallback; open/closed source; unavailable storage (in-memory locale); offline source. No runtime fetching, loading, reconnect, timers, auth or remote execution, so these states are inapplicable. Language preserves all experiment state, focus, disclosure and feedback. Reset clears trace to base row, with no active process; quiz is independent.

## Scope and costs

P0: entire causal path, bilingual stateful experiments, Python parity, official evidence, exhaustive/oracle and browser checks. Highest-return 20%: insertion bijection and visible entering/leaving sum. P1: complete table replay and source fallback. P2: none. Deferred: auto-play, large-table animation, new framework and mastery statistics (no learner evidence). All input presets are complete simulations of the recurrence, not execution of Python. Canonical O(n(k+1)) time, O(k+1) auxiliary space including k=0; infeasible target returns in O(1). Teaching snapshots intentionally use more storage, O(n²(k+1)²) upper bound for copied tables; tiny bounded presets only. Brute oracle execution stays in tests.

Related existing anchors: ../552/#step2 (finite-state counting DP), ../600/#step1 (counting completions). Registry and global concept map are dispatcher-owned and untouched; lesson-entry.json supplies concept anchors for later registration.

## Verification and release boundary

Run tests/test_solution.py, tests/test_core.cjs, tests/browser.cjs and root metadata validate-only; scripts accept OUTPUT_DIR for emitted evidence. Independent brute permutation histograms, direct insertion sums, polynomial convolution and max-bound checks; verify intermediate frames and source binding. Real Chromium both locales, every preset and endpoint, fresh prediction, clipboard success/fallback, download bytes, 320/390/736/1440, zoom 200%, keyboard, storage denial, offline, local requests and contrast. Visually inspect emitted screenshots. Save command/results and frozen candidate hashes. Self-check is not independent acceptance or novice teach-back; release and separate reviewer remain pending.
