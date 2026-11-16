---
lang: en
---

::: strings
back: ← Knowledge index
pageTitle: Graph algorithms · let edges lead
tagline: BFS puts the next layer in a queue; DFS pushes the unfinished path onto a stack. Edit one edge and watch the frontier change.
foot: Graph algorithms · an editable small graph with replayable steps
graphReady: {v} nodes, {e} undirected edges. Start: {s}.
edgeOn: {a} — {b} is open
edgeOff: {a} — {b} is closed
stepDone: {algo} complete: visited {n} nodes, scanned {scans} adjacency entries.
stepIdle: Click “Step once” to start {algo}.
stepActive: Removed {node}; discovered {found}. Container left: {left}.
causal: After toggling {a} — {b}, next frontier: {frontier}
noFrontier: No new frontier; nothing reachable from the start.
metricV: Nodes V
metricE: Edges E
metricScan: Adjacency scans
metricVisited: Visited
bfsName: BFS
dfsName: DFS
barScan: Scans
barV: Nodes
barE: Edges
:::

## Treat the graph as an editable map {#step0 h2=s0t}

::: strings
nav0: 0 Graph as map
:::

Step 0 · Hook {#s0k .step-kicker i18n=text}

Nodes are places and edges are roads. Drag nodes to change the layout; click an edge or use the controls to open/close a road. Next you will see: **the same graph produces a different walk when its container changes.** {#s0e .explain}

::: html step0-1
fromLab: From
toLab: To
toggleEdge: Toggle this edge
resetGraph: Restore example
:::

Hint: edges are undirected. Click any node to make it the start; dragging changes only the picture, not the algorithm data. {#s0hint .hint}

## A queue makes BFS layer by layer; a stack sends DFS down one path {#step1 h2=s1t}

::: strings
nav1: 1 Queue vs stack
:::

Step 1 · Core move {#s1k .step-kicker i18n=text}

Take one observable action at a time: remove one node from the container, then add unseen neighbors. **FIFO queue** preserves layers; **LIFO stack** follows the newest branch first. {#s1e .explain}

::: html step1-1
bfs: BFS · queue
dfs: DFS · stack
stepOnce: Step once
play: Play
resetRun: Reset traversal
containerTitle: Current container
visitedTitle: Visit order
:::

Watch when a node enters the queue/stack and when it leaves. The container rule changes the order—not a slogan that “BFS is smarter.” {#s1hint .hint}

## Change one edge and the frontier rewrites itself {#step2 h2=s2t}

::: strings
nav2: 2 Change one edge
:::

Step 2 · Causal experiment {#s2k .step-kicker i18n=text}

Reset, toggle one edge, then step again. Focus on the **first different container state**: that is the causal chain from structure to behavior. {#s2e .explain}

::: html step2-1
edgeHint: Changed edge
frontierHint: Next frontier
goalHint: Experiment goal
goalText: Find the first fork
:::

Restore the example to return to a fixed baseline; toggle the same edge repeatedly to compare BFS and DFS. {#s2hint .hint}

## Complexity comes from how often nodes and edges are inspected {#step3 h2=s3t}

::: strings
nav3: 3 Complexity
:::

Step 3 · Accounting {#s3k .step-kicker i18n=text}

With adjacency lists, BFS and DFS each enqueue/push every node once and scan every adjacency entry once. Work therefore grows with **V + E**; the container changes order, not complexity. {#s3e .explain}

::: html step3-1
formulaNote: V: nodes · E: edges · an undirected adjacency list exposes 2E entries
:::

Close one edge and E drops by 1 (two adjacency entries), but the growth shape stays the same. Complexity describes scale, not this run’s stopwatch time. {#s3hint .hint}

## Turn the choice into a reusable rule {#step4 h2=s4t}

::: strings
nav4: 4 Synthesis
:::

Step 4 · Synthesis {#s4k .step-kicker i18n=text}

Choose BFS for layer or distance-from-source answers; choose DFS to follow a branch, backtrack, or find components. Both rely on a **visited set**, so cycles do not loop forever. {#s4e .explain}

::: html step4-1
finalRule: "Transferable rule: "
finalText: The container sets order, the visited set guarantees termination, and adjacency lists give O(V+E). Draw the frontier before writing code.
:::
