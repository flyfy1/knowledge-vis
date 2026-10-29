# Backpropagation · build brief

- Slug: `backpropagation` · category: `computing` · stage: `university` (outline v2 draft, "R" pool; existing ids)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `gradient-descent` (teaches descent on terrains and momentum; does not teach where gradients come from) and `derivative`. Overlap well under 80%.

## Steps

### Step 0 · Forward pass and loss
- Reader knows: a function maps input to output; sigmoid as a squashing curve is explained in place.
- One question: given two weights, how far is the output from the target?
- Inputs / quantity: w1, w2 (x = 1, target 1.2); sought: a = w1·x, h = σ(a), ŷ = w2·h, L = ½(ŷ − 1.2)².
- Controls / expected: drag sliders or click the loss map; chain values change and the orange dot moves over a bright (low-loss) valley w2·σ(w1) = 1.2.
- Holds when: this one-path network, no bias.

### Step 1 · Nudge and see
- Reader knows: loss from step 0.
- One question: how can we measure one weight's share of blame without calculus?
- Inputs / quantity: chosen weight, its position, ε (10^-5 … 1); sought: secant slope (L(w+ε) − L(w))/ε vs exact slope.
- Controls / expected: shrinking ε turns the orange secant into the white tangent; readout difference shrinks roughly in proportion to ε.
- Holds when: smooth loss, ε large enough for rounding to be negligible (≥ 1e-5).

### Step 2 · The backward ledger
- Reader knows: slopes (step 1).
- One question: how can one backward sweep give every weight's slope?
- Inputs / quantity: w1, w2, progress 0–4; sought: dL/dŷ, dL/dw2, dL/dh, dL/da, dL/dw1 and their agreement with central differences.
- Controls / expected: advance progress or press Auto demo (one line per 0.9 s); lines appear with bars; the cross-check difference stays around 1e-10. Reset clears progress and stops the demo.
- Holds when: the chain-rule factors listed are the complete dependency (single path).

### Step 3 · Downhill
- Reader knows: gradients (step 2).
- One question: knowing gradients, how do we reduce the loss?
- Inputs / quantity: start (w1, w2), η; sought: trajectory, loss per step, stop reason.
- Controls / expected: η = 0.2 descends in 67 steps; η = 5 does not converge in 400 steps (bouncing); η = 8 leaves the map. Click on the map to set the start. Reset clears path and readouts and stops the run.
- Holds when: this network and the default start; other starts differ.

### Step 4 · Deep gradients
- Reader knows: backward multiplication of factors (step 2).
- One question: what happens to the gradients as the chain gets deeper?
- Inputs / quantity: n layers, shared w, activation; sought: |dL/dw_k| per layer (log axis), first/last ratio.
- Controls / expected: sigmoid at w = 1, n = 8: layer-1 gradient ≈ 1e-6 vs layer-8 ≈ 2e-2; ReLU at w = 1 keeps 0.5 in every layer; w = 2 makes gradients grow.
- Holds when: identical-weight single-neuron chain, one gradient evaluation, not training.

### Step 5 · Finale
- Question: recap of forward, nudge cost, chain rule, descent and depth. Deep links: gradient-descent#step1, derivative#step1, attention-mechanism#step4.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| sigmoid σ | 0 | squeezes any number into 0–1 |
| loss | 0 | gap between output and target, smaller better |
| slope, secant, ε | 1 | change in loss per unit change in the weight; line through two points; nudge size |
| chain rule, local slope | 2 | dL/dw = product of neighbouring rates, multiplied back to front |
| gradient, learning rate η | 3 | vector of slopes pointing uphill; how far each step goes |
| vanishing gradient | 4 | early-layer gradients become negligible because the product factor is below 1 |

## Simulation versus reality / model mismatch
Single-path, no bias, no batches, one scalar target. Real networks sum blame over many paths, use vectorised layers, mini-batches, and adaptive optimisers. Step 3 outcomes depend on this loss and start. Step 4 is a fixed-w chain and a single gradient evaluation, not a trained network. Not validated by a human learner walk-through.
