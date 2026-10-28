# 2026-10-29 · Probability Distribution

## Intent

Add a compact mathematics/probability visual that makes the causal sequence `P(X=x) → E[X] → Var(X), σ → P(X≥k)` re-computable by the learner.

## Implemented

- New bilingual page: `probability-distribution/`.
- Pure model for positive tilted Gaussian weights, moments, normalized probabilities, tail sums, and misconception feedback.
- Interactive SVG chart with mean/threshold markers and highlighted tail bars.
- Four presets, four sliders, live metrics, keyboard-friendly buttons, and reduced-motion CSS.
- BRIEF, acceptance spec, and focused Node tests.

## Verification

`node probability-distribution/tests/core.cjs`

Index registration is intentionally left for the main integration branch so it can be combined with other page additions without overwriting concurrent `pages.config.js` edits.
