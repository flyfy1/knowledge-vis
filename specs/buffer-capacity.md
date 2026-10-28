# Buffer capacity visual spec

## Causal contract

`HA ⇌ H⁺ + A⁻` gives three separate claims:

1. acid/base additions are first consumed by the conjugate partner;
2. the ratio `[A⁻]/[HA]` sets pH through Henderson–Hasselbalch;
3. total inventory determines capacity, so equal starting pH can have different resistance.

## Acceptance probes

- Step 0: acid lowers pH and reduces A⁻; base raises pH and reduces HA; feedback names the misconception.
- Step 1: pKa +1 or ratio ×10 raises pH by one; changing total concentration alone at fixed ratio leaves pH unchanged.
- Step 2: the sampled buffer curve has a flatter central region than the pure-water estimate and eventually steepens after inventory exhaustion.
- Step 3: fixed 0.01 mol/L acid produces a smaller absolute `ΔpH` for higher total concentration.
- Language toggle changes all teaching copy and redraws numeric canvas labels in both locales.

## Out of scope

Activity coefficients, water autoionization, volume change during titration, and full mass/charge balance are disclosed model limits rather than hidden claims.
