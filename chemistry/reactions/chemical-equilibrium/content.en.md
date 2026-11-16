---
lang: en
---

::: strings
docTitle: Chemical Equilibrium · Still Moving at Balance
back: ← Knowledge Index
pageTitle: Chemical Equilibrium
tagline: Balance does not mean the reaction stopped: forward and reverse directions run at the same rate, so the headcount looks steady while particles keep moving.
category: Chemistry
stage: Senior high
navLabel: Step navigation
foot: Chemical Equilibrium · Still Moving at Balance
currentFrame: frame
total: total particles
countA: A count
countB: B count
why: Conclusion
dynamic: This is dynamic equilibrium: particles are still converting.
staticGuess: This would be static equilibrium: no conversions.
actual: "Actual: "
trueDynamic: dynamic equilibrium
falseGuess: Your bet was wrong; the event count shows conversions are still happening.
trueGuess: Correct bet: the event count shows conversions are still happening.
resetAll: Reset this step
direction: Direction
noChange: No disturbance yet
settle: At balance
:::

## A steady headcount does not mean nobody moves {#step0 h2=step0t}

::: strings
nav0: 0 Dynamic balance
:::

STEP 0 · DYNAMIC BALANCE {#step0k .step-kicker i18n=text}

Start with a mixture already near balance. The number of B particles barely changes, but A ⇌ B conversion events still happen. The question is simple: if the curve is flat, did the reaction stop? Bet first, then reveal the event counter. {#step0e .explain i18n=text}

::: html step0-1
canvasLabel: A and B particle simulation canvas
:::

Each dot is one particle in a fixed spot; a white ring marks a particle that converted in this frame (its colour flips in place). The event counter is accumulated from the simulation. {#step0note .hint i18n=text}

::: html step0-2
guessedMoving: My guess: still moving
guessedStopped: My guess: stopped
reveal: Reveal
reset: Reset this step
:::

::: strings
guessPrompt: Place your bet: did the reaction stop at balance?
events: conversion events
particleA: A particles
particleB: B particles
rateForward: forward rate
rateReverse: reverse rate
rateUnit: events/frame
balance: balance test
balanced: rates are close; the curve is flat
settling: not flat yet; keep watching
ratio: B share
netDirection: net direction
towardB: net change currently points toward B
towardA: net change currently points toward A
noNet: net change is near zero
:::

## Balance arrives when forward and reverse rates meet {#step1 h2=step1t}

::: strings
nav1: 1 Start from zero
:::

STEP 1 · START FROM ZERO {#step1k .step-kicker i18n=text}

Start with pure A. At first only the forward direction can fire; as B builds up, the reverse direction fires more often. The curve is drawn frame by frame as it plays; both rate readouts are moving averages of measured events over the latest 30 frames, not a pre-drawn curve. Switch to the B-rich start to verify that coming from the other side reaches the same B share. {#step1e .explain i18n=text}

Start from pure A: forward events happen first; as B builds, reverse events catch up; only then do the headcounts flatten. {#step1bridge .hint i18n=text}

::: html step1-1
play: Play
showRates: Show rate curves
chooseInitial: Choose initial state:
initialPureA: pure A
initialMixed: B-rich (1/4 A)
:::

The balance test is equal-ish rates, not equal A and B counts. {#step1hint .hint i18n=text}

::: strings
pause: Pause
hideRates: Hide rate curves
rateOverlay: rate curves
temp: Temperature
:::

## Push it: the system resists, but does not erase the push {#step2 h2=step2t}

::: strings
nav2: 2 Add material
:::

STEP 2 · DISTURBANCE 1: ADD MATERIAL {#step2k .step-kicker i18n=text}

Let the system settle, then inject a batch of A at frame 150. Compared with the same seeded run without the push, extra forward events appear in the frames right after it, the net change points toward B, and the curve settles at a new level. The readout also shows A and B levels before and after. {#step2e .explain i18n=text}

Let the curve flatten first, then add A: forward events briefly lead, reverse events catch up, and the system settles at a new level. {#step2bridge .hint i18n=text}

::: html step2-1
inputA: A particles to add
addA: Add A
:::

“Resist” means the opposing direction strengthens and blunts the external change; it does not mean the composition returns to its old value. {#step2hint .hint i18n=text}

::: strings
added: Added +{n} A particles at frame {f}
initial: Initial state
yes: yes
no: no
convertedNow: converted now
frames0to: frames 0–{f}
lastFrames: mean of last {n} frames
flatSince: flat since frame {f}
pushWindow: In the {w} frames after the push
netEvents: net forward events (f−r)
withoutPush: ; same run without the push:
levels: mean levels (before → after re-settling)
crossMarks: Dashed lines: frame each run covers {p}% of the way
notFaster: catalyst not faster in this run
diffEndpoint: endpoints differ by {d} pp (≥3, not the same)
:::

## Temperature changes the balance point itself {#step3 h2=step3t}

::: strings
nav3: 3 Change temperature
:::

STEP 3 · DISTURBANCE 2: TEMPERATURE {#step3k .step-kicker i18n=text}

This page treats forward A → B as the endothermic direction: warming raises both probabilities, the forward one more, shifting balance toward B; cooling lowers both, the forward one more. The share is a measured mean over the final simulation window. {#step3e .explain i18n=text}

Start at baseline, then warm or cool: compare the final B share to see the balance point move, rather than only the arrival speed changing. {#step3bridge .hint i18n=text}

::: html step3-1
cool: Cool
normal: Baseline
warm: Warm
:::

Temperature is qualitative here: both probabilities change with different amplitudes; this is not a quantitative Arrhenius calculation. {#step3hint .hint i18n=text}

::: strings
heatSensitive: this page treats forward as endothermic
equilibriumB: B share at balance
compare: Comparison
catalyst: Catalyst
noCatalyst: No catalyst
withCatalyst: With catalyst
timeToBalance: frames to cover {p}% of the way
endpoint: endpoint B share
sameEndpoint: same endpoint (difference {d} pp, <3)
faster: faster
:::

## A catalyst changes speed, not the endpoint {#step4 h2=step4t}

::: strings
nav4: 4 Catalyst
:::

STEP 4 · CATALYST {#step4k .step-kicker i18n=text}

Run two copies from the same initial state and the same random seed. The catalyst multiplies forward and reverse probabilities by the same factor. The chart overlays both B curves; compare the frame each run covers 80% of the way, and the final B share. {#step4e .explain i18n=text}

Start without a catalyst, then turn it on: compare frames to balance and check whether the final B share stays the same. {#step4bridge .hint i18n=text}

::: html step4-1
:::

A catalyst changes the time to balance, not the thermodynamic balance position. {#step4hint .hint i18n=text}

## Explain “equilibrium” to someone else {#step5 h2=step5t}

::: strings
nav5: 5 Wrap-up
:::

STEP 5 · WRAP-UP {#step5k .step-kicker i18n=text}

Dynamic equilibrium means both directions are still happening, but their average rates per unit time match, so the macroscopic headcount stops changing visibly. Add material and the balance shifts; temperature changes the balance point; a catalyst only gets you there sooner. {#step5e .explain i18n=text}

Four moves, four ideas: equal rates explain the flat line; adding material shifts balance; temperature changes the endpoint; a catalyst changes only the speed. {#step5bridge .hint i18n=text}

::: html step5-1
modelTitle: Model boundary
modelBody: This page uses finite particles, discrete frames, and probabilistic A ⇌ B events to build intuition. The temperature effect is qualitative, not an Arrhenius calculation; particle count is not a real concentration scale.
ratesLink: → Back to reaction-rates: where rates come from
massLink: → Continue to mass-conservation: the conservation ledger
:::
