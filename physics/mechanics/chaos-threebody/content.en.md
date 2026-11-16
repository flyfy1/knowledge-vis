---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Chaos and the Three-Body Problem · Tiny Differences, Huge Outcomes
tagline: The rules are fully deterministic, yet long-term prediction fails: from a one-line map to Lorenz’s butterfly to three stars chasing each other.
docTitle: Chaos and the Three-Body Problem · Tiny Differences, Huge Outcomes
:::

## When do two almost identical starting points part ways? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Sensitivity
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Sensitive dependence
:::

<b>This step answers: after how many steps does a tiny initial error become a real problem?</b> The logistic map x → r·x(1−x) has a one-line rule. Two orbits start at 0.4 and 0.4 + δ (cyan and orange). For small r they quickly coincide; near r = 4 the gap roughly doubles every step, and the red line marks the first step where the difference exceeds 0.1. Drag r and δ. {#s0e .explain}

::: html step0-2
s0cv: Two logistic-map orbits against step number with a red line at the point they separate
lblR: Parameter r
lblDexp: Initial gap δ = 10^(−k), k =
:::

## How can a single number tell regular from chaotic behaviour? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Lyapunov
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Growth rate and bifurcation
:::

<b>This step answers: by what factor does an error grow per step on average?</b> The Lyapunov exponent is λ = the average of ln|r(1−2x)|. λ &lt; 0: errors shrink and orbits settle on a few points (regular); λ &gt; 0: errors grow exponentially, which is chaos. The top plot shows where orbits settle for each r (a bifurcation diagram) and the bottom plot shows λ(r). The orange vertical line is your r and locates you on both. {#s1e .explain}

::: html step1-2
s1cv: Top: bifurcation diagram of the logistic map; bottom: Lyapunov exponent against r
:::

## Why do three differential equations draw a butterfly? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Lorenz
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The Lorenz attractor
:::

<b>This step answers: can continuous systems be chaotic too?</b> The Lorenz equations dx/dt = σ(y−x), dy/dt = x(ρ−z)−y, dz/dt = xy−βz (σ = 10, β = 8/3) come from a simplified model of convection. For ρ &lt; 1 everything settles to the origin; for 1 &lt; ρ &lt; about 24.74 trajectories spiral into one of two fixed points; at ρ = 28 they never repeat and never stop, hopping unpredictably between the two lobes. Press Play to watch the trajectory drawn step by step in the x–z plane. {#s2e .explain}

::: html step2-2
s2cv: Lorenz trajectory in the x–z plane with colour changing with time
lblRho: Parameter ρ
play: Play
reset: Reset
drawAll: Draw all
:::

::: strings
pause: Pause
lblSplit: split at step {n}
axStep: step n
s0ro: r = {r}, δ = {d}: the two orbits differ by more than 0.1 at step {n}.
s0roNo: r = {r}, δ = {d}: within {N} steps the two orbits never differ by more than 0.1 (the gap is damped or never grows).
axAttr: long-term values
axLyap: Lyapunov exponent λ
kChaos: λ > 0: chaotic
kOrder: λ ≤ 0: regular
s1ro: r = {r}: λ = {l} ({kind}); about {k} distinct long-term values.
regA: ρ < 1: settles at the origin
regB: 1 < ρ < 24.74: spirals into a fixed point
regC: ρ > 24.74: chaotic
s2ro: ρ = {rho} ({reg}); t = {tm}: x = {x}, y = {y}, z = {z}.
axX: x(t)
axSep: log₁₀ separation
axTime: time t
s3ro: δ = {d}: the separation first exceeds 1 at t = {ts}; the formula ln(1/δ)/λ = {pred}.
axPrec: initial precision
axHor: predictable time
s4ro: Precision 10^(−{k}): simulated horizon {h}, formula {pred}; one more digit buys about {g} (theory ln10/λ = {g2}).
legend5: grey: perfect figure-8 · coloured: the three stars
s5ro: ε = {eps}, t = {T}: largest deviation from the perfect orbit {dev}; relative energy error {de}; closest pair distance {mn}.
:::

## If the starting points differ by a hair, how long until the two paths stop resembling each other? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Butterfly effect
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The butterfly effect
:::

<b>This step answers: how long does it take an error to become visible?</b> Two Lorenz trajectories (ρ = 28) start a distance δ apart in x. The top plot is x(t); the bottom plot is the logarithm of their separation. The red line first climbs along a roughly straight line, which is exponential growth at about λ ≈ 0.906 per time unit, until it saturates at the size of the attractor. The dashed white line marks the first time the separation exceeds 1. Drag log₁₀δ. {#s3e .explain}

::: html step3-2
s3cv: Top: x(t) of the two trajectories; bottom: the logarithm of their separation rising then saturating
lblDexp2: log₁₀ δ
:::

## If measurements become ten times more precise, how much longer can we predict? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Prediction limit
:::

::: html step4-1
s4step: "Step 4 · "
s4k: The prediction horizon
:::

<b>This step answers: why is there a wall in long-range weather forecasting?</b> Errors grow like e^{λt}, so the predictable time is about ln(threshold/δ)/λ, proportional only to the logarithm of the precision. Every tenfold gain in precision buys just ln10/λ ≈ 2.5 more time units. The orange line is the horizon found by simulating the Lorenz equations for each precision; the grey line is the formula. Drag the precision to see how much time each extra digit buys. {#s4e .explain}

::: html step4-2
s4cv: Prediction horizon growing roughly linearly with the logarithm of the initial precision
lblPrec: Initial precision 10^(−k), k =
:::

## Can three equal-mass stars pulling on each other settle into a stable orbit? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Three bodies
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · the three-body problem
:::

<b>This step answers: why is the three-body system hard to predict?</b> Under Newtonian gravity three stars have no general closed-form solution. One rare periodic solution is the “figure-8” orbit (period about 6.33 with G = m = 1): all three stars chase each other along the same figure 8. Grey is the perfect figure-8; coloured is the real orbit after nudging star 1’s x coordinate by ε. With tiny ε it follows the 8 for a while and eventually departs; with a bigger ε it flies apart quickly. The readout gives the deviation from the perfect orbit, the energy error and the closest pair distance. {#s5e .explain}

::: html step5-2
s5cv: Trails of three stars (coloured) over the perfect figure-8 orbit (grey)
lblEps: Nudge ε of star 1 (×0.001)
lblTmax: Simulated time
recapTitle: Recap
recap1: Deterministic rules can be chaotic: errors grow like e^{λt}, and when λ > 0 long-term prediction fails.
recap2: The prediction horizon is proportional to the logarithm of the precision: ten times better data buys only a short extra stretch.
recap3: The three-body problem has no general closed form; the stable figure-8 is a rare special case that departs when nudged.
modelTitle: Scope and limits of the model
modelText: Model: the logistic map and the Lorenz equations are minimal examples of chaos, not real weather. Numerical integration (fourth-order Runge–Kutta) has its own error, so for chaotic systems the fine detail of long trajectories is not trustworthy; only statistical features (attractor shape, λ) are. The three-body model is planar with G = m = 1 and starts from the known figure-8 solution.
link0: → Population Growth: the continuous cousin of the logistic model
link1: → Exponent & Log: exponential error growth and log scales
link2: → Control: how feedback damps disturbances
:::

Page complete. {#done .readout .success i18n=text}
