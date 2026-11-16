---
lang: en
---

::: strings
docTitle: Mass Conservation · Not a Single Atom Lost
back: ← Knowledge Index
pageTitle: Mass Conservation · Not a Single Atom Lost
tagline: A chemical reaction does not erase atoms; it rearranges them. In a closed system the total mass stays equal. If a sample seems lighter or heavier, matter crossed the system boundary.
foot: Mass Conservation · Not a Single Atom Lost
navLabel: Step navigation
:::

## What will the balance show after the reaction? {#step0 h2=s0t}

::: strings
nav0: 0 Weigh first
:::

Step 0 · Make a prediction {#s0k .step-kicker i18n=text}

This step asks: a **sealed** bottle of reactants sits on a balance. After ignition, will it be heavier, lighter, or unchanged? Pick a prediction, then start the reaction. Sealed means the gas stays inside the system. {#s0e .explain}

::: html step0-1
canvasLabel: Chemical reaction diagram for this step; readouts are below
s0pickHeavy: Heavier
s0pickLight: Lighter
s0pickSame: Unchanged
start: Ignite / start reaction
reset: Reset this step
:::

Predict first, then ignite; watch the atoms regroup inside the bottle, then compare the two bars. {#s0hint .hint i18n=text}

Unit convention: each coefficient stands for 1 mol (one portion) of molecules, so readings can be in g — 1 portion of C counts as 12 g, 1 portion of O₂ as 32 g. A single atom is of course far lighter. {#unitNote .hint i18n=text}

::: html step0-2
:::

::: strings
before: Before
after: After
sealed: sealed vessel
selected: Selected
choose: Choose
observe: Watch in this order
s0ro: Prediction: <b>{pick}</b>. Before {before} g; after {after} g; difference {delta} g. {result}
s0pending: The reaction has not started yet.
s0same: In a closed system the reading stays equal: atoms only rearrange.
s0wrong: That prediction disagrees with the model; the next step opens the account.
s0noPick: Pick one of the three predictions above before you can ignite (the pick locks once ignited).
:::

## Do both sides contain the same atom counts? {#step1 h2=s1t}

::: strings
nav1: 1 Count atoms
:::

Step 1 · Split molecules into atoms {#s1k .step-kicker i18n=text}

This step asks: after splitting molecules into atoms, how many of each element are on each side? Switch reactions while keeping coefficients fixed, then read the count table. {#s1e .explain}

Read the formula first, then count each element: the molecules may be rearranged, but every element total must still match. {#s1bridge .hint i18n=text}

::: html step1-1
reactionBurn: Burning: C + O₂ → CO₂
reactionLimestone: Limestone + acid: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂
left: Reactants
right: Products
:::

::: strings
countLine: {el}: {left} on the left · {right} on the right
balanced: atom counts match
unbalanced: atom counts do not match
s1ro: Current reaction: {name}. {status} Conclusion: atoms are rearranged, not destroyed.
:::

## Did every atom’s mass stay in the account? {#step2 h2=s2t}

::: strings
nav2: 2 Account for mass
:::

Step 2 · Where mass comes from {#s2k .step-kicker i18n=text}

This step asks: if each element has a relative atomic mass, do the two totals match? Use − / + beside a coefficient to change molecule counts; an intentionally unbalanced equation triggers both count and balance warnings. {#s2e .explain}

Intentionally change one coefficient: both the atom count and balance warn you. Repair the equation and both readings match again. {#s2bridge .hint i18n=text}

::: html step2-1
:::

::: strings
coeff: coefficient
massLabel: total mass
tiltLabel: balance tilt
alarm: Not balanced: count atoms, then repair the coefficients
balancedMass: Balanced: atom counts and mass agree
s2ro: Left {lm} g; right {rm} g; {status}. {tilt}<br>{counts}
:::

## Why can an open reaction look lighter? {#step3 h2=s3t}

::: strings
nav3: 3 The open-cup trap
:::

Step 3 · The open-cup trap {#s3k .step-kicker i18n=text}

This step asks: run step 1’s limestone + acid in an open cup — once the CO₂ it makes escapes, is it still inside the balance system? Switch sealed / open; when open, attach a collection balloon and watch the reading return. {#s3e .explain}

::: html step3-1
closed: Sealed
open: Open
balloonOn: Attach collection balloon
:::

First switch to open: watch the reading lose the CO₂ that leaves the system. Then attach the collection balloon and return that same gas to the system; the reading comes back. {#s3bridge .hint i18n=text}

::: html step3-2
:::

::: strings
balloonOff: No collection
escaped: escaped gas
systemMass: system mass
s3ro: State: {state}; {balloon}. Reading {mass} g = total {total} g − escaped {escape} g. {result}
s3closed: The gas stays in the system, so mass is conserved in the reading.
s3open: Gas leaves the system, so the balance loses its mass.
s3balloon: The gas is returned to the system, so the total comes back.
:::

## Where does the extra mass in rusting iron or burning magnesium come from? {#step4 h2=s4t}

::: strings
nav4: 4 Why it gets heavier
:::

Step 4 · The heavier mystery {#s4k .step-kicker i18n=text}

This step asks: when a solid gets heavier, did oxygen atoms enter from air? Switch the material and the air toggle; compare the solid alone with the whole system including incoming oxygen. {#s4e .explain}

Turn air off first: the solid stays the same. Turn it on: incoming oxygen adds mass; include that oxygen in the system and the ledger still balances. {#s4bridge .hint i18n=text}

::: html step4-1
iron: Rusting iron
magnesium: Burning magnesium
airOn: Air involved: on
:::

::: strings
airOff: Air involved: off
solidMass: starting solid mass
addedOxygen: oxygen added
s4ro: {name}: starting solid {base} g; oxygen added from air {oxygen} g; solid after {after} g (weighing the solid alone: +{gain} g). Whole system (solid + incoming oxygen): before {sysBefore} g → after {sysAfter} g. {result}
s4on: Oxygen enters from air, so the solid gets heavier; include it in the system and mass still balances.
s4off: Air off: with no oxygen the metal does not react and no product forms; the solid is still the original {base} g — no gain and no new substance.
:::

## Explain mass conservation in one sentence {#step5 h2=s5t}

::: strings
nav5: 5 Takeaway
:::

Step 5 · Take it with you {#s5k .step-kicker i18n=text}

Say it this way: in a chemical reaction, not one atom is gained or lost; atoms are rearranged, so a closed system keeps the same total mass. If something looks lighter or heavier, ask what gas left or entered. {#s5e .explain}

For the final check, ask one boundary question: what gas left, or what entered from air? That explains why a reading can look lighter or heavier. {#s5bridge .hint i18n=text}

::: html step5-1
modelTitle: Model assumptions
modelBody: This page uses simplified equations and relative atomic masses. The balance shows calculated model values, not the error of weighing real powder.
boundaryTitle: Model boundary
boundary: Real experiments have weighing error, leaks, and unreacted material. This page conserves an atom-level account; its illustrative balance is exact only under the stated model.
linkParticles: → Particle States, step 0: see particles keep moving
linkAtoms: → Atomic Structure, step 1: proton count fixes element identity
linkRates: → Reaction Rates: speed changes, atom accounting does not
:::

::: strings
elC: carbon C
elO: oxygen O
elCa: calcium Ca
elCl: chlorine Cl
elH: hydrogen H
resultSame: unchanged
resultDiff: changed
deltaZero: 0
s4betWrong: Bet reveal: in step 0 you picked “{pick}”, but the sealed bottle reads “unchanged”. A reading only looks heavier or lighter when gas crosses the system boundary — like the oxygen entering from air here.
s4betRight: Bet reveal: in step 0 you picked “{pick}” — correct. The sealed bottle reads the same; here the solid gets heavier without breaking conservation, because the oxygen that came in from air is counted in the system.
s4betNone: Bet reveal: you have not made a prediction in step 0 yet — go back, make one, then come back to settle it.
rustNote: Note: real rusting also needs water, and rust is hydrated Fe₂O₃·xH₂O; this page only tracks the iron and oxygen.
s4noReaction: no oxygen → no reaction
solidAfter: solid mass after
:::
