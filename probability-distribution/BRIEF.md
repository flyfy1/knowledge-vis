# Probability Distribution · Mean, Variance, Tail

## Learning promise

After this lesson, a learner can read a discrete probability distribution, compute its weighted mean, distinguish mean from mode, explain variance as a weighted squared distance, and use a right-tail probability to answer a threshold question.

## Causal teaching chain

1. **Probability → shape**: each bar is an outcome and its height is `P(X=x)`; all bars are normalized to sum to 1.
2. **Shape → expectation**: the green line is `E[X] = Σ x·P(X=x)`, the balance point of the weighted bars.
3. **Expectation → spread**: `Var(X)` averages squared distances from that balance point; `σ` returns to outcome units.
4. **Spread → decision**: a threshold highlights the right tail and computes `P(X≥k)`.
5. **Misconception feedback**: the final check separates mode, mean, and one-trial outcomes with values from the current shape.

## Controls and guardrails

- Center, spread, skew, and threshold are range inputs with visible numeric outputs.
- Four presets make symmetry, skew and spread contrastable in one click.
- The model clamps inputs and normalizes weights, so the probability total remains 1.
- SVG chart includes accessible title/description and bar labels; the metrics and readouts use live regions.
- Language toggle updates the full page and persists the learner's choice locally.

## Evidence

- `tests/core.cjs` checks normalization, moments, tail monotonicity, skew response, and misconception feedback.
- Manual smoke path: preset → adjust all sliders → threshold → quiz → language toggle → reset.
