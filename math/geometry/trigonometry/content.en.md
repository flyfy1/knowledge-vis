---
lang: en
---

::: strings
docTitle: Trig Functions · The Unit Circle — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Trig Functions · The Unit Circle
tagline: Three years of memorising sin and cos — and all along they were just the height and the sideways position of a point walking around a circle. One lap draws a sine wave out of the height, a cosine wave out of the position, and the tangent out of the slope: three functions, three projections of one circle. This page is the prequel to Fourier: the sky full of spinning circles over there is this single circle, many times over.
foot: visual.integ.life · Trig Functions & the Unit Circle — one interaction at a time
play: ▶ Play
:::

## A wave machine that only spins {#step0 h2=s0t}

::: strings
nav0: 0 The wave machine
:::

Step 0 · The hook {#s0k .step-kicker i18n=text}

This step answers: **how can a point that only goes around in circles trace out a sine wave?** A point glides around a circle at a steady pace, and its height (the vertical coordinate) is traced out stroke by stroke — into the very **sine wave** you have been memorising for years. Nothing gets explained yet: just let it spin and watch. Every rise and fall of the wave is the point’s position on the circle. {#s0e .explain}

::: html step0-1
s0speed: Angular speed ω (rad/s)
pause: ⏸ Pause
stepOnce: Step ▸ (+6°)
:::

Radians first: the radian (rad) is another unit for angles — one full turn is 2π rad, so 1 rad ≈ 57.3°; and ω in rad/s is simply how many radians the point sweeps per second. The wave is not pre-drawn: every frame takes the point’s **actual height at that instant**, records it, and joins the dots. Drag the speed up or down and watch the wave squeeze or stretch — remember the feel; in step 5 it turns into pitch. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
undef: undefined
s0ro: θ = {deg}° ({rad} rad) · sin θ (height right now) = {sin} · the leading point of the wave is exactly this height
cHeight: height sin θ
cWave: the traced wave
:::

## Cosine is where it stands, sine is how high {#step1 h2=s1t}

::: strings
nav1: 1 Coordinates
:::

Step 1 · Coordinates of the point {#s1k .step-kicker i18n=text}

This step answers: **why are the point’s two coordinates exactly cos and sin?** Stop the spinning and take over with your hand. Drag the point anywhere on the circle: how far it sits sideways from the centre is **cos θ** (its position); how high it sits is **sin θ** (its height). The trigonometric functions are nothing more than names given to this point’s two coordinates. The two projection lines and the right triangle between them follow it everywhere. {#s1e .explain}

::: html step1-1
tangentCanvas: Unit-circle and tangent diagram; nearby text gives values, view limits and keyboard instructions
s1deg: Degrees °
s1rad: Radians rad
s1snap: Jump to a special angle:
tangentKeyboard: Diagram keys: arrows1°,Shift10°;Home/End select0°. Degree/radian switching changes only the display.≈marks rounding; near90° is not exactly90°.
s1exactT: Exact values at special angles
s1exactNone: Drag the point onto a special angle — 30°, 45°, 60°, 90°… (it snaps gently when close), or use the buttons above — and the exact, no-calculator values show up here.
:::

Watch the signs change: cross the y-axis and the position (cos) turns negative while the height stays positive; drop below the x-axis and the height (sin) turns negative too. The sign rules for the four quadrants are not a chant — they are just the signs of the coordinates themselves. Wherever the point is, read them off. {#s1hint .hint}

::: html step1-2
s1optics: Use sine’s range to test refraction: measure angles from the normal →
:::

::: strings
s1ro: θ: {ang} · cosθ (horizontal): {cos} · sinθ (vertical): {sin} · tanθ: {tan}
s1quad: Quadrant {q} · sin {ss} · cos {cs} · tan {ts}
s1axisY: On the y-axis · sin {ss} · cos {cs} · tan {ts}
s1axisX: On the x-axis · sin {ss} · cos {cs} · tan {ts}
s1pyth: cos²θ+sin²θ=1 (unit-circle identity). Numeric terms: {c2}, {s2}; their unrounded numeric sum is{sum}.
cSinLab: sin θ (height)
cCosLab: cos θ (position)
:::

## Unroll the height and you get the sine wave {#step2 h2=s2t}

::: strings
nav2: 2 Sine = height
:::

Step 2 · Enter sine {#s2k .step-kicker i18n=text}

This step answers: **why does laying the height out in time order give exactly the sine wave?** Now the wave machine, explained. When the point climbs to the very top, the wave reaches its peak; when the point crosses the horizontal diameter, the wave crosses zero. The wave is not “like” the circle — it is the circle’s **profile**: the point’s height, laid out in time order, nothing more. Stop at a few key angles, drop a marker, and see what the wave is doing at that exact spot. {#s2e .explain}

::: html step2-1
s2amp: Amplitude = radius R
s2mark: Pause & mark at key angles:
s2pause: ⏸ Pause
:::

Drag the amplitude slider: the circle grows and the wave grows taller **in sync** — both are measured with the same ruler, the same radius. Amplitude is not a separate dial on the wave; it is the circle’s radius itself. {#s2hint .hint}

::: strings
s2play: ▶ Keep spinning
s2ro: R = {R} · θ = {deg}° · height right now = R·sin θ = {h} · the wave peaks at {R}
s2marks: Marked: {list}
s2marksNone: No marks yet — try the angle buttons above.
s2markItem: {deg}° → {v}
cPeak: peak
cZero: zero
:::

## Look from the other side: position makes a wave too {#step3 h2=s3t}

::: strings
nav3: 3 Cosine = position
:::

Step 3 · Enter cosine {#s3k .step-kicker i18n=text}

This step answers: **how is the wave traced by cos related to sin?** Same machine, different quantity: trace the sideways position (the horizontal coordinate) instead. The wave that comes out is identical to sine — except it **sets off a quarter period earlier**. Cosine is not a second function to memorise: it is sine, 90° ahead of schedule. From here on, the phrase “phase difference” has a picture. {#s3e .explain}

::: html step3-1
s3watchSin: Trace height (sin)
s3watchCos: Trace position (cos)
s3watchBoth: Overlay both
:::

Clearest on the circle: when the height is at its peak, the position is crossing zero; when the position is at its rightmost, the height is crossing zero. One peaks exactly when the other crosses — a quarter turn apart, forever. The “phase” that turns up all over the Fourier and sampling pages is precisely this offset. {#s3hint .hint}

::: strings
s3ro: θ = {deg}° · sin θ = {sin} · cos θ = {cos} · the phase gap is always 90° (π/2): cos θ = sin(θ + 90°) = {shift} — the same number as cosine itself
cSinWave: sine wave (height)
cCosWave: cosine wave (position)
:::

## Tangent is slope, standing on the wall x = 1 {#step4 h2=s4t}

::: strings
nav4: 4 Tangent = slope
:::

Step 4 · Enter tangent {#s4k .step-kicker i18n=text}

This step answers: **what is tan, and what happens to it as the point creeps up on 90°?** One left. Extend the line from the origin through the point until it hits the vertical wall at x = 1: the height of the hit point is **tan θ** — which is really just that line’s slope, sine divided by cosine. Drag the point (or the slider) towards 90° and watch the hit point rocket skywards; then drag past 90° and see where it comes back from. {#s4e .explain}

Compare 89.9°, 90° and 90.1°: finite, undefined and finite negative are three different states. {#s4bridge .hint i18n=text}

::: html step4-1
s4th: Angle θ (°)
s4near: Creep up on 90°:
tangentSource: Mathematical basis: OpenStax · tan domain and period ↗
:::

The domain excludes90°+180°k for integer k; period180° (π rad). Approaching90° from the left gives+∞ and from the right−∞; these are one-sided limits, not a value at90°. Finite offscreen values remain finite;≈marks rounding. Full turn0–360°;360° equals0° in orientation and displays0°. Slider/diagram arrows cycle0.1°,Shift1°;Home/End select0°. Internally angles are radians;180°=π rad. {#s4hint .hint}

::: strings
s4ro: θ: {deg}° · tanθ: {tan} (finite). sinθ: {sin}, cosθ: {cos}; quotient from unrounded sin/cos: {ratio}.
s4roOff: The hit is outside the vertical±3.3 view. The arrow means offscreen, not an infinite value at this angle.
s4roUndef: θ: {deg}°; tan is undefined. At this lesson’s exact90° or270° state, cos=0 and the line through the origin is parallel to x=1, with no intersection. sinθ={sin}; division by0 is not allowed.
cWall: x = 1 (the wall)
cTanLab: tan θ (hit height)
cLine: line through origin & point
:::

## The world keeps translating between circles and waves {#step5 h2=s5t}

::: strings
nav5: 5 Spin ⇄ wave
:::

Step 5 · Spin ⇄ oscillation {#s5k .step-kicker i18n=text}

This step answers: **how do spinning and waves translate into each other in the real world?** Circles and waves are not classroom decorations: **for anything that spins, its height is a wave; and a wave is a spin, unrolled.** The three scenes below share one spin rate — a Ferris wheel cabin’s height, an engine piston’s stroke, and the pitch of a sound are the same point, turning. {#s5e .explain}

::: html step5-1
s5speed: Spin rate (rev/s)
s5wheelT: ① Ferris wheel: cabin height
s5pistonT: ② Crank & piston: the stroke
s5soundT: ③ Spin becomes sound
s5play: ▶ Listen
:::

The crank drives the piston through a connecting rod only 2.5× the crank radius. A finite rod makes the piston linger a little near the top of its stroke, so the piston’s curve is **close to a sine, but not a sine**. The longer the rod, the smaller the difference; only an infinitely long rod yields an exact sine. {#s5pistonE .explain}

Drag the rate: the wave on screen squeezes tighter at exactly the moment the pitch rises — wave density and pitch are one thing, locked together by the spin rate. Silent by default; click to play, volume kept low. {#s5soundHint .hint}

::: strings
s5wheelRo: The lit cabin’s height right now = sin θ = {sin} (hub = 0, radius = 1) · θ = {deg}°
s5pistonRo: Piston position (normalised) = {p} · pure sine = {pure} · the rod’s doing = {diff} (the red curve below is that difference, magnified ×3)
s5soundRo: Spin {rps} rev/s → the height wave’s frequency is {rps} Hz (far too low to hear) → played 220× faster: {hz} Hz
s5stop: ■ Stop
cHeightWave: cabin height
cPiston: piston
cPure: pure sine
cDiff: difference ×3
cSoundWave: height wave (2 s window)
:::

## The console: one circle, three projections {#step6 h2=s6t}

::: strings
nav6: 6 Finale console
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

This step answers: **how can one single point trace the sin, cos and tan waves all at once?** Finally, the whole family at one table: drag the point (or let it spin) and the point on the circle, the three readouts and the **current positions** on all three waves light up together. None of the three waves is pre-drawn — wherever the point has been dragged, its projection paints the wave on the spot; where it has never been, the wave is simply absent. {#s6e .explain}

::: html step6-1
s6play: ▶ Spin it
s6chain: Add a second circle
s6clear: Clear traces
s6autoNote: Traces record only angles actually swept. The tan band shows±3.4; offscreen samples remain gaps and90°/270° are undefined. Use arrows for1° (Shift10°),Home/End for0°; manual input pauses play. Reload restores only the angle/chain switch, not traces or autoplay.≈marks rounding; the displayed angle alone does not classify the domain.
s6fin: Try hanging the second, smaller circle on the first circle’s point: as it orbits the moving point, its tip stops tracing a circle and draws petals instead. One more step and you arrive at the **Fourier transform** — many such circles chained end to end, each with its own radius, speed and phase, drawing any waveform, any picture, for you. The single circle on this page is that whole page’s entire toolkit.
s6linkF: On to Fourier: chain the circles, draw anything →
:::

::: strings
s6pause: ⏸ Pause
s6chainOff: Remove the second circle
s6ro: θ: {deg}° ({rad} rad) · sinθ: {sin} · cosθ: {cos} · tanθ: {tan}
s4domain: Δ=θ minus90°/270° in this half-turn: {delta} rad. Domain classification uses the unrounded angle; a rounded label does not make a nonzeroΔ exactly vertical.
cTanOutside: outside view
:::
