---
lang: en
---

::: strings
pageTitle: Titration Curves · The pH Cliff Near the End Point
tagline: Add base to acid drop by drop: pH creeps up, then leaps near the equivalence point; the indicator must change colour right on that leap.
:::

## Add base drop by drop: the acid is neutralised, how does pH change? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Adding base
:::

::: html step0-1
:::

This step answers: as base is added to an acid, how does pH change with the amount added? We titrate 25.0 mL of 0.100 mol/L acid with 0.100 mol/L sodium hydroxide (base). When the base added equals the acid in moles, that is the **equivalence point** (V = 25.0 mL here). In the plot the horizontal axis is the volume V of base added and the vertical axis is pH (pH = −log₁₀[H⁺]; lower is more acidic); the curve is drawn up to the current V. A strong acid ionises completely; a weak acid (acetic) only partly, so its starting pH is higher. {#s0e .explain}

::: html step0-2
s0o: Start with the strong acid and slowly drag V from 0 to 50: notice the curve is almost flat at first and shoots up around 25 mL; then switch to the weak acid and compare the starting pH and the pH at the equivalence point.
lV: Base added V (mL)
aStrong: Strong acid (e.g. HCl)
aWeak: Weak acid (e.g. acetic, Kₐ = 1.8×10⁻⁵)
:::

::: strings
iMoN: methyl orange
iBtbN: bromothymol blue
iPpN: phenolphthalein
r0: {kind}: V = {v} mL, pH = {ph}; equivalence point at V = {veq} mL. {note}
nBefore: Acid is still left over, so pH is below the equivalence value.
nAt: Exactly at equivalence.
nAfter: Base is now in excess.
:::

## The leap: near equivalence one drop shifts pH by several units {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The leap
:::

::: html step1-1
:::

This step answers: why must you go slowly near the end point? Look at the slope dpH/dV (how much pH changes per mL of base): small early on, rising steeply near the equivalence point and largest right at it. The orange bar below is the slope at the current position; the "steepest point" in the readout is found by scanning the whole curve and should match the equivalence point at V = 25 mL. {#s1e .explain}

::: html step1-2
s1o: Move V from 20 to 30 in 0.5 mL steps: the orange slope bar rises, peaks at 25 mL and falls again; compare which acid, strong or weak, has the larger maximum slope.
:::

::: strings
r1: {kind}: V = {v} mL, pH = {ph}, slope dpH/dV = {slope} pH/mL; steepest point on the whole curve at V = {vmax} mL (equivalence {veq} mL).
:::

## Weak acid: the pH at half equivalence is the pKₐ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Weak acid
:::

::: html step2-1
:::

This step answers: how can you read a weak acid's strength from its titration curve? The weak acid HA has ionisation constant Kₐ (smaller means weaker) and pKₐ = −log₁₀Kₐ. Halfway (V = 12.5 mL, the half-equivalence point), half the HA has become A⁻ so the two have equal concentrations and pH ≈ pKₐ (the Henderson–Hasselbalch equation, see the buffer page). At the equivalence point only A⁻ remains, and it reacts slightly with water to make OH⁻, so pH is above 7. Grey is the strong-acid curve and orange is the weak acid with the current pKₐ. {#s2e .explain}

::: html step2-2
s2o: Drag pKₐ from 3 to 7: the orange curve starts higher and the pH at the half-equivalence line follows the pKₐ; compare the readout's half-equivalence pH with pKₐ, and check that the equivalence-point pH is above 7.
lPka: Weak acid pKₐ
:::

::: strings
r2: pKₐ = {pka}: at half equivalence (V = {vh} mL) pH = {phh} (theory ≈ pKₐ); at equivalence pH = {phe}; current V = {v} mL, pH = {ph}.
:::

## Indicators: the colour change must fall inside the leap {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Indicators
:::

::: html step3-1
:::

This step answers: which indicator tells you the end point accurately? An **indicator** is a weak acid whose acid and base forms have different colours; it changes colour when pH is near its pKᵢₙ. In a titration we take the moment the indicator changes colour (pH = pKᵢₙ) as the end point. If that pH is not inside the leap, the end point comes too early or too late: the readout gives the difference from the true equivalence point. The lower the concentration c (log slider), the shorter the leap and the fewer indicators work. {#s3e .explain}

::: html step3-2
s3o: Pick strong acid + phenolphthalein for an error near 0; switch to methyl orange and look at the error; then switch to the weak acid and compare all three indicators, asking which suits it; set concentration to 10⁻³ and see which indicators still work.
lC: Acid and base concentration c = 10^x (mol/L)
iMo: Methyl orange (range pH 3.1–4.4)
iBtb: Bromothymol blue (range pH 6.0–7.6)
iPp: Phenolphthalein (range pH 8.2–10)
:::

::: strings
r3: {acid} + {ind}: the leap spans pH {lo}–{hi} (V = {v1}–{v2} mL); the indicator's change point pH = {pk} gives an end point at V = {ve} mL, which differs from the equivalence point ({veq} mL) by {err} mL ({rel}%).
:::

## In practice: find the concentration of an unknown hydrochloric acid {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Unknown concentration
:::

::: html step4-1
:::

This step answers: how do you find an unknown concentration by titration? Take 25.0 mL of hydrochloric acid of unknown concentration, add phenolphthalein, and titrate with 0.100 mol/L sodium hydroxide. Acid and base react 1:1, so at equivalence c_acid·25.0 = 0.100·V, i.e. c_acid = 0.100·V/25.0. Drag V until the flask turns pale pink (stop as soon as it does), press "read the result", and the page gives your estimate, the true value and the error. {#s4e .explain}

::: html step4-2
s4o: Take big steps until the colour is about to change, then use 0.1 mL steps and press read just as the pale pink appears; the error should be under 1%. Think about why you take smaller steps nearer the end point.
bRead: I see the end point: read the result
bNew: Try another acid of unknown concentration
:::

::: strings
r4: Current V = {v} mL, flask colour: {col}; no result read yet.
colNone: colourless (pH {ph})
colPink: pink (pH {ph})
r4done: You read V = {v} mL → estimate c = 0.100×{v}/25.0 = {c} mol/L; true value {ct} mol/L, error {err}%.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) a titration curve is pH against V, and the equivalence point is where acid and base are equal in moles; (2) the leap: the slope is largest near equivalence; (3) weak acid: pH at half equivalence = pKₐ and pH at equivalence > 7; (4) the indicator's change point must lie inside the leap, and lower concentration shortens it; (5) at equivalence c_acid·V_acid = c_base·V_base (monoprotic). {#s5e .explain}

::: html step5-2
qq: When a strong base titrates a weak acid and exactly half the equivalence volume of base has been added, what is the pH about?
qo0: 7
qo1: 14
qo2: The weak acid's pKₐ
s5m: This page is an idealised model of a monoprotic acid titrated by a monoprotic strong base: 25.0 mL of acid, base at 0.100 mol/L (concentration adjustable in step 3); pH is solved numerically from charge balance (strong acid fully ionised, weak acid via Kₐ, Kw = 10⁻¹⁴, 25 °C). It ignores activity coefficients (inaccurate at high concentration), dissolved CO₂, temperature change and the base consumed by the indicator itself; the indicator change point is taken as pH = pKᵢₙ, whereas real changes are gradual and the eye judges them to about ±0.5 pH.
lk0: Buffer capacity: the flat stretch near half equivalence is the buffer region
lk1: Acid–base equilibrium: what Kₐ is and how HA moves both ways
lk2: Chemical equilibrium: the dynamic acid ⇌ conjugate-base balance behind titration
:::

::: strings
qwhy: At half equivalence [HA] = [A⁻], so pH = pKₐ (check in step 2).
:::
