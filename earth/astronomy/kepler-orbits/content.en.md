---
lang: en
---

::: strings
pageTitle: Kepler Orbits · Ellipses, Swept Areas and Transits
back: ← Knowledge Index
navLabel: Kepler orbits steps
tagline: A planet circles a star. How close does it get, and how far? When does it move fastest? How long is one lap? And how can we tell it is there from hundreds of light years away? In seven steps one two-body gravity model gives Kepler’s three laws, then works out how deep, how long and how rare a planet’s “transit” across its star is.
nav0: 0 Ellipse
nav1: 1 Areas
nav2: 2 Speed
nav3: 3 Period
nav4: 4 Transit
nav5: 5 Alignment
nav6: 6 Wrap-up
au: AU
foot: Written independently by Claude Code (claude-opus-5-5).
:::

## The star is not at the centre. How near and how far does the planet get? {#step0 h2=s0t}

Step 0 · The shape of an orbit {#s0k .step-kicker i18n=text}

The question here: if you know an orbit’s size and how squashed it is, can you write down the planet’s closest and farthest distance from the star? Kepler’s first law says the orbit is an **ellipse** with the star at one **focus**; the other focus is empty. Two numbers describe the ellipse: the **semi-major axis a** (half the longest diameter, the orbit’s size) and the **eccentricity e** (the distance c from centre to focus divided by a, its flatness; e = 0 is a circle, values near 1 are very elongated). Distances are in **AU** (astronomical units, about 149.6 million km, the mean Earth–Sun distance). This step fixes a = 1 AU and changes only e. For every point on an ellipse the distances to the two foci add up to 2a (<a class="xlink" href="../../../math/geometry/conic-sections/#step2">→ Conic sections, step 2: drawing an ellipse with string and two pins</a>), and that gives the nearest point, **perihelion**, at a(1 − e) and the farthest, **aphelion**, at a(1 + e). {#s0e .explain}

::: html step0-1
c0: Orbital plane (star at one focus, a = 1 AU)
s0lgOrbit: Elliptical orbit
s0lgR1: r₁: P to the star
s0lgR2: r₂: P to the empty focus
s0lgC: Focus to centre c = a·e
eSlider: Eccentricity e
pSlider: Position of point P on the ellipse (parameter angle, degrees)
preEarth: Earth 0.017
preMars: Mars 0.093
preMercury: Mercury 0.206
preHalley: Halley’s comet 0.967
:::

What to try: first drag only the position of P. The orange r₁ and green r₂ trade length, and their sum in the readout stays at 2.000 AU. Then drag only e (or press the four presets): the star (yellow dot) moves away from the centre and perihelion closes in on it. Earth’s e is only 0.017, so its nearest and farthest distances differ by about 3% and the orbit looks like a circle. Earth passes perihelion in early January, in the northern winter, so the seasons are not caused by distance (<a class="xlink" href="../../../earth/astronomy/seasons-orbit/#step0">→ Seasons, step 0: is Earth closest to the Sun in the northern summer?</a>). {#s0hint .hint}

::: strings
lbStar: Star
lbEmpty: Empty focus
lbPeri: Perihelion
lbApo: Aphelion
lbCenter: Centre
s0readout: e = {e}: perihelion a(1 − e) = {rp} AU, aphelion a(1 + e) = {ra} AU, far/near = {ratio}×; semi-minor axis b = a√(1 − e²) = {b} AU. Point P: r₁ = {r1} AU, r₂ = {r2} AU, r₁ + r₂ = {sum} AU = 2a.
:::

## In equal times, does the planet cover equal arcs? Equal areas? {#step1 h2=s1t}

Step 1 · Equal times {#s1k .step-kicker i18n=text}

The question here: cut one lap into 12 equal stretches of time. In each, how far does the planet move along its orbit, and how much area does the star–planet line sweep? Kepler’s second law says the line sweeps **equal areas in equal times**. The reason: gravity always points at the star, so it can never speed up or slow down the planet’s turning about the star; physicists call this **conservation of angular momentum**, and the area swept per unit time is exactly half the angular momentum divided by the planet’s mass, so it stays constant. The page finds the position at each time from **Kepler’s equation** M = E − e·sin E (the second law written as a formula): M, the mean anomaly, is 2π × time elapsed ÷ period, and E is the parameter angle from step 0. The shaded areas are then measured separately, polygon by polygon. {#s1e .explain}

::: html step1-1
c1: Every slice takes the same time: 1/12 of a period
s1lgSlice: Swept sector (alternating colours)
s1lgDot: Position every 1/12 period
s1lgPlanet: Planet
playSlices: Run one lap in equal times
showSlices: Show all
:::

What to try: set e to 0 (a circle) and press “Run one lap in equal times”: the 12 white dots are evenly spaced. Drag e to 0.6 and run it again: the dots spread out near perihelion (fast) and bunch up near aphelion (slow), yet every sector has the same area. Near the star the sectors are short and wide; far away they are long and thin. {#s1hint .hint i18n=text}

::: strings
s1progress: "{c}/12 slices done · "
s1readout: {prog}e = {e}: every measured sector is {share}% of the ellipse (= 1/12), but the arcs differ: longest / shortest = {arcRatio}×.
:::

## How much faster is perihelion than aphelion, and what sets the speed? {#step2 h2=s2t}

Step 2 · Speed {#s2k .step-kicker i18n=text}

The question here: knowing the orbit and the planet’s present distance r from the star, can you work out its present speed v? Energy conservation gives the **vis-viva equation**: **v² = GM (2/r − 1/a)**. G is the gravitational constant and M the star’s mass; together GM measures how strong the star’s pull is (the Sun’s value here). The closer in (smaller r), the faster; the speed depends only on r and a, not on which side of the orbit the planet is on. At perihelion and aphelion the velocity is exactly perpendicular to the star–planet line, so angular momentum conservation from step 1 gives a simpler ratio: **v_peri / v_aph = r_aph / r_peri = (1 + e)/(1 − e)** (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step3">→ Gravity and orbits, step 3: why it moves faster near the centre</a>). The example is still a = 1 AU around the Sun. {#s2e .explain}

::: html step2-1
c2a: Velocity arrow on the orbit (length ∝ speed)
c2b: Speed v (km/s) against time t/T
s2lgPlanet: Planet and velocity arrow
s2lgTrace: v(t) so far
s2lgFull: v(t) over the full lap
qSlider: Time t / T (fraction of a lap since perihelion)
playOrbit: Play one lap
:::

What to try: keep e = 0.5 and drag time t/T up from 0. In the orbit plot the arrow is longest at perihelion and shortest at aphelion; the speed plot draws the v(t) you have covered as a solid line. Note that v(t) is not a gentle symmetric wave: the peak near perihelion is narrow and steep (the fast part is brief) and the trough near aphelion is wide and flat (the slow part lasts). Then change e: at e = 0 the speed stays at 29.78 km/s, Earth’s mean orbital speed. {#s2hint .hint i18n=text}

::: strings
s2readout: t/T = {q}: r = {r} AU, v = {v} km/s (vis-viva). Perihelion {vp} km/s, aphelion {va} km/s, ratio {vr} = r_aph / r_peri = {rr}. A circular orbit with the same a moves at {vc} km/s.
:::

## Double the orbit: how long is a lap? Squash it: does the period change? {#step3 h2=s3t}

Step 3 · Period {#s3k .step-kicker i18n=text}

The question here: what sets the period T? Kepler’s third law says **T² ∝ a³**. Around the Sun, measuring T in years and a in AU, the constant is exactly 1: **T = √(a³) years**. The precise form is T = 2π√(a³/GM): it contains a but not e (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step4">→ Gravity and orbits, step 4: bigger orbits take longer</a>). In the orbit plot two planets leave perihelion together: cyan follows a circle of radius a, orange an ellipse with the same a and eccentricity e. The period plot uses **log scales** (each grid step is a factor of 10): a across, T up; the line is T = √(a³) and the dots are the measured periods of the eight planets and Halley’s comet. {#s3e .explain}

::: html step3-1
c3a: Same a: circle (cyan) and ellipse (orange)
c3b: Period T (years) vs semi-major axis a (AU), log scales
s3lgCirc: Circular orbit
s3lgEll: Ellipse with the same a
s3lgLaw: T = √(a³)
s3lgBody: Measured periods
aSlider: Semi-major axis a (AU, log scale)
e3Slider: Eccentricity e of the orange orbit
playLaps: Run both for two laps
:::

What to try: press “Run both for two laps”. Orange pulls ahead near perihelion and cyan catches up near aphelion, and at the end of every lap the two are back at the start together (same count). Drag e to 0.9 and run again: same result. Finally drag a: the white ring in the period plot slides along the line; make a 4 times larger and T becomes 8 times longer (√(4³) = 8). {#s3hint .hint i18n=text}

::: strings
pause: Pause
s3laps: Laps done: cyan {c} · orange {e}
s3lapProgress: "{lap} laps run · "
s3readout: {prog}a = {a} AU: T = √(a³) = {T} years ({d} days), the same for both orbits. The animation squeezes one lap into 6 s. Halley’s comet has e = 0.967 and a = 17.83 AU; the formula gives {th} years, the measured period is about 75.3.
b_mercury: Mercury
b_venus: Venus
b_earth: Earth
b_mars: Mars
b_jupiter: Jupiter
b_saturn: Saturn
b_uranus: Uranus
b_neptune: Neptune
b_halley: Halley
:::

## When a planet crosses in front of its star, how much light is lost, and for how long? {#step4 h2=s4t}

Step 4 · Transit {#s4k .step-kicker i18n=text}

The question here: we cannot see a distant planet itself, but when it passes between its star and us (a **transit**) it hides a small patch of the star’s face. The fraction hidden is the fraction of light lost, called the **transit depth**. Treating the star as a uniformly bright disc (ignoring the darker rim, “limb darkening”), the depth once the planet is fully on the disc is (planet radius Rp ÷ star radius R★)². The duration depends on how fast the planet moves along its orbit: the closer the orbit, the shorter the period (step 3) and the quicker it crosses. Here the star is the Sun, the orbit is circular and the planet crosses the centre of the disc. Rp is in **Earth radii R⊕** (about 6371 km); Jupiter is about 11.2 R⊕. The lower plot is the **light curve**: hours from mid-transit across, the drop in brightness from the unblocked star up (0 = nothing blocked). {#s4e .explain}

::: html step4-1
c4b: Light curve: brightness drop vs time (hours)
s4lgStar: Stellar disc
s4lgPlanet: Planet
s4lgCurve: Light curve so far
s4lgFull: Full curve
rpSlider: Planet radius Rp (Earth radii R⊕)
a4Slider: Orbit radius a (AU, log scale)
xSlider: Planet position (in star radii, 0 = centre)
sweep4: Send the planet across
:::

What to try: press “Send the planet across” and watch the light curve: the brightness slopes down as the planet enters the disc, stays flat while it is fully on, and climbs back as it leaves. Then change only Rp: the depth of the flat bottom goes as Rp² (double the radius, four times the depth; the vertical axis rescales, so read the number). Finally change only a: the depth stays put but the duration stretches with a (roughly as √a). An Earth-size planet at 1 AU gives about 84 ppm (parts per million) for about 13 hours; a Jupiter-size one about 1%. {#s4hint .hint i18n=text}

::: strings
c4a: The star seen from Earth (planet drawn to scale)
s4readout: Rp = {rp} R⊕, a = {a} AU: period {P} days; depth (Rp/R★)² = {depth}; total duration {dur} hours. Now {dt} hours from mid-transit, brightness down by {f}.
s4axis: vertical axis rescales with the depth
:::

## Why do we see no transits at all in most planetary systems? {#step5 h2=s5t}

Step 5 · Alignment {#s5k .step-kicker i18n=text}

The question here: how far must an orbit be tilted before the transit disappears? Seen from afar, the angle between the orbital plane and our line of sight is described by the **inclination i**: at i = 90° we see the orbit exactly edge-on. As the planet passes in front of the star, its closest approach to the centre of the disc on the sky, in star radii, is the **impact parameter b = (a/R★)·cos i**. Whenever b < 1 + Rp/R★ the planet’s disc touches the star and a transit happens. So the further out the orbit, the smaller the tilt away from 90° that makes the planet miss. For orbits facing random directions (cos i spread evenly between 0 and 1), the fraction that transit is about **(R★ + Rp)/a**. The planet here is Jupiter-size (11.2 R⊕), the star is still the Sun, the orbit circular. {#s5e .explain}

::: html step5-1
c5a: Seen from Earth: the planet’s path
c5b: Randomly oriented orbits: cos i (0 to 1)
s5lgStar: Stellar disc
s5lgTrack: Planet path (closest approach to the centre = b)
s5lgBand: Transit range cos i < (R★+Rp)/a
s5lgHit: Transits
s5lgMiss: Misses
iSlider: Inclination i (degrees)
a5Slider: Orbit radius a (AU, log scale)
drawMany: Place 500 random orbits
clearMany: Clear
:::

::: strings
s5yes: a transit happens
s5no: no transit (it passes beside the disc)
s5readout: a = {a} AU, i = {i}°: b = {b}, {verdict}. A transit needs i > {imin}°. With random orientations the fraction that transit is (R★+Rp)/a = {p}%; {sim}
s5sim: {n} placed so far, {h} transit ({f}%).
s5nosim: press “Place 500 random orbits” to run the experiment.
s5hint: What to try: keep a = 0.05 AU and drag i down from 90°. In the sky view the path moves from the middle of the disc to its edge and then off it; below {imin0}° there is no transit. Then pull a out to 1 AU: the window shrinks to about 0.29°. Finally press “Place 500 random orbits” a few times: each dot in the cos i strip is one random orientation, those inside the orange band transit, and the running fraction settles towards the formula. Changing a clears the experiment.
:::

## One law of gravity, three laws of orbits, one way to find planets {#step6 h2=s6t}

Step 6 · Wrap-up {#s6k .step-kicker i18n=text}

::: html step6-1
s6fin: **Step 0**: the orbit is an ellipse with the star at a focus; perihelion and aphelion sit at a(1 ∓ e). **Step 1**: equal areas in equal times (angular momentum is conserved), so the planet is fast when close. **Step 2**: the speed follows vis-viva and depends only on r and a; the perihelion-to-aphelion speed ratio is (1 + e)/(1 − e). **Step 3**: the period depends only on a, T² ∝ a³. **Step 4**: the transit depth is about (Rp/R★)², the duration set by the orbital speed. **Step 5**: only nearly edge-on orbits transit; with random orientations the chance is about (R★ + Rp)/a, so a planet at 1 AU has only about a 0.5% chance of being found this way.
formula: "r = a(1 − e·cos E)　M = E − e·sin E\nv² = GM (2/r − 1/a)\nT = 2π √(a³/GM)\ndepth ≈ (Rp/R★)²　P ≈ (R★ + Rp)/a"
boundary: Scope: the two-body problem, with the planet’s mass negligible next to the star’s; no tugs from other planets and no relativistic corrections (such as Mercury’s perihelion precession). Measured periods are standard reference values. The transit steps assume a circular orbit, a uniformly bright stellar disc (real stars are darker at the rim, which rounds the bottom of the light curve) and a Sun-like star; on an eccentric orbit the duration also depends on where along the orbit the transit falls. The random experiment in step 5 is a simulation, not observational data.
linksTitle: Where to go next
lk1: → Gravity and orbits, step 2: why an orbit swings between two radii
lk2: → Conic sections, step 1: one number (eccentricity) tells circle, ellipse, parabola and hyperbola apart
lk3: → Seasons, step 0: is Earth closest to the Sun in the northern summer?
lk4: → Blackbody radiation, step 2: in which band a star shines brightest
:::
