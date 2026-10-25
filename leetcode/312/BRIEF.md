# #312 Burst Balloons — local brief

2026-10-24 author candidate. Category: algorithms/computing. Stage: university. Target: readers who know Python lists, loops, and multiplication. Product verdict: build one local lesson inside the approved LeetCode pattern; no shared framework or registry changes. Design review and dispatcher already approved the reused pattern; independent lesson review is pending.

Official source: https://leetcode.com/problems/burst-balloons/ (accessed 2026-10-24). Free Hard. Statement: burst every indexed balloon; gain current left × current × current right, out of bounds treated as 1; return maximum coins. Examples [3,1,5,8]→167 and [1,5]→10. Constraints n=nums.length, 1≤n≤300, 0≤nums[i]≤100. Python3 callable observed as `class Solution: def maxCoins(self, nums: List[int]) -> int` (the source uses a compatible built-in generic annotation).

## Step contract

| Step | Already known | One question | Input → wanted quantity | Action → visible observation | Applies when |
|---|---|---|---|---|---|
| 0 | arrays and multiplication | Why is order nonlocal? | [3,1,5] → max coins | hand-calculate two orders; see largest-first counterexample | all valid inputs; sentinels explain boundaries |
| 1 | local gains | How can a last burst fix neighbors? | open interval (left,right) → dp value | choose `last`; compare left/right subinterval values | every interval has fixed sentinel/balloon boundaries |
| 2 | recurrence | What accumulates and in what order? | preset nums → DP table | advance one interval, rewind/reset, inspect retained cells | trace is a simulation of the recurrence, not Python execution |
| 3 | invariant | Can the rule transfer? | [2,1,2], values=[1,2,1,2,1], last padded index 3 (original nums[2]) → product term | predict, reveal, change answer; feedback is cleared on change | boundary product uses interval sentinels |
| 4 | recurrence and proof | How does code preserve it? | source → executable Python | inspect/copy/download and map loops | official Python submission contract |

## Terms first introduced

Sentinel: an artificial boundary value 1. Open interval: endpoints excluded. `last`: final balloon inside the interval. `dp[left][right]`: maximum coins for bursting all balloons strictly between endpoints. Subproblem: one of the two smaller intervals after choosing `last`. Invariant: a fact true at every loop entry. Width: endpoint distance used to order intervals.

## Model mismatch and evidence

The DP table is an explanatory simulation; it does not execute the browser code as Python. The official submission is `solution.py`. A brute-force recursive oracle independently checks small arrays. Teaching snapshots are not extra submission space.

## Tokens and scope

Reuse `../style.css` tokens exactly: #0d1117, #161b22, #1c2330, #2b3547, #e8edf4, #9aa7b8, #6ee7ff, #ffb454, #7ee2a8, #ff7a93. Local CSS only adds DP table states and 48px controls. P0 is causal interval DP, cumulative table, exact source, bilingual states. P1 is preset switching and reversible controls. P2 none. Deferred: autoplay, shared visualization framework, registry/deployment, independent acceptance, novice study.

## Validation plan

Run exhaustive brute-force comparisons for arrays of length ≤6 over a small alphabet, seeded random arrays, official examples, zeros and singleton boundaries; verify every DP frame invariant and endpoint replay. Browser-check both locales, presets, forward/back/reset, prediction reveal/change, copy fallback, keyboard/focus, 320/390/desktop/200% zoom, local asset loading, source parity and contrast. Record self-check only; independent review remains required.

## R312-INDEX-001 correction contract (2026-10-25)

Reuse the reviewed layout and interaction. P0: give the fresh exercise the same
zero-based padded coordinates as the recurrence. Show the full padded input,
identify `last=3` as original `nums[2]`, and ask only for the last-step product.
Boundaries `(0,4)` remain sentinel 1s, so `values[0]*values[3]*values[4]=2`.
The options 4 and 1 respectively retain a burst neighbor or use padded index 2
instead of 3. Reveal explains both. Changing selection clears feedback; switching
locale preserves it. Trace controls remain independent of this fixed exercise.
P1/P2: none. Deferred: new layouts/features and independent acceptance; a separate
reviewer must recheck this frozen candidate. No new tokens or CSS are needed.

Author-found R312-HAND-001: the largest-first counterexample must remove 5 before
continuing. Its remaining [3,1] yields at most 6, hence 5+3+3=11, not 23. The
alternative continuation yields 9. Both locales now enumerate these moves.
