# 2026-10-29 · Acid–base composition chart

- Scope: `acid-base-equilibrium` common-ion step.
- Change: added a responsive canvas chart comparing no common ion with the selected A⁻ concentration; bars show undissociated HA versus dissociated share and annotate pH.
- Teaching chain: particle motion → slider → same-state analytic before/after chart → readout and model boundary. Chinese and English labels use the existing language toggle.
- Source contract: added `compositionData(state)` to expose baseline/current values from the existing quadratic solver without changing the model.
- Validation: `node acid-base-equilibrium/tests/core.cjs`; `node --check acid-base-equilibrium/app.js`.
- Browser QA: pending parent integration and site smoke pass.
- Built-By: Codex (chemistry visual lane)
- Verified-By: self-check (focused core assertions + syntax)
