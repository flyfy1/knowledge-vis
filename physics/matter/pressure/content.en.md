---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Physics & Circuits
stageBadge: Junior High
foot: Pressure · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Pressure · Same Force, Spread Wider, Pushes Softer
pageTitle: Pressure
tagline: Snowshoes keep you on top; a thumbtack tip goes in easily. The same force pressed on a smaller area pushes harder: force per unit area is pressure.
:::

## Same weight, so why does a snowshoe not sink? {#step0 h2=s0t}

::: strings
nav0: 0 Feet in snow
:::

Step 0 · Feet in snow {#s0k .step-kicker i18n=text}

This step asks: with the same weight on snow, how does the dent change when the contact area grows? **Force** here is the push perpendicular to the surface (newtons, N); **pressure** is force per unit area, p = F ÷ S (S is the contact area), in pascals (Pa) — this page uses kilopascals (1 kPa = 1000 Pa). Drag the force and the contact area and watch the snow dent. {#s0e .explain}

::: html step0-1
s0stage: Snow cross-section: the arrow is force F, the block’s base width is contact area S, the dent depth shows how far the snow is pressed
s0canvas: Snow diagram: a weight on snow; the smaller the contact area, the deeper the dent
s0f: Force F (the person’s weight)
s0a: Contact area S
:::

Takeaway: same force, bigger area, lower pressure, shallower dent. Holds in this model: snow is a uniform soft material with dent depth ∝ pressure, capped at 25 cm. {#s0result .readout i18n=text}

::: strings
s0ro: p = F ÷ S = {f} N ÷ {a} cm² = {p} kPa; snow dented about {d} cm.
:::

## Both ends of a thumbtack feel the same force — how different is the pressure? {#step1 h2=s1t}

::: strings
nav1: 1 Two ends of a tack
:::

Step 1 · Two ends of a tack {#s1k .step-kicker i18n=text}

This step asks: you push a thumbtack with a finger; head and tip carry the same force, so why is the pressure so different? Drag the area slider (the axis is in powers of ten) and watch the dot slide along the curve: every 10× larger area gives one-tenth the pressure. Then change F and see the whole line shift. {#s1e .explain}

::: html step1-1
s1stage: x-axis: contact area S (cm², log scale); y-axis: pressure p (kPa, log scale); the orange dot is the current area
s1canvas: Log–log graph of pressure against area: each 10× increase in area cuts pressure to a tenth, a straight falling line
s1f: Finger force F
s1a: Contact area S as log₁₀ S
:::

Takeaway: for a fixed force, p is inversely proportional to S. Holds when the force is spread evenly over the contact; a real tack tip is not an ideal flat patch. {#s1result .readout i18n=text}

::: strings
s1ro: S = {a} cm² → p = {p} {u}; that area is {r}× the tack head (1 cm²).
:::

## What sets the pressure at a point inside a liquid? {#step2 h2=s2t}

::: strings
nav2: 2 Deeper, harder
:::

Step 2 · Deeper, harder {#s2k .step-kicker i18n=text}

This step asks: why does a hole lower on a tank wall spray harder? In a liquid at **depth h** (vertical distance below the surface) the pressure is p = ρgh, where ρ is the liquid’s density (see the [[density#step0|density page]]) and g = 9.8 N/kg. Drag the water level, pick a liquid, and watch each hole’s pressure arrow and jet. {#s2e .explain}

::: html step2-1
s2stage: Tank: four small holes; arrow length = pressure at the hole; jet paths are drawn for ideal outflow
s2canvas: Tank with holes in its wall: lower holes have longer pressure arrows and the jets reach farther
s2liq: Liquid
s2h: Water level H
:::

Takeaway: in one liquid, pressure grows linearly with depth; a denser liquid gives proportionally more at the same depth. Holds for still liquid, gauge pressure (air pressure left out); jet shapes use ideal outflow, which does not depend on ρ. {#s2result .readout i18n=text}

::: strings
s2ro: Lowest hole at depth {d} m: p = ρgh = {rho} × 9.8 × {d} = {p} kPa; the deepest hole’s pressure is {r}× the shallowest’s.
:::

## How much pressure does the air above us exert, and why does it fall with height? {#step3 h2=s3t}

::: strings
nav3: 3 Weight of air
:::

Step 3 · Weight of air {#s3k .step-kicker i18n=text}

This step asks: air has weight, so does it press? **Atmospheric pressure** is the weight of the whole air column above, per unit area; at sea level it is about 101.3 kPa. A **barometer** holds a liquid column up with it: column height h = p ÷ (ρg). Drag the altitude and watch the column fall. {#s3e .explain}

::: html step3-1
s3stage: Barometer: air pressure holds up the liquid column; the dashed line marks the sea-level height
s3canvas: Barometer diagram: the higher the altitude, the shorter the column
s3liq: Liquid in the tube
s3z: Altitude z
:::

Takeaway: at sea level mercury stands near 760 mm and water near 10.3 m; higher up the air is thinner and the pressure lower. Holds in this isothermal model p = p₀·e^(−z/8400); the real atmosphere varies with temperature and weather. {#s3result .readout i18n=text}

::: strings
s3ro: Altitude {z} m: air pressure about {p} kPa ({r}% of sea level); the {liq} column is {h} {u} tall.
:::

## Why can a small piston lift a big weight? {#step4 h2=s4t}

::: strings
nav4: 4 Small force, big lift
:::

Step 4 · Small force, big lift {#s4k .step-kicker i18n=text}

This step asks: in a sealed liquid the pressure is the same everywhere (Pascal’s principle), so what force on the small piston lifts the load on the big one? Pressure p = F₁ ÷ S₁, and the big piston gets F₂ = p × S₂. Press “Push small piston 10 cm” and see how high the big one rises. {#s4e .explain}

::: html step4-1
s4stage: Hydraulic press: small piston left, big piston right, a 100 kg load on top (about 980.7 N)
s4canvas: Hydraulic press diagram: the small piston goes down and the big piston lifts the load
s4f1: Force on small piston F₁
s4a1: Small piston area S₁
s4a2: Big piston area S₂
s4push: Push small piston 10 cm
s4reset: Reset
:::

Takeaway: F₂ = F₁ × S₂ ÷ S₁ — force is multiplied, distance shrinks, work stays equal (ideal case). Holds for incompressible liquid with no leaks or friction; real presses lose energy. {#s4result .readout i18n=text}

::: strings
s4ro: p = {p} kPa; F₂ = {f2} N ({cmp} the 980.7 N load). {move}
s4lift: enough to lift
s4nolift: not enough to lift
s4moved: Small piston down 10 cm, big piston up {d2} cm; work in {w1} J, work out {w2} J.
s4stuck: The big piston stays put: F₂ is too small. Raise F₁ or S₂ ÷ S₁ and try again.
s4idle: Press “Push small piston 10 cm” to demonstrate.
:::

## Explain pressure to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Pressure is force per unit area: the same force on a smaller area presses harder.
f1t: Solids
f1b: p = F ÷ S: spread the area to lower pressure (snowshoes), shrink it to raise pressure (a tack).
f2t: Liquids and air
f2b: In a liquid p = ρgh grows linearly with depth; air pressure is the weight of the air above and falls with altitude.
f3t: Sealed liquid
f3b: Pascal’s principle: pressure is equal everywhere, so a hydraulic press trades force gain for shorter travel.
modelT: Honest model notes
model1: The snow dent, jet paths and isothermal atmosphere are teaching approximations; real snow compacts and the atmosphere is layered by temperature.
model2: The hydraulic press here has no friction or leaks; real machines deliver less work than they take in.
model3: Jet paths use ideal outflow, whose reach does not depend on ρ, while the pressure at a hole grows in proportion to ρ — keep the two apart.
nextT: Keep going (on this site)
l1: Levers & Pulleys · step 2: why gaining force always costs distance (the work ledger)
l2: Density · step 3: the ρ inside p = ρgh, and how floating is decided
l3: Particles & States · step 1: the particle motion behind gas pressure
:::

::: strings
unitN: N
unitCm2: cm²
unitKpa: kPa
unitMpa: MPa
unitM: m
unitMm: mm
unitCm: cm
liqWater: Water
liqSalt: Salt water
liqOil: Cooking oil
liqHg: Mercury
:::
