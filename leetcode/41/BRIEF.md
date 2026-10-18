# 41: First Missing Positive

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Advance through swaps and watch correct slots accumulate. Switch to duplicates and see how “destination already has this value” stops a cycle.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/first-missing-positive/.
What is the smallest positive integer missing from an unsorted array? Positive starts at 1; zero and negatives do not count. Use linear time and constant auxiliary space; the input may be rearranged.
1 ≤ n ≤ 10⁵; signed 32-bit integers. Required: O(n) time and O(1) auxiliary space.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Once x reaches x−1 it stays there. Out-of-range values and extra copies fill no new valid destination; the remaining gaps identify the answer. The lower row shows expected values, the upper row current values. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Advance through swaps and watch correct slots accumulate. Switch to duplicates and see how “destination already has this value” stops a cycle. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(n), auxiliary space O(1). The total number of while-loop swaps is O(n), not n for every i. The input array is mutated. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `target = nums[i] - 1` | Steps 1–2; repeated in step 4 | Destination saved before a swap; retained until next assignment | Arrays, indices, the stated input contract |
| `nums[target] != nums[i]` | Steps 1–2; repeated in step 4 | Prevent duplicate-value swap cycles | Arrays, indices, the stated input contract |
| `i + 1` | Steps 1–2; repeated in step 4 | Positive integer expected at this position | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Chained swaps: `[3, 4, -1, 1]`.
- Duplicate cycle trap: `[1, 1, 2]`.
- All out of range: `[7, 8, 9, 11, 12]`.
- Complete 1…n: `[2, 3, 1]`.

[3,4,−1,1] contains 1 and 3 but not 2, so the answer is 2. It is neither the minimum element nor necessarily the maximum plus one.

## Demonstration boundaries

Worked calculation, trace presets, and prediction are separate experiments.
The trace runs JavaScript, not Python. Full retained trace snapshots are teaching
storage and are excluded from the submitted algorithm's complexity claim.
Rewind restores a complete snapshot, not an inverse mutation. All placement
events are retained. Diagram-only operation markers are documented below.

## Verification

Run `python3 leetcode/tests/test_hard_solutions.py`,
`node leetcode/tests/test_hard_core.cjs`, and
`NODE_PATH=<playwright package directory> node leetcode/tests/test_hard_browser.cjs`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.

## Review repair contract (2026-10-18)

Focused repairs adopt required findings 41-R1/R2/R3 from
`specs/reviews/41-review-1-1c260097.md`; no new feature or layout.
Product-fit verdict: reuse the existing experiment for basic Python readers;
smallest useful outcome is an unambiguous operation-to-code mapping and readable
indices. Separate independent re-review remains pending.

P0 / highest-return slice: add valid lesson metadata; distinguish operation-only
markers from saved Python variables; restore essential index contrast in current
and previous diagrams. Done means preflight and bilingual browser regressions pass.
P1: explain set membership and work a tiny placement before the general rule.
P2: none. Deferred: new inputs/layout and shared runtime refactoring, because these
are unnecessary for the findings and outside lesson ownership.

Presentation contract: retain layout, focus, typography, controls and lifecycle.
Only `.trace-cell.hot small` uses existing `--text` (#e8edf4) instead of `--muted`
(#9aa7b8) on unchanged #164b59; target at least 7:1, never below 4.5:1.
`op_i` marks the just-described placement-loop position; `swap_to` marks the
just-completed swap destination. Both are display markers, not saved Python
variables. `∅` means no applicable marker, never a Python negative index.
After the first swap and skip, markers are op_i=0, swap_to=∅ while Python's
saved target remains 2. Final aggregate scan has no operation markers. The legend
is visible beside the state and repeated in the code mapping in both languages.
Initial, swap, skip and final states all use this contract; loading/reconnect are
inapplicable to this synchronous static lesson. Locale changes retain snapshots,
prediction and disclosures. The adapter only transforms marker state and removes
inactive highlight indices; array data, operation order and results are preserved.
