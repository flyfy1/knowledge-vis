---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Biology
stageBadge: Junior High
foot: Food Webs · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Food Webs · Remove One Species and See Who Follows
pageTitle: Food Webs
tagline: Grass, rabbit, fox joined into a web — eating and being eaten passes energy up level by level, and a change at any node ripples to others.
:::

## In this picture, who eats whom and which way does energy go? {#step0 h2=s0t}

::: strings
nav0: 0 Who eats whom
:::

Step 0 · Who eats whom {#s0k .step-kicker i18n=text}

This step asks: how do you read a food web? Arrows point from the **eaten** to the **eater**, the direction energy is passed. A **producer** (grass) makes its own food from sunlight; **consumers** get energy by eating other organisms. The **trophic level** is its position in the chain: producers are level 1, what eats them is level 2, and so on; for a mixed diet take the average level of its foods plus 1. Pick a species (or click a dot on the picture) and see what it eats and what eats it. {#s0e .explain}

::: html step0-1
s0stage: The food web: arrows go from food to eater; horizontal position is only layout, height is trophic level; cyan lines = what it eats, orange lines = what eats it
s0canvas: A food web of eight organisms: grass at the bottom, frog, snake, fox and hawk above, arrows showing energy flow
s0sp: Pick a species
:::

Takeaway: arrow direction = energy flow; the higher the trophic level, the farther from sunlight. Holds for this simplified fictional eight-species meadow web; real webs are far more complex. {#s0result .readout i18n=text}

::: strings
s0ro: {name} (trophic level {tl}): eats {eats}; eaten by {eaten}.
s0none: nothing
s0prod: makes its own food
s0top: no predators (top predator)
:::

## Why are there always far fewer meat-eaters than plant-eaters? {#step1 h2=s1t}

::: strings
nav1: 1 Energy pyramid
:::

Step 1 · Energy pyramid {#s1k .step-kicker i18n=text}

This step asks: at each step up a trophic level, how much energy is left? Most of the energy an animal eats goes into breathing, moving and heat; only a small part becomes its own body, the energy available to the next eater. A common rule of thumb is a **transfer efficiency** of about 10% (adjustable 5–20% here). Start from 10000 kJ at the producers and multiply by the efficiency level by level; a level below 5 kJ cannot support a population. Drag the efficiency and see how many levels the pyramid holds. {#s1e .explain}

::: html step1-1
s1stage: Energy pyramid (widths on a log scale): producers at the bottom up to top consumers, each level’s energy in kJ; grey means it cannot be supported
s1canvas: An energy pyramid: each level up multiplies energy by the efficiency, and levels under 5 kJ turn grey
s1eff: Transfer efficiency
:::

Takeaway: lower efficiency makes a shorter pyramid and fewer top predators. Holds with the teaching numbers used (10000 kJ start, 5 kJ minimum, the same efficiency at every step); real efficiencies vary between organisms. {#s1result .readout i18n=text}

::: strings
s1ro: Efficiency {eff}%: energy per level {list}; levels that can be supported = {n}.
:::

## Take one species away: how do the others’ numbers change? {#step2 h2=s2t}

::: strings
nav2: 2 One species gone
:::

Step 2 · One species gone {#s2k .step-kicker i18n=text}

This step asks: remove one species from the web — how do the others’ numbers change, and do any disappear with it? Each species grows with the food it gets and shrinks when eaten. This page runs a simplified mathematical model (every eat/eaten pair works by encounters): first the eight species sit at balance, then one is removed and you watch every curve (as a percentage of its original number). Pick a species and press “Remove and run”. {#s2e .explain}

::: html step2-1
s2stage: x-axis: model time, y-axis: each species’ number as a percentage of its balance value (shown up to 250%); one line per species, under 2% counts as gone
s2canvas: Curves of each species’ number over time after one is removed: some rise, some fall, some vanish
s2rm: Species to remove
s2run: Remove and run
s2reset: Restore the original web
:::

Takeaway: removing one species spreads through the chain of eating and being eaten, raising some species and lowering others. Holds in a linear-interaction toy model with parameters tuned for stability; real ecosystems respond according to the actual species involved. {#s2result .readout i18n=text}

::: strings
s2ro0: Eight organisms at balance: every one is at 100%. Pick a species, remove it and run.
s2ro1: After removing “{name}”, at time {t}: {list}
s2dead: " (gone)"
:::

## Why does a trace of poison in the environment get alarmingly concentrated in top animals? {#step3 h2=s3t}

::: strings
nav3: 3 Toxin build-up
:::

Step 3 · Toxin build-up {#s3k .step-kicker i18n=text}

This step asks: when a hard-to-break-down, hard-to-excrete poison enters a food chain, how does its concentration change at each level? Such substances (certain pesticides, mercury) are stored in the body, so each meal adds to the store: nearly all the poison in the animal below stays with its eater, and each step up multiplies the concentration by some factor. Compare by **concentration** (poison per unit body mass). Drag the “multiplier per level” and the “producer concentration” and see which level crosses the danger line. {#s3e .explain}

::: html step3-1
s3stage: Along the chain grass → grasshopper → frog → snake → hawk, the poison concentration at each level (log scale); the red dashed line is a teaching danger level of 100
s3canvas: A poison magnified level by level along the food chain: each level is a multiple of the one below and top predators can cross the danger line
s3f: Multiplier per level
s3c0: Producer concentration
:::

Takeaway: poisons that accumulate magnify up the food chain, hitting top predators hardest even if the environment holds very little. Holds only for substances that persist and are hard to excrete; many are excreted or broken down and do not magnify; the multiplier and danger line are teaching numbers. {#s3result .readout i18n=text}

::: strings
s3ro: Concentration per level: {list}; levels over the danger line (100): {over}.
s3over: level {n} ({name})
:::

## Why does an ecosystem with more food sources survive shocks better? {#step4 h2=s4t}

::: strings
nav4: 4 Web beats chain
:::

Step 4 · Web beats chain {#s4k .step-kicker i18n=text}

This step asks: remove the same species from a single-line chain and from an interwoven web — which loses more species along with it? The rule is simple: a consumer survives as long as **one** of its foods is alive, and disappears once all of them are gone. Choose “full web” or “single-line chains”, pick a species, press “Remove”, and count what goes with it. {#s4e .explain}

::: html step4-1
s4stage: The food web: coloured = alive, red cross = removed by you, grey = gone because its food is gone
s4canvas: The food web after removing a species, with the species lost as a consequence shown in grey
s4mode: Shape of the web
s4rm: Species to remove
s4remove: Remove
s4reset: Restore everything
:::

Takeaway: when one food disappears, a predator with other foods can hold on; the more interwoven the web, the fewer species are lost with it. Holds for this one structural rule (“is there any food left”); numbers, competition and disease are not modelled. {#s4result .readout i18n=text}

::: strings
s4ro: {mode}, removing “{name}”: {n} more species lost ({list}). The same removal in the other structure loses {other}.
s4ro0: {mode}: all eight organisms are here. Pick a species and press “Remove”.
:::

## Explain food webs to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: A food web draws, with arrows, the paths energy takes from producers to consumers; only about a tenth is passed on at each step, so top predators are few; and a change at any node spreads along the web.
f1t: Reading it
f1b: Arrows run from eaten to eater, which is also the direction of energy (step 0).
f2t: Energy and poison
f2b: Energy shrinks to about 10% per level; poisons that accumulate grow per level, so the top is most at risk (steps 1 and 3).
f3t: Ripples
f3b: Removing a species spreads through the web; more food sources make it sturdier (steps 2 and 4).
modelT: Honest model notes
model1: This is a fictional eight-species meadow web; real webs have hundreds or thousands of nodes, plus decomposers, omnivory and competition.
model2: Step 2 is a linear-interaction toy model with parameters tuned to be stable; the curves show tendencies and cannot predict a real ecosystem.
model3: The transfer efficiency, danger line and multiplier are teaching numbers, not measurements.
nextT: Keep going (on this site)
l1: Photosynthesis · step 1: how the producers at the base of the web make their food
l2: Population Growth · step 3: why a population has a ceiling called K
l3: Population Ecology · step 2: how predators make prey numbers rise and fall
:::

::: strings
sp0: Grass
sp1: Grasshopper
sp2: Rabbit
sp3: Mouse
sp4: Frog
sp5: Snake
sp6: Fox
sp7: Hawk
lvl1: Producer
lvl2: Primary consumer
lvl3: Secondary consumer
lvl4: Tertiary consumer
lvl5: Quaternary consumer
unitKj: kJ
unitPct: %
s0sep: ", "
modeWeb: Full food web (predators have several foods)
modeChain: Single-line chains only (each predator eats one thing)
statAlive: alive
statRemoved: removed by you
statExtinct: gone because their food is gone
:::
