# Multi-armed bandits · build brief

- Slug: `bandit-arms` · category: `probability` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `montecarlo` (estimating by sampling) and `bayes` (Beta updating). No bandit/decision-under-uncertainty page. Overlap low.

## Steps

### Step 0 · Five machines, blind
- Reader knows: a probability as a win rate.
- One question: where should limited pulls go when win probabilities are hidden?
- Inputs / quantity: pulls on machines A–E (seeded game), reveal toggle; sought: estimated rate wins/pulls with ~95% error range, cumulative score vs ideal, expected regret Σ(p* − p_pulled).
- Controls / expected: bars update on each pull; reveal shows true rates (red), ideal line (green) and regret; New game picks other machines and clears everything (button says so); Reset returns to game 1 with 0 pulls.
- Holds when: independent Bernoulli arms with fixed probabilities.

### Step 1 · Explore versus exploit
- Reader knows: regret (step 0).
- One question: why does always pulling the current best lose out?
- Inputs / quantity: ε (0–0.5); sought: mean cumulative regret at T = 500 (80 runs) for greedy, ε = 0.1 and the chosen ε, on probabilities 0.25/0.40/0.50/0.62/0.45.
- Controls / expected: ε = 0 → ≈46, ε = 0.1 → ≈25, ε = 0.3 → ≈38; orange curve moves with the slider.
- Holds when: this arm set; each run starts with one pull per arm.

### Step 2 · Optimism under uncertainty (UCB)
- Reader knows: ε-greedy (step 1).
- One question: how can rarely pulled machines be given a chance systematically?
- Inputs / quantity: t (1–300), c (0.1–2); sought: estimate, bonus c·√(2 ln t / n), next choice, regret to t, from one seeded run.
- Controls / expected: small n → large bonus; the framed machine is the next pick; c up → more exploration; Play advances t (stops when hidden or off-screen); Reset stops and restores t = 30, c = 1.
- Holds when: c = 1 is textbook UCB1; smaller c is a heuristic with no such guarantee.

### Step 3 · Thompson sampling
- Reader knows: Beta posteriors are explained in place.
- One question: can beliefs themselves drive the choice?
- Inputs / quantity: t (1–300); sought: Beta(1 + wins, 1 + losses) per machine from one seeded run; draw one sample per machine and pick the largest.
- Controls / expected: curves narrow and move toward the true-probability ticks as t grows; Play/Reset as step 2.
- Holds when: uniform Beta(1,1) priors.

### Step 4 · Comparing strategies
- Reader knows: all four strategies.
- One question: which strategy has the least regret?
- Inputs / quantity: gap Δ (0.05–0.4) with probabilities 0.5 + Δ and four at 0.5; horizon T (100–1000); sought: mean regret over 60 runs for greedy, ε = 0.1, UCB c = 1, UCB c = 0.3, Thompson.
- Controls / expected: smaller Δ → all regrets rise; at Δ = 0.12, T = 600 Thompson ≈ 30 and UCB c = 0.3 ≈ 24 are below textbook UCB c = 1 ≈ 47 and greedy ≈ 41; textbook UCB over-explores for this horizon.
- Holds when: this arm set; ranking can change with Δ, T and c.

### Step 5 · Finale
- Recap and limits; deep links montecarlo#step2, bayes#step4, clt#step2.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| estimate, error range | 0 | wins ÷ pulls; ~95% interval |
| regret | 0 | sum of (best true probability − pulled machine's true probability) |
| greedy, ε-greedy | 1 | always best estimate; random pull with probability ε |
| UCB, c, bonus | 2 | estimate + c·√(2 ln t / n); exploration weight |
| Beta distribution, Thompson sampling | 3 | belief about a probability; pick the largest draw |
| gap Δ | 4 | best machine's advantage |

## Simulation versus reality / model mismatch
Stationary independent Bernoulli arms; real use has drift, context and delayed feedback. Regret uses true probabilities (only possible in simulation). Averages use fixed seeds and 60–80 runs, so curves fluctuate. Rankings (including UCB's constant) hold for these arm sets only. Not validated by a human learner walk-through.
