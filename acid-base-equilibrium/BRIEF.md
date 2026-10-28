# Acid–Base Equilibrium · Brief

## Teaching contract
- Start with the causal picture: HA ⇌ H⁺ + A⁻ is active in both directions at equilibrium.
- Expose one control at a time: Ka, total concentration (dilution), then a common ion.
- Every slider changes the analytic equilibrium readout and the particle canvas, so the learner can connect composition to pH.
- Keep the distinction explicit: Ka is an equilibrium constant, not a reaction-rate control.

## Interaction contract
- `window.ACID_BASE.equilibrium(ka, c, common)` returns the quadratic equilibrium composition.
- `window.ACID_BASE.advanceState(state)` preserves the equilibrium target while showing stochastic forward/reverse events.
- All four teaching steps are bilingual and use the shared `knowledge-lang` preference.

## Scope and limits
The model assumes fixed temperature, ideal concentrations, and ignores water autoionization and activity corrections. The particle layer is illustrative; the quadratic readout is the quantitative anchor.
