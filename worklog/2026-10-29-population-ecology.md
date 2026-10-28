# 2026-10-29 · population ecology

- Built a self-contained bilingual lesson for logistic growth, carrying-capacity feedback, and predator–prey coupling.
- Added responsive canvas traces, native range controls, text readouts, language toggle, and a misconception check.
- Added a focused Node test for model functions; no external dependencies or deployment.
- Extended the predator–prey step with a bilingual phase-plane visual: the same trajectory is redrawn as N-versus-P, with start/end markers, orientation, and a text readout.
- Added `phaseSummary` regression checks for bounded ranges and the nearly-flat edge case; `node population-ecology/tests/population-ecology.cjs` passes.
