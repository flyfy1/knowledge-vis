# Overfitting · build brief

- Slug: `overfitting` · category: `computing` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `decision-trees` (my b4 page, depth vs new-data accuracy on trees) and `gradient-descent`. This page teaches the train/test gap on polynomial regression, data size, bias–variance and ridge; the decision-trees page covers only the depth→new-data pattern. Overlap clearly under 80%; cross-linked from the finale.

## Steps

### Step 0 · Fit a curve
- Reader knows: a curve and noisy points.
- One question: how curvy should the curve be?
- Inputs / quantity: degree d (0–11); sought: least-squares fit and training RMSE.
- Controls / expected: d = 0/1 stiff and far from the points; d = 11 passes through all 12 points (training RMSE ≈ 0) but swings between them.
- Holds when: 12 jittered points on sin(2πx) + N(0, 0.25²), seed 11, Chebyshev basis with ridge 1e-9 for conditioning.

### Step 1 · Training error and test error
- Reader knows: training RMSE (step 0).
- One question: does a smaller training error mean a smaller error on unseen points?
- Inputs / quantity: d and noise σ (0–0.5); sought: train and test RMSE (300 unseen noisy points, seed 4242), best degree, noise floor σ.
- Controls / expected: training RMSE falls to ~0, test RMSE is U-shaped with minimum near d = 5 at σ = 0.25 (0.29, close to the 0.25 floor); with σ = 0 the minimum moves to d = 11.
- Holds when: fixed seeds; test labels carry the same noise so the floor is σ.

### Step 2 · More data, more stability
- Reader knows: the train/test gap (step 1).
- One question: can more data cure overfitting for a flexible model?
- Inputs / quantity: n 10–80, fixed d = 9; sought: fit, learning curve, gap.
- Controls / expected: n ≈ 10–12 test RMSE far above σ; n ≥ 30 train and test converge near σ.
- Holds when: per-n points regenerated with fixed seed.

### Step 3 · New samples
- Reader knows: flexible fits behave badly (steps 1–2).
- One question: why are high-degree fits unstable across batches?
- Inputs / quantity: d and number of batches (button adds 1 or 5, max 20); sought: bias² and variance on 41 grid points.
- Controls / expected: d = 1: bias² ≈ 0.21, variance ≈ 0.01; d = 9: bias² ≈ 0.18, variance ≈ 3. Clear resets batches (not d).
- Holds when: ≥ 2 batches; numbers fluctuate with batch seeds.

### Step 4 · Regularisation
- Reader knows: overfitting from too much flexibility.
- One question: can the curve be tamed without lowering the degree?
- Inputs / quantity: λ = 10^−9…10; d = 11, 12 points; sought: train/test RMSE and the best λ in the scanned range.
- Controls / expected: λ tiny → train 0, test 2.8; λ ≈ 10^−1…10^0 → test ≈ 0.35–0.37; λ = 10 → underfit (test 0.52).
- Holds when: λ is chosen on the same test points here (real work needs a validation set).

### Step 5 · Finale
- Recap and limits; deep links decision-trees#step3, gradient-descent#step0, montecarlo#step2.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| polynomial degree, coefficient | 0 | highest power; adjustable numbers (d+1) |
| least squares, RMSE, training RMSE | 0 | minimise squared vertical errors; root-mean-square error; on the training points |
| test point, test RMSE, noise floor | 1 | points not used in the fit; error on them; noise std |
| learning curve | 2 | error against number of training points |
| bias, variance | 3 | how far the average fit is off; how much fits scatter between batches |
| ridge regression, λ | 4 | squared-error + λ·Σcoefficient²; penalty strength |

## Simulation versus reality / model mismatch
One-variable polynomial on a known smooth truth with Gaussian noise; seeds fixed, so numbers (including the "best degree") belong to this data set. No cross-validation, no separate validation set for λ, no model-selection uncertainty. Not validated by a human learner walk-through.
