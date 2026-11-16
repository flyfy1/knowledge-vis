---
lang: en
---

::: strings
pageTitle: Natural Selection · Why the Peppered Moth Flipped Colour
tagline: One species of moth comes in light and dark forms; birds eat what they can see, the survivors breed, and when the bark colour changes the colour ratio flips within a few generations.
:::

## Birds eat only what they can see: colour decides survival {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Who gets eaten
:::

::: html step0-1
:::

This step answers: why does the environment decide which individuals survive? The moth has two heritable colours: light and dark. Birds hunt by sight, and the more a moth contrasts with the bark the easier it is to spot. Let the bark darkness be b (0 is pale, 1 is black). A light moth survives with probability w_light = 1 − k·b and a dark moth with w_dark = 1 − k·(1 − b), with k = 0.5 the predation strength (the chance of being eaten when fully visible). Press "let the birds hunt one round": each moth survives at random with its own survival probability. {#s0e .explain}

::: html step0-2
s0o: Set the bark pale first (b = 0.2) and hunt a few rounds (resetting before each): light moths survive better; then set the bark dark (b = 0.9): the result reverses; compare the measured survival rates in the readout with the formula values (random, so they deviate).
lBark: Bark darkness (0 pale to 1 dark)
bHunt: Let the birds hunt one round
bRestore: Reset: restore the 60 moths
:::

::: strings
r0: Bark b = {b}: light moths {n1}/{t1} survived ({s1}%, formula {e1}%), dark moths {n2}/{t2} survived ({s2}%, formula {e2}%).
notYet: not hunted yet
:::

## Generation after generation: the survivors breed and the colour ratio shifts {#step1 h2=s1t pre=1}

::: strings
nav1: 1 A few generations on
:::

::: html step1-1
:::

This step answers: how do survival differences add up to change in a population? Each generation: first predation (with the survival probabilities above), then the survivors breed and offspring keep their parents' colour (colour is heritable), and the population is topped back up to 200. The dark share p changes as p′ = p·w_dark / (p·w_dark + (1 − p)·w_light). Press play, one generation at a time; the line tallies the dark share, and the dashed line is the no-randomness theory (with 200 moths the solid line still wobbles). {#s1e .explain}

::: html step1-2
s1o: With dark bark (b = 0.9) and 10% dark moths to start, watch the dark share climb toward 100% in a few generations; set pale bark (b = 0.1) and replay: the share falls; at b = 0.5 both do equally well and the share just wanders at random.
lP0: Starting share of dark moths
bPlay: Play / Pause
bReset: Reset: back to generation 0
:::

::: strings
r1: Generation {g}: {n} of {N} are dark, share {p}%; theory predicts {pt}%.
:::

## How strong is the selection? The per-generation advantage sets the speed {#step2 h2=s2t pre=1}

::: strings
nav2: 2 How strong
:::

::: html step2-1
:::

This step answers: what decides how fast the colour ratio changes? Each generation dark has an advantage ratio r = w_dark / w_light over light. The log-odds of the dark share, logit(p) = ln(p/(1 − p)), rises by exactly ln r per generation, so going from p₀ to p takes [logit(p) − logit(p₀)] / ln r generations. The bigger the ratio the faster the change. The orange line is the dark-share curve for the current settings (starting at 1%) and the readout gives the generations needed to reach 50% and 90%. {#s2e .explain}

::: html step2-2
s2o: Move the bark from 0.5 to 1: r grows from 1 and the generations needed fall sharply; raise the predation strength k for the same effect; at b = 0.5, r = 1 and nothing ever changes.
lK: Predation strength k (largest chance that a fully visible moth is eaten)
:::

::: strings
r2: w_light = {wl}, w_dark = {wd}, advantage ratio r = {r}: 1% to 50% takes {t50} generations and to 90% takes {t90}.
never: never (r ≤ 1)
:::

## A changing world: the population follows, but with a lag {#step3 h2=s3t pre=1}

::: strings
nav3: 3 A changing world
:::

::: html step3-1
:::

This step answers: when the environment changes, how does selection keep up? Take the industrial revolution: soot blackened the bark, and later cleaner air made it pale again. The bark darkness varies by generation (grey line: 0.4 at first, rising to 0.9 over generations 10–40, falling to 0.15 over generations 60–90) and the dark share (orange line) updates each generation by the formula of the last step (plus 0.1% of individuals changing to the other colour by mutation each generation, in both directions, so a rare colour never vanishes completely), starting at 2% (at b = 0.5 both colours do equally well, and selection reverses only once b crosses 0.5). Drag the generation slider and the dot moves along both curves. You will see the population always trails the environment, since each generation can change only part of the way. {#s3e .explain}

::: html step3-2
s3o: Drag the generation from 0 to 110: use the readout to see how many generations after the bark crosses 0.5 the dark share crosses 50%, and likewise on the way down; raise the predation strength k and the lag shortens.
lGen: Generation
:::

::: strings
r3: Generation {g}: bark b = {b}, dark share {p}%; the bark rises past 0.5 at generation {bu} and falls below it at {bd}; the dark share rises past 50% at generation {up} and falls below it at {dn}.
:::

## Chance vs selection: in small populations the ratio drifts even with no selection {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Chance vs selection
:::

::: html step4-1
:::

This step answers: is a change in the colour ratio always caused by selection? No. Each generation draws N offspring at random from the previous one; even when both colours are equally fit (no selection, 50% each at the start) the ratio fluctuates by chance, which is **genetic drift**; the smaller the population the larger the fluctuation, and one colour can vanish altogether (**fixation**). The variance of one generation's sampling is p(1 − p)/N. The plot shows the 100-generation trajectories of 5 independent populations. The readout uses 40 repeats to find the standard deviation of the share at generation 100 and compares it with theory. {#s4e .explain}

::: html step4-2
s4o: Increase N from 10 to 1000: the paths go from wild to almost flat; the number "fixed" in the statistics falls; press "run 5 new random populations" for a fresh batch and compare.
lLogN: Population size N = 10^x
bNewPops: Run 5 new random populations
:::

::: strings
r4: N = {N}: of these 5 populations {fx} have fixed (0 or 100%) by generation 100; over 40 repeats the standard deviation of the share after 100 generations is {sd}, theory ≈ {th}.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) individuals differ in a heritable way (light and dark); (2) the environment (birds, bark) gives different individuals different survival; (3) survivors breed and the ratio shifts generation by generation, with logit(p) rising by ln(w_dark/w_light) each generation; (4) stronger selection means faster change, and a population lags a changing environment; (5) in small populations chance alone can make the ratio drift even without selection. {#s5e .explain}

::: html step5-2
qq: After soot blackened the bark, why did dark moths become more common?
qo0: Light moths turned themselves dark to hide from birds
qo1: Dark moths were less likely to be eaten, survived and bred more, and passed on their dark colour
qo2: Birds preferred light moths and drove the dark ones back
s5m: This is a teaching model: just two colours, set by a single haploid gene (no dominance) and inherited faithfully, with no migration or mating (step 3 only adds a fixed 0.1% two-way mutation); survival w is a simple linear formula with fixed generations and constant population size; the bark curve in step 3 is a sketch, not measured data; the real peppered-moth studies (Kettlewell and others) have been debated and revised for effects such as bird feeding behaviour and where moths rest; drift uses the standard random-sampling (Wright–Fisher) model.
lk0: DNA replication and translation: mutation is the source of new colour variants
lk1: Genetics & probability: how genes and alleles pass to offspring
lk2: Population ecology: how population size is limited by resources and predation
:::

::: strings
lblGen: generation
lblBark: grey: bark darkness b
lblDark: orange: dark share p
qwhy: The change happens at the population level: no individual changes colour, but different colours have different chances to survive and breed, so the dark share rises generation by generation (step 1).
:::
