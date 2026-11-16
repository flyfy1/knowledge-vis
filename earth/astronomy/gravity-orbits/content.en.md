---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Gravity and Orbits · Throw It Sideways: Fall, Circle or Escape
tagline: An inverse-square pull plus some sideways speed: the path turns from a crash into an ellipse, a circle, then an escape; Kepler’s three laws emerge from the simulation.
docTitle: Gravity and Orbits · Throw It Sideways: Fall, Circle or Escape
:::

## How quickly does gravity (the acceleration of free fall) weaken as you move away from Earth? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Inverse square
:::

::: html step0-1
s0step: "Step 0 · "
s0k: The pull weakens with distance
:::

<b>This step answers: how does gravity depend on distance?</b> Gravitation F = GMm/r² gives an acceleration g(r) = GM/r²: double the distance and the pull is a quarter. In units of the Earth’s radius R⊕, at the surface (r = 1) g ≈ 9.81 m/s², and at 2 R⊕ from the centre only about 2.45 m/s². Drag the distance and watch the dot on the curve and the length of the arrow on the right change together. {#s0e .explain}

::: html step0-2
s0cv: Gravitational acceleration falling with distance from the Earth’s centre, with the Earth and the pulled ball on the right
lblDist: Distance from Earth’s centre r
:::

## Throw from the same height with different sideways speeds: what path results? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Throw sideways
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Launching sideways
:::

<b>This step answers: how does the launch speed decide the orbit?</b> Take units with GM = 1 and launch tangentially at r = 1. Below the circular speed 1: an ellipse (or a crash into the central body if too slow); exactly 1: a circle; between 1 and √2 ≈ 1.414: a more elongated ellipse; at the escape speed √2: a parabola that never returns; faster: a hyperbola. The path is computed by step-by-step integration (velocity Verlet). Press Play or Draw all. {#s1e .explain}

::: html step1-2
s1cv: The central body and the orbit starting from the launch point on the right
lblSpeed: Launch speed v (multiples of the circular speed)
play: Play
reset: Reset
drawAll: Draw all
:::

::: strings
pause: Pause
:::

## Why does an orbit only swing between two radii, and where does the escape speed come from? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Energy
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The energy ledger and escape speed
:::

<b>This step answers: why are there a nearest and farthest point, and what is the condition for escape?</b> The total energy E = ½v² − 1/r (per unit mass) is conserved. With angular momentum conserved as well, the radial motion behaves like a ball rolling in the “effective potential” V<sub>eff</sub>(r) = L²/(2r²) − 1/r: the points where the energy line (cyan) meets the curve (orange) are the nearest and farthest points (green dots). E &lt; 0 is bound; E = 0 (v = √2) is the threshold of escape; E &gt; 0 meets the curve once and flies off for good. Drag the launch speed. {#s2e .explain}

::: html step2-2
s2cv: The effective-potential curve, the horizontal energy line and their intersections (nearest and farthest points)
:::

## Why does a planet move faster when it is closer to the centre? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Equal areas
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Kepler’s second law
:::

<b>This step answers: what do equal times sweep out?</b> The orbit is split into 8 equal time intervals, and each sweeps a wedge between the body and the centre (coloured alternately). Wedges near the centre are wide and short, those far away narrow and long, yet their areas are equal: the geometric form of conservation of angular momentum (Kepler’s second law). The readout gives the areas of three of the wedges (found by numerical integration), which should equal ½·L·T/8. Drag the launch speed to change how elongated the ellipse is. {#s3e .explain}

::: html step3-2
s3cv: An elliptical orbit divided into 8 equal-time wedges of equal area
:::

## The bigger the orbit, how long does one lap take? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 T² and a³
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Kepler’s third law
:::

<b>This step answers: how are the period and the size of the orbit related?</b> Choose the launch radius and speed (as a multiple of the circular speed) and press “Add this orbit”: the page integrates one full lap, measures the period T and records the semi-major axis a (from the energy). All points fall on one straight line through the origin: T² = 4π²a³/GM, with slope 4π² ≈ 39.5 for GM = 1. Circular, elongated, large and small orbits all sit on the same line. {#s4e .explain}

::: html step4-2
s4cv: A scatter of T² against a³ with the theoretical line dashed
lblRadius: Launch radius r
lblFactor: Speed ÷ circular speed
addOrbit: Add this orbit
:::

::: strings
axR: distance r (R⊕)
axG: acceleration g (m/s²)
s0ro: r = {r} R⊕ (altitude about {alt} km): g = 9.81/r² = {g} m/s², {ratio} of the surface value; consistent with 1/r² = {inv}.
lblStart: launch point
k_circle: circle
k_ellipse: ellipse
k_parabola: parabola (just escapes)
k_hyperbola: hyperbola (escapes)
k_crash: crashes into the central body
s1ro: v = {v} (circular speed {vc}, escape speed {ve}): {kind}; eccentricity e = {e}, nearest point {rp}, farthest point {ra}.
axR2: radius r
axE: energy
lblE: total energy E = {e}
bound: E < 0: bound
unbound: E > 0: escapes
marginal: E = 0: threshold
s2ro: v = {v}: kinetic {ke} + potential {pe} = E = {e} ({kind}); nearest {rp}, farthest {ra}; escape speed √2 = {ve}.
lblWedges: 8 equal-time wedges (alternating colours)
s3ro: v = {v}, period T = {T}: wedge areas for intervals 1, 4 and 7 are {a1}, {a2} and {a3}; theory ½·L·T/8 = {exp}; largest and smallest differ by {spread}%.
axA3: semi-major axis cubed a³
axT2: period squared T²
lblLine: T² = 4π² a³
s4ro0: No orbit yet. Pick a radius and speed, then press “Add this orbit”; theoretical slope 4π² = {th}.
s4ro: {n} orbit(s) added; latest a = {a}, T = {T}, T²/a³ = {ratio} (theory {th}).
lblDay: one sidereal day ≈ 23 h 56 min
rISS: ISS
rGPS: GPS
rGEO: geostationary
rMoon: Moon
axAlt: altitude (km, log)
axPeriod: period (log)
hitGeo: ≈ one sidereal day: geostationary
belowDay: shorter than a day
aboveDay: longer than a day
s5ro: Altitude {alt} km: period {T}, orbital speed {v} km/s; {hit}.
:::

## How high must a satellite be to take exactly one day to circle the Earth? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Satellites
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · real satellites
:::

<b>This step answers: using the laws on real satellites.</b> For a circular orbit T = 2π√(a³/GM) with a = R⊕ + altitude and the Earth’s GM = 3.986×10¹⁴ m³/s². The International Space Station at about 400 km takes about 92 minutes; GPS at about 20,200 km takes about 12 hours; at about 35,786 km the period equals the Earth’s rotation period and a satellite seems to hang motionless over the equator: a geostationary orbit. The Moon, much farther, takes about 27 days. Drag the altitude (log scale) to find the green line. {#s5e .explain}

::: html step5-2
s5cv: Period against orbital altitude (log scale) with a few real reference points
lblAlt: Orbit altitude (log slider)
recapTitle: Recap
recap1: Gravity F ∝ 1/r²; the sideways speed decides the orbit: an ellipse below the circular speed, a circle at it, an escape at √2 times it.
recap2: Conservation of energy and angular momentum gives the nearest and farthest points and the equal-areas law (Kepler’s second law).
recap3: T² ∝ a³ holds for all orbits and lets us work out the altitude and period of satellites.
modelTitle: Scope and limits of the model
modelText: Model: a two-body problem with the central body far heavier than the moving one, non-rotating, no atmosphere and no other gravity; the numerical integration uses a small fixed step (velocity Verlet), so periods and areas carry small numerical errors, shown in the readouts. Kepler’s first law appears here through the eccentricity and the nearest and farthest points. Real satellites are also affected by atmospheric drag, the Earth’s oblateness and the Moon and Sun.
link0: → Earth’s Orbit & the Seasons: the Earth’s ellipse around the Sun
link1: → Gravitational Lensing: gravity bends light
link2: → Cosmic Expansion: gravity and expansion at large scales
:::

Page complete. {#done .readout .success i18n=text}
