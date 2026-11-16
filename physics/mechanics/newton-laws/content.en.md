---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Newton’s Laws of Motion · F = ma, Tuned by Hand
tagline: Push a box on ice, on a rough floor and on a ramp: the force arrows and the acceleration stay in step, so F = ma is something you tune, not memorise.
:::

## Push harder and the speed grows faster {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Push and accelerate
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Force changes velocity
:::

This step asks: how does the box’s motion change when the push grows? A **force** is a push or pull, measured in **newtons (N)**; **acceleration a** is how much the velocity changes each second, in m/s² (see the [[velocity-vt#step1|velocity–time graph]]). The box has a fixed mass of 2 kg on frictionless ice and is pushed right for 3 seconds. The picture “snaps” a ghost every 0.5 s. **What to do:** drag the push F and keep everything else fixed; watch the gaps between neighbouring ghosts. Widening gaps mean the speed keeps rising, and a bigger F widens them faster. The slider changes a model input (the force), not just the display. {#s0e .explain}

::: html step0-2
s0cv: Stroboscopic picture: positions of a box under a constant push, the gaps widening
replay: ▶ Replay 3 s
forceL: Push force F (N)
:::

## Mass is resistance to changing motion {#step1 h2=s1t pre=1}

::: strings
nav1: 1 What mass does
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Same push, different mass
:::

This step asks: with the same push, what is different about a heavy box and a light one? **Mass m** (kg) measures how hard it is to change an object’s motion. **What to do:** fix the push F, change only m, and watch how fast the gaps widen; then double m and check that a halves (the readout shows the predicted half for comparison). Valid when: no friction, constant mass, force along the line of motion. {#s1e .explain}

::: html step1-2
s1cv: Stroboscopic picture: boxes of different mass under the same push; heavier ones change position more slowly
massL: Mass m (kg)
:::

::: strings
s1ro: F = {F} N, m = {m} kg → a = {a} m/s²; doubling the mass would give a = {dbl} m/s².
:::

## Friction eats part of the push; what is left accelerates the box {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Friction and net force
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Only the net force counts
:::

This step asks: with a rough floor, does the whole push go into accelerating? **Friction** resists sliding and cannot exceed μmg (μ is the friction coefficient; this page uses one μ for both static and sliding friction). The **net force** is the vector sum of all forces, and it alone sets the acceleration: a = net force / m. The box is 3 kg. **What to do:** fix μ and raise F slowly. While F ≤ μmg the box does not move (friction equals the push); only above that does a net force appear and the ghosts spread out. Red is friction, orange the push. {#s2e .explain}

::: html step2-2
s2cv: Stroboscopic picture with push (orange) and friction (red) arrows; the net force decides whether the box accelerates
muL: Friction coefficient μ
:::

::: strings
s2ro: F = {F} N, μ = {mu} (max friction {fmax} N) → friction {fr} N, net force {net} N, a = {a} m/s² ({state}).
stMove: box accelerates
stStuck: box stays put
push: push F
fric: friction f
posAxis: position x (m)
tTick: {t} s
clock: time t = {t} s
slopeNote: slope {th}°
s3ro: θ = {th}° → along-slope pull g·sinθ = {along} m/s², friction slows by {fr} m/s² → a = {a} m/s² ({state}).
stSlide: box slides
stHold: box holds still
:::

## Gravity splits in two: one part pulls down the slope, one presses into it {#step3 h2=s3t pre=1}

::: strings
nav3: 3 The ramp
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Forces on a ramp
:::

This step asks: how much of gravity actually drives the box down the ramp? Gravity mg points straight down and splits into mg·sinθ along the slope and mg·cosθ pressing into it; friction is at most μ·mg·cosθ. So along the slope a = g(sinθ − μcosθ): the mass cancels, so a does not depend on m (g = 9.8 m/s²). **What to do:** fix μ and raise the angle θ — the green along-slope arrow grows and the ghosts slide faster. Fix θ and raise μ — the red friction arrow grows until the box sticks. {#s3e .explain}

::: html step3-2
s3cv: Ramp sketch: gravity (violet), along-slope part (green), friction (red) and sliding ghosts
thetaL: Slope angle θ (°)
:::

## When you push it, it pushes you back just as hard {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Action and reaction
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Action and reaction
:::

This step asks: when two objects push on each other, what sets each one’s acceleration? Newton’s third law: the force A exerts on B and the force B exerts on A are **equal in size, opposite in direction, and act on different objects**. Two frictionless carts are pushed apart by a spring for 0.5 s, then coast. Both feel the same force, but a = F/m, so the lighter cart accelerates more. **What to do:** fix F, change either mass, and see which side runs farther. The readout shows mass × speed is equal and opposite on both sides ([[momentum-collision#step1|momentum]] is the topic of the collision page). {#s4e .explain}

::: html step4-2
s4cv: Stroboscopic picture: two carts pushed apart by a spring; same force, different accelerations
replay4: ▶ Replay 2 s
pairL: Spring force F (N)
massA: Left cart mass (kg)
massB: Right cart mass (kg)
:::

::: strings
s0ro: F = {F} N, m = {m} kg → a = F/m = {a} m/s²; speed after 3 s is {v} m/s, distance so far {x} m.
pairNote: Pushing phase: each cart feels {F} N, in opposite directions
s4ro: F = {F} N: left cart {m1} kg → a = {a1} m/s², v = {v1} m/s; right cart {m2} kg → a = {a2} m/s², v = {v2} m/s. Ratio a₁/a₂ = {ratio}, inverse mass ratio m₂/m₁ = {inv}; total momentum {p} (kg·m/s).
:::

## Why does a bathroom scale read more or less in a lift? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Scale in a lift
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: F = ma explains “feeling heavy”
:::

This step asks: what does the scale actually read? It reads the support force N it exerts on you. If the lift accelerates upward at a (negative for downward), you feel gravity mg down and N up, so the net force is N − mg = ma and N = m(g + a). **What to do:** fix your mass and drag the lift’s acceleration: upward → reading above the weight line; downward → below it; a = −9.8 m/s² (free fall) → reading 0. The slider changes the lift’s motion, not your mass. {#s5e .explain}

::: html step5-2
s5cv: Lift and scale: acceleration arrow and a reading bar against the weight line
massP: Body mass m (kg)
liftA: Lift acceleration a (m/s², up positive)
recapTitle: Recap
recap1: A force is a push or pull (N); the net force sets the acceleration, a = F_net/m: double the force, double a; double the mass, halve a.
recap2: Friction and gravity components eat part of the push; only the remaining net force accelerates. On a ramp a = g(sinθ − μcosθ).
recap3: Forces come in pairs: equal, opposite, on two different objects. A scale reads N = m(g+a).
modelTitle: Scope and limits of this model
modelText: Scope: point-mass objects (no shape or spin), constant mass, one μ for static and sliding friction, g fixed at 9.8 m/s², speeds far below light. Real friction varies with speed and surface, and air drag is ignored here. The 0.5 s spacing and replay speed are for teaching; every number comes from the formulas.
link1: → Velocity–time graphs: acceleration is the slope of the line
link2: → Momentum and collisions: what action and reaction do in a crash
link3: → Derivatives: acceleration is the derivative of velocity
:::

Page complete. {#done .readout .success i18n=text}

::: strings
liftAcc: a = {a} m/s²
wLine: weight mg = {W} N
nBar: scale N = {N} N
feelHeavy: feels heavier
feelLight: feels lighter
feelSame: reading equals weight
feelNone: weightless (reading 0)
s5ro: m = {m} kg, lift acceleration {a} m/s² → scale reading N = m(g+a) = {N} N, like {kg} kg ({feel}).
docTitle: Newton’s Laws of Motion · F = ma, Tuned by Hand
:::
