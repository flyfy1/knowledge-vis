# BRIEF — #315 Count of Smaller Numbers After Self

- category: computing; stage: university; audience: readers who know arrays, loops, and prefix sums.
- product verdict: build one problem-local bilingual lesson using the approved LeetCode explainer pattern and shared tokens.
- target outcome: calculate the exact counts by hand, see why forward scanning repeats work, derive the right-to-left frequency invariant, and implement the official Python `Solution.countSmaller` interface.

## Five fields by step
1. **Already known:** array positions and strict comparison. **Question:** what does each answer count? **Input/output:** `[5,2,6,1]` → per-position counts. **Action/observation:** select a suffix and inspect each smaller witness. **Conditions:** “right” means larger index; equality is not smaller.
2. **Already known:** definition. **Question:** why does the direct scan repeat work? **Input/output:** one array → baseline counts and comparisons. **Action/observation:** advance the current index and watch the comparison ledger grow. **Conditions:** baseline is exact but O(n²) time.
3. **Already known:** right side is the relevant suffix. **Question:** what state is enough when walking right to left? **Input/output:** suffix → sorted values and rank of current value. **Action/observation:** reveal each insertion and count strictly smaller values; predict a fresh step before reveal. **Conditions:** duplicates occupy separate positions and use `<`.
4. **Already known:** rank query. **Question:** how can a frequency summary answer “how many values < x” quickly? **Input/output:** bounded value → prefix sum. **Action/observation:** compare a naive frequency scan with a Fenwick tree update/query trace. **Conditions:** coordinate compression preserves order; each update/query is O(log n).
5. **Already known:** invariant and data structure. **Question:** can the canonical code be reconstructed and checked? **Input/output:** Python callable → output list. **Action/observation:** map code lines to trace, copy/download source, run verification cases. **Conditions:** n≥1, strict inequality, output aligned with original indices.

## New terms
| term | first use | plain definition |
|---|---|---|
| suffix | step 0 | the part of an array beginning at an index and continuing to the end |
| strict smaller | step 0 | a value x with x < current value; equal values do not count |
| baseline | step 1 | a simple correct method used as an independent reference |
| invariant | step 2 | a condition that stays true after every processed item |
| coordinate compression | step 3 | replacing ordered values by consecutive ranks while preserving order |
| Fenwick tree | step 3 | an array structure for prefix sums with logarithmic update/query |

Simulation is a JavaScript trace, explicitly separate from executing the canonical Python submission. The independent oracle is the quadratic baseline.
