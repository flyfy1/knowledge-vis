# Acid–Base Equilibrium · Review Spec

- **Causal question:** what changes when a weak-acid system is made stronger, more dilute, or given a common ion?
- **Interaction proof:** Ka, total concentration, and extra A⁻ sliders recompute the quadratic equilibrium and redraw the particle field; pH and dissociation share are exposed as readouts.
- **Bilingual proof:** all visible teaching copy and controls are supplied in `zh` and `en`; the shared `knowledge-lang` setting switches both.
- **Model honesty:** the page labels the particle layer as illustrative and names fixed temperature, ideal concentrations, activity/water omissions.
- **Focused checks:** `node acid-base-equilibrium/tests/core.cjs`; `node --check acid-base-equilibrium/app.js`; browser smoke should verify index card, 390px layout, language toggle, and each slider readout.
