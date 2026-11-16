---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Float & Sink · What the Displaced Water Holds Up
tagline: The same plasticine sinks as a ball but floats as a boat: what decides it is how much water it pushes aside.
:::

## Objects of the same size (40 cm³): which float and which sink? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Who floats
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: WHO FLOATS
:::

This step answers: what comparison decides floating or sinking? Every object here is 40 cm³, and water has a density of 1 g/cm³ (**density** is how many grams per cubic centimetre). A submerged object gets an upward **buoyant force** equal to the weight of the water it displaces, while its own weight pulls down. Pick an object and see which arrow is longer. {#s0e .explain}

::: html step0-2
s0cv: An object in a tank, weight (down) and buoyant force (up)
obj: Choose an object
oCork: Cork
oWood: Wood block
oIce: Ice block
oClay: Plasticine
oIron: Iron block
:::

::: strings
s0ro: {name}: density {rho} g/cm³, weight {w} gf (gram-force); {state}, displacing {v} cm³ of water, buoyant force {b} gf.
floats: it floats (less dense than water)
sinks: it sinks (denser than water)
:::

## Pushing a wooden block down, how does the buoyant force change with depth? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Displaced water
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: DISPLACED WATER
:::

This step answers: how is the buoyant force related to displaced water? You push a wooden block (40 cm³, density 0.6) into the water bit by bit: the more of it is under water, the more water it displaces, the higher the water level rises, and buoyant force = weight of the displaced water (1 cm³ of water weighs 1 gf). On the right the x-axis is the fraction submerged and the y-axis is the buoyant force; the flat line is the block’s own weight, 24 gf, and where they cross is where it floats by itself. {#s1e .explain}

::: html step1-2
s1cv: Left: water level as the block is pushed in; right: buoyant force against fraction submerged
sub: Fraction submerged (0 = just touching, 1 = fully under)
:::

::: strings
s1ro: {pct}% submerged: {v} cm³ of water displaced, buoyant force = {b} gf; the block weighs {w} gf, {cmp}.
cmpUp: buoyancy is larger, so it is pushed up
cmpDown: buoyancy is smaller, so it would sink if released
cmpEq: buoyancy equals weight: balance, the block floats at this depth by itself
:::

## Why does the same plasticine float once it is shaped into a boat? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Ball to boat
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: BALL TO BOAT
:::

This step answers: how can shape change floating? The plasticine weighs 50 g and its own volume is about 31 cm³ (density 1.6). The **hull volume** is the volume enclosed by the outer outline of the boat, air inside included. Drag the slider to hollow it out: a bigger hull volume can displace more water, with maximum buoyancy = hull volume × 1 gf/cm³; at 50 g it can hold itself up. {#s2e .explain}

::: html step2-2
s2cv: The same plasticine: bigger hull volume, more water displaced
env: Hull volume (cm³)
:::

::: strings
s2ro: Hull volume {env} cm³: fully under it displaces at most {env} cm³, so maximum buoyancy {bmax} gf against the plasticine’s {w} gf: {res}; actually displaces {v} cm³ of water.
s2roSink: it sinks
s2roFloat: it floats, only {frac}% submerged
:::

## How much cargo can the boat take before it sinks? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Cargo
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: CARGO
:::

This step answers: how do we work out a floating boat’s load limit? A boat with a hull volume of 100 cm³ (own weight 50 g) is loaded with marbles of 5 g each. Each marble adds weight and the boat sits lower; when the total weight equals the maximum buoyancy (100 gf) the waterline reaches the rim, and one more sinks it. Press “Add a marble” and watch the waterline rise step by step. {#s3e .explain}

::: html step3-2
s3cv: A boat with marbles, the waterline rising
add: Add a marble
rem: Remove a marble
reset3: Clear the cargo
:::

::: strings
s3ro: {n} marbles, total weight {mass} gf; maximum buoyancy {cap} gf, {res}.
s3roOk: the waterline is at {pct}% of the hull height, room for {left} more
s3roFull: exactly full, one more sinks it
s3roSunk: overloaded, it has sunk
:::

## Why does the same egg float in salt water? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Salt water
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: SALT WATER
:::

This step answers: how does floating change when the water’s density changes? An egg has a density of 1.08 g/cm³, more than fresh water (1.00), so it sinks; dissolving salt raises the water’s density. Drag the water density and see where the egg starts to rise; when it floats, fraction submerged = egg density ÷ water density. {#s4e .explain}

::: html step4-2
s4cv: An egg in water of different densities
rw: Water density (g/cm³)
:::

::: strings
s4ro: Water density {rw}: egg density 1.08, {res}.
s4roSink: higher than the water’s, so the egg sinks
s4roFloat: lower than the water’s, so the egg floats, {frac}% submerged
:::

## Design a boat that floats {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: for a given weight, how big must a boat be to float? Choose the boat’s weight and hull volume. It floats if hull volume ≥ weight ÷ water density (1 g/cm³). {#s5e .explain}

::: html step5-2
s5cv: The boat you designed
m5: Boat weight (g)
v5: Hull volume (cm³)
recapTitle: Recap
recap1: Buoyant force = weight of the displaced water; the object’s own weight pulls down.
recap2: Less dense than water floats; something denser can float if hollowed out so its average density is below water’s.
recap3: Denser water (salt) makes the same object float more easily.
modelTitle: Scope and limits of this model
modelText: The water is an ideal incompressible fluid at 1 g/cm³ (except in step 4); we ignore waves, surface tension and the boat’s tipping stability. gf (gram-force) is the weight of one gram of mass, about 9.8 times smaller than the SI newton in numbers; this page only compares sizes.
linkLev: → Levers & Pulleys: forces and balancing them
linkEq: → Equations on a Balance: balance needs both sides equal
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Weight {m} g needs at least {need} cm³ of hull volume to float; yours is {env} cm³: {res}.
s5roYes: it floats
s5roNo: it sinks, {gap} cm³ short
docTitle: Float & Sink · What the Displaced Water Holds Up
:::
