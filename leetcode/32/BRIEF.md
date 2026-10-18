# 32: Longest Valid Parentheses

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Process one parenthesis at a time. An unmatched ) resets the boundary; a matched ) highlights a contiguous suffix. Compare its length with best.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/longest-valid-parentheses/.
How long is the longest contiguous well-formed parentheses fragment? Choose a substring, never skip invalid characters inside it. Return its character count; empty text returns 0.
0 ≤ n ≤ 30000; characters are only ( and ).

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | best is the maximum over all processed endpoints; length is only the current valid suffix. The bottom boundary differs from the unmatched openings above it; −1 is not an input character. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Process one parenthesis at a time. An unmatched ) resets the boundary; a matched ) highlights a contiguous suffix. Compare its length with best. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), space O(n). Each index is pushed and popped at most once; nesting does not make the scan quadratic. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `stack[0]` | Steps 1–2; repeated in step 4 | Last uncrossable closing boundary, initially −1 | Arrays, indices, the stated input contract |
| `stack[-1]` | Steps 1–2; repeated in step 4 | Boundary before the current valid suffix | Arrays, indices, the stated input contract |
| `best` | Steps 1–2; repeated in step 4 | Maximum over all processed positions | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Reset the boundary: `")()())"`.
- Nested and adjacent: `"()(())"`.
- Unmatched opening: `"(()"`.
- Empty text: `""`.

In ")()())", indices 1…4 form "()()", length 4. In "(()", the valid suffix "()" has length 2. Counting all opening and closing parentheses does not determine the answer.

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

## Required-review revision: 32-R1 and 32-R2 (2026-10-18)

Product-fit verdict: reuse the existing lesson, layout, tokens and controls. The
reader's immediate job is to calculate validity before learning the saved-index
rule. This correction implements the independent review's requested bridge;
it adds no new feature or layout. Original review:
`../../specs/reviews/32-review-1-c7934545.md`. Independent re-review is pending.

P0 / highest-return slice: supply lesson-local metadata and replace the result-only
opening with explicit calculations in both languages. P1/P2: no additions.
Deferred: redesign and custom-input controls, because neither is needed to repair
the findings. Existing colors, typography, spacing and motion remain inherited.

The first reading path now defines pairing (including nested and adjacent pairs),
then balance as the count waiting to close. It explains negative-prefix rejection
and the zero-ending test before baseline code. For the same default input, scan
from 0 and reject; scan from 1 through balances 1,0,1,0,-1; then exclude every
other start. Calculate 4−1+1=4 explicitly. Use the second example `(()` to show why a positive ending is insufficient. The
counterexample `)(` rejects equal totals as a validity rule. The later independent
prediction `())(())` remains unrevealed until the learner chooses and checks.

Before the optimized rule, define a stack as end-only list operations, push as
append, pop as removal of the last item, and top as that item. Define suffix next
to its first use in the derivation. Connect the original hand calculation to
`[0,3] → [0]` at i=4 and length 4−0=4, explaining which rescanning is avoided.

32-R1: new `lesson-entry.json` uses Python and the single string
`O(n) time; O(n) auxiliary space`; deep links target existing steps. There is no
non-Python exception or supportedLanguages list to repair. Python is the preferred
faithful interface. Canonical `solution.py` and `python-code.js` remain byte-exact.
The source/mirror/export pair was read from `LANGUAGE_FILES` in the registration
script. No registration is authorized by this revision.

Done criteria: safe validation-only preflight passes; actual Python and trace
regressions pass; both translations show calculations before abstraction; browser
controls and exact source display/copy/download work in both locales. Evidence
and candidate hashes live under `evidence/fix-r1-r2/`. These are author self-checks,
not independent acceptance, a LeetCode submission, or novice comprehension data.
