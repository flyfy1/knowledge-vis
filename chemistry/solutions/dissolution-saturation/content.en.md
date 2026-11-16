---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Chemistry
stageBadge: Junior High
foot: Dissolution & Saturation · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Dissolution & Saturation · Keep Adding, Until It Stops Dissolving
pageTitle: Dissolution & Saturation
tagline: Add salt to water spoon by spoon: at first it all disappears, then at some point it will not dissolve any more. That “full” state is saturation — not frozen, but dissolving and crystallising at the same speed.
:::

## Adding salt spoon by spoon, when does it stop dissolving? {#step0 h2=s0t}

::: strings
nav0: 0 Until it stops
:::

Step 0 · Until it stops {#s0k .step-kicker i18n=text}

This step asks: add salt (5 g a spoon) to 100 g of water at 20 °C — at which spoon does salt start to sit on the bottom? **Dissolving** means solid particles spreading out through the water; **solubility** is the most of a substance, in grams, that 100 g of water can dissolve at a given temperature; once no more will dissolve the liquid is a **saturated solution**. Press “Add a spoon” and watch the dissolved dots and the solid on the bottom. {#s0e .explain}

::: html step0-1
s0stage: Beaker: dots spread in the water are dissolved salt, white grains on the bottom are undissolved salt (20 °C, 100 g water)
s0canvas: Beaker diagram: dots in the water increase with each spoon; past saturation salt piles on the bottom
s0add: Add a spoon of salt (+5 g)
s0reset: Empty and start over
:::

Takeaway: dissolving has a ceiling, the solubility; salt beyond it stays solid. Holds for 100 g of water at 20 °C here; solubility is interpolated from a table, so values are approximate. {#s0result .readout i18n=text}

::: strings
s0ro: {n} spoons = {added} g added; {dis} g dissolved, {und} g left on the bottom; {state}
s0unsat: not saturated yet, room for {room} g more.
s0sat: saturated: at 20 °C 100 g of water dissolves at most {S} g; anything more just sinks.
:::

## Does a higher temperature dissolve more? {#step1 h2=s1t}

::: strings
nav1: 1 Hotter, more
:::

Step 1 · Hotter, more {#s1k .step-kicker i18n=text}

This step asks: put the same 60 g of solute in 100 g of water — how do solubility and the amount on the bottom change with temperature? The left chart is the solubility curve (x: temperature, y: most grams that 100 g of water dissolves); the right is the beaker. Drag the temperature, then switch substances: some depend strongly on temperature, some hardly at all. {#s1e .explain}

::: html step1-1
s1stage: Solubility curves: x temperature (°C), y solubility (g per 100 g water); the orange dot is the current temperature; the beaker holds 60 g solute and 100 g water
s1canvas: Solubility curves for two substances and a beaker: potassium nitrate climbs steeply, table salt barely changes
s1sol: Solute
s1T: Temperature
:::

Takeaway: for most solids a higher temperature means higher solubility, but by very different amounts (steep for KNO₃, flat for salt). Data are a simple polyline through typical table values; a few substances (like slaked lime) behave the opposite way. {#s1result .readout i18n=text}

::: strings
s1ro: {sol}: at {T} °C the solubility is {S} g per 100 g water; of the 60 g, {dis} g dissolve and {und} g sit on the bottom.
:::

## Once saturated, has dissolving stopped? {#step2 h2=s2t}

::: strings
nav2: 2 Dynamic balance
:::

Step 2 · Dynamic balance {#s2k .step-kicker i18n=text}

This step asks: with solid on the bottom and a saturated solution, has dissolving really stopped? Model: the solid’s surface keeps dissolving into the water (rate kd, g/s), and particles in the water keep returning to the solid surface (rate proportional to concentration). **Dynamic equilibrium** means two opposite processes run at equal rates, so nothing changes on the large scale. Press “Start” and watch the two rate lines close in while the amounts level off. {#s2e .explain}

::: html step2-1
s2stage: Top: two rate lines (dissolving / crystallising, g/s) closing in over time; bottom: dissolved amount and remaining solid (g) over time
s2canvas: Time curves: dissolving and crystallising rates converge to equal and the dissolved amount levels off
s2m: Total solid put in
s2run: Start
s2reset: Start over
:::

Takeaway: saturated = dissolving and crystallising at equal rates (dynamic equilibrium), not standing still. Holds in a first-order rate model with kc = 0.08 /s chosen for teaching; the animation runs 4 model seconds per real second. {#s2result .readout i18n=text}

::: strings
s2pause: Pause
s2ro: t = {t} s: dissolving {rd} g/s, crystallising {rp} g/s; dissolved {c} g, solid left {m} g. {state}
s2net: Dissolving is faster than crystallising, so the solution is still getting stronger.
s2eq: The two rates are equal: dynamic equilibrium, saturated — neither process has stopped, they cancel.
s2none: All the solid has dissolved (you did not exceed the solubility), so the solution is unsaturated and nothing crystallises.
:::

## How can one number say how strong a solution is and when it is saturated? {#step3 h2=s3t}

::: strings
nav3: 3 How concentrated
:::

Step 3 · How concentrated {#s3k .step-kicker i18n=text}

This step asks: how do you judge how concentrated a solution is and whether it is saturated? **Mass fraction of solute** = dissolved solute mass ÷ total solution mass (solute + water). Drag the solute mass and water mass and pick a substance and temperature: if there is more solute than “solubility × water ÷ 100”, the excess sinks and the concentration stops at the saturation value. {#s3e .explain}

::: html step3-1
s3stage: Left: darker beaker = stronger; right: the vertical bar is concentration and the line is the saturation level at this temperature
s3canvas: Beaker and concentration bar: concentration rises with solute until the saturation line, then stops
s3sol: Solute
s3T: Temperature
s3m: Solute mass
s3w: Water mass
:::

Takeaway: a saturated solution has mass fraction S ÷ (100 + S), set by solubility alone (substance and temperature) and independent of the amount of water. S here is approximate; supersaturation is not covered. {#s3result .readout i18n=text}

::: strings
s3ro: {dis} g dissolved, {und} g on the bottom; mass fraction {w}%, saturation value at this temperature {ws}%; {state}
s3unsat: unsaturated: room for {room} g more.
s3sat: exactly saturated.
s3over: saturated, with {und} g still on the bottom.
:::

## How do you get a dissolved substance back out? {#step4 h2=s4t}

::: strings
nav4: 4 Get crystals out
:::

Step 4 · Get crystals out {#s4k .step-kicker i18n=text}

This step asks: to get crystals from a saturated solution, should you cool it or evaporate it? Start: 100 g of water at 80 °C holding exactly the saturated amount. **Cooling** lowers the solubility, so the excess crystallises; **evaporating** removes water, so less can stay dissolved. Pick a substance, drag the temperature down, and press “Evaporate 10 g of water” a few times. {#s4e .explain}

::: html step4-1
s4stage: Beaker: crystals on the bottom are the amount that has come out; the readout lists water, solubility and crystals
s4canvas: A saturated solution cooled or evaporated: crystals pile up on the bottom
s4sol: Solute
s4T: Cooled down to
s4evap: Evaporate 10 g water
s4reset: Back to saturated at 80 °C
:::

Takeaway: substances whose solubility climbs steeply with temperature suit cooling crystallisation; those that barely change suit evaporation. Data are a simple polyline; water of crystallisation and supersaturation are ignored. {#s4result .readout i18n=text}

::: strings
s4ro: {sol}: started with {d0} g dissolved; now {T} °C, {w} g of water, solubility {S} g/100 g, at most {cap} g can stay dissolved, crystals out {cr} g.
s4hint: Hint: KNO₃ gives lots of crystals just by cooling; salt barely does, so use evaporation.
:::

## Explain dissolving and saturation to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: At a given temperature, a given amount of water can hold only so much of a substance; at that limit it is saturated, and dissolving and crystallising still go on at equal rates.
f1t: A ceiling
f1b: Solubility: the most grams 100 g of water dissolves at one temperature; the rest sinks (steps 0–1).
f2t: Dynamic
f2b: Saturation is a dynamic equilibrium of equal dissolving and crystallising rates, not a stop (step 2).
f3t: Getting it out
f3b: Cooling or evaporating leaves too much to stay dissolved, so crystals form; which one suits depends on the solubility curve (step 4).
modelT: Honest model notes
model1: Solubility is a linear interpolation of typical table values — approximate; real curves bend and sources differ slightly.
model2: Step 2 is a first-order toy model to show rates converging to equality, not real dissolution kinetics.
model3: Supersaturation, water of crystallisation, heat of solution and ionic interactions are not covered.
nextT: Keep going (on this site)
l1: Chemical Equilibrium · step 0: the more general picture of two opposite rates equalising
l2: Particles & States · step 3: how surface particles escape (the opposite direction from dissolving)
l3: Reaction Rates · step 0: what sets a rate
:::

::: strings
solNaCl: Table salt NaCl
solKNO3: Potassium nitrate KNO₃
unitG: g
unitC: °C
unitS: s
unitGs: g/s
unitPer100: g per 100 g water
lblDis: Dissolved
lblUnd: Undissolved solid
lblRate: Rate (g/s)
lblAmt: Mass (g)
lblRd: Dissolving rate
lblRp: Crystallising rate
lblCr: Crystals out
:::
