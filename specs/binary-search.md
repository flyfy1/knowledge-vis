# Binary search visual spec

- **Hook:** a sorted array and one target; grey cells make the discarded half visible.
- **Core invariant:** the target, if present, remains inside the closed interval `[lo, hi]`.
- **Causal control:** each “one step” performs exactly one midpoint comparison and updates one boundary; a target slider replays the same algorithm with a different branch path.
- **Accounting:** the complexity panel computes `n` linear comparisons versus `floor(log2(n)) + 1` binary comparisons from the same `n` slider.
- **Acceptance:** zh/en copy stays aligned; no hidden result state; `node tests/core.cjs`, `node --check app.js`, and `node --check i18n.js` pass.
