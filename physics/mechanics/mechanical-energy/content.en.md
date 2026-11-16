---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger
tagline: Kinetic and gravitational potential energy trade off while the total stays fixed; add friction and the missing mechanical energy shows up as heat, so the ledger still balances.
docTitle: Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger
:::

## As a ball falls from a height, where does its energy go? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Trade-off
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Kinetic and potential energy trade off
:::

<b>This step answers: how do potential and kinetic energy change during a fall?</b> A 1 kg ball falls freely from height h₀. Gravitational potential energy is E<sub>p</sub> = mgh (g = 9.8 m/s²) and kinetic energy is E<sub>k</sub> = ½mv². With no air resistance, whatever E<sub>p</sub> loses E<sub>k</sub> gains, and the sum E<sub>p</sub> + E<sub>k</sub> always equals the starting mgh₀. At the ground the speed is v = √(2gh₀), independent of the mass. Drag the progress of the fall and the starting height. {#s0e .explain}

::: html step0-2
s0cv: The ball at different heights with three bars for potential, kinetic and total energy
lblDrop: Starting height h₀
lblProgress: Progress of the fall (0 = start, 10 = ground)
:::

## On a smooth track, can the cart climb higher than where it started? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The track
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Energy on a smooth track
:::

<b>This step answers: what does conservation of mechanical energy say about where the cart can go?</b> The cart starts from rest at height h₀. Without friction E<sub>p</sub> + E<sub>k</sub> is constant, so the speed anywhere is set by the height difference: v = √(2g(h₀ − h)). Where the track is higher than h₀ the kinetic energy would be negative, so the cart cannot get there (red zones). Drag the cart’s position and the starting height and see the two bars trade off under the dashed line of the total energy. {#s1e .explain}

::: html step1-2
s1cv: A roller-coaster track with the starting-height line, the cart and two energy bars; red marks unreachable regions
lblStartHeight: Starting height h₀
lblPos: Cart position x
:::

## With friction, where does the mechanical energy go? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Friction
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The ledger with friction
:::

<b>This step answers: how does friction change the energy ledger?</b> Sliding friction does work that turns mechanical energy into internal energy (heat). The cart rolls back and forth, each time reaching a lower peak, until it rests in the valley. The red bar Q is the heat produced so far, and E<sub>p</sub> + E<sub>k</sub> + Q always equals the starting energy: nothing disappears, it is only transferred. Friction here is μ × the normal force; drag μ to see how fast the cart stops. Press Play. {#s2e .explain}

::: html step2-2
s2cv: The cart sliding back and forth on the track with bars for potential, kinetic and heat
lblMu: Friction coefficient μ
play: Play
reset: Reset
:::

::: strings
pause: Pause
:::

## From how high must the cart start to get safely round a vertical loop? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Loop
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Going round a vertical loop
:::

<b>This step answers: how do you find the minimum start height for a loop?</b> At the top of the loop the cart needs enough speed for the track still to press on it: if gravity alone (mg) provides more centripetal force than needed it falls off, so the condition is v² ≥ gR. Energy conservation mgh₀ = mg·2R + ½mv² then gives h₀ ≥ 2.5R. The bar shows the track’s support force (in units of mg); a negative value means the cart leaves the track. Drag the loop radius, the starting height and the angle of the cart on the loop. {#s3e .explain}

::: html step3-2
s3cv: A loop with the cart position, the starting-height line and the minimum-height line, and a bar for the support force
lblRadius: Loop radius R
lblAngle: Cart angle on the loop (from the bottom)
:::

## How high can a compressed spring throw a ball? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Spring launch
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Elastic potential energy
:::

<b>This step answers: how does elastic energy turn into height?</b> A spring compressed by x stores elastic potential energy E = ½kx² (k is the spring constant). On release it all becomes the ball’s kinetic energy ½mv² and, at the top, all becomes gravitational energy mgh, so h = kx²/(2mg) and the launch speed is v = x√(k/m). The three bars have equal height: that is the energy ledger. Drag the spring constant, the mass and the compression. {#s4e .explain}

::: html step4-2
s4cv: A compressed spring, the ball and its rise, with bars for elastic, kinetic and gravitational energy
lblK: Spring constant k
lblMass: Ball mass m
lblCompress: Compression x
:::

::: strings
lblCompressTag: compressed {x} m
:::

## Why does doubling the speed make the braking distance four times longer? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Braking
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · braking distance
:::

<b>This step answers: an everyday use of the energy ledger.</b> When a car brakes, friction μmg does work over a distance d and turns all of the kinetic energy ½mv² into heat: ½mv² = μmg·d, so d = v²/(2μg). The mass cancels and the distance grows with the square of the speed: double the speed, four times the distance. The slipperier the road (the smaller μ), the longer it is. Pick a dry, wet or icy road and drag the speed to see the white curve climb. {#s5e .explain}

::: html step5-2
s5cv: Braking distance growing with the square of the speed; thin lines for dry, wet and icy roads, the thick line for the chosen one
lblCarSpeed: Car speed
lblMuRoad: Friction coefficient μ (×0.01)
roadDry: Dry road μ = 0.8
roadWet: Wet road μ = 0.4
roadIce: Icy road μ = 0.1
recapTitle: Recap
recap1: Without friction E<sub>p</sub> + E<sub>k</sub> is conserved: each drop in height becomes the same gain in kinetic energy, and speed follows from the height difference, v = √(2gΔh).
recap2: With friction the mechanical energy shrinks and the difference becomes heat; E<sub>p</sub> + E<sub>k</sub> + Q is still conserved.
recap3: The same ledger gives the minimum loop height 2.5R, the rise of a spring launch kx²/(2mg) and the braking distance v²/(2μg).
modelTitle: Scope and limits of the model
modelText: Model: a point mass, 1 kg unless stated, g = 9.8 m/s², no air resistance; friction is Coulomb friction with a constant coefficient; the cart is assumed to hug the loop and rolling is ignored. A real roller coaster also involves the rotational energy of the wheels, air drag and track deformation; the numbers illustrate the principle and are not a basis for safety design.
link0: → Levers & Pulleys: the work ledger, saving force costs distance
link1: → Momentum & Collisions: another conservation ledger
link2: → Velocity & v–t Graphs: why a downhill run keeps speeding up
:::

Page complete. {#done .readout .success i18n=text}

::: strings
bEp: Ep
bEk: Ek
bTot: total
bQ: heat
bElastic: elastic
bKin: kinetic
bEpPeak: potential at top
lblHeight: height {y} m
lblStartH: start height {h} m
lblUnreach: unreachable
s0ro: h₀ = {h0} m, now at {y} m: Eₚ = mgh = {Ep} J, Eₖ = {Ek} J, total {tot} J (= mgh₀); speed {v} m/s, ground speed √(2gh₀) = {vg} m/s. (mass 1 kg)
s1ro: Position x = {x} (height {hh} m): speed {v} m/s, Eₚ = {Ep} J, Eₖ = {Ek} J, total {tot} J; the highest point reachable is {hmax} m. (mass 1 kg)
s2ro: μ = {mu}, t = {t} s: Eₚ = {Ep} J, Eₖ = {Ek} J, heat Q = {Q} J; the three add up to {tot} J against the starting energy {E0} J. (mass 1 kg)
lblMinH: minimum start height 2.5R = {h} m
lblNormal: support force N/mg
vLoopOk: gets safely round the whole loop
vLoopFail: leaves the track somewhere
s3ro: R = {R} m, h₀ = {h0} m, angle {phi}°: speed {v} m/s, support force N = {N} mg; the minimum start height 2.5R = {hmin} m: {verdict}.
s3roNo: R = {R} m, h₀ = {h0} m: the cart cannot even reach this angle (the kinetic energy would be negative); getting round the whole loop needs at least 2.5R = {hmin} m.
lblPeak: rises {h} m
s4ro: k = {k} N/m, m = {m} kg, compression {x} m: elastic energy ½kx² = {E} J; launch speed x√(k/m) = {v} m/s; rise h = kx²/(2mg) = {h} m.
axSpeed: speed (km/h)
axDist: braking distance (m)
lblCurves: thin lines: dry / wet / icy
s5ro: {v} km/h, μ = {mu}: braking distance d = v²/(2μg) = {d} m; about {ek} kJ of kinetic energy of a 1000 kg car turns into heat; at double the speed, {v2} km/h, the distance is {d2} m.
:::
