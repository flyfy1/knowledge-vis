# Bounded exploratory search measurement for #818

Investigation only, not lesson code, an approved design replacement or acceptance.
The archived exact-source Mac baseline in ../818-performance-observation-20261026/
already measured the resource concern: target9809 used about1.195GB peak RSS,
whereas target10000 used about199MB. This is not an official failure/limit claim.
The Linux author has correctly left a smaller-distance DP completeness gap open.

Before the following experiment, ranked falsifiable hypotheses are:

1. An admissible remaining-command lower bound will reduce explored states enough
   to lower memory on the recorded targets without imposing an unproved position
   cutoff. Compare bounded prototype answers/counts/RSS to archived baseline.
2. Recognizing a car facing away from the target strengthens that bound: after a
   necessary reversal it has unit speed and must cover at least the old distance.
   Compare with the weaker speed-only bound under the same state/time caps.
3. Heap/dictionary overhead may negate the smaller search; if RSS or caps remain
   poor, reject this route as a practical improvement even if small answers match.

The experiment uses an unbounded state graph and preserves both legal transitions.
It returns only when a target is removed from the priority queue, permits improved
g-values to reopen states, and explicitly reports cap exhaustion. Caps are local
experiment protections, not pruning rules or acceptance thresholds for LeetCode.
Its lower-bound argument still needs independent examination. Small raw-command
BFS comparisons cannot prove the heuristic or large-case optimality by themselves.
No live author file, shared prompt, campaign state or public lesson is changed.

## Observations on this Mac

Commands: `python3 probe.py --small`; for each of9809,9879,10000 run
`python3 probe.py --target N` and `python3 probe.py --target N --weak` in separate
processes. Both variants matched independent unbounded raw-command BFS for1..64.
At250,000 stored states, both variants capped on9809/9879. Weak also capped on
10000; directional found45 using124,516 states and about45.7MB peak RSS.
The cap outcome is retained in results.json, not reported as a solved case.

A second bounded measurement used `--cap 1000000`, directional only:

| Target | Answer | Stored states | Peak RSS bytes | Seconds |
| --- | ---: | ---: | ---: | ---: |
| 9809 | 56 | 669016 | 146178048 | 0.672 |
| 9879 | 55 | 581444 | 135020544 | 0.600 |

The archived original BFS observations were about1.195GB and839MB respectively.
These measurements support a practical improvement on these specific inputs;
they do not establish a full-range runtime/memory maximum, official acceptance,
asymptotic improvement or a replacement teaching design. Heap memory is still
exponential in the optimal command depth in the worst case. Full-range resource
validation and independent heuristic proof remain pending. Do not remove the
known-working lesson or close818-RESOURCE-R1 based on this experiment.

The central author independently reported the requested smaller-distance DP proof
unresolved and preserved the working runtime at commit
`33686548c3c385cdb14b5b7262e4ca58a3b8d2f4`. This is a lesson-specific unresolved
revision; the campaign continued to827. Root can run future Mac measurements once
a replacement candidate exists, so Linux author location is a coordination issue,
not a mathematical or permanent access blocker.
