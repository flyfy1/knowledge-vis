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
