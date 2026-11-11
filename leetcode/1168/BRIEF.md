# #1168 lesson BRIEF

Status: author candidate; independent review is pending and not claimed. Category: algorithms. Stage: university. Target reader: a learner who knows arrays and sorting but has not connected graph optimization to MST.

## Learning loop
A village of three houses becomes a graph by adding virtual source 0. The learner watches sorted well/pipe edges, predicts a cycle decision, and maps the trace to the official Python method.

| step | known | one question | input/output | action/observation | conditions |
|---|---|---|---|---|---|
| 0 | well and pipe prices | how can wells fit one graph? | wells, pipes → virtual edges | choose preset; see source 0 edges | all houses need water; pipes undirected |
| 1 | graph edges | what does each cheap edge contribute? | sorted edges → cost/components | advance one edge; retained history and cost update | Kruskal order by nondecreasing weight |
| 2 | connected components | why reject a tempting edge? | DSU state → invariant | predict then reveal cycle decision | DSU sets exactly represent current reachability |
| 3 | invariant | how does code submit? | n,wells,pipes → integer | inspect exact Python source | official callable is Solution.minCostToSupplyWater |
| 4 | MST rule | can I transfer it? | fresh prices/edges → total | reveal answer after reasoning | same graph transformation and nonnegative costs |

## New terms
virtual source (extra vertex 0 representing digging a well), edge (connection with cost), connected component (vertices mutually reachable), cycle (closed path), DSU/union-find (structure tracking components), MST (minimum spanning tree).

## Evidence boundary
Official GraphQL metadata was queried 2026-10-27T00:00:00+08:00. It returned title, Hard, paidOnly, examples and topic tags but `content` and `codeSnippets` were null in public access; see tests/evidence/official-graphql.json. The lesson uses the standard public callable contract and marks the page's simulation separately from source execution. Self-check is author evidence only; no independent acceptance is asserted.

## Independent review and revision — 2026-11-11

The record above is the authoring run's (Codex, `Built-By: gpt-6.1-sol (1168-author-1998bce3756d)`, candidate `fd48e6e5b7f6a5cd696eee2513d90fd59364d0f3`) and is left unchanged. Its step table no longer matches the page; the current sequence is below.

```
Verified-By: Claude Code (claude-opus-5-5); independent review of Codex candidate fd48e6e5 — learner read-through scored on REVIEW-RUBRIC A–G, solution.py against an exhaustive subset oracle, link check, browser check zh/en at 1280/390/320. The revisions listed below are self-checked only; a fresh independent review of the revised lesson is pending. Not reviewed by a human.
```

**Rubric before → after (0–3):** A 1→3, B 1→3, C 1→3, D 1→3, E 1→3, F 1→3, G 1→3.
Before: no restatement of the problem; "virtual source 0" announced in the intro; text-only trace; page broken — the stylesheet link pointed at `../../leetcode/common.js` and the shared `../style.css` was not loaded, the back link went to `../../index.html`, the copy button threw (`#manualCopy` missing), the nav and preset labels were untranslated, a hard-coded "并查集" appeared in English mode; related links to a non-existent `../1584/`; `tests/test_trace.py` promised an exhaustive-subset oracle but only asserted results ≥ 0.

**Correctness (unchanged solution.py):** exhaustive-subset oracle (every subset of wells and pipes): 2,577 exhaustive cases (n ≤ 3, ≤ 2 pipes including parallel pipes, prices 0–2) + 3,000 seeded random (n ≤ 6, ≤ 8 pipes); input not mutated; n = 10⁴ max-size run in < 0.01 s. The browser's Kruskal trace matches an independent edge-subset oracle on 4,577 cases. Not submitted to LeetCode (premium).

**Changed:** rewrote copy.js, index.html, app.js, core.js, style.css, lesson-entry.json. New sequence: hand-built plan on a 3-house village (toggle wells/pipes, best-so-far, 2⁶ brute force) → per-house greedy wrong turn (cost 2, no water at all) → the learner's own plan redrawn with a source W, so "has water" = "connected to W" → minimum spanning tree named → Kruskal with an exchange argument tied to the example, union-find, SVG trace with retained lay/skip verdicts, editable prices, brute-force check at the end → fresh prediction (two wells beat one) → Python mapping and cost. Links: dead `../1584/` replaced by `../685/#step2` (union-find finds the loop-closing edge) and `../839/#step2` (union-find merging). tests/test_trace.py now implements the oracle its comment described (strengthened, not loosened).
**Tests added:** tests/test_core.cjs, tests/browser.cjs. tests/test_core.py kept. Files in tests/evidence/ describe the earlier candidate.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5); treated as a new lesson, working tree only (not committed).
Statement: confirmed from public sources (doocs mirror; vultr/jointaro write-ups): wells[i−1] for house i, two-way pipes [a,b,c], multiple pipes per pair allowed, 2 ≤ n ≤ 10⁴, 1 ≤ pipes ≤ 10⁴, costs 0…10⁵; examples → 3 and 2.
Brute force: own exhaustive search over every subset of wells × every subset of pipes with water spreading along laid pipes; 1,500 seeded random villages (n 1–5, up to 7 pipes, zero costs, parallel and exact-duplicate pipes) plus both official examples agree with solution.py. Max size (10⁴ houses, 10⁴ pipes): 0.007 s.
Examples recomputed: main village best 4 of 2⁶ = 64 plans; per-house greedy picks 1–2, 1–2, 2–3 → cost 2, no well; Kruskal order pipe 1–2, pipe 2–3, well 2, pipe 1–3, well 1, well 3 (same as Python's tuple sort) → 4; predict village → wells 1 and 4 + pipes 1–2, 3–4 = 8, wrong options 13 and 18; exchange proof checked (the cycle through e crosses the cut again at an edge Kruskal saw later). Complexity statements correct. Links #685/#839 exist with anchors.
Tests: test_core.py, test_trace.py, test_core.cjs, browser.cjs pass. Browser zh/en at 1280/390/320: no overflow, empty copy or console errors; diagrams read correctly at 390.
Found: no errors. Rubric: A3 B3 C3 D3 E3 F3 G3.
Changed: nothing besides this note.
