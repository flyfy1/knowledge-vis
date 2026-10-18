# #52 · N-Queens II — author brief

Date: 2026-10-18. Category: computing (LeetCode collection); stage: university.
Audience: readers who know Python loops, sets and recursion. Outcome: reconstruct a count-only backtracking algorithm and explain exactly when the count grows.

Product verdict: reuse the collection shell, common locale, controls and exact shared CSS tokens. Approved design and dispatcher adjudication: `specs/reviews/leetcode-all-hard-design-review.md`, D1–D10. This is an author candidate, not independent acceptance. Ownership is only `leetcode/52/`; registry and concept-map integration belong to the dispatcher.

## Verified official contract

Official URL: https://leetcode.com/problems/n-queens-ii/ . Verified 2026-10-18 through the public page and public GraphQL `question(titleSlug:"n-queens-ii")`. Free, Hard, ID 52. Input is integer n, 1 ≤ n ≤ 9; return the number of distinct nonattacking n-queen arrangements on an n×n board. Official examples: n=4 → 2, n=1 → 1. Public Python3 snippet: `class Solution: def totalNQueens(self, n: int) -> int:`. No mutation, ordering, modulus, empty-input or exception contract is specified. Out-of-range inputs are outside the lesson submission contract. No paywall access needed. Source evidence saved in tests/official.json.

## Learning loop and five steps

Each step uses these five fields in order: known; question; input/output; action/observation; conditions.

0. Knows chessboard coordinates; what is counted?; n and integer answer; hand enumerate n=4 branches by first column (0,1,1,0) and compare mirror leaves; n queens, no shared row/column/diagonal, reflections distinct. Show permutation baseline and explain repeated completed work.
1. Knows complete boards; why discard a prefix?; first r rows and next square; calculate c, r−c, r+c and inspect n=4 [0,2] dead end; existing attacks cannot be removed by future placements. Legal partial placements do not increment the answer.
2. Knows three constraint sets; when does count increase?; n=1…4 complete trace; next/back/reset/seek and preset restart reveal placements, rejects, undo and cumulative leaf receipt ledger; every event is retained, full snapshot semantics, count increments only at r=n. Rewind restores ledger too.
3. Knows local legality differs from completion; how many contributions from a fresh n=5 prefix [0,3]?; choose a completion count before reveal; reveal the legal remaining columns and full leaf or dead ends; independent quiz does not change when trace resets. Choice change hides prior feedback, language preserves state.
4. Knows counted leaves; how does Python return the count with no retained boards?; canonical source and cost; map count += 1, recursive descent and undo to diagram, copy/download; average O(1) set operations, exhaustive finite search, no symmetry reduction. Proof covers initialization, transition, coverage, uniqueness, restoration and termination.

## Terms and dependencies (also redefined locally)

- Step 0: row r / column c, zero based; arrangement = queen coordinates, not queen identities; permutation = one use of each column; count = completed arrangements only.
- Step 1: prefix = first r consecutive rows; diagonal keys c/r−c/r+c; pruning = skip an already invalid prefix; invariant = legal prefix and exactly its occupied keys; backtracking = restore all keys before next sibling.
- Step 2: event = just-completed action; Q is data, ×/? are rejection/undo annotations on empty squares; ledger = cumulative complete leaves, a teaching aid rather than returned boards.
- Step 3: contribution = number of complete descendants, not number of safe next squares.
- Step 4: V = visited incomplete legal prefixes, F = snapshots, S = complete leaves; auxiliary memory excludes teaching history.

## Mathematical design and numerical checks

Baseline enumerates permutations and checks pairwise coordinate distances independently of set-based recursion. Optimized state stores cols/down/up; a leaf contributes 1, all other prefixes 0 directly. n=4 branch totals by first column: 0,1,1,0. For fresh n=5 [0,3], legal third columns are {1}, and only complete descendant is [0,3,1,4,2]. Counting legal placements would overcount; treating mirrors as identical would undercount.

Use five sections because the mechanism needs contract, pruning, trace, retrieval and transfer, not an invented series of optimizations. All n=1…4 events are complete, no automatic animation. JS simulates Python; it does not execute Python. Max n=9 checked outside browser. Independent oracle, exhaustive legal prefixes, seeded prefix sampling and every trace invariant are author checks only.

## Exact visual contract and state matrix

Reuse `../style.css`: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93; inherited system font stack, line height 1.75, 14px panel radius, 8px controls. Local queen table, not Sudoku; no box borders. Local CSS overrides 48px targets and full-opacity disabled labels; 3px orange focus. No new palette. Local board cells use letters/symbols as well as color. No motion, external assets or loading state.

EN/zh states: start, placed, rejected, undone, leaf counted, terminal (including zero), rewound, preset restart; quiz unselected/selected/revealed correct/revealed wrong/change; clipboard copied/denied manual selection; storage unavailable memory locale. Locale keeps trace, selection, reveal, disclosures and focus. Empty/loading/reconnect/network execution are inapplicable to static local computation. Missing JS has bilingual noscript and source link.

P0/highest-return slice: causal count-only distinction, complete reversible n=4 search, fresh retrieval, exact Python parity, bilingual accessible controls and actual browser/oracle checks. P1: prior-state and operation disclosures plus related anchors. P2: no decoration planned. Deferred: universal renderer, Python runtime, symmetry optimization, automatic animation, cloud progress; none is necessary for this bounded lesson.

Validation: tests/algorithm.py, tests/core.cjs, tests/browser.cjs. Outputs support LESSON_TEST_OUTPUT_DIR. Inspect screenshots and contrast measurements, 320/390/desktop, landscape, 200% zoom, keyboard/forced colors, denied clipboard/storage. Independent review, real learner studies, actual LeetCode submission, deployment and public parity remain pending/out of scope.
