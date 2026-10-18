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

## Review repair candidate 37-r2 (2026-10-18)

Scope: only this lesson; the designated independent review is
`specs/reviews/37-review-1-807e6ed8.md`. Its four required recommendations are
adopted. This repairs the existing teaching sequence and state presentation;
no new feature, layout, shared runtime or solver is introduced. Target reader
and five-step learning loop above remain the contract. Independent acceptance
and finding closure remain pending a separate review.

P0 / highest-return slice: make the failed choice calculable before abstraction
(37-R02), test a fresh calculation (37-R03), supply metadata (37-R01), and wrap
state keys within their existing grid column (37-R04). Done means bilingual
causal copy, executed Python/source parity, readable intermediate states and
passing non-mutating metadata validation. P1/P2: none. Deferred: new presets,
solver optimizations and decoration, because they are outside the required fixes.

The worked branch in step 01 uses the actual official trace, events 9–14:
`5312748..` → try 9 at (0,7) → `53127489.` → (0,8) needs 6 but its
column contains 6 → restore (0,7) and its three projections → return to (0,6).
The full official input and every projection needed for that two-cell calculation
are visible. This is a temporary branch of the original puzzle, not a new
unique-solution input or a claim that the next attempt succeeds. Baseline returns
True for completion / False for failure. Step 02 defines set membership/add/remove
using that same column, then explains integer division and box numbering before
the general invariant. Step 05 derives the geometric search bound.

New first definitions: backtracking in step 01 after a concrete undo; set,
membership, add/remove, lists of nine sets, integer division, box index in step 02
before the formula. Fixed-width membership saves rescans, not the search tree.

Fresh step-04 input: solved-board first row with (0,0),(0,1) erased;
row `..4678912`, column `.61847923`, box `..4 / 672 / 198`.
The learner computes {5}, with row-only {3,5} and empty-set distractors.
The answer/calculation stays hidden until explicit reveal. Existing option order,
feedback clearing, locale persistence, and experiment isolation are preserved.

Presentation hooks: new lesson-local `lesson.css` only applies `min-width:0` and
`overflow-wrap:anywhere` to `#state dt`; shared layout, colors, fonts, spacing,
focus and disabled rules are reused exactly. No new color or spacing literals.
Existing tokens: text #e8edf4 / panel #161b22; muted #9aa7b8 / panel #161b22;
accent #6ee7ff; givens/focus #ffb454; active fill #164b59. Existing 13px mobile /
14px desktop state typography is preserved. Reflow must prevent glyph overlap,
not merely page overflow, at 320/390/736/1440 and 200% CSS magnification.
No new asynchronous, empty/loading/error branches are added. Browser branch matrix:
EN/ZH × initial/placement/dead-end/undo/final × all presets; all three quiz answers,
revealed and changed; source display/copy/fallback/download; offline + denied storage.
Evidence is author self-check only; native zoom, real devices, screen readers,
novice comprehension and public delivery are not established.
