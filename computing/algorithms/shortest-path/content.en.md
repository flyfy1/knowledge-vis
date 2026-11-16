---
lang: en
---

::: strings
back: ← Knowledge Index
category: Computing & AI
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Shortest Path · Flooding Out From the Start
tagline: Dijkstra’s algorithm “settles” the nearest node at a time: the shortest paths are forced out by the order in which the flood reaches things; see how it detours around mud on a weighted map and when it breaks.
:::

## From A to E, which route has the smallest total? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 The cost of a path
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Cost first
:::

This step asks: what does “shortest” mean in a weighted graph? A graph consists of **nodes** (A–F) and **edges** joining them, each with a **weight** (here a distance or time); a path’s cost is the sum of the weights of its edges, not the number of nodes. **What to do:** press the buttons to walk from A toward E one stop at a time (only to a neighbour you have not visited; you can Undo or Reset), and the readout shows your total cost and the known shortest cost. Try A→B→D→E (7+15+6 = 28) and A→C→F→E (9+2+9 = 20): the route with more stops is shorter. {#s0e .explain}

::: html step0-2
s0cv: A weighted undirected graph: orange is the path you have walked, numbers are edge weights
nextHop: Next stop:
undo: Undo one step
resetPath: Reset path
:::

::: strings
startLab: start
goalLab: goal
vBest: you found a shortest path
vLonger: {d} more than the shortest
vKeep: keep going to E, then compare
s0ro: Your path {path}: total cost {cost}; shortest path {bp}, cost {best}. {verdict}.
:::

## How can you find the shortest path without trying every path? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Settling like a flood
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Dijkstra’s algorithm
:::

This step asks: how can we systematically get the shortest distance from the start to every node? Each node keeps a **tentative distance** (the shortest distance found so far, initially ∞, and 0 for the start). Each round: among the nodes not yet settled, pick the one with the smallest tentative distance and **settle** it (red ring) — its distance is now final; then check each neighbour and, if going through it is shorter, update the neighbour’s tentative distance (orange). It is like water flooding outwards from the start: what the flood reaches first is the nearest. **What to do:** press “Step” or “Run” (pausable) and watch the number under each node. Green nodes are settled, orange are candidates; settling always goes in order of increasing distance. {#s1e .explain}

::: html step1-2
s1cv: Settling from start A: green = settled, orange = candidate (number = tentative distance), red = just settled
stepBtn: Step
run: Run
resetBtn: Start over
:::

::: strings
pause: Pause
stepCount: step {k}/{n}
none: none
s1ro0: The start A has distance 0 and the rest are ∞ (not yet found). Press “Step” to settle the nearest node.
s1ro: Settled {u} (final distance {d}); updated tentative distances of {rel}; candidates: {front}; settled: {done}.
:::

## Can an edge weight be negative? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Negative weights break it
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Its precondition
:::

This step asks: why does Dijkstra’s algorithm require non-negative weights? Its correctness rests on this: when a node is settled nothing shorter can show up, because every unsettled node is farther away and leaving it along a non-negative edge only makes things longer. With a negative weight that argument breaks. Here is a small directed graph: S→A 1, S→B 2, B→A (adjustable), A→C 1. Set the B→A weight below −1 (say −2): the algorithm settles A first (distance 1) and only later finds that going via B is shorter, but A is already “closed”, so C comes out wrong; cyan is Dijkstra’s answer and green that of Bellman–Ford, which has no such restriction. **What to do:** drag the B→A weight: at −1 or more the two agree; below −1 a red ring appears for any disagreement. {#s2e .explain}

::: html step2-2
s2cv: A directed graph (red edge = negative weight) and the distances from S found by the two algorithms
wL: Weight of B→A
:::

::: strings
rowDj: Dijkstra
rowBf: Bellman–Ford
wrongTag: Dijkstra gives a wrong answer here
rightTag: both algorithms agree
vWrong: Dijkstra gives C = {dj}, the right answer is {bf}
vRight: both agree
s2ro: B→A weight {w}: Dijkstra gets C = {dj} and Bellman–Ford {bf}: {verdict} (going via B to A costs 2 + w, below 1 when w < {crit}, and then it fails).
:::

## There is a patch of mud ahead: cross it or go round? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Shortest path on a map
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Shortest path on a map
:::

This step asks: what happens when the same algorithm runs on a map? Each grid cell is a node with moves between neighbouring cells, and entering a cell costs that cell’s weight: road 1, mud (brown, number = cost) adjustable. Walk from the green S to the red T. Blue shading shows the distance at which the algorithm settled a cell (brighter = nearer) and the orange line is the shortest path. **What to do:** drag the mud cost: at low cost the path goes straight through the mud; once it is high enough the path switches to the top row (12 more cells but each costs 1). The readout gives the total cost, the number of mud cells crossed and the all-road cost for comparison. The algorithm is unchanged; only the weights moved. {#s3e .explain}

::: html step3-2
s3cv: A grid map: blue = settled cells (brighter = nearer), brown = mud (number = cost), orange line = shortest path
legGrid: black = blocked (none in this map), brown = mud, blue = cells settled by the algorithm
mudL: Cost per mud cell
:::

::: strings
throughMud: crosses the mud
aroundMud: goes around the mud
s3ro: Mud cost {m}: the shortest path costs {cost} in {len} steps, {mudCells} of them mud cells ({kind}); with all-road cells it would cost {free}.
:::

## If you know the goal is to the right, must you flood in every direction? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 A\* looks at fewer cells
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Looking at fewer cells
:::

This step asks: can “roughly where the goal is” save work? <strong>A\*</strong> adds a **heuristic** h to every cell on top of Dijkstra: an estimate of the remaining distance to the goal (here the Manhattan distance, the horizontal plus vertical cell count; since every step costs at least 1 it never overestimates). It settles the cell with the smallest “distance so far + estimated remaining”, so it favours the goal’s direction instead of flooding evenly. **What to do:** switch between the two and compare how many cells are settled: A\* settles fewer — the most when the mud costs 1 (all road), less when the mud is expensive — while the total path cost is the same (the readout checks). The higher the mud cost, the more the heuristic underestimates. The map and mud cost are shared with the previous step. {#s4e .explain}

::: html step4-2
s4cv: The same map: the fewer cells settled (blue), the more efficient the search
nameD: Dijkstra
nameA: A\* (Manhattan heuristic)
:::

::: strings
explored: {n} cells settled
s4ro: {algo}: {n} cells settled (of {tot}); Dijkstra {nd}, A\* {na}; path costs {cd} and {ca}, equal: {same}.
:::

## Which node is settled next? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Predict the next one
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Try it
:::

This step asks: have you got the rule “pick the smallest tentative distance”? The graph is paused partway through the algorithm: green = settled, orange = candidate (the number below is the tentative distance). Choose the node you think will be **settled next** and press Check; “Next step” lets the algorithm advance one step for the next question, and “Start over” zeroes the score. Settled nodes cannot be chosen. {#s5e .explain}

::: html step5-2
s5cv: The algorithm part-way: predict the next node to be settled
guessNext: My pick:
chk5: Check
nx5: Next step
rs5: Start over
recapTitle: Recap
recap1: In a weighted graph a path’s cost is the sum of its weights; Dijkstra settles the node with the smallest tentative distance each time, so the order is by increasing distance and one run gives the shortest distance to every node.
recap2: It needs non-negative weights; a negative edge lets a settled node be improved afterwards, which needs Bellman–Ford. On a map, changing weights changes the shortest path.
recap3: A\* uses a “where is the goal roughly” heuristic to look at fewer cells, and as long as it never overestimates the result is still a shortest path.
modelTitle: Scope and limits of this model
modelText: Scope: small hand-made graphs, undirected (step 2 directed); the grid map allows only up/down/left/right moves with the cost of the cell entered; A\*’s Manhattan heuristic is guaranteed not to overestimate only if every step costs at least 1; this page uses a simple O(V²) implementation with no heap (priority queue), which makes no visible difference at this size; real navigation also needs live traffic, turn costs, hierarchical road networks and more.
link1: → Graph algorithms: first learn to visit every node of a graph
link2: → Network flow: another “best on a graph” problem
link3: → PageRank: accumulating importance on a graph
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: After step {k}: pick a candidate node and press Check. Score {score}/{tot}.
s5roOk: Correct: {next} has the smallest tentative distance {d}, so it is settled next. Score {score}/{tot}.
s5roNo: Not quite: you picked {pick}, but the candidate with the smallest tentative distance is {next} ({d}). Score {score}/{tot}.
docTitle: Shortest Path · Flooding Out From the Start
:::
