# 37: Sudoku Solver

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: The official example starts with candidates {1,2,4}. Step to an undo and watch the cell return to .; use the event slider to navigate. Long searches retain the first 180 events and the final board, with an explicit omission notice.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/sudoku-solver/.
How can we complete a 9×9 Sudoku? Each row, column, and 3×3 box must contain 1…9 exactly once; . is empty. The input has a unique solution, and the board must be modified in place.
Fixed 9×9 board; each cell is a digit character or .; a unique solution is guaranteed.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | At every recursive entry, sets exactly match the board and givens are unchanged. pos indexes the empty-cell list; r,c are zero-based board coordinates. candidates_at_entry retains candidates from before trying this cell. Orange marks givens, cyan the active cell, and thick boundaries identify 3×3 boxes. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | The official example starts with candidates {1,2,4}. Step to an undo and watch the cell return to .; use the event slider to navigate. Long searches retain the first 180 events and the final board, with an explicit omission notice. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | For E empty cells, a conservative bound is O(9^E) time and O(E) space for recursion and empty-cell positions. Constraint sets are constant-sized for a fixed 9×9 board. Pruning often reduces work without changing that upper bound. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `r, c, box` | Steps 1–2; repeated in step 4 | Board coordinates and 3×3 box index | Arrays, indices, the stated input contract |
| `rows / cols / boxes` | Steps 1–2; repeated in step 4 | Used-digit sets synchronized with the board | Arrays, indices, the stated input contract |
| `search(pos + 1)` | Steps 1–2; repeated in step 4 | Try completing remaining cells under this choice | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Official puzzle: failures and undo: `["53..7....", "6..195...", ".98....6.", "8...6...3", "4..8.3..1", "7...2...6", ".6....28.", "...419..5", "....8..79"]`.
- One remaining cell: `[".34678912", "672195348", "198342567", "859761423", "426853791", "713924856", "961537284", "287419635", "345286179"]`.
- Already solved: `["534678912", "672195348", "198342567", "859761423", "426853791", "713924856", "961537284", "287419635", "345286179"]`.

At (0,2) in the official example, the row excludes 5,3,7, the column excludes 8, and the box also excludes 6,9. Candidates are {1,2,4}. A candidate is not a solution: 1 is locally valid but can lead to a later dead end.

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
