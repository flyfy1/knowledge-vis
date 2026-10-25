# #239 Sliding Window Maximum — implementation brief

- Category: algorithms; stage: university; target reader: someone who knows arrays and loops but has not used a monotonic deque.
- Product-fit verdict: build one problem-local interactive lesson using the approved LeetCode explainer pattern and shared tokens. The smallest useful outcome is that a reader can derive, trace, and implement the O(n) monotonic-deque solution.
- Official contract: `Solution.maxSlidingWindow(nums: list[int], k: int) -> list[int]`; public statement and GraphQL selector evidence are in `tests/evidence/official-source.txt`.

## Five-step learning loop

1. **Concrete quantity.** Known: an array and a window width `k`. Question: what maximum is visible in each consecutive window? Input: `[1,3,-1,-3,5,3,6,7]`, `k=3`; desired output `[3,3,5,5,6,7]`. Controls: move a highlighted window; observe exact members and max. Condition: windows are contiguous and move one index at a time.
2. **Baseline and wrong shortcut.** Known: each window can be scanned. Question: why does repeated scanning waste work, and why is “keep the previous max” wrong when it exits? Input: a small counterexample `[9,1,2,3]`, `k=2`; desired output `[9,2,3]`. Controls: advance baseline/shortcut trace; observe rescanned values and the expired 9. Condition: baseline is correct but O(nk).
3. **Discover the invariant.** Known: only candidates that can still win matter. Question: what can be discarded when a new value arrives? Input: `[1,3,-1,-3,5]`, `k=3`. Controls: step through push/pop trace; observe dominated tail values and expired head. Condition: deque indices stay increasing and values strictly decreasing from front to back (ties keep the newest index).
4. **Predict before reveal.** Known: front of deque is current window maximum. Question: after seeing a new index, which indices remain and what is the next maximum? Controls: choose answer, reveal, change choice; feedback explains expiration and domination. Condition: answer uses both expiration (`i-k`) and back domination.
5. **Canonical implementation and proof.** Known: invariant and output timing. Question: how does each trace action map to Python? Controls: copy/download/show exact source. Condition: each index enters and leaves deque at most once, so O(n) time and O(k) auxiliary space; `k=1`, `k=n`, negatives and duplicates are handled.

## New terms first used

| Term | First step | Plain definition |
|---|---:|---|
| sliding window | 1 | the `k` consecutive elements currently visible |
| deque | 3 | a double-ended queue supporting removal at both ends |
| monotonic decreasing | 3 | values from front to back never increase |
| expired index | 3 | an index left of the current window |
| dominated candidate | 3 | a value that a newer, larger value makes permanently useless |
| invariant | 3 | a fact kept true after every update |

Simulation is a visual trace of the algorithm’s state, never execution of the submitted Python. The baseline oracle in `tests/test_solution.py` is independently written with direct window scans.

## 2026-10-25 review repair scope

Adopt the supplied independent review `specs/reviews/239-review-2-99bc6fb4.md`:
P0 / highest-return change is **239-R2-01**, aligning array membership with the
completed insertion frame. At i=-1 no input is processed or highlighted. At
0<=i<k-1 highlight only [0,i], label it partial and emit nothing. Thereafter
highlight [i-k+1,i], label it a full window after the update; output is cumulative
across all completed full windows. State expired indices and unprocessed indices
in nearby text so the meaning is available beyond color. Preserve section 01's
left-edge convention and the existing core snapshots. Rewind and locale changes
must restore the same interval, deque and output.

P1 adopts **239-R2-N1** (localized dynamic reasons and an index:value legend) and
**239-R2-N2** (n=len(nums), exact baseline value-visit count, k=n boundary and
k=n/2 example). P2 has no deliverable. Deferred: layout redesign and suboperation
animation have no need in this scoped repair; reconsider only with a separate
teaching requirement. Publication requires separate independent review.

This carries forward the established layout and shared styling; no new feature,
layout, design token, animation, service or dependency is needed. Use existing
hint/readout typography for the scope and legend. Allowed presentation changes
are cell membership and localized explanatory readouts. All canonical Python,
core state, control transitions, prediction input and source transfer semantics
remain under regression checks.
