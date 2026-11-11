# #1192 Critical Connections in a Network — author brief

Status: author run; independent review pending. No acceptance, publication, or learner outcome claimed. Reuses the approved five-step explainer pattern and exact shared tokens. Owns only `leetcode/1192/`.

Product fit: university algorithm learner; job is to discover why a bridge edge is detected by DFS low-link values and implement the official Python callable. Category: computing (LeetCode); stage: university.

Official verification: `provenance/official.json` records the browser-visible official statement, examples, constraints, and Python interface. A critical connection is an undirected edge whose removal disconnects reachability. Output order is arbitrary. Canonical source is `solution.py`; the canvas is a simulation and does not execute that source.

## Five steps

0. Known: an undirected graph and reachability. Question: which edge is actually a single point of failure? Input: 0-1-2-0 plus 1-3. Action: toggle removal on the tiny graph; observe the triangle stays connected while 1-3 isolates 3. Condition: simple undirected graph, no repeated edges.
1. Known: bridges are global connectivity facts. Question: why does checking every edge by re-running DFS scale poorly? Input: a four-node graph and edge-removal baseline. Action: compare all-edge baseline with one DFS tree; observe repeated work. Condition: baseline is an oracle for small graphs only.
2. Known: DFS discovery order. Question: what does `low[u]` mean? Input: preset graphs. Action: advance reversible trace; observe `tin`, `low`, parent edge and back-edge updates. Condition: undirected DFS skips only the exact parent edge; low is the earliest discovery time reachable from the subtree using tree edges plus at most one back edge.
3. Known: low-link invariant. Question: predict which traversed edges are bridges before reveal. Input: fresh graph with a cycle and a tail. Action: choose an answer, reveal, then change choice; feedback resets. Condition: bridge iff `low[child] > tin[parent]`; equality means a back edge returns to the parent and is not a bridge.
4. Known: rule and proof. Question: how does the Python submission map to the invariant and costs? Input: official signature. Action: inspect/copy/download exact source and related anchors. Condition: connected input per statement; an explicit heap-backed DFS stack preserves the return step without relying on Python recursion depth.

## Terms and dependencies

Step 0: bridge/critical connection = edge whose removal breaks reachability; connected component = nodes mutually reachable.
Step 1: baseline = remove each edge and run DFS; DFS tree = parent-child discovery structure.
Step 2: `tin[u]` = discovery timestamp; `low[u]` = smallest `tin` reachable from u's subtree without crossing the parent edge; back edge = edge to an already discovered ancestor; invariant is stated and checked at every frame.
Step 3: strict `>` is required; `<=` would misclassify cycle edges.
Step 4: adjacency list, explicit DFS stack, O(n+m) time and O(n+m) space.

Simulation limits: presets are small and deterministic; displayed frames are authored trace data, not execution of the official source. The baseline and oracle are independently implemented in `tests/test_solution.py`.

## Independent review and revision — 2026-11-11

The record above is the authoring runs' (Codex, `Built-By: gpt-6.1-sol (1192-author-b4c3766882a1)` and `(1192-fix-5d7b662f24a3)`, candidate `dbcc0dc09d4ff175ddadf05ad74f5a1e9f04c8af`) and is left unchanged. Its five steps were replaced by the sequence below.

```
Verified-By: Claude Code (claude-opus-5-5); independent review of Codex candidate dbcc0dc0 — learner read-through scored on REVIEW-RUBRIC A–G, solution.py against a cut-every-edge oracle, link check, browser check zh/en at 1280/390/320. The revisions listed below are self-checked only; a fresh independent review of the revised lesson is pending. Not reviewed by a human.
```

**Rubric before → after (0–3):** A 2→3, B 1→3, C 2→3, D 2→3, E 1→3, F 2→3, G 2→3.
Before: low[u] defined and the `low[c] > tin[p]` rule stated before any example showed why; step 1 said "toggle edge removal" but was a static table; the trace was a tin/low table without a graph; a related link pointed to a non-existent `../802/`; a footer announced workflow status in the learner UI.

**Correctness (unchanged solution.py):** 1,542 exhaustive connected graphs (n ≤ 5, two edge orders) + 2,000 seeded random connected graphs against removing each edge and re-searching; 10⁵-node path (all bridges, no RecursionError) and 10⁵-node cycle (none). The browser trace core agrees with a union-find cut oracle on 54,950 exhaustive connected graphs (n ≤ 6) and 3,000 random graphs (n ≤ 40), and every return-event verdict equals the cut test. Not submitted to LeetCode.

**Changed:** rewrote copy.js, index.html, app.js, core.js, style.css, lesson-entry.json (zh title now the official 查找集群内的关键连接). New sequence: cut each of 8 cables on a 7-server network, with detours and a running work count (168 visits), brute-force cost → the safe cables all lie on loops; DFS tree/back edges, pressing a back edge highlights the tree edges it covers; uncovered = the critical ones; the "arrival cable is not a back edge" wrong turn → tin and one number reported upward, low; strict `>` with the equality case → SVG trace with tin/low, retained history, cut-test check at every return, editable cables → bowtie prediction (articulation point but no bridge) → Python mapping and cost. Links: dead `../802/` and the unrelated #51 replaced by `../928/#step1`, `../685/#step2`, `../924/#step2`. tests/test_solution.py kept its original tests and is now runnable without pytest.
**Tests added:** tests/test_core.cjs, tests/browser.cjs. Files in tests/evidence/ and tests/SELF-CHECK.md describe the earlier candidate.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5); treated as a new lesson, working tree only (not committed).
Statement: confirmed from a public mirror (doocs: 2 ≤ n ≤ 10⁵, n−1 ≤ connections ≤ 10⁵, no self-loops or repeats, connected; examples [[1,3]] and [[0,1]]); it matches `contract`.
Brute force: own cut-and-count-components test vs solution.py on every connected simple graph with 2–5 nodes, each in two edge orders/orientations (1,542 runs), and 2,000 seeded random connected graphs up to 12 nodes: all agree, no duplicate bridges. Timing: path of 10⁵ nodes 0.047 s (99,999 bridges, no recursion), cycle of 10⁵ nodes 0.051 s.
Claims recomputed: main network DFS reaches servers in numeric order (tin = id), back edges 2–0 and 5–3 cover 0–1, 1–2, 3–4, 4–5; bridges 1–3 and 5–6; low of {3,4,5,6} = 3 > tin[1] = 1; low of {1,2} = 0; cut test 7 + 2·7 = 21 visits per cut, 168 in total; 10⁵·2·10⁵ = 2×10¹⁰; bow-tie predict: low[3] = low[4] = 2 = tin[2], answer empty. Links #928/#685/#924 exist with anchors.
Tests: test_solution.py, test_core.cjs, browser.cjs pass. Browser zh/en at 1280/390/320: no overflow, empty copy or console errors.
Found: no errors. Rubric: A3 B3 C3 D3 E3 F3 G3.
Changed: nothing besides this note.
