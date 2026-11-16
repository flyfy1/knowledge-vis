---
lang: en
---

::: strings
pageTitle: Enzymes · Catalysts of the Living World
tagline: An enzyme pulls substrates together in a pocket of the right shape so reactions run fast at body temperature: from lock-and-key fit to saturation, temperature, pH and inhibitors.
:::

## An enzyme accepts only a substrate of the right shape {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Lock and key
:::

::: html step0-1
:::

This step answers: how does an enzyme "choose" which reaction to catalyse? An enzyme is a protein with a fixed-shape pocket, the **active site**. Only a molecule of matching shape (the **substrate**) fits in, is turned into a **product** inside the pocket and released, and the enzyme is unchanged and can be used again at once. This is the lock-and-key model (simplified here). The three grey shapes are enzymes and the notch is the active site; the floating shapes are substrates. Press play: substrates move at random, and one that meets a free enzyme and has the right shape is converted. During contact, in every time step the relative chance of binding is 100% for a matching substrate, 15% for a similar one and 0 for a wrong shape (several tries are possible during one contact, so the measured rate ratio need not equal the chance ratio). {#s0e .explain}

::: html step0-2
s0o: Pick each of the three substrates in turn, play for a while, and compare "products" and "rate" in the readout: the matching shape gives the most products and the wrong shape none; switching substrate clears the count so the comparison is fair.
sMatch: Substrate: matching shape (triangle)
sNear: Substrate: similar shape (trapezoid)
sMiss: Substrate: wrong shape (circle)
bPlay: Play / Pause
bReset: Reset: clear the product count
:::

::: strings
r0: Substrate: {kind} (relative binding chance {p}%); ran {t} s, {n} products; rate over the last 8 s {rate} per s.
kMatch: matching shape
kNear: similar shape
kMiss: wrong shape
:::

## Saturation: when every enzyme is busy, more substrate does not speed things up {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Saturation
:::

::: html step1-1
:::

This step answers: does more substrate always mean a faster reaction? At low substrate concentration [S] most enzymes are empty, and more substrate means more binding, so the rate rises with [S]; but each enzyme handles one substrate at a time, and once all enzymes are occupied (**saturation**) the rate tops out at the **maximum rate** Vmax (proportional to the amount of enzyme). Michaelis–Menten equation: v = Vmax·[S]/(Kₘ + [S]). Kₘ is the substrate concentration at which the rate is half of Vmax; a smaller Kₘ means the enzyme binds its substrate more readily. The 10 enzyme icons below are shaded by the occupied fraction [S]/(Kₘ + [S]). {#s1e .explain}

::: html step1-2
s1o: Move [S] from 0 to 10: the curve is steep and then flat while the enzyme icons fill up; set [S] equal to Kₘ and the rate is exactly half of Vmax; double the amount of enzyme and the whole curve doubles in height, but the half-way position (Kₘ) stays.
lS: Substrate concentration [S] (mM)
lKm: Michaelis constant Kₘ (mM)
lE: Amount of enzyme [E] (relative)
:::

::: strings
r1: [S] = {s} mM, Kₘ = {km} mM, Vmax = {vmax}: v = {v} ({pct}% of Vmax); about {occ}/10 of the enzymes are occupied.
:::

## Temperature: faster at first, then a collapse from denaturation {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Temperature
:::

::: html step2-1
:::

This step answers: why are enzymes most active near body temperature and useless when too hot? Warming makes molecules collide harder, so the reaction itself speeds up (about 2× per 10 °C, see the activation-energy lesson); but an enzyme is a protein, and at high temperature it **denatures** (its three-dimensional structure is destroyed, the active site is deformed, irreversibly). The two curves are multiplied: the grey dashed line is "speed-up only", the cyan line is the fraction of enzyme still folded (half denatured at 50 °C here), and the orange line is their product, the activity curve, whose peak is the **optimum temperature**. {#s2e .explain}

::: html step2-2
s2o: Drag the temperature from 0 to 80 °C: activity rises, then falls abruptly past the optimum; compare with the optimum in the readout; between 37 °C and 45 °C notice how activity changes with temperature.
lT: Temperature T (°C)
:::

::: strings
r2: T = {t} °C: speed-up factor {rate} (relative to 37 °C), folded fraction {fold}%, activity {act} ({pct}% of the maximum); optimum temperature about {topt} °C.
:::

## pH: each enzyme has its own optimum {#step3 h2=s3t pre=1}

::: strings
nav3: 3 pH
:::

::: html step3-1
:::

This step answers: why does a stomach enzyme stop working in the small intestine? An enzyme's activity depends on the charge state of a few key groups, and pH changes their charge and thereby the shape of the active site. This page uses a simple two-step ionisation: activity = 1/(1 + 10^(pK₁ − pH) + 10^(pH − pK₂)), highest midway between pK₁ and pK₂. The three enzymes have different optima: pepsin about 2, salivary amylase about 7 and trypsin about 8. {#s3e .explain}

::: html step3-2
s3o: Choose pepsin and move pH from 2 to 8; then choose trypsin and do the same: see where each peak is, and think about the acidity of the organ each works in.
lPh: Solution pH
ePepsin: Pepsin (stomach)
eAmylase: Salivary amylase (mouth)
eTrypsin: Trypsin (small intestine)
:::

::: strings
r3: {enz}: pH = {ph}, relative activity {act}%; optimum pH about {opt}.
nPepsin: pepsin
nAmylase: salivary amylase
nTrypsin: trypsin
:::

## Inhibitors: competitive and non-competitive {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Inhibitors
:::

::: html step4-1
:::

This step answers: how do inhibitors slow an enzyme, and can more substrate "rescue" it? A **competitive inhibitor** looks like the substrate and competes for the active site: the apparent Kₘ grows (Kₘ,app = Kₘ(1 + [I]/Kᵢ)) while Vmax is unchanged, so enough substrate pushes it out. A **non-competitive inhibitor** binds elsewhere and disables part of the enzyme: Vmax falls (Vmax,app = Vmax/(1 + [I]/Kᵢ)) while Kₘ is unchanged, and adding substrate cannot fix it. This page takes Vmax = 1, Kₘ = 1 mM and Kᵢ = 2 mM. Grey is no inhibitor, colour is with inhibitor, and the dot marks the current [S]. {#s4e .explain}

::: html step4-2
s4o: Choose the competitive inhibitor, set [I] to 10 and raise [S] to 20: does the curve approach the uninhibited one? Switch to non-competitive and do the same: does it catch up?
lI: Inhibitor concentration [I] (mM)
iComp: Competitive inhibitor
iNon: Non-competitive inhibitor
:::

::: strings
r4: {kind}, [I] = {i} mM: Vmax,app = {vm}, Kₘ,app = {kma}; at [S] = {s} mM v = {v} (without inhibitor {v0}).
kComp: competitive inhibition
kNonc: non-competitive inhibition
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) an enzyme's active site accepts only a substrate of matching shape, and the enzyme is unchanged afterwards; (2) v = Vmax[S]/(Kₘ + [S]): with plenty of substrate the enzymes saturate and the rate has a ceiling; (3) temperature: speed-up times denaturation gives an optimum; (4) each enzyme has an optimum pH; (5) competitive inhibition can be overcome by a high substrate concentration, non-competitive inhibition cannot. {#s5e .explain}

::: html step5-2
qq: When the substrate concentration is far above Kₘ (the enzyme is nearly saturated), what happens to the rate if you double the substrate concentration?
qo0: It doubles
qo1: It hardly changes
qo2: It halves
s5m: This is a teaching model: lock-and-key fit ignores induced fit and conformational change; the Michaelis–Menten equation assumes a single substrate and steady state; the temperature curve is the simple product "speed-up × native fraction" with the 50 °C denaturation midpoint as an illustrative value; the pH curve uses a simplified two-step ionisation formula; inhibitors are simple reversible binders and Kᵢ is an example value; the simulation in step 0 uses random contacts and binding chances, so the numbers fluctuate; real enzymes have allosteric regulation, cofactors and multi-substrate reactions.
lk0: Activation energy: a catalyst lowers the barrier, and an enzyme is the biological catalyst
lk1: Reaction rates: catalysts and concentration seen as particle collisions
lk2: Acid–base equilibrium: pH changes the ionisation of groups
:::

::: strings
qwhy: Nearly all enzymes are already occupied, so the rate is close to Vmax and extra substrate has no free enzyme to use (step 1: keep raising [S] at the maximum).
:::
