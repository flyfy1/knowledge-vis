---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: ODE Phase Portraits · Predators and Prey in a Loop
tagline: Rabbits and foxes rise and fall together: time curves show the story, the phase plane shows the whole picture, and each trajectory is a fate.
:::

## More prey feeds more predators, and more predators cut the prey {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Rise and fall
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Two populations
:::

This step asks: how do two populations that hold each other in check change over time? Let the prey (cyan) number x and the predators (orange) number y. The **Lotka–Volterra model**: prey grow in proportion to themselves, a·x, and are eaten at rate b·x·y; predators grow by eating, d·x·y, and die in proportion to themselves, c·y. Here x′ and y′ are the rates of change per unit time (see [[derivative#step3|derivatives]]). We use a = 1, b = 0.5, c = 0.75, d = 0.25. **What to do:** change the two starting numbers and press Replay: both curves rise and fall in cycles, with each predator peak trailing the prey peak. The sliders change the initial counts, not the rules. {#s0e .explain}

::: html step0-2
s0cv: Time curves: prey (cyan) and predators (orange) over time
replay: ▶ Replay 7 s
preyStart: Prey start x₀
predStart: Predator start y₀
:::

::: strings
timeAxis: time t
popAxis: population
legPrey: prey x
legPred: predators y
s0ro: Start (x₀, y₀) = ({x0}, {y0}); at t = {tt}: prey x = {x}, predators y = {y}.
:::

## Hide time: prey across, predators up {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Phase plane
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: The phase plane
:::

This step asks: how can one picture show the whole story at a glance? The **phase plane** puts prey on the horizontal axis and predators on the vertical axis; each point is a “state”, and as the rules move the state it leaves a path called a **trajectory**. The grey arrows show the “next direction” at each place (the **direction field**); the green dot is the equilibrium of the next step. **What to do:** change the start and replay: the trajectory closes into a loop around the green dot — the same cycles as before, drawn differently. The farther from green, the bigger the loop; two different loops never touch. {#s1e .explain}

::: html step1-2
s1cv: Phase plane: grey arrows are the direction field, orange is the trajectory from the start
:::

::: strings
preyAxis: prey x
predAxis: predators y
eqLabel: equilibrium
s1ro: Start ({x0}, {y0}): prey range {xmin}–{xmax}, predators {ymin}–{ymax} (values over 30 time units).
:::

## Where do prey stand still? Where do predators? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Nullclines and equilibrium
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Nullclines and equilibrium
:::

This step asks: why does everything circle that one point? A **nullcline** is where one rate is exactly 0: prey stand still on y = a/b = 2 (cyan dashes) or x = 0; predators stand still on x = c/d = 3 (orange dashes) or y = 0. They cross at the **equilibrium** (3, 2), where neither population changes. The nullclines cut the plane into four regions, each with a fixed combination of “prey up/down, predators up/down”, which is why the field circulates. **What to do:** drag the probe point; the white arrow is the (x′, y′) direction there (its length only hints at size). Crossing a dashed line flips the sign of the matching component. {#s2e .explain}

::: html step2-2
s2cv: Nullclines (cyan and orange dashes) and the direction of change at the probe point
probeX: Probe x
probeY: Probe y
:::

::: strings
ncPrey: x′ = 0: y = {v}
ncPred: y′ = 0: x = {v}
rises: rising
falls: falling
steady: steady
s2ro: At ({x}, {y}): x′ = {dx} (prey {px}), y′ = {dy} (predators {py}).
:::

## Why are the loops closed? Something stays constant {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Conserved quantity
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: A conserved quantity
:::

This step asks: what stays unchanged along a trajectory in this model? The quantity H = d·x − c·ln x + b·y − a·ln y is constant along true solutions, so a trajectory can only stay on one contour of H, which makes it close into a loop. The lower plot shows H against time. With **RK4** (four slope samples per step, accurate) it is almost flat; with the simplest **Euler method** (one slope per step) H drifts and the trajectory spirals outward — that is numerical error, not ecology. **What to do:** switch method and increase the time step Δt to see how large the drift gets. {#s3e .explain}

::: html step3-2
s3cv: Top: numerical trajectory in the phase plane; bottom: drift of H from its starting value
mRk4: RK4 (accurate)
mEuler: Euler (crude)
dtL: Time step Δt
:::

::: strings
hAxis: change in H
blown: (Euler blew up)
s3ro: {m}, Δt = {dt}: start H = {h0}, end H = {h1}, change {dr}. {bad}
:::

## Change one parameter and the equilibrium moves house {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Parameters move it
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Parameters
:::

This step asks: which numbers in the rules decide where the equilibrium sits? It is (c/d, a/b): the prey level depends only on the predators’ death rate c and conversion rate d, and the predator level only on the prey’s growth rate a and eating rate b. This is a little counter-intuitive: raising the prey growth rate a raises the **predator** level. **What to do:** drag a and c and see where the green point goes; the three coloured loops (started directly below the equilibrium) always circle it. {#s4e .explain}

::: html step4-2
s4cv: Three trajectories with different starts, circling the equilibrium (green)
aL: Prey growth rate a
cL: Predator death rate c
:::

::: strings
s4ro: a = {a}, c = {c} → equilibrium (c/d, a/b) = ({ex}, {ey}) (b = 0.5, d = 0.25 fixed).
:::

## Add crowding for the prey and loops become spirals {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Add crowding
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: A bit more realistic
:::

This step asks: how does the story change if prey also slow down when crowded? Replace the prey growth with a·x·(1 − ε·x); a larger ε means stronger crowding (carrying capacity K = 1/ε, see [[logistic-growth#step2|carrying capacity K]]). **What to do:** ε = 0 is the closed loop from before; for ε &gt; 0 the trajectory no longer returns to its loop but spirals into the equilibrium (3, 2(1 − 3ε)), faster for larger ε. The start is fixed at (6, 1); the readout gives distances from the equilibrium. The slider changes the model’s rules, not just the display. {#s5e .explain}

::: html step5-2
s5cv: Phase plane with a crowding term: the trajectory spirals into the equilibrium
eL: Crowding strength ε
recapTitle: Recap
recap1: Lotka–Volterra: x′ = a·x − b·x·y, y′ = −c·y + d·x·y; equilibrium (c/d, a/b); each trajectory in the phase plane is a fate, and bigger loops mean bigger swings.
recap2: The time curves and the phase plane are two drawings of the same solution; H = d·x − c·ln x + b·y − a·ln y is conserved, so loops close; Euler’s method makes H drift.
recap3: Add crowding and loops become spirals into the equilibrium: change the rules and the portrait changes.
modelTitle: Scope and limits of this model
modelText: Scope: two populations, continuous counts, fixed rules, no randomness, no migration. Real predators can die out if numbers get very low (here populations can shrink toward zero and recover), prey have refuges, and environments change. Integration uses RK4 with step 0.01; step 3’s Euler demo uses a deliberately coarse step, so what you see is numerical error, not ecology.
link1: → Population growth: how the carrying capacity K bends the curve
link2: → Eigenvalues: flatten the portrait near an equilibrium into a linear problem
link3: → Derivatives: x′ is just the rate of change of the count
:::

Page complete. {#done .readout .success i18n=text}

::: strings
inf: ∞
kSpiral: spirals in
kLoop: closed loop (does not converge)
s5ro: ε = {e} (K = {k}): equilibrium ({ex}, {ey}); the start is {d0} from it, after 60 time units the distance is {d1} ({kind}).
docTitle: ODE Phase Portraits · Predators and Prey in a Loop
:::
