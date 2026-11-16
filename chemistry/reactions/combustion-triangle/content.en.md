---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Chemistry
stageBadge: Junior High
foot: The Fire Triangle · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: The Fire Triangle · Remove One Leg and the Fire Dies
pageTitle: The Fire Triangle
tagline: Fuel, oxygen and enough heat: you need all three. Putting a fire out does not mean beating it — it means taking one leg away.
:::

## What must be present at the same moment for a fire? {#step0 h2=s0t}

::: strings
nav0: 0 Three legs
:::

Step 0 · Three legs {#s0k .step-kicker i18n=text}

This step asks: why do some things sit there while others catch with a touch? **Burning** is the vigorous, light-and-heat-giving reaction of a fuel with oxygen. To keep going it needs three things at once: **fuel** (something that can burn), **oxygen** (usually from air) and **temperature at or above the ignition point** (the lowest temperature at which a substance starts to burn). Switch the three off one by one and see when the flame goes out. {#s0e .explain}

::: html step0-1
s0stage: The triangle’s three sides are the three conditions: lit means present; the flame appears only when all three sides are lit
s0canvas: The fire triangle: fuel, oxygen and temperature on its three sides; the flame shows only when all three are present
s0fuel: Fuel present
s0air: Oxygen present (air)
s0heat: Hot enough (at the ignition point)
:::

Takeaway: burning needs all three together; remove any one and the fire goes out. Holds in this simplified triangle model; a fuller picture adds the self-sustaining chain reaction. {#s0result .readout i18n=text}

::: strings
s0ro: {legs}. {verdict}
s0legs: Present: {have}; missing: {miss}
s0none: none
s0burn: All three conditions met: it burns.
s0out: At least one condition is missing: it will not (keep) burning.
:::

## Why does a candle go out under a jar, and does jar size matter? {#step1 h2=s1t}

::: strings
nav1: 1 Jar over a candle
:::

Step 1 · Jar over a candle {#s1k .step-kicker i18n=text}

This step asks: why does a candle die inside a closed jar, and what changes if the jar is bigger? Air is about 21% oxygen by volume. A burning candle keeps using it up, and once the oxygen share drops below about 16% the flame cannot hold. Drag the jar volume, press “Cover with the jar”, and watch the oxygen share fall and the flame shrink until it goes out. {#s1e .explain}

::: html step1-1
s1stage: Top: candle and jar; bottom: oxygen share over time (solid = already happened, dashed = predicted) with the ~16% flame-out line
s1canvas: A candle under a jar: the oxygen share falls and the flame dies when it crosses the flame-out line
s1v: Jar volume
s1cover: Cover with the jar
s1lift: Lift the jar and relight
:::

Takeaway: a bigger jar holds more oxygen and the candle burns longer. Holds with the teaching numbers used here: oxygen use of 1 mL/s and a 16% flame-out line, ignoring CO₂ and temperature effects; a real candle’s flame-out point depends on the setup. {#s1result .readout i18n=text}

::: strings
s1ro: Jar {v} mL: t = {t} s, oxygen {frac}%; {state}
s1on: the flame is still on, but shrinking.
s1out: oxygen is below about 16%, so the flame has gone out (it went out at about {te} s).
s1idle: not covered yet; once covered it will go out after about {te} s.
:::

## How hot does it need to be to catch fire — the same for everything? {#step2 h2=s2t}

::: strings
nav2: 2 Ignition point
:::

Step 2 · Ignition point {#s2k .step-kicker i18n=text}

This step asks: heated the same way, why do some things catch first? Each substance has its own **ignition point** (the lowest temperature that starts it burning). Pick a substance and drag the heating temperature; it ignites only once the temperature reaches its ignition point and there is oxygen. The bars show approximate ignition points of some common substances; the orange line is the current temperature, so everything left of it could ignite now. {#s2e .explain}

::: html step2-1
s2stage: Bar chart: each substance’s ignition point (approximate, °C); the orange vertical line is the current heating temperature; the one being heated is highlighted
s2canvas: Ignition points of several substances with the current temperature line; those the line has passed can ignite
s2mat: Substance being heated
s2T: Heating temperature
s2air: Oxygen present (air)
:::

Takeaway: ignition points differ by substance, and you need both temperature and oxygen. Holds with approximate common-source values (they depend on pressure, particle size and how it is heated), which are not safety thresholds. {#s2result .readout i18n=text}

::: strings
s2ro: {mat}: ignition point about {ign} °C, now {T} °C; {state}
s2go: the temperature has reached its ignition point and there is oxygen: it ignites.
s2noT: not at its ignition point yet: it will not ignite.
s2noAir: hot enough, but there is no oxygen: it cannot burn.
s2others: Substances that could ignite at this temperature: {list}.
:::

## Which leg does each way of putting out a fire take away? {#step3 h2=s3t}

::: strings
nav3: 3 Putting it out
:::

Step 3 · Putting it out {#s3k .step-kicker i18n=text}

This step asks: pick a way to fight a fire — which leg does it remove here, and does it actually work? Water mostly absorbs heat so the temperature falls below the ignition point; covering cuts off oxygen; shutting off fuel removes the fuel; a CO₂ extinguisher blankets the flame with gas that shuts out air. Pick a fire, try each method, and note that some methods backfire in particular situations. {#s3e .explain}

::: html step3-1
s3stage: The fire and its triangle: the removed leg turns grey; the fire counts as out only if the flame goes out
s3canvas: A fire scene: after a method is tried, one triangle side greys out and the flame goes out or carries on
s3sc: Fire
s3m0: Pour water (cool it)
s3m1: Cover it (cut off air)
s3m2: Cut off or remove the fuel
s3m3: CO₂ extinguisher
s3reset: Relight
:::

Takeaway: putting a fire out = removing one leg, but you must pick the right way. Only four fires and four methods are shown; real firefighting must weigh safety, size and type (for example, never water on electrical fires). {#s3result .readout i18n=text}

::: strings
s3ro0: Pick a method to try.
s3roOut: {m}: it removes the “{leg}” leg, and the fire is out.
s3roUnsafe: {m}: dangerous! {why}
s3roStill: {m}: this does not work here — {why}
s3whyOilWater: Water is heavier than oil, sinks under it and flashes to steam, throwing burning oil everywhere so the fire spreads. Cover the pan with a lid instead.
s3whyOilFuel: You cannot “remove” the oil in the pan in time; turn off the heat and put a lid on.
s3whyGasWater: Water only cools; the gas keeps leaking and will reignite at the next spark. Shut the valve first.
s3whyGasCover: You cannot “cover” a jet of gas that keeps coming; shut the valve first.
s3whyGasCo2: The flame may be smothered for a moment, but the gas still leaks and can reignite or build up and explode. Shut the valve first.
s3whyForestCover: A forest fire is far too large to cover.
s3whyForestCo2: An extinguisher holds too little to matter against a big wildfire; firebreaks and heavy water drops are used instead.
leg_water: temperature
leg_cover: oxygen
leg_fuel: fuel
leg_co2: oxygen
:::

## Why does the same block of wood burn faster once it is chopped up? {#step4 h2=s4t}

::: strings
nav4: 4 How fast
:::

Step 4 · How fast {#s4k .step-kicker i18n=text}

This step asks: does more contact area between fuel and oxygen mean faster burning? Cut a wooden cube into k×k×k small cubes: the mass is unchanged but the total surface area becomes k times larger. Then adjust the ventilation (air flow multiplier). Press “Ignite” and watch how quickly the block blackens and the burn-down curve (fraction of mass left over time) falls. {#s4e .explain}

::: html step4-1
s4stage: Top: the block’s front face cut into k×k cells, brighter = more burned; bottom: mass left over time, with a grey reference line for k = 1 and 1× ventilation
s4canvas: Chopped wood burning: smaller pieces and better ventilation make the remaining-mass curve fall faster
s4k2: Cut into k×k×k pieces
s4a: Ventilation (air flow multiplier)
s4go: Ignite
s4reset: Restore the block
:::

Takeaway: burn rate grows with contact area and oxygen supply, which is why powder ignites most easily and shavings beat a log. Holds in this teaching model: burn-out time = 60 s ÷ (k × ventilation); fine powders like flour or coal dust suspended in air can even explode — never try it. {#s4result .readout i18n=text}

::: strings
s4ro: Total surface area ×{k}, ventilation ×{a}: burns out in about {T} s (reference 60 s); now t = {t} s, {rem}% left.
:::

## Explain the fire triangle to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Burning needs fuel, oxygen and a temperature at or above the ignition point together; putting out a fire means removing one of them.
f1t: Three conditions
f1b: Fuel + oxygen + temperature at the ignition point, all together (steps 0 and 2).
f2t: Putting out
f2b: Cutting off air, cooling below the ignition point or removing fuel suit different situations (steps 1 and 3).
f3t: How fast
f3b: More contact area and more oxygen mean faster burning (step 4).
modelT: Honest model notes
model1: The triangle is a simplified model; real burning also involves a self-sustaining chain reaction.
model2: Ignition points, flame-out oxygen and burn rates are approximate teaching numbers, not safety data.
model3: This page shows principles only; in a real fire evacuate and call the emergency number, and do not try to fight a large fire yourself.
nextT: Keep going (on this site)
l1: Reaction Rates · step 3: why surface area sets how fast a reaction goes
l2: Reaction Rates · step 2: how temperature speeds a reaction up
l3: Mass Conservation · step 4: oxygen joins in when something burns — how the mass account works
:::

::: strings
legFuel: fuel
legAir: oxygen
legHeat: temperature
matP: Phosphorus
matPaper: Paper
matGas: Gasoline
matWood: Wood
matCH4: Methane
scWood: Campfire (wood)
scOil: Oil fire in a kitchen pan
scGas: Burning gas leak at a stove
scForest: Forest fire
mWater: Pour water (cool it)
mCover: Cover it (cut off air)
mFuel: Cut off or remove the fuel
mCo2: CO₂ extinguisher
unitMl: mL
unitS: s
unitC: °C
unitPct: %
:::
