---
lang: en
---

::: strings
pageTitle: Activation Energy · The Hill a Reaction Has to Climb
tagline: Reactants must climb an energy hill before they become products: how high the hill is, and how many molecules can climb it, decides how fast the reaction goes.
:::

## A reaction is a hill climb: up first, then down to the products {#step0 h2=s0t pre=1}

::: strings
nav0: 0 The hill
:::

::: html step0-1
:::

This step answers: why do some reactants react on contact while others need heating? The horizontal axis is reaction progress (from reactants to products) and the vertical axis is the system's energy (kJ/mol). Reactants sit low on the left, products on the right, and a hill lies between them; the height of the top above the reactants is the **activation energy** Eₐ, and the energy difference between products and reactants is the **reaction enthalpy** ΔH (negative means heat is released and the products are lower). Launch a molecule with energy E: it gets over the top only if E ≥ Eₐ, otherwise it is turned back. The ball moves by energy conservation (kinetic energy = E − potential energy at its position). {#s0e .explain}

::: html step0-2
s0o: With Eₐ = 90, raise E from 62 to 97 and press launch: for E < Eₐ the ball turns back partway up, for E ≥ Eₐ it goes over the top; then change ΔH and see the end level move while the summit (Eₐ) stays put.
lEa: Activation energy Eₐ (kJ/mol)
lDh: Reaction enthalpy ΔH (kJ/mol)
lE: Molecule's energy E (kJ/mol)
bLaunch: Launch a molecule with energy E
bReset: Reset: molecule back at the start
:::

::: strings
r0: Eₐ = {ea} kJ/mol, ΔH = {dh} kJ/mol ({kind}); molecule energy E = {e} kJ/mol: {res}; reverse activation energy Eₐ′ = Eₐ − ΔH = {er} kJ/mol.
axisProg: reaction progress
kExo: exothermic
kEndo: endothermic
kZero: no net heat
resPass: E ≥ Eₐ: over the top, products formed
resBack: E < Eₐ: turned back partway up, no reaction
resIdle: not launched yet
:::

## Who can climb? Only the high-energy few in the crowd of molecules {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Who can climb
:::

::: html step1-1
:::

