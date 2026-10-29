# Recursion and divide-and-conquer · build brief

- Slug: `recursion-divide` · category: `computing` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `binary-search` (halving, steps/complexity) and `sorting` (step 2 "divide and conquer" in a race of sorts). This page teaches recursion itself (call stack, base case), Hanoi, recursion-tree shape vs cost, and the merge-sort execution order. Overlap well under 80%.
- Outline note: the draft says Hanoi and binary search are "isomorphic". They are not (different recursion trees and costs); this page shows the contrast instead and says so in the model-limits card.

## Steps

### Step 0 · A function calls itself
- Reader knows: a function and multiplication.
- One question: what happens when a function calls itself?
- Inputs / quantity: n (1–8) and execution step s (0–2n); sought: stack frames (n pushes then n returns), result n!.
- Controls / expected: frames pile up for n steps (blue), then turn green from the base case outward with values; Play advances one step per 0.6 s; Reset stops and clears to n = 4, step 0.
- Holds when: factorial with base case 1! = 1.

### Step 1 · Towers of Hanoi
- Reader knows: stack idea (step 0).
- One question: how do you move a whole tower?
- Inputs / quantity: n (1–7), move k (0–2^n − 1); sought: peg contents after k moves, current move and phase, T(n) = 2T(n−1) + 1.
- Controls / expected: disks move legally, the phase text switches at moves 2^(n−1)−1 → 2^(n−1) → after; Play 0.3 s per move; Reset to n = 3, move 0.
- Holds when: classic 3-peg rules, optimal recursive solution.

### Step 2 · The recursion tree
- Reader knows: Hanoi's doubling (step 1).
- One question: do different recursions grow the same tree?
- Inputs / quantity: kind (Hanoi / binary search / merge sort) and m; sought: blocks per level, work per level, total work (2^m−1; m+1; n·m with n = 2^m).
- Controls / expected: Hanoi widths double per level; binary search one block per level; merge sort doubles with constant work n per level.
- Holds when: work counted per kind as stated (different units, shapes only).

### Step 3 · Growth rates
- Reader knows: totals per kind (step 2).
- One question: how different is the cost as n grows?
- Inputs / quantity: n (1–64); sought: 2^n−1, n·log2 n, n, log2 n + 1 on a log axis, time at 10^9 steps/s (assumed).
- Controls / expected: n = 64 → Hanoi 1.8×10^19 moves ≈ 584 years; merge sort 384 steps ≈ 384 ns.
- Holds when: the 10^9 steps/s figure is only an assumption.

### Step 4 · Divide and conquer
- Reader knows: recursion trees (step 2).
- One question: in what order does merge sort's tree actually run?
- Inputs / quantity: event step 0–14 on 8 seeded numbers; sought: split/merge events, recursion stack, comparisons (≤ n log2 n = 24).
- Controls / expected: orange frame = split, green = merge; stack bars grow/shrink; New numbers reseeds and returns to step 0 (label says so); Reset restores the initial array.
- Holds when: 8 numbers in 1–9; top-down merge sort.

### Step 5 · Finale
- Recap and limits; deep links binary-search#step1, sorting#step2, exp-log#step0.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| base case | 0 | smallest case answered directly |
| call stack | 0 | pile of calls still waiting for a result |
| T(n), recurrence | 1 | moves for n disks; T(n) = 2T(n−1) + 1 |
| recursion tree | 2 | calls as blocks, subproblems on the next level |
| divide and conquer, merge | 4 | split, solve halves, combine two sorted halves |

## Simulation versus reality / model mismatch
Exact counts come from the code running on the page; time conversion assumes 10^9 steps/s. No discussion of stack overflow, tail calls, cache effects or the master theorem. Not validated by a human learner walk-through.
