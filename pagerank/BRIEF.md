# PageRank · build brief

- Slug: `pagerank` · category: `computing` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `eigen` (step 3 power iteration) and `graph-algorithms`. Neither covers ranking by links or random walks with teleport. Overlap low.

## Steps

### Step 0 · Who matters
- Reader knows: a graph as nodes and arrows.
- One question: is the most linked-to page the most important?
- Inputs / quantity: guessed page; sought: in-link counts vs PageRank order (d = 0.85).
- Controls / expected: pick a page, Reveal switches node sizes to PageRank; X (3 in-links) ranks below Y (1 in-link from important C). Reset clears the guess and hides the reveal.
- Holds when: this 8-page toy graph, d = 0.85.

### Step 1 · The random surfer
- Reader knows: PageRank as "probability of being on the page" (step 0).
- One question: how can "important" become a computable number?
- Inputs / quantity: damping d (0–0.99), steps (1/100/1000/auto, seed 77); sought: visit frequencies vs exact PageRank; TV distance.
- Controls / expected: bars grow and converge to the white ticks (TV ≈ 0.01 at ~10^4 steps); changing d clears the counts and says so; Reset clears everything.
- Holds when: random jump uniform over the 8 pages.

### Step 2 · Iterating
- Reader knows: the surfer's stationary distribution (step 1).
- One question: can PageRank be computed without simulation?
- Inputs / quantity: iterations k (0–60) at d = 0.85; sought: r_k, change, distance to the fixed point.
- Controls / expected: bars drift from 1/8 toward the white ticks; sum stays 1; distance falls by about ×0.85 per iteration. Play adds one iteration per 0.45 s; Reset returns to k = 0.
- Holds when: power iteration of r ← (1−d)/N + d·M r.

### Step 3 · The damping factor
- Reader knows: iteration (step 2).
- One question: what does d change?
- Inputs / quantity: d (0.05–0.99); sought: PageRank, ranking, iterations to reach L1 change < 1e-8.
- Controls / expected: small d → near-even scores and X high; d = 0.85 → A > B > C > Y > X; larger d → more iterations (64 at 0.85, 135 at 0.99).
- Holds when: this graph.

### Step 4 · Add one link
- Reader knows: PageRank.
- One question: which new link lifts a page most?
- Inputs / quantity: five candidate links; sought: new vs old PageRank and rank changes.
- Controls / expected: A → X lifts X from 0.067 to 0.209 (rank 5 → 2); D/E/F → Y changes Y by < 0.01 each.
- Holds when: example links only; no anti-spam modelling.

### Step 5 · Finale
- Recap and limits; deep links eigen#step3, graph-algorithms#step0, montecarlo#step1.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| in-link | 0 | number of links pointing to a page |
| PageRank | 0 | probability a random surfer is on the page (sum 100%) |
| damping factor d, teleport | 1 | probability of following a link; random jump otherwise |
| total variation distance | 1 | ½Σ|frequency − PageRank| |
| power iteration | 2 | repeated multiplication by the transition matrix |
| convergence | 2–3 | changes shrink toward zero |

## Simulation versus reality / model mismatch
8-node toy graph with no dangling pages (the code spreads dangling mass evenly, untested by the graph), uniform teleport, one fixed seed for the surfer. Real search ranking uses many signals and the web graph is huge and adversarial. Not validated by a human learner walk-through.
