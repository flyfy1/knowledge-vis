# 量子基础 · build brief

A bilingual four-step lesson for a first quantum intuition: amplitudes, measurement, phase and interference.

- Pure core API: `amplitudes`, `probabilities`, `interferenceProbability`, `measurementOutcome`.
- Every slider exposes a visible value; dynamic readouts use `aria-live`; language switching preserves state.
- Scope: single qubit, ideal projective measurement, no decoherence, noise or entanglement.
- Validation: `node tests/core.cjs`, `node --check app.js`, browser smoke for sliders, measurement, language and quiz.
