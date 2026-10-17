# 4: Median of Two Sorted Arrays

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Keep one input fixed and execute the next operation. Inspect both cuts and all four boundaries; predict the search direction first. The readout shows the updated search range while the cuts retain the just-tested positions; rewind restores all state.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/median-of-two-sorted-arrays/.
How can we find the median without merging? Given two sorted arrays, return the middle value of their combined order, or the mean of the two middle values for an even length. The combined input is nonempty.
0 ≤ m,n ≤ 1000; 1 ≤ m+n ≤ 2000; values in −10⁶…10⁶. The required time is O(log(m+n)).

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Every candidate satisfies i+j=half; a valid cut remains in [lo,hi]. Once both cross comparisons hold, odd length uses max(aL,bL), while even length averages it with min(aR,bR). |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Keep one input fixed and execute the next operation. Inspect both cuts and all four boundaries; predict the search direction first. The readout shows the updated search range while the cuts retain the just-tested positions; rewind restores all state. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(log(min(m,n)+1)); auxiliary space O(1). Each comparison discards at least half the cuts; no merged array is created. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `i, j` | Steps 1–2; repeated in step 4 | Counts of elements before the two cuts | Arrays, indices, the stated input contract |
| `al, ar, bl, br` | Steps 1–2; repeated in step 4 | Values adjacent to cuts, with infinite empty-side sentinels | Arrays, indices, the stated input contract |
| `lo, hi` | Steps 1–2; repeated in step 4 | Remaining candidate cuts in a | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Odd total: `[[1, 3], [2]]`.
- Even total and boundary: `[[1, 2], [3, 4]]`.
- One empty array: `[[], [2, 3]]`.
- Duplicates and negatives: `[[-3, -1, -1], [-2, -1, 4]]`.

For a=[1,3], b=[2], manual merging gives [1,2,3], so the median is 2. For [1,2] and [3,4], the middle pair is 2 and 3, giving 2.5.

## Demonstration boundaries

Worked calculation, trace presets, and prediction are separate experiments.
The trace runs JavaScript, not Python. Full retained trace snapshots are teaching
storage and are excluded from the submitted algorithm's complexity claim.
For Sudoku, the first 180 events and final board are retained; an explicit final
notice identifies omitted events. Heap frames show completed operations, with
sift behavior explained in prose. DP retains the full table even where Python
uses rolling rows. Rewind restores a complete snapshot, not an inverse mutation.

## Verification

Run `python3 leetcode/tests/test_hard_solutions.py`,
`node leetcode/tests/test_hard_core.cjs`, and
`NODE_PATH=<playwright package directory> node leetcode/tests/test_hard_browser.cjs`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.
