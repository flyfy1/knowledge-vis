---
lang: en
---

::: strings
docTitle: Reaction Rates · Counting Successful Collisions
back: ← Knowledge Index
pageTitle: Reaction Rates · Counting Successful Collisions
tagline: Reaction speed comes from successful collisions: collide more often, and make a larger share energetic enough.
foot: Reaction Rates · One collision at a time
navLabel: Step navigation
:::

## A collision does not always make a reaction {#step0 h2=s0t}

::: strings
nav0: 0 Successful collisions
:::

STEP 0 · SUCCESSFUL COLLISIONS {#s0k .step-kicker i18n=text}

Reactant particles move inside the box. When A meets B, it counts as a **successful collision** only if their relative speed clears the activation-energy threshold; a low-energy meeting is still a collision, but it does not react. Count successful collisions before talking about reaction speed. {#s0e .explain}

::: html step0-1
canvasLabel: Particle collision simulation canvas
:::

✓ successful (that A and B are used up and a green P is made)　✗ too little energy; markers linger about 0.5 s, then fade {#s0note .legend i18n=text}

::: html step0-2
pause: Pause
reset: Reset this step
:::

::: strings
run: Run
s0ro: Last {sec} s (threshold {v}): {collisions} collisions, {successes} successful; success share {rate}%; {products} products so far.
:::

## More particles, more collisions {#step1 h2=s1t}

::: strings
nav1: 1 Concentration
:::

STEP 1 · CONCENTRATION {#s1k .step-kicker i18n=text}

Add A and B particles to the same box and meetings become more frequent. Move the particle-count slider and watch successful collisions per second and the product trace; every point on the trace comes from simulation counts. {#s1e .explain}

::: html step1-1
traceLabel: Cumulative product trace
countLab: Total particles
:::

::: strings
countVal: {n} particles
s1ro: {n} particles · {rate} successful collisions/s · {products} products so far.
s1compare: Comparison (mean of {seeds} seeds × {sec} s): particles {base} → {n}, successful rate {a} → {b}/s.
:::

## Move faster, clear the threshold more often {#step2 h2=s2t}

::: strings
nav2: 2 Temperature
:::

STEP 2 · TEMPERATURE {#s2k .step-kicker i18n=text}

Heating does two things at once: particles move faster, so they meet more often; and a larger share of meetings clears the activation-energy threshold. "Relative temperature" is this page's speed knob, not a kelvin temperature. The threshold in this step is 90, so only a minority of collisions qualify (the high-energy tail of the speed distribution) — that is exactly when heating beats adding the same relative amount of particles; with a very low threshold most collisions already qualify and the second effect is weak. {#s2e .explain}

::: html step2-1
tempLab: Relative temperature
:::

::: strings
tempVal: {t}%
s2ro: Temperature {t}% · mean speed {speed} · {coll} collisions/s · success share {ready}% (last 8 s) · {rate} successful collisions/s.
s2compare: Same +50% comparison (threshold {thr}, mean of {seeds} seeds × {sec} s): particles 32→48 (A and B each +50%) raise the success rate by {conc}%; relative temperature 100%→150% (mean speed ×{sp}) raises it by {temp}% — collision frequency +{cf}%, success share {sh0}% → {sh1}%. Verdict: heating is {verdict}.
:::

## Chunk or powder: contact area sets the opportunities {#step3 h2=s3t}

::: strings
nav3: 3 Surface area
:::

STEP 3 · SURFACE AREA {#s3k .step-kicker i18n=text}

Same amount of solid (36 B sites). As one chunk, only the outer ring of sites touches the solution; the inner ones are buried — A particles bounce off the solid and cannot reach them. Ground into powder (9 small grains), every site is exposed. Bright outlined orange = contactable (surface) site, dark brown = buried, dashed box = contact zone. Solid B does not move, so success depends only on how fast A hits it; this step therefore uses its own threshold of 40. {#s3e .explain}

::: html step3-1
surfaceLab: Solid form
block: Chunk
powder: Powder
:::

::: strings
s3ro: {shape} · contactable sites {active}/{total} · threshold {v} · {rate} successful collisions/s.
s3compare: Same {total} sites: the contactable list grows from {a} to {b}; the successful rate rises from {r1} to {r2}/s (mean of {seeds} seeds × {sec} s).
:::

## Lower the gate {#step4 h2=s4t}

::: strings
nav4: 4 Catalyst
:::

STEP 4 · CATALYST {#s4k .step-kicker i18n=text}

A catalyst lowers the activation-energy threshold, so more collisions at the existing speeds qualify; it does not suddenly speed up the particles. Move the threshold and watch the success share and mean speed: success rises while the speed distribution stays put. The reaction-coordinate sketch below draws "clearing the gate" as an energy peak: particle motion stays the same while the peak gets lower. {#s4e .explain}

Hold particle motion steady and lower only the threshold: the successful share rises while mean speed stays about the same. Then toggle the catalyst and compare the gate change under the same speed distribution. {#s4bridge .hint i18n=text}

::: html step4-1
energyLabel: Activation-energy reaction-coordinate chart
:::

Pink line: the current uncatalysed gate; green dashed line: the lower catalysed gate. The peak is a sketch; the collision simulation above still supplies the measured rate. {#energyNote .energy-note i18n=text}

::: html step4-2
thresholdLab: Activation threshold
catOn: Add catalyst
:::

::: strings
energyAxisX: reaction coordinate
energyAxisY: relative energy
energyUncat: uncatalysed gate
energyCat: catalysed gate
energyReactants: reactants
energyProducts: products
thresholdVal: {v}
catOff: Remove catalyst
s4ro: Threshold {v} · mean speed {speed} · success share {ready}% (last 8 s) · {rate} successful collisions/s.
s4compare: Add catalyst: threshold {a} → {b} (mean of {seeds} seeds): successful rate rises from {r1} to {r2}/s; mean speed {speed} → {speed2}, unchanged.
:::

## Four controls change two things {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

STEP 5 · WRAP-UP {#s5k .step-kicker i18n=text}

Concentration↑ makes collisions more frequent; temperature↑ makes them more frequent and raises the above-threshold share; surface area↑ expands the contactable list; catalyst↓ lowers the activation gate. They all increase successful collisions, but by different routes. {#s5e .explain}

::: html step5-1
modelTitle: Model assumptions and mismatch
modelBody: This page simplifies particles as moving in straight lines at constant speed with elastic rebounds off the walls; particles pass through each other, and each meeting is counted once, when contact starts. An A–B meeting is successful only when relative speed exceeds the threshold: that A and B are used up and a product particle P appears where they met (it leaves the picture after about 4 s; the count is kept). To keep concentration constant, fresh A and B with the same speeds are fed in at the same moment (like a continuously fed reactor; solid sites are refilled in place), so the rate here never slows down — in a real closed vessel reactants run out and the rate falls over time. "Relative temperature" is only a speed-scale knob, not kelvin. Real systems have Maxwell–Boltzmann speed distributions, and temperature and rate constant are related by the Arrhenius equation; this discrete threshold model is only a qualitative picture. The catalyst here lowers the threshold without changing the particle-speed distribution.
linkEq: → Chemical Equilibrium, Step 0: equilibrium means equal forward and reverse rates
linkParticles: → Particles & States: the heat-motion foundation
:::

::: strings
seconds: s
collisions: collisions
products: products
success: successful
failed: failed
avgSpeed: mean speed
ready: above threshold
A: A
B: B
P: P
canvasLegend: ● A (cyan) / B (orange) reactants　◆ P products (green)
statusRunning: running
statusPaused: paused
computing: Computing comparison…
surfaceLegend: ■ bright orange: contactable site　■ dark brown: buried　● A in solution　◆ P product
notSteeper: not steeper
steeper: steeper
traceGhost: dashed: before, {n} particles
traceNow: solid: now, {n} particles
traceY: products made
traceX: time (last 20 s)
:::
