---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Physics & Circuits
stageBadge: Junior High
foot: Buoyancy & Archimedes · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Buoyancy & Archimedes · The Displaced Water’s Weight Is the Buoyant Force
pageTitle: Buoyancy & Archimedes
tagline: Lower an object into water and the spring scale reading keeps dropping — by exactly the weight of the water it pushes aside.
:::

## Why does the spring scale read less once the object is in water? {#step0 h2=s0t}

::: strings
nav0: 0 Scale drops
:::

Step 0 · The scale drops {#s0k .step-kicker i18n=text}

This step asks: as an object sinks into water, how does the spring scale reading change? The scale reads the upward pull holding the object. Once in water, the water pushes up on it too; that upward push is the **buoyant force** (in newtons, N). Pick an object, drag how far it is lowered, and watch the spring and the reading. {#s0e .explain}

::: html step0-1
s0stage: A spring scale holds a block: the dashed line is the water surface; a shorter spring means a smaller reading
s0canvas: A spring scale lowers a block into water; the spring shortens as the reading falls
s0obj: Object
s0z: Lowered depth z (from when the bottom touches the surface)
s0reset: Lift out of water
:::

Takeaway: the more submerged, the smaller the reading and the larger the buoyant force. Holds when the object sinks (here every object is denser than water) in still water. {#s0result .readout i18n=text}

::: strings
s0ro: Weight W = {w} N; submerged volume {vs} cm³ (of {v} cm³); buoyant force F_b = {fb} N; reading = W − F_b = {r} N.
:::

## What exactly is the buoyant force equal to? {#step1 h2=s1t}

::: strings
nav1: 1 Displaced water
:::

Step 1 · Displaced water {#s1k .step-kicker i18n=text}

This step asks: how is the buoyant force related to the water the object pushes aside? A cup is filled to the brim; as the object goes in, water spills into a bucket. The **displaced water** is the water pushed out of the object’s place. Drag the depth and compare “how much the reading fell” with “the weight of the water in the bucket”. {#s1e .explain}

::: html step1-1
s1stage: Overflow cup and bucket: the deeper it goes, the more spills; the two bars on the right compare two forces
s1canvas: Overflow cup diagram: water spills into a bucket; two bars compare the reading drop with the spilled water’s weight
s1obj: Object
s1z: Lowered depth z
s1reset: Lift out and empty bucket
:::

Takeaway: F_b = W_displaced = ρ_liq·g·V_displaced (Archimedes’ principle). Holds for an object in still liquid; V_displaced is the part of the volume below the liquid surface. {#s1result .readout i18n=text}

::: strings
s1ro: Reading fell by {d} N; displaced water in the bucket {vs} cm³ weighs {ww} N; they differ by {diff} N (simulated scale error about ±1%).
:::

## Does buoyancy depend on how deep the object is? {#step2 h2=s2t}

::: strings
nav2: 2 Depth or volume
:::

Step 2 · Depth or volume {#s2k .step-kicker i18n=text}

This step asks: as an object sinks deeper, does the buoyant force keep growing? It depends only on ρ_liq, g and the **displaced volume**. The graph’s x-axis is lowered depth, y-axis is the buoyant force: before the block is fully under, deeper means more displaced; once fully under, going deeper changes nothing. Pick a block size and liquid and drag the depth. {#s2e .explain}

::: html step2-1
s2stage: x-axis: depth z (cm); y-axis: buoyant force F_b (N); three lines for three block sizes, the bright one is selected
s2canvas: Graph of buoyant force against depth: rises, then flat once the block is fully submerged
s2obj: Block size
s2liq: Liquid
s2z: Lowered depth z
:::

Takeaway: buoyancy grows with displaced volume and is independent of depth once fully submerged; a denser liquid lifts the plateau in proportion. Holds for an incompressible liquid and a rigid block. {#s2result .readout i18n=text}

::: strings
s2ro: A {s} cm block in {liq}: at z = {z} cm the displaced volume is {vs} cm³ and F_b = {fb} N; {state}
s2part: not fully under yet, so going deeper still adds buoyancy.
s2full: fully under, so going deeper leaves it unchanged.
:::

## After letting go, which two forces decide float or sink? {#step3 h2=s3t}

::: strings
nav3: 3 Float or sink forces
:::

Step 3 · Float or sink forces {#s3k .step-kicker i18n=text}

This step asks: after release, does the object go up or down? That is decided by weight W (down) versus buoyant force F_b (up). Fully under, F_b = ρ_liq·g·V; if W is bigger it sinks, if F_b is bigger it rises, until floating at the surface where F_b equals W. Pick a liquid, drag the object’s density, press “Let go”, and watch the arrows. {#s3e .explain}

::: html step3-1
s3stage: Tank: the red down arrow is weight W, the cyan up arrow is buoyant force F_b, drawn to one common scale
s3canvas: Tank diagram: one arrow up and one down on the object; when floating the two are equal length
s3liq: Liquid
s3rho: Object density ρ_obj
s3drop: Let go
s3lift: Lift it back up
:::

Takeaway: ρ_obj < ρ_liq floats (F_b = W while floating); ρ_obj > ρ_liq sinks. Holds for solid uniform objects in still liquid. {#s3result .readout i18n=text}

::: strings
s3ro: W = {w} N; fully under, F_b would be {fm} N; {res}
s3resFloat: floats, F_b = W = {w} N, about {p}% submerged.
s3resSink: sinks to the bottom: F_b = {fm} N is less than W, the floor supports {n} N.
s3resNeutral: hangs in balance, F_b = W.
s3ready: The object is above the liquid; press “Let go”.
:::

## Steel is far denser than water — so why does a steel ship float? {#step4 h2=s4t}

::: strings
nav4: 4 Why steel ships float
:::

Step 4 · Why steel ships float {#s4k .step-kicker i18n=text}

This step asks: why does a hollow steel shell float when a solid lump sinks? What counts is the overall average density = total mass ÷ the volume the hull encloses; a bigger hull displaces more water. The steel plates weigh a fixed 800 kg. Drag the hull volume and the cargo mass and watch the waterline; load it past what the buoyancy can hold and it sinks. {#s4e .explain}

::: html step4-1
s4stage: Ship side view: the dashed line is the water surface; the hull below it displaces water; the readout compares total mass with the water mass it can displace
s4canvas: Ship side view: a bigger hull rides higher, more cargo sits deeper, overloading sinks it
s4v: Volume enclosed by the hull V
s4c: Cargo mass
s4reset: Unload and reset
:::

Takeaway: the ship floats as long as total mass stays below hull volume × water density. Holds in this box-hull model: no leaks, steel volume ignored; real ships also need stability and wave margins. {#s4result .readout i18n=text}

::: strings
s4ro: Total mass {m} kg; average density {rho} kg/m³; fully submerged the hull can displace at most {cap} kg of water; {res}
s4resFloat: floats, draft {p}% of hull height, room for {left} kg more.
s4resSink: overloaded: it sinks (total mass exceeds the water mass the hull can displace).
:::

## Explain Archimedes’ principle to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: An object in a liquid feels an upward buoyant force equal to the weight of the liquid it displaces.
f1t: Formula
f1b: F_b = ρ_liq·g·V_displaced; scale reading = W − F_b.
f2t: Volume, not depth
f2b: Buoyancy follows displaced volume and liquid density; once fully under, depth does not matter (step 2).
f3t: Float or sink
f3b: Compare W with F_b, i.e. average density with liquid density; hollow shapes lower the average density (steps 3, 4).
modelT: Honest model notes
model1: This page uses g = 9.8 N/kg, water 1000 kg/m³, salt water 1030, cooking oil 920; scale error is a deterministic wobble of about ±1%.
model2: Object and liquid are treated as still; real floating involves bobbing, drag and surface tension.
model3: The ship is a simple box shell; stability, waves and centre of gravity are outside this model.
nextT: Keep going (on this site)
l1: Pressure · step 2: buoyancy really comes from the pressure difference across the object (p = ρgh)
l2: Density · step 3: compare densities to predict floating (another way into this page)
l3: Density · step 4: the displacement method uses the same displaced volume
:::

::: strings
unitN: N
unitCm: cm
unitCm3: cm³
unitM3: m³
unitKg: kg
unitDens: kg/m³
lblFb: F_b
lblDrop: Reading drop
lblBucket: Bucket water
lblTotal: Total
lblCap: Capacity
objAl: Aluminium block
objFe: Iron block
objSmall: Small block
objMid: Medium block
objBig: Large block
liqWater: Water
liqSalt: Salt water
liqOil: Cooking oil
:::
