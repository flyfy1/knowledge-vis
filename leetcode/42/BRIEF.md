# 42: Trapping Rain Water

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Settle one position at a time. Compare the two running maxima before seeing which endpoint is settled. Cyan water remains visible and can be summed at the end.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/trapping-rain-water/.
How much water fits between unit-width bars? Heights are nonnegative, and water needs a wall on both sides. Return the sum of water depths at all positions.
1 ≤ n ≤ 20000; 0 ≤ height[i] ≤ 100000.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Each position outside the pointers has been settled exactly once. Gray blocks are bars, cyan blocks confirmed water; no cyan at an unsettled position does not mean it will remain dry. water is the settled total. Displayed pointers have advanced to the next cell; maxima refresh at the start of the next operation. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Settle one position at a time. Compare the two running maxima before seeing which endpoint is settled. Cyan water remains visible and can be summed at the end. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), auxiliary space O(1). One pointer moves each round, for at most n rounds. Python stores no per-position depths; the teaching view retains them separately. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `left_max / right_max` | Steps 1–2; repeated in step 4 | Running side maxima, not current bar heights | Arrays, indices, the stated input contract |
| `left / right` | Steps 1–2; repeated in step 4 | Endpoints of the unsettled range | Arrays, indices, the stated input contract |
| `water` | Steps 1–2; repeated in step 4 | Total water at settled positions | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Three wet positions: `[3, 0, 2, 0, 4]`.
- Official example: `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`.
- Increasing heights: `[1, 2, 3, 4]`.
- Single bar: `[4]`.

For [3,0,2,0,4], index 2 has left/right highest walls 3/4. Above level 3 water spills left, so the level is min(3,4)=3 and depth is 3−2=1. At indices 1 and 3 the same walls give 3−0=3 each. Ends hold 0: 0+3+1+3+0=7 units at unit width. Using only wall 4 incorrectly predicts middle depth 2; counting level 3 as depth includes the bar. These numeric steps appear before the baseline in both locales.

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


## Required-review repair scope (2026-10-18)

Report: `../../specs/reviews/42-review-1-c31e1a0d.md`.
Product-fit verdict: reuse the existing lesson, step order, paragraphs, tokens and
controls. The reader needs the concrete wall → level → depth bridge before code.
The existing independent finding supplies the requested design direction; this
repair adds no new feature or layout. P0 / highest-return slice: numeric hand
calculation in EN/ZH and valid lesson-local metadata. P1/P2: none. Deferred:
shared visual refinements remain outside this lesson's ownership and required fixes.
The canonical Python interface and shared trace are unchanged. New metadata is a
new candidate, not a repair of the historical review result. Both required IDs
remain fixed awaiting independent review; see `SELF-CHECK.md` for evidence.
