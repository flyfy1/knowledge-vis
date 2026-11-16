---
lang: en
---

::: strings
pageTitle: Magnetic Force · The Force Is Always Sideways to the Velocity
tagline: Start with a charged particle bending in a magnetic field, derive its radius and period, then use them to weigh ions and pick out a speed.
:::

## The force in a magnetic field is always sideways to the velocity {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Sideways force
:::

::: html step0-1
:::

This step answers: which way does a magnetic field push a moving charge? The **Lorentz force** is F = q v × B. Here B points straight out of the screen (the small dots) and the particle moves in the screen plane, so |F| = q v B and F is perpendicular to the velocity v. The dot is a positive charge, the cyan arrow is v, the orange arrow is F, and the dashed arc shows where the force starts to carry it. {#s0e .explain}

::: html step0-2
s0o: Drag the velocity angle and watch the orange arrow stay at 90° to the cyan one; make q negative and the force reverses; set q to 0 and it disappears.
lAng: Velocity angle
lQ: Charge q
lB: Magnetic field B
:::

::: strings
r0: v = ({vx}, {vy}), F = qv×B = ({fx}, {fy}), |F| = {f}; F·v = {dot}, so the magnetic force does no work and the speed does not change.
:::

## A sideways force bends a straight path into a circle {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Circles
:::

::: html step1-1
:::

This step answers: what path does the particle follow, and how big is it? The force is always perpendicular to the velocity, so it changes direction but not speed: uniform circular motion with the Lorentz force as the centripetal force, q v B = m v²/r, hence **r = m v / (q B)** (this page uses m = 1, |q| = 1). Press play and the path builds up over time; "measured radius" is the circumradius of three points on the trail, to compare with the formula. {#s1e .explain}

::: html step1-2
s1o: Play one lap; then double the speed v and replay: by what factor does the radius change? Then double B: what happens now? Compare the formula radius with the measured one.
lV: Speed v
bPlay: Play / Pause
bReset: Reset: clear the trail and go back to the start
:::

::: strings
r1: Formula r = mv/(qB) = {r}; radius measured from three trail points = {rm}; t = {t}, {turns} turns so far.
rNone: trail too short yet
:::

## How long does one lap take? It does not depend on speed {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Period vs speed
:::

::: html step2-1
:::

This step answers: does a faster particle go round faster? The period is T = 2πr/v; substituting r = mv/(qB) gives **T = 2πm/(qB)**: v cancels. Three particles with speeds 0.6, 1.2 and 1.8 (different radii) start together at the top; press play and see whether they get back to the top at the same time. {#s2e .explain}

::: html step2-2
s2o: Play and watch whether the three dots return to the top together; then change B or the mass m: the period changes, yet the three still return together.
lM: Mass m
:::

::: strings
r2: Radii r = {r1} / {r2} / {r3}; period T = 2πm/(qB) = {tp}; t = {t}, {laps} laps done, phase spread between the three = {dphi}°.
:::

## Weigh an ion with a half circle: the landing spot gives the mass {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Weigh an ion
:::

::: html step3-1
:::

This step answers: how can a magnetic field measure an unknown ion's mass? In a mass spectrometer, ions enter a slit at the same speed v = 1, turn through half a circle and land 2r from the slit, with r = mv/(qB). Farther landing means heavier. The three grey paths are known masses 1, 2, 3; orange is the unknown ion, whose mass is recovered from its landing spot: m = qB·x / (2v). {#s3e .explain}

::: html step3-2
s3o: Drag the unknown mass and watch the orange landing point slide along the baseline; change B: every landing point rescales, but the recovered mass does not change.
lMu: Unknown ion mass m
:::

::: strings
r3: Landing x = 2r = {x}; recovered m = qB·x/(2v) = {m} (set value {ms}).
:::

## Add an electric field: only one speed goes straight {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Add an E field
:::

::: html step4-1
:::

This step answers: how can you select particles of one speed? Besides B, add a vertical upward electric field E, so the electric force qE opposes the magnetic force qvB. When they balance the particle goes straight: **v = E / B** (independent of the sign of the charge and of the mass); otherwise it follows a drifting cycloid that curves to one side. Here B = 1 and the particle enters from the left, moving right. {#s4e .explain}

::: html step4-2
s4o: Set the speed v to the E/B shown in the readout and the path straightens; go above or below it and see which way it bends; then change E and watch the selected speed move.
lE: Electric field E
:::

::: strings
r4: Selected speed E/B = {vs}; current v = {v}, {case}; after {len} units of horizontal travel the vertical offset is y = {dy}.
caseOk: forces balance, straight line
caseHigh: magnetic force wins, bends down
caseLow: electric force wins, bends up
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) F = qv×B is perpendicular to v and does no work; (2) so r = mv/(qB); (3) T = 2πm/(qB), independent of v; (4) the landing point 2r reads out the mass; (5) with an added E field, particles with v = E/B go straight. {#s5e .explain}

::: html step5-2
qq: A proton (charge +e, mass m) and an alpha particle (charge +2e, mass about 4m) enter the same magnetic field at the same speed, perpendicular to it. Which circle is bigger?
qo0: The alpha particle, about twice the proton's radius
qo1: They are the same
qo2: The proton's
s5m: This page models a single charged particle in a uniform, constant magnetic field using classical mechanics, ignoring radiation losses and relativity. m = 1 and |q| = 1 are teaching units (kept in steps 3 and 4); in step 4 E and B are uniform; particles do not interact; the animation is a teaching slow-motion, not a real particle speed.
lk0: Electric fields: compare how the electric force qE does work and the magnetic force does not
lk1: Momentum & collisions: force × time = change in momentum, to contrast with a force that only turns the velocity
:::

::: strings
slit: slit
qwhy: r = mv/(qB): the alpha particle's m/q is 4/2 = 2 times the proton's, so its radius is twice as large (check in step 1).
:::
