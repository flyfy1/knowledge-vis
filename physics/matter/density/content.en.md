---
lang: en
---

::: strings
docTitle: Density · Same Size, Different Stuff
languageLabel: Language
back: ← Knowledge Index
catBadge: Physics & Circuits
stageBadge: Junior High
pageTitle: Density
tagline: An iron block and a wood block of the same size: one weighing tells them apart. Density is how much mass fits in each cubic centimetre.
navLabel: Step navigation
foot: Density · Built by Claude Sonnet via Mini Claude Code · static bilingual page
unitG: g
unitCm3: cm³
unitDens: g/cm³
matCork: Cork
matWood: Pine wood
matIce: Ice
matWater: Water
matAl: Aluminium
matFe: Iron
matAu: Gold
matSalt: Salt water
matOil: Cooking oil
:::

## Same volume: which side holds more mass? {#step0 h2=s0t}

::: strings
nav0: 0 Weigh them
:::

Step 0 · Weigh them {#s0k .step-kicker i18n=text}

This step asks: put two pieces of **equal volume** on a balance — which side is heavier, and by what factor? **Mass** is how much matter an object contains, measured on a balance in grams (g); **volume** is how much space it fills, in cubic centimetres (cm³). Change either material or the shared volume and watch the beam tilt. {#s0e .explain}

::: html step0-1
s0stage: Balance: the blocks have equal volume; the beam tilts by the mass difference
s0canvas: Balance diagram: two equal-volume blocks, beam tilting toward the larger mass
s0left: Left pan
s0right: Right pan
s0vol: Shared volume V
:::

Takeaway: equal volume but different mass means different amounts of matter per cm³. That number is density. Holds for uniform, solid pieces. {#s0result .readout i18n=text}

::: strings
s0ro: Left: {ml} g   Right: {mr} g   {verdict}
s0heavL: Left is heavier, {r}× the right.
s0heavR: Right is heavier, {r}× the left.
s0eq: Equal mass (same material or same density).
:::

## Does a bigger piece of the same material have a higher density? {#step1 h2=s1t}

::: strings
nav1: 1 Bigger = denser?
:::

Step 1 · Bigger = denser? {#s1k .step-kicker i18n=text}

This step asks: if you cut the same material bigger or smaller, does mass ÷ volume change? Pick a material, drag the volume, and press “Record this point” to plot (V, m); more points show what line they fall on. Mass readings carry a simulated ±2% weighing error. {#s1e .explain}

::: html step1-1
s1stage: x-axis: volume V (cm³); y-axis: mass m (g); each dot is one weighing
s1canvas: Mass versus volume scatter: recorded points line up along a line through the origin
s1mat: Material
s1vol: Volume V
s1rec: Record this point (V, m)
s1clear: Clear all points
:::

Takeaway: m is proportional to V, and the ratio (the slope) does not depend on piece size — only on the material. That is density. Holds for uniform material; weighing has error, so averaging many points helps. {#s1result .readout i18n=text}

::: strings
s1now: Now: V = {v} cm³, weighed m = {m} g, m/V = {r} g/cm³
s1fit: {n} points recorded; fitted slope = {k} g/cm³ (true value {rho} g/cm³)
s1none: No points yet; press “Record this point” to start.
:::

## In ρ = m/V, how do m and V connect, and what are the units? {#step2 h2=s2t}

::: strings
nav2: 2 Per cell
:::

Step 2 · Per cell {#s2k .step-kicker i18n=text}

This step asks: write **density** as ρ = m ÷ V — how is a piece’s mass found from its volume? Each square is a 1 cm³ cell, and each dot in it stands for 0.25 g of material (bookkeeping, not real atoms). Denser material has more dots per cell. Pick a material and drag the number of cells. {#s2e .explain}

::: html step2-1
s2stage: Each square = 1 cm³; each dot = 0.25 g of matter (illustrative bookkeeping)
s2canvas: Grid of cells: dots per cell show density, number of cells shows volume
s2mat: Material
s2cells: Volume V (cells of 1 cm³)
:::

Conversion: 1 g/cm³ = 1000 kg/m³. Dots per cell are rounded for drawing only; readouts use the exact density. {#s2note .model-note i18n=text}

Takeaway: the same material has the same dots per cell (ρ fixed); twice the cells means twice the mass. m = ρ·V and ρ = m/V say the same thing. {#s2result .readout i18n=text}

::: strings
s2ro: ρ = {rho} g/cm³ = {rhoSi} kg/m³; V = {v} cm³ → m = ρ·V = {m} g; drawn with {dots} dots (0.25 g each, rounded)
:::

## Put an object in a liquid: what decides float or sink? {#step3 h2=s3t}

::: strings
nav3: 3 Float or sink
:::

Step 3 · Float or sink {#s3k .step-kicker i18n=text}

This step asks: what decides whether an object floats or sinks? Compare the object’s density ρ_obj with the liquid’s ρ_liq: lower floats, higher sinks. Pick a liquid, drag the object’s density, press “Let go”. A floating object sits submerged by the fraction ρ_obj ÷ ρ_liq (the reason is on the buoyancy page). {#s3e .explain}

::: html step3-1
s3stage: Tank: the grey block is the object; the dashed line is the liquid surface
s3canvas: Tank diagram: object floating or resting on the bottom, with immersion depth following the density ratio
s3liq: Liquid
s3obj: Object density ρ_obj
s3drop: Let go and see where it settles
s3lift: Lift it back up
:::

Takeaway: compare the densities. Holds for solid, uniform objects in still liquid; hollow objects (like ships) use their overall average density. {#s3result .readout i18n=text}

::: strings
s3ro: ρ_obj = {ro} g/cm³, ρ_liq = {rl} g/cm³ → {verdict}
s3float: floats, about {p}% submerged.
s3sink: sinks to the bottom (ρ_obj > ρ_liq).
s3neutral: hangs just submerged (ρ_obj = ρ_liq).
s3ready: The object is above the liquid; press “Let go”.
:::

## How do you find the volume of an irregular object? {#step4 h2=s4t}

::: strings
nav4: 4 Odd stone
:::

Step 4 · Odd stone {#s4k .step-kicker i18n=text}

This step asks: you cannot measure an odd shape with a ruler — so what then? Lower it into water in a measuring cylinder: the **rise in water level** equals its volume (displacement method). Choose an object (mass already weighed), press “Lower into water”, read the rise, then compute ρ = m ÷ V. {#s4e .explain}

::: html step4-1
s4stage: Measuring cylinder: scale in mL (1 mL = 1 cm³)
s4canvas: Measuring cylinder diagram: the water rises when the object goes in; the rise equals the object volume
s4obj: Object
s4go: Lower into water
s4out: Take it out
:::

Takeaway: displacement turns a shape problem into a scale reading. Holds if the object sinks, absorbs no water and does not dissolve; cylinder readings have error. {#s4result .readout i18n=text}

::: strings
s4o0: Piece A (m = 13.5 g)
s4o1: Piece B (m = 39.5 g)
s4o2: Piece C (m = 96.5 g)
s4ro0: Object mass {m} g; water level before: {v0} mL. Press “Lower into water” to read the rise.
s4ro1: Level {v0} mL → {v1} mL, rise {dv} mL = object volume; ρ = {m} ÷ {dv} = {rho} g/cm³, closest to {name}.
:::

## Explain density to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Density is a property of a material: how much mass sits in each unit of volume.
f1t: Definition
f1b: ρ = m ÷ V, in g/cm³ or kg/m³; 1 g/cm³ = 1000 kg/m³.
f2t: Property
f2b: For one uniform material, m is proportional to V, so the ratio does not depend on piece size (step 1).
f3t: Use
f3b: Compare densities to predict float or sink (step 3); use displacement to get volume, then ρ to identify a material (step 4).
modelT: Honest model notes
model1: Table densities are typical values at room conditions (about 20 °C, 1 atm). Temperature shifts them slightly; water is densest near 4 °C and ice is lighter than water.
model2: The balance and cylinder here are idealised, and mass readings carry a simulated ±2% error; real materials have impurities and pores, so their density drifts from table values.
model3: The dots in cells are bookkeeping (0.25 g each), not atoms; real density comes from atom mass and how tightly atoms are packed.
nextT: Keep going (on this site)
l1: Particles & States · step 0: how tightly solid particles pack, and why that means high density
l2: Particles & States · step 2: how melting loosens the pattern and changes volume and density
l3: Mass Conservation · step 0: how mass is weighed and why it is conserved
:::
