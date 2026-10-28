# Build report · buffer-capacity

- Page: `buffer-capacity/`
- Model: ideal HA ⇌ H⁺ + A⁻ buffer; stoichiometric strong-acid/base neutralization plus Henderson–Hasselbalch readout.
- Bounds: `pKa 0–14`, total concentration `0.0001–10 mol/L`, ratio `0.0001–10000`; canvas samples capped at 73 points.
- Checks: `node --check app.js`, `node --check i18n.js`, `node tests/core.cjs`.
- Browser review target: Chinese and English renders, 390px width, five sections, no horizontal overflow, console free of errors.
