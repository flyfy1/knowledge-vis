# Spec · Probability Distribution

## Job to be done

When a learner sees a probability table, they should be able to move from the visible shape to mean, variance, and a threshold probability without treating the mean as the most likely value.

## Acceptance criteria

- [x] Page is reachable at `/probability-distribution/` after index registration.
- [x] Chinese and English copy describe the same five-step chain.
- [x] Center, spread, skew, and threshold can be adjusted without reload.
- [x] SVG bars, mean marker, threshold marker, right-tail highlighting, and spread band update from one pure model.
- [x] Readouts expose `E[X]`, mode, `Var(X)`, `σ`, `P(X≥k)`, and threshold z-distance.
- [x] Quiz gives value-specific feedback for mode/mean/tail misconceptions.
- [x] Reset and language toggle work after arbitrary slider changes.
- [x] Core tests pass in Node without a browser dependency.

## Non-goals

- This is a finite discrete approximation, not a continuous density calculator.
- It does not introduce conditional probability or Bayesian updating; those have dedicated pages.
