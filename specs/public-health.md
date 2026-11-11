# Public Health

## Route
- slug: `public-health`
- category: `biology`
- stage: `senior`

## Causal contract
1. `Rₑ = R₀(1 − intervention)` controls the teaching curve.
2. The curve is an SIR model (`sirRun` in `app.js`): 100,000 people, 10 initial cases, mean infectious
   period 7 days (γ = 1/7), β = Rₑ·γ, uniform mixing, recovered people immune, RK4 with dt = 0.01 day
   over a 730-day horizon. The plotted quantity is I(t), people ill at the same time.
3. The peak is where S/N = 1/Rₑ; the page states this and calls 1 − 1/Rₑ the herd-immunity threshold
   (reached here through infection). More intervention gives a lower and later peak.
4. Rₑ ≤ 1: no outbreak and no peak after day 0. A peak beyond the observation window is reported as
   such, never as the window's last day; Rₑ barely above 1 can have no peak within 730 days.
5. Sensitivity and specificity split a fixed population into TP, FN, TN and FP.
6. PPV and NPV depend on baseline prevalence as well as test accuracy.
7. Model outputs describe assumptions; they do not prescribe real-world policy or care.

## Tests
`node biology/body/public-health/tests/core.cjs` sweeps the slider ranges (R₀ 0.8–4 by 0.1, intervention
0–0.8 by 0.05) and pins: S/N at the peak = 1/Rₑ within 0.001 (the readout shows both to 0.1 %); the
final size satisfies f = 1 − e^(−Rₑ f) within 0.002; lower and later peaks with more intervention; no peak
for Rₑ ≤ 1; the default peak (day 56) lies inside the 60-day window.

## History
- 2026-11-11, Claude Code (claude-opus-5-5): the curve was a pure exponential `cases·e^{(Rₑ−1)·0.08}`
  with no susceptible depletion, so the displayed "peak" and "peak day" were the window's last day (or
  day 0 when Rₑ < 1). Replaced by the SIR model above; the days slider now reaches 360 so slow outbreaks
  can be followed to their peak; peak shown as the share of the population ill at once.
