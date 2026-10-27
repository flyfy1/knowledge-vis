# #1192 Critical Connections in a Network — author brief

Status: author run; independent review pending. No acceptance, publication, or learner outcome claimed. Reuses the approved five-step explainer pattern and exact shared tokens. Owns only `leetcode/1192/`.

Product fit: university algorithm learner; job is to discover why a bridge edge is detected by DFS low-link values and implement the official Python callable. Category: computing (LeetCode); stage: university.

Official verification: `provenance/official.json` records the browser-visible official statement, examples, constraints, and Python interface. A critical connection is an undirected edge whose removal disconnects reachability. Output order is arbitrary. Canonical source is `solution.py`; the canvas is a simulation and does not execute that source.

## Five steps

0. Known: an undirected graph and reachability. Question: which edge is actually a single point of failure? Input: 0-1-2-0 plus 1-3. Action: toggle removal on the tiny graph; observe the triangle stays connected while 1-3 isolates 3. Condition: simple undirected graph, no repeated edges.
1. Known: bridges are global connectivity facts. Question: why does checking every edge by re-running DFS scale poorly? Input: a four-node graph and edge-removal baseline. Action: compare all-edge baseline with one DFS tree; observe repeated work. Condition: baseline is an oracle for small graphs only.
2. Known: DFS discovery order. Question: what does `low[u]` mean? Input: preset graphs. Action: advance reversible trace; observe `tin`, `low`, parent edge and back-edge updates. Condition: undirected DFS skips only the exact parent edge; low is the earliest discovery time reachable from the subtree using tree edges plus at most one back edge.
3. Known: low-link invariant. Question: predict which traversed edges are bridges before reveal. Input: fresh graph with a cycle and a tail. Action: choose an answer, reveal, then change choice; feedback resets. Condition: bridge iff `low[child] > tin[parent]`; equality means a back edge returns to the parent and is not a bridge.
4. Known: rule and proof. Question: how does the Python submission map to the invariant and costs? Input: official signature. Action: inspect/copy/download exact source and related anchors. Condition: connected input per statement; recursion depth may require an iterative adaptation in constrained runtimes, while the submitted Python source follows the canonical recursive presentation.

## Terms and dependencies

Step 0: bridge/critical connection = edge whose removal breaks reachability; connected component = nodes mutually reachable.
Step 1: baseline = remove each edge and run DFS; DFS tree = parent-child discovery structure.
Step 2: `tin[u]` = discovery timestamp; `low[u]` = smallest `tin` reachable from u's subtree without crossing the parent edge; back edge = edge to an already discovered ancestor; invariant is stated and checked at every frame.
Step 3: strict `>` is required; `<=` would misclassify cycle edges.
Step 4: adjacency list, recursion, O(n+m) time and O(n+m) space.

Simulation limits: presets are small and deterministic; displayed frames are authored trace data, not execution of the official source. The baseline and oracle are independently implemented in `tests/test_solution.py`.
