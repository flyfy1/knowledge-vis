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
pageTitle: Projectiles & Circular Motion · Always Falling, Never Landing
tagline: Split velocity into a horizontal and a vertical part that do not disturb each other; circular motion needs a steady pull toward the centre; a satellite is a cannonball whose fall keeps curving round the Earth.
:::

## A ball thrown sideways and a ball simply dropped land together {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Two independent directions
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Two directions, each on its own
:::

This step asks: does horizontal speed change how fast something falls? From a 20 m tower the cyan ball is thrown out horizontally at v₀ while the orange ball is let go at the same instant. Gravity acts only vertically, so vertically the balls match: displacement ½gt² (g = 9.8 m/s², see [[velocity-vt#step3|accelerated motion]]); horizontally nothing pushes, so the cyan ball moves at constant v₀·t. A position is drawn every 0.25 s and dashed lines join the two balls at the same instant. **What to do:** drag v₀: the cyan balls spread evenly farther apart but every dashed line stays level — both balls are always at the same height; at v₀ = 0 they coincide. This is an ideal model with no air resistance. {#s0e .explain}

::: html step0-2
s0cv: Stroboscopic picture: cyan ball thrown sideways, orange ball dropped; dashes join same-time positions
replay: ▶ Replay (real 2 s)
speedL: Horizontal speed v (m/s)
:::

## Same speed: which angle sends it farthest? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Angle and range
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Throwing at an angle
:::

This step asks: with a fixed launch speed of 20 m/s, how does the launch angle θ set where it lands? Split the velocity into a horizontal part v·cosθ (constant) and a vertical part v·sinθ (slowing on the way up, then speeding down): flight time 2v·sinθ/g, range R = v²·sin2θ/g, peak height (v·sinθ)²/(2g). **What to do:** drag θ and watch the orange landing point move along the ground; the violet dashed path is the complementary angle 90° − θ, which lands in the same place (equal range) though its height and time differ; the range is greatest at 45°. “Keep this path” stores the current angle’s path for comparison (up to 6). No air resistance. {#s1e .explain}

::: html step1-2
s1cv: Paths from the ground: orange is the current angle, violet dashes the complementary angle, cyan the kept ones
keep: Keep this path
clearKept: Clear kept paths
angleL: Launch angle θ (°)
:::

::: strings
legNow: now θ = {th}°
legComp: complement {th}°
legKept: {n} kept
s1ro: θ = {th}°: range {r} m; the complementary {c}° gives {rc} m (equal); peak height {hmax} m; flight time {T} s.
:::

## How fast and in which direction is it moving at each moment? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Velocity in two parts
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Velocity at one instant
:::

This step asks: at one moment in flight, what are the horizontal and vertical parts of the velocity? The horizontal part vₓ = v·cosθ never changes (cyan arrow); the vertical part v_y = v·sinθ − g·t drops by 9.8 m/s every second (green arrow). The orange arrow is their combination, always along the path’s tangent; the **speed** is its length √(vₓ² + v_y²). **What to do:** drag the time t: on the way up the green arrow shrinks, at the top it is zero, then it grows downward; the cyan arrow stays the same throughout. At the top the speed is smallest but not zero (the horizontal part remains). {#s2e .explain}

::: html step2-2
s2cv: Path and the velocity parts at one instant: cyan horizontal, green vertical, orange combined
timeL: Time t (s)
:::

::: strings
atTop: (near the top: vertical speed is about 0)
s2ro: t = {t} s (top at {top} s): vₓ = {vx} m/s, v_y = {vy} m/s; speed {sp} m/s, {ang}° from the horizontal. {tag}
:::

## The speed is constant, so why is there an acceleration? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Circular motion
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Circular motion
:::

This step asks: a ball circles at constant speed — why call that “accelerating”? **Acceleration** measures change of velocity, direction included. The speed stays put, but the direction turns at every instant, so there must be an acceleration pointing to the centre, a = v²/r (green arrow): the **centripetal acceleration**; the velocity lies along the circle’s tangent (orange arrow). **What to do:** change the radius r and speed v: the green arrow grows with v² and shrinks with r; the period is T = 2πr/v. Press “Cut the string”: once the inward pull is gone the ball flies off along the tangent and stops circling — that is inertia. The picture is a ¼-speed slow-motion sketch and can be paused. {#s3e .explain}

::: html step3-2
s3cv: A ball on a circle: orange is velocity (tangent), green is the acceleration toward the centre
pause: Pause
cut: Cut the string
resetRing: Re-attach
radiusL: Radius r (m)
:::

::: strings
resume: Resume
slowNote: slow-motion sketch (¼ speed)
cutNote: string cut: straight along the tangent
s3ro: r = {r} m, v = {v} m/s → a = v²/r = {a} m/s² (toward the centre); period T = 2πr/v = {T} s, {f} turns per second.
s3roCut: String cut: with no inward force the ball moves in a straight line along the tangent at {v} m/s.
:::

## Fire the cannonball sideways faster and faster — then what? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Newton’s cannon
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Newton’s cannon
:::

This step asks: how fast must a ball be thrown sideways so that it no longer lands? Imagine firing a cannonball horizontally at ground level (no air) at v km/s. The Earth’s surface curves: for every 8 km you travel the ground drops about 5 m, while a ball falls about 4.9 m in a second; when the fall equals the ground’s curving away, the ball keeps “falling” round the Earth — the **first cosmic speed** 7.9 km/s. Faster gives an ellipse, and above 11.2 km/s (the **escape speed**) it leaves the Earth for good. The path is integrated step by step under point-mass gravity. **What to do:** drag v and see when the orange path stops hitting the ground; replay shows the path building up. {#s4e .explain}

::: html step4-2
s4cv: Earth and the path of a horizontally fired ball (point-mass gravity, integrated)
replay4: ▶ Replay path (6 s)
launchL: Launch speed v (km/s)
:::

::: strings
xAxis: horizontal distance x (m)
yAxis: height y (m)
legA: cyan: thrown at {v} m/s
legB: orange: dropped
clock: time t = {t} s
s0ro: v₀ = {v} m/s: fall time √(2h/g) = {tf} s (independent of v₀); horizontal distance at landing {x} m; both balls are now {y} m high (tower {h} m).
launchPt: launch point
k_fall: falls back to the ground
k_circle: about a circular orbit
k_ellipse: elliptical orbit
k_escape: escapes the Earth
s4ro: v = {v} km/s (circular speed {vc}, escape speed {ve}): {kind}; closest approach to Earth’s centre {rp} km (Earth radius {re} km); the integration {hit}, closest distance in it {rmin} km.
hitYes: hit the ground
hitNo: did not hit the ground
:::

## How does altitude set speed and period? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 A satellite’s books
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: A satellite’s books
:::

This step asks: why doesn’t a satellite fall, and how does altitude set its period? For a circular orbit at altitude h the radius is r = 6371 + h (km), the speed is v = √(GM/r) and the period T = 2π√(r³/GM). The distance the satellite falls toward Earth in one second, ½·(GM/r²)·1², equals how far the ground curves away over the distance it travels, v²/(2r)·1² — so it keeps falling and never lands. The plot is log–log: the period goes as the 3/2 power of the radius, so all satellites sit on one straight line (Kepler’s third law). **What to do:** drag the altitude and the orange point slides along the dashed line; the green points are rough altitudes of the ISS, GPS and a geostationary satellite. {#s5e .explain}

::: html step5-2
s5cv: Orbit radius against period (log–log): dashed line is circular orbits, green points are three examples
altL: Orbit altitude h (km)
recapTitle: Recap
recap1: Projectiles: uniform horizontally, uniformly accelerated vertically, independent; range v²sin2θ/g, complementary angles share a range; the velocity parts combine at every instant.
recap2: Circles: constant speed still means a centripetal acceleration v²/r toward the centre; with no inward pull the body flies off along the tangent (inertia).
recap3: A satellite is a cannonball fast enough that its fall matches the ground’s curving away; T² ∝ r³, 7.9 km/s gives a low circular orbit and 11.2 km/s escapes.
modelTitle: Scope and limits of this model
modelText: Scope: projectiles ignore air drag with g fixed at 9.8 m/s²; circular motion is uniform; the cannon and satellites use a spherical point-mass Earth (GM = 398,600 km³/s², radius 6371 km) with no atmosphere, rotation, Moon or Sun; orbit integration (RK4, 5 s step) is only for display while the classification uses the analytic thresholds (7.9 / 11.2 km/s). Step 0 plays in real time; other animations are teaching slow motion.
link1: → Velocity–time graphs: displacement under acceleration
link2: → Newton’s laws: how force and acceleration balance
link3: → Seasons and orbit: another orbit, this one around the Sun
:::

Page complete. {#done .readout .success i18n=text}

::: strings
rAxis: orbit radius r (km, log)
tAxis: period T (hours, log)
s5ro: h = {h} km: v = {v} km/s, period {Tm} min ({Th} h); T²/r³ = {k}×10⁻⁵ s²/km³ (same for every circular orbit); in 1 s it falls {fall} m and the ground curves away {away} m.
docTitle: Projectiles & Circular Motion · Always Falling, Never Landing
:::
