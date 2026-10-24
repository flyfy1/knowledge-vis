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
