# Standing-wave phase landmark probe

- **Scope:** Add a computed nearest-node / nearest-antinode distance readout to Step 1.
- **Model:** `nearestLandmarks(x, λ)` selects the closest member of each analytic family; the canvas and readout share the same `x, λ` state.
- **Teaching result:** Learners can drag P away from presets and directly check the λ/2 spacing invariant without confusing a visual estimate with a calculated result.
- **Validation:** `node --check standing-wave/app.js`; pure landmark and i18n parity test; existing standing-wave phase-core smoke test.
- **Limits:** This is a geometric explanation aid. It does not claim a measured physical distance, alter animation, or model damping/dispersion.