This step answers: at a given temperature molecules have a spread of energies, so how many reach Eₐ? At temperature T the fraction of molecules with energy above E falls by the Boltzmann factor: fraction(≥E) = e^(−E/RT) (R = 8.314×10⁻³ kJ/(mol·K) is the gas constant; RT is the scale of thermal energy, about 2.5 kJ/mol at 300 K). The vertical axis is logarithmic, so fraction(≥E) is a straight line, flatter at higher temperature. The vertical bar is Eₐ and the height where it meets the line is the fraction of molecules able to react. The grey line is the 300 K reference. {#s1e .explain}

::: html step1-2
s1o: With Eₐ = 60, raise T from 300 K to 350 K: the crossing point rises by several orders of magnitude, matching the fold change in the readout; then raise Eₐ to 100 and compare the fold change from the same warming.
lT: Temperature T (K)
:::

::: strings
r1: T = {t} K: RT = {rt} kJ/mol; fraction with energy ≥ Eₐ, e^(−Eₐ/RT) = {frac}; compared with 300 K ({f300}) that is {ratio}×.
:::

## Arrhenius: the rate constant grows exponentially with temperature {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Arrhenius
:::

::: html step2-1
:::

This step answers: how much faster does the reaction get per degree of warming? Only molecules that can climb react, so the rate constant is k = A·e^(−Eₐ/RT) (A is a constant tied to collision frequency; this page uses a relative value A = 1). The left plot is k against T (as a multiple of its value at 300 K); the right plot is ln k against 1/T, a straight line of slope −Eₐ/R (an Arrhenius plot). Record adds the ln k at the current T with ±2% simulated measurement error as a data point; fit the slope through a few points to recover Eₐ. {#s2e .explain}

::: html step2-2
s2o: With Eₐ fixed, record at least 4 points at different T between 300 and 420 K and see whether the fitted Eₐ is close to the slider value; change Eₐ and watch the line steepen; roughly how many times faster is the reaction per 10 K near 300 K, according to the readout?
bAdd: Record a data point (1/T, ln k)
bClear: Clear all data points
:::

::: strings
r2: T = {t} K: k/k₃₀₀ = {kr}; after a 10 K rise k becomes {x10}×; {n} points recorded, fitted Eₐ ≈ {efit} kJ/mol (set {ea} kJ/mol).
needMore: at least 2 points are needed to fit
:::

## A catalyst: dig the hill down, leave the endpoints alone {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Catalysts
:::

::: html step3-1
:::

This step answers: how does a catalyst speed a reaction up? A catalyst gives the reaction a different path with a lower summit (smaller Eₐ), while the reactants' and products' energies stay the same (ΔH unchanged). In k = A·e^(−Eₐ/RT) the exponent shrinks, so k grows by a factor e^(ΔEₐ/RT). The reverse hill is lowered by the same amount, so the reverse reaction speeds up by the same factor and the catalyst does not shift the equilibrium (it only gets there sooner). Grey is the uncatalysed path and colour is the catalysed one. {#s3e .explain}

::: html step3-2
s3o: Raise the "activation energy lowered" from 0 to 40: the summit drops while the endpoints stay; watch the speed-up factor grow; raise T: does the same catalyst give a bigger or a smaller speed-up?
lDea: Activation energy lowered by the catalyst (kJ/mol)
:::

::: strings
r3: Lowering Eₐ by {d} kJ/mol at T = {t} K speeds both forward and reverse reactions {sp}×; equilibrium-constant ratio (catalysed / uncatalysed) = {kr}.
:::

## The reverse reaction has to climb too: different heights, different speeds {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Reverse reaction
:::

::: html step4-1
:::

This step answers: starting from the products, how hard is the way back over the same hill? The reverse activation energy is Eₐ′ = Eₐ − ΔH. The ratio of the forward and reverse rate constants is k_f/k_r = e^(−ΔH/RT) (this page takes the same A for both, which ignores entropy; a teaching simplification). For an exothermic reaction (ΔH < 0) the way back is harder, so k_f > k_r; endothermic is the opposite. Raising T pulls the ratio toward 1. The two bars are k_f and k_r (logarithmic axis). {#s4e .explain}

::: html step4-2
s4o: Move ΔH from −50 to +50: the k_f bar goes from above to below the k_r bar; at a fixed ΔH raise T and the gap between the bars shrinks; compare with the ratio in the readout.
:::

::: strings
r4: Eₐ = {ea}, Eₐ′ = {er} kJ/mol, T = {t} K: k_f = {kf}, k_r = {kb} (relative values); k_f/k_r = {ratio}.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) reactants must climb an energy hill, and the summit's height above the reactants is Eₐ; (2) at temperature T the fraction of molecules with energy ≥ Eₐ is e^(−Eₐ/RT); (3) k = A·e^(−Eₐ/RT), and ln k against 1/T is a line of slope −Eₐ/R; (4) a catalyst lowers Eₐ, speeds forward and reverse alike, and leaves ΔH and the equilibrium position unchanged; (5) the reverse activation energy is Eₐ − ΔH. {#s5e .explain}

::: html step5-2
qq: A reaction with Eₐ = 50 kJ/mol near room temperature (300 K) is warmed by 10 K. By about what factor does its rate rise?
qo0: About 1.1×
qo1: About 2×
qo2: About 100×
s5m: This page uses the simplest form of the Boltzmann factor and the Arrhenius equation: it counts only energy sufficiency and ignores collision orientation factors, quantum tunnelling, the temperature dependence of A, and multi-step reactions; the energy distribution is taken as exponential (a simplification of the degrees of freedom); ΔH and Eₐ are treated as constant with temperature; equal A for forward and reverse ignores entropy; the measurement error in step 2 is artificial; the ball in step 0 is an energy-conserving teaching sketch, not a real molecular trajectory.
lk0: Reaction rates: see from the collision side how a catalyst lets more collisions succeed
lk1: Chemical equilibrium: why warming shifts an equilibrium, linked to the k_f/k_r ratio here
lk2: Reaction rates: the temperature step of the same story, counted in particle collisions
:::

::: strings
qwhy: The factor is e^((Eₐ/R)(1/300 − 1/310)) ≈ 1.9 (check the "10 K rise" figure in step 2).
:::
