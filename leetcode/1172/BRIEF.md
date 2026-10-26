# BRIEF · 1172 Dinner Plate Stacks

- Category: algorithms; stage: university; target: readers who know stacks and arrays.
- Product verdict: build one bilingual explainer reusing the approved LeetCode lesson pattern; no new framework.
- Author status: author run and self-check only; independent review is separate and not claimed here.
- Official contract verified 2026-10-27 from the public statement at https://leetcode.com/problems/dinner-plate-stacks/ (capture in `provenance/official-statement.txt`). Python class interface is supported and selected.

## Learning loop / outputs

1. Hand trace capacity 2 and five pushes; learner predicts before reveal.
2. Derive two invariants: smallest non-full index and largest non-empty index.
3. Counterexample to a single pointer after `popAtStack(0)` creates a hole.
4. Reversible bilingual simulation with prediction/reveal/change.
5. Map invariant to the exact Python submission, then run an independent oracle.

## Step contract

| step | known | single question | input/output | action and observation | conditions |
|---|---|---|---|---|---|
| 0 | stack push/pop | where do plates land? | capacity, values → stacks | advance five operations; stacks visibly change | capacity positive |
| 1 | stack ordering | what must always be true? | candidate index sets | change operation; heaps gain/lose indices | stale heap entries are cleaned |
| 2 | leftmost rule | why one pointer fails? | hole then push | compare wrong/new stack and correct stack 0 | `popAtStack` can create holes |
| 3 | operation semantics | can you predict return? | fixed scenario → value | choose, reveal, change question | prediction precedes reveal |
| 4 | invariants | how does code implement them? | official callable methods | copy/download exact source | Python is canonical submission |
| 5 | expected behavior | does optimization preserve outputs? | seeded operation traces | compare against scan oracle | includes boundary cases |

## New terms

- capacity: maximum plates in one stack; first used step 0.
- min-heap: priority queue whose top is the smallest index; step 1.
- invariant: a statement kept true after every operation; step 1.
- stale entry: heap index no longer matching current stack state; step 1.
- amortized: average cost over a sequence including cleanup; step 4.

Simulation is illustrative and does not execute the displayed submission. Workflow status is kept here and in evidence, never in learner copy.
