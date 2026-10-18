# 23: Merge k Sorted Lists

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: Pop the minimum head, then insert its successor. Inspect heap levels and output history; equal values keep distinct source:index labels. Frames show completed heap operations, not each internal swap.

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/merge-k-sorted-lists/.
How can sorted lists become one list? Each input list is ascending; return one ascending list containing all nodes. Empty lists have no head, and equal-valued nodes remain distinct objects.
0 ≤ k ≤ 10⁴; each list length ≤ 500; total nodes N ≤ 10⁴; values −10⁴…10⁴.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | Before each pop, each nonempty remaining list contributes exactly one head. The global remaining minimum is among those heads; the output prefix is sorted. source:index is permanent node identity; h in the heap is a storage position. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Pop the minimum head, then insert its successor. Inspect heap levels and output history; equal values keep distinct source:index labels. Frames show completed heap operations, not each internal swap. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O(k + N log(k+1)), auxiliary space O(k); output reuses input nodes. Initialization scans all k entries, including empty lists. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `(node.val, source, node)` | Steps 1–2; repeated in step 4 | Order by value, break ties with source ID | Arrays, indices, the stated input contract |
| `tail.next = node` | Steps 1–2; repeated in step 4 | Link the actual node to the output tail | Arrays, indices, the stated input contract |
| `heappush / heappop` | Steps 1–2; repeated in step 4 | Maintain at most k candidates | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Three candidate streams: `[[1, 4, 5], [1, 3, 4], [2, 6]]`.
- Empty lists and ties: `[[], [1, 1], [1], []]`.
- All empty: `[]`.

For [[1,4],[1,3],[2]], compare heads 1,1,2. After taking the first 1, only its successor 4 enters the candidates. The output is 1,1,2,3,4.

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

## Required-review revision contract (2026-10-18)

Source: independent report `../../specs/reviews/23-review-1-8b9525f6.md`.
Adopt LC23-R1's requested local definitions and concrete pointer table; adopt
LC23-R2's native browser zoom verification. These are corrections within the
existing step layout, not a new feature or layout. No child reviewer is authorized;
separate independent re-review remains pending.

Product-fit verdict: reuse this lesson's existing prose, table, localization and
controls. Audience/job: a basic-Python reader must reconstruct the actual returned
linked object, not only sorted values. Highest-return slice: show the old tail's
next changing while the selected node's successor survives.

P0: define val/next/None and the input list of heads in step 01; hand-calculate all
five identities; in step 03 show the default experiment's fixed events 0/1/3 with
old/new links, dummy and tail, actual reachable chains and logical ledger; in step
05 map construction, successor preservation, termination and dummy.next to Python.
P0 verification: execute actual Python with identity/cycle and pointer snapshots;
check all controls, source parity, both languages, narrow screens and native 200%
browser zoom. P1: numerical heap repair and the whole-list counterexample, included.
P2/deferred: new visualization machinery, animations and custom input; unnecessary
for the explicit table remedy, and would expand the reviewed interaction contract.

Terms: node.val/node.next/None and Python list of heads are defined in step 01.
Step 03 repeats next/None locally and defines dummy/tail before its table. Step 05
repeats allocation, aliasing, mutation versus variable reassignment, and return.
The table is explicitly a fixed default-input reference, independent of preset or
slider; the input rows retain original order, while the output ledger records only
the logically selected prefix. No claim that those rows depict current pointers.

Presentation contract: existing approved components and CSS tokens only; no CSS
changes, colors, motion, sizing rules, or new runtime state. Existing --text,
--muted, --line and --panel roles, system font, table-wrap overflow and responsive
breakpoints continue to apply. New table headers use scope=col/row. All added prose
and labels have equivalent en/zh strings. Empty/terminal and denied-permission
branches remain the existing control paths. Loading/reconnect/server actions are
inapplicable to this local static lesson.

Python remains the faithful preferred official interface, Solution.mergeKLists
returning ListNode or None; LeetCode supplies ListNode. There is no non-Python
language-contract.json or supportedLanguages list to correct. Exact registration
pair read: solution.py / python-code.js / PYTHON_SOURCE. Canonical source and mirror
are unchanged; their displayed/copied/downloaded/offline equality is rechecked.
Author evidence and stable finding mapping: SELF-CHECK.md. Status is self-checked
only when those checks pass, awaiting independent re-review; no acceptance claim.
