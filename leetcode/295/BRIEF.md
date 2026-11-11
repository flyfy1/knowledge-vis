# BRIEF — #295 Find Median from Data Stream

- category: computing; stage: university; audience: readers who know sorted arrays and heaps.
- product verdict: build one problem-local bilingual lesson reusing the approved LeetCode explainer pattern and shared tokens.
- target outcome: reconstruct the two-heap invariant, hand-simulate updates, and implement the official `MedianFinder` Python interface.

## Five fields by step
1. **Already known:** median of a sorted list. **Question:** what must be retained after each stream update? **Input/output:** stream prefix → exact median. **Action/observation:** hand-sort `[5,2,10,4]`; see middle values. **Conditions:** integers, at least one value before query.
2. **Already known:** insertion into a sorted list. **Question:** why is repeated sorting too slow? **Input/output:** prefix → median and cost. **Action/observation:** compare sorted-list baseline with a split at the middle. **Conditions:** up to 5×10⁴ calls.
3. **Already known:** lower/upper halves. **Question:** which invariant lets two heaps expose the middle? **Input/output:** values → two heaps and sizes. **Action/observation:** step through presets and see each rebalance. **Conditions:** max-heap lower half, min-heap upper half, size gap ≤1, every lower ≤ every upper.
4. **Already known:** invariant. **Question:** can the learner predict the next median? **Input/output:** fresh stream → prediction. **Action/observation:** answer before reveal, then inspect arithmetic. **Conditions:** prediction uses both parity cases.
5. **Already known:** all transitions. **Question:** why is the Python class correct and what are costs? **Input/output:** callable class. **Action/observation:** map each diagram operation to code and copy/download it. **Conditions:** heap operations O(log n), query O(1).

## New terms
| term | first use | plain definition |
|---|---|---|
| median | step 0 | middle value, or mean of two middle values |
| stream | step 0 | values arriving one at a time |
| max-heap | step 2 | structure whose largest item is exposed |
| min-heap | step 2 | structure whose smallest item is exposed |
| invariant | step 2 | a condition preserved after every update |
| rebalance | step 2 | move one root so heap sizes differ by at most one |

Simulation is a JavaScript trace, explicitly separate from executing the canonical Python submission.

## Revision 2026-11-11

Review (review-range-1, B=1): two heaps announced up front with no example showing that only the two middle values matter; the trace displayed sorted arrays, not heaps; dead link to #215; zh labels mixed English; learner-facing review status.

Changes: step 2 now starts from the sorted-list insertion baseline (code shown with `bisect.insort`), then draws a cut through [2,4 | 5,10], inserts 1 and 0, and asks what was actually read: only the left's largest and the right's smallest, plus at most one value crossing the cut. Heaps are named only after that observation. New `core.js` ports CPython heapq push/pop line by line; the trace shows the heap arrays `solution.py` holds after every addNum, root marked, with each step's branch and rebalance move. Quiz explanation now walks the heaps. Links: #215 removed; #4 (median as a cut), #23 (min-heap), #480 kept. Labels localized; headings no longer double-numbered; footer status removed.

Verified: new `tests/test_trace.cjs` (page heap arrays and medians equal `solution.py` on 206 streams; quoted cut and quiz facts); `test_solution.py`, `test_core.js`, `browser.cjs`; no console errors or overflow at 1280/390/320 zh/en.

Changed by Claude Code (claude-opus-5-5), 2026-11-11, uncommitted working-tree change.
