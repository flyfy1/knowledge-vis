# #60 Permutation Sequence — author brief

2026-10-18. Reuse verdict: build one local lesson within the approved collection pattern, not a new layout/product. Design authority: `specs/reviews/leetcode-all-hard-design-review.md`, dispatcher D1–D10 and #60 obligations. Website-design skill read; independent pattern review already adjudicated. This is an author candidate; independent lesson review remains pending.

Audience: readers who know Python lists and integer division. Job: reconstruct the kth lexicographic permutation without enumerating its predecessors. Category computing; stage university. Learning loop: hand-order → count equal blocks → choose/remove/reduce → rewind and compare → predict fresh boundary → implement and verify.

Official verification: https://leetcode.com/problems/permutation-sequence/ and public https://leetcode.com/graphql/ on 2026-10-18. Free, Hard, frontend ID 60. Python3 snippet: `class Solution: def getPermutation(self, n: int, k: int) -> str`. Distinct digits 1..n, increasing lexicographic order; k is 1-based. n=1..9, k=1..n!. Examples (3,3)→213, (4,9)→2314, (3,1)→123. No empty/invalid input, mutation, modulus, callbacks, or external types specified. Chinese title is an authored translation. Evidence saved in tests/official-contract.json.

## Step contract

|Step|Already known|Single question|Input → wanted quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0 Order|digits and lists|What does kth mean?|n=3,k=4 → string|Read the six ordered strings and hand-group by first digit → 231|Distinct sorted single digits, 1-based k|
|1 Blocks|lexicographic order|Why can whole blocks be skipped?|m unused digits and rank r → index q and new rank|Follow 4,9 arithmetic, compare exact boundary 6/7 → q changes only at boundary|r zero-based, block=(m−1)!, 0!=1|
|2 Experiment|block division|What survives a digit choice?|preset or valid n,k → prefix, unused digits, residual rank|Choose a preset/custom n,k, advance, rewind, reset → equal block intervals and cumulative ledger match before/after|All official inputs, at most 10 frames; no omitted operations|
|3 Retrieval|division mechanism|Which digit follows at a fresh boundary?|n=5,k=49 → first digit and residual rank|Select, explicitly reveal, change choice → explanation clears|Independent of worked trace; answer not shown before reveal|
|4 Implementation|invariant|How does the proof become Python?|state transition → canonical code and costs|Inspect/copy/download source; follow mapping and test instructions|Official valid integers only; no acceptance claim|

## Term dependency / first appearances (redefined locally where reused)

Step 0: permutation = one ordering using every digit once; lexicographic = first differing digit decides; factorial n! = product 1..n (0!=1 at step 1); rank k = position starting at one.
Step 1: prefix = digits already chosen; unused sorted list; m = its length; r = zero-based offset among completions; block = completions with a fixed next digit; q = zero-based list index; remainder = offset within chosen block.
Step 2 repeats m,r,block,q and interval meaning adjacent to diagram; ledger before/after labels. Step 3 repeats zero-based residual rank. Step 4 repeats invariant and pop/index meaning.

Invariant: at loop entry unused is sorted, prefix contains each removed digit exactly once, target is the rth zero-based completion of prefix, 0≤r<m!. Equal contiguous blocks each have (m−1)! completions. divmod finds unique q and remainder; removing only unused[q] preserves sortedness and uniqueness. m decreases; at m=0 prefix is the target.

Baseline: itertools.permutations over sorted digits, islice to kth item, join. Independent enumeration; worst O(n·n!) time, O(n) working space with streaming iteration. Optimized Python Θ(n²) time due to list pop shifting, O(n) auxiliary and O(n) returned characters. Factorial precompute O(n). Under n≤9 integer arithmetic treated constant-cost; tutorial snapshots/ledger O(n²), not submission memory. JS is a deterministic visual simulation, never described as executing Python.

## Exact reused token contract

Use ../style.css without edits: --bg #0d1117; --panel #161b22; --panel2 #1c2330; --line #2b3547; --text #e8edf4; --muted #9aa7b8; --accent #6ee7ff; --accent2 #ffb454; --good #7ee2a8; --bad #ff7a93. Existing system font, heading clamp, 8px control radius, 14px stage radius, 1000px outer/952px content. Local overrides only 48px controls, readable disabled opacity 1, 3px accent2 focus, solid sticky background, wrapping and responsive grids. No new palette/shadows/motion. Total shared+local CSS <25000 bytes.

P0 / highest-return slice: causal block diagram, cumulative reversible ledger, exact Python, bilingual state and all required checks. P1: custom valid inputs and direct slider. P2: none. Deferred: automatic playback (no need), universal framework (one consumer), catalog edits/deployment (outside ownership), actual learner study and independent acceptance (separate runs).

States × locales: initial, partial, terminal, boundary presets, valid/invalid custom input, selected/unrevealed, revealed correct/incorrect, changed choice, copy success/fallback and denied storage all localizable. Locale keeps frame, fields, choices, disclosures and focus. No fetch/loading/reconnect state: assets are static; noscript provides bilingual recovery. No asynchronous animation or timers. Related concept links target existing #4/#51 anchors; concept registration deferred to dispatcher due file ownership.

Validation plan: independent itertools oracle exhaustive n≤7, seeded n=8/9, closed-form endpoints; JS trace check every transition/boundary against independent permutation ranking, source parity, real browser EN/ZH at 320/390/736/1440 and 200% zoom; endpoints/presets/custom invalid, prediction crossings, copy/fallback, denied storage, keyboard/focus, forced colors/reduced motion, local asset errors, links, measured contrast, inspect screenshots. All output-producing tests support OUTPUT_DIR. Self-check evidence only, no novice or submission claim.
