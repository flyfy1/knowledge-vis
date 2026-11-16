---
lang: en
---

::: strings
docTitle: Convex Lens Imaging · Move the Candle, Change the Image — One Interaction per Step
back: ← Knowledge Index
pageTitle: Convex Lens Imaging · Move the Candle, Change the Image
tagline: A candle stands before a convex lens: far away, its image is small and upside-down; drag it closer and the image grows; drag it past one special point and the image suddenly jumps to the same side of the lens, upright and magnified. No magic — just two watershed points: one focal length splits real from virtual, two focal lengths split shrinking from magnifying. Every image on this page is computed live from the lens formula 1/f = 1/u + 1/v — what the picture shows and what the words say are the same image.
foot: visual.integ.life · Convex Lens Imaging —— One Interaction per Step series
navLabel: Step navigation
:::

## Parallel light goes in — the lens gathers it to one point {#step0 h2=s0t}

::: strings
nav0: 0 Parallel Light, One Point
:::

Step 0 · Light through a Lens {#s0k .step-kicker i18n=text}

Known: light travels straight in one medium and bends at an interface (refraction). This step answers one question only: **where does a bundle parallel to the principal axis go after passing through a convex lens?** Two names first: the straight line through the centre of the lens, perpendicular to it, is the **principal axis**; the centre point of the lens is the **optical centre O**. Drag the focal-length slider and watch where the rays on the right meet. {#s0e .explain}

::: html step0-1
canvasLabel: Ideal thin-lens rays; nearby text gives values, view limits and keyboard instructions
s0fLab: Focal length f (focus to optical centre)
:::

Conclusion: **a convex lens is a converging lens** — it gathers parallel light to its focus. Conditions: this page draws the idealised case of a **thin lens and rays near the axis**; rays near the rim of a real lens deviate slightly (spherical aberration), which this page does not develop. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: The parallel light is gathered onto one point of the axis — the **focus F**: it sits <span>{f}</span> to the right of the optical centre (that distance is the **focal length**); the 2F point sits at <span>{f2}</span>. With f = {f}: {judge}
s0judgeShort: A shorter focal length gives larger ray deflections and a nearer focus; it does not measure travel time.
s0judgeMid: The focus is at an intermediate distance; this drawing compares geometry only.
s0judgeLong: A longer focal length gives smaller deflections and a farther focus; travel time is not computed.
cAxis: principal axis
cFocusTag: focus F
nextLens: Continue the existing lens lesson: why focus separates real and virtual images →
:::

## Locating one image point takes only three rays {#step1 h2=s1t}

::: strings
nav1: 1 Three Special Rays
:::

Step 1 · Three Special Rays {#s1k .step-kicker i18n=text}

Question: how do rays from one object point locate an image point? In this paraxial thin-lens model, two independent principal rays suffice. Real images are intersections of outgoing rays; virtual images are intersections of backward extensions. At the focal plane the outgoing rays are parallel and there is no finite image point. Drag the object or use the sliders and toggle rays. This step fixes f=60; distances and heights use the same arbitrary length unit;1/f=1/u+1/v. Here u>0 is real-object distance; v>0 is a real image on the right and v<0 a virtual image on the left. |v| is the positive distance size. {#s1e .explain}

::: html step1-1
s1r1: Ray 1 · Parallel → through focus
s1r2: Ray 2 · Through centre → straight
s1r3: Ray 3 · Through focus → parallel
s1uLab: Object distance u (candle to centre)
s1hLab: Object height (flame tip to axis)
:::

The third special ray is shown only if its lens-plane intercept is finite and inside the drawing. It is unavailable at u=f; use the first two rays to see parallel output. The lens symbol is not an aperture calculation. Large-angle, marginal and thick-lens behaviour is outside this approximation. {#s1hint .hint}

::: strings
s1rule1: Ray 1: leaves parallel to the axis, bends at the lens toward the far focus F.
s1rule2: Ray 2: passes straight through the optical centre, undeviated.
s1rule3: Ray 3: leaves through the near focus F, leaves the lens parallel to the axis.
s1roIdle: Light at least one ray and watch where it goes after the lens.
s1ro: Object distance u = {u}; the formula gives image distance v = <span>{v}</span>. The lit rays meet exactly there: absolute image height <span>{ih}</span> ({m}× the object height {oh}, <b>inverted</b>). Any two rays fix the point — the third joins on its own.
s1roVirt: Object distance u = {u} (less than the focal length 60): on the right the rays spread apart and never meet; extend them **backwards** (dashed) and they meet on the left: |v| = <span>{v}</span>, absolute image height <span>{ih}</span> ({m}× the object height {oh}, <b>upright</b>) — a virtual image, more in Step 3.
s1roInf: Object distance u = {u}, exactly the focal length: after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no image point can be drawn.
cObjTip: flame tip
:::

## Drag the candle closer — the image wears five faces {#step2 h2=s2t}

::: strings
nav2: 2 Move the Candle
:::

Step 2 · Moving the Candle (the core step) {#s2k .step-kicker i18n=text}

Question: how does changing u change image distance and type? This step fixes a converging thin lens at f=60 and a real object of height H=26, in one arbitrary length unit. Light travels left to right; the object is at x=−u with u>0. v>0 is a real image on the right; v<0 is a virtual image on the left. Signed magnification M=−v/u is positive for upright and negative for inverted; size factor is|M|. Select the u=f preset, then press ←/→ once on the object slider (0.1 unit) to compare finite distances on either side. {#s2e .explain}

::: html step2-1
cBandFar: u>2f · smaller, real
cBandMid: f<u<2f · bigger, real
cBandNear: u<f · bigger, virtual
s2uLab: Object distance u
s2pFar: Far, 3f (u = 180)
s2p2f: Exactly 2f (u = 120)
s2pMid: Between f and 2f (u = 90)
s2pF: Exactly f (u = 60)
s2pNear: Inside f (u = 30)
:::

Only unrounded u=f has no finite image point. As u→f from below, v→−∞; from above, v→+∞. Rounded labels do not classify states; u−f below distinguishes the sides. At u=2f,M=−1; nearby values are not exactly equal size. A finite image outside the fixed view still exists. The scale does not auto-zoom. This is not the pinhole model: a lens must also satisfy its focal-length relation. {#s2hint .hint}

Model: ideal converging thin lens, paraxial rays, real object, same surrounding medium on both sides,f>0. Dispersion, aberrations, aperture and diffraction are omitted. Steps use independent parameters; this step’s f does not follow step0’s focal slider. Rays do not encode travel time or energy fractions. {#modelScope .hint i18n=text}

::: html step2-2
modelSource: Scientific basis: OpenStax · thin lenses, signs and principal rays ↗
:::

::: strings
s2roGt: u = {u} (<b>beyond 2f</b>): the image sits on the other side, v = <span>{v}</span>, size factor|M|={m} — <b>inverted, shrunk, real</b>. A camera puts its subject in this zone.
s2roEq2: u = {u} (<b>exactly 2f</b>): v = <span>{v}</span>, size factor|M|={m} — <b>inverted, same size, real</b>. This is the size watershed.
s2roMid: u = {u} (<b>between f and 2f</b>): v = <span>{v}</span>, size factor|M|={m} — <b>inverted, magnified, real</b>. A projector puts its slide in this zone.
s2roEqF: u = {u} (<b>exactly at the focus</b>): after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no screen anywhere can catch it. This is the real/virtual watershed.
s2roLt: u = {u} (<b>less than f</b>): the rays spread on the right; their backward extensions meet on the left: |v| = <span>{v}</span>, size factor|M|={m} — <b>upright, magnified, virtual</b>. A magnifying glass holds its object in this zone.
cFarTag: image far away →
:::

## A real image can be caught; a virtual one can only be seen {#step3 h2=s3t}

::: strings
nav3: 3 Screen & Eye
:::

Step 3 · Screen and Eye {#s3k .step-kicker i18n=text}

Question: which image can a screen intercept directly? This step uses separate fixed scenes: f=60,H=26; real scene u=150,v=100; virtual scene u=30,v=−60. Move screen p and compare with v. Only the unrounded equality p=v is labelled exactly in focus. Blur and patches are defocus illustrations, not irradiance, diffraction or a physical point-spread calculation. The eye icon indicates viewing direction, not internal-eye imaging. {#s3e .explain}

::: html step3-1
s3mReal: Scene 1 · Catch a real image
s3mVirt: Scene 2 · The magnifier’s virtual image
:::

Start with **Scene 1**: drag the screen to image distance v and catch the real image. Then switch to **Scene 2** to see why that screen cannot catch a virtual image. {#s3bridge .hint}

::: html step3-2
s3scrLab: Screen position (distance from centre)
:::

A real image is an actual convergence of outgoing rays and can be intercepted there. A virtual image is an intersection of backward extensions and cannot be intercepted directly at that point. Another optical system could form a further image from the rays; that is not simulated here. {#s3hint .hint}

::: strings
s3roSharp: The screen is at {p}, <b>exactly the image distance v = {v}</b>: the flame on it is **sharp**! A real image is where rays truly converge — the screen must sit exactly at the meeting point.
s3roBlur: The screen is at {p}; the image distance is {v}, off by <span>{d}</span>: the image blurs into a blob (blur drawn schematically). The rays have not met yet (or have met and spread again) — the screen only slices a patch of light. Drag it to {v} and try.
s3roVirt: Here u=30,v=−60: the virtual image is upright, enlarged and on the object side. A right-hand screen at p={p} cannot intercept this virtual image directly. Only outgoing directions and backward extensions are illustrated, not screen irradiance or real eye imaging.
cScreen: screen
cEye: eye
cOnScreen: image on screen
cNothing: only a light patch
:::

## Three questions on the two watersheds {#step4 h2=s4t}

::: strings
nav4: 4 Self-Test
:::

Step 4 · Self-Test {#s4k .step-kicker i18n=text}

No formulas — just the pocket rule: one focal length splits real from virtual, two split small from large. The axis diagram below stays available (f = 60). {#s4e .explain}

::: html step4-1
s4q1: Q1. A camera lens is a convex lens. The person stands far away (u > 2f). What is the image on the sensor like?
s4q1o0: Inverted, smaller, real
s4q1o1: Upright, magnified, virtual
s4q1o2: Inverted, magnified, real
:::

Q2. A candle is dragged slowly from 3f to 1.5f (staying outside f the whole way). How does the image change? {#s4q2 .quiz-q i18n=text}

::: html step4-2
s4q2o0: From magnified to smaller, still a real image
s4q2o1: From smaller to magnified, still an inverted real image
s4q2o2: Past some point it flips to an upright virtual image
:::

Q3a. A projector needs an inverted, magnified, real image. Which zone should the slide be in? {#s4q3a .quiz-q i18n=text}

::: html step4-3
s4zGt: u > 2f
s4zMid: f < u < 2f
s4zLt: u < f
:::

Q3b. A magnifying glass needs an upright, magnified, virtual image. Which zone should the object be in? {#s4q3b .quiz-q i18n=text}

::: html step4-4
:::

All three questions ask the same thing: first locate u — beyond 2f, between f and 2f, or inside f — and orientation, size and real/virtual are all decided. {#s4hint .hint}

::: strings
s4q1why: For u > 2f the image is inverted, smaller and real — a camera squeezes a big scene onto a tiny sensor, and the sensor can “catch” it.
s4q2why: At 3f, u > 2f, so the image is smaller; at 1.5f it sits between f and 2f, so magnified. F is never crossed, so it stays an inverted real image — only crossing F flips it to virtual.
s4q3awhy: An inverted, magnified, real image exists only for f < u < 2f: slides live in this zone — and a slide loaded upside down projects upright, for exactly this reason.
s4q3bwhy: An upright, magnified, virtual image exists only for u < f: once the object crosses F it turns into an inverted real image and the magnifier “stops working”.
s4ok: "✓ Correct. "
s4no: "✗ Not quite. "
s4idle: Tap an option to answer.
:::

## The whole page in three sentences {#step5 h2=s5t}

::: strings
nav5: 5 Finale · Three Sentences
:::

Step 5 · Finale {#s5k .step-kicker i18n=text}

Same candle, same lens. Everything needed to predict the image is two watersheds plus three rays: {#s5e .explain}

::: html step5-1
c1h: One focal length splits real from virtual
c1: u > f: rays truly meet — a **real image** on the other side. u < f: only the backward extensions meet — a **virtual image** on the same side. u = f: the rays leave parallel, the image is **at infinity**.
c2h: Two focal lengths split small from large
c2: u > 2f shrinks, u = 2f matches, f < u < 2f magnifies. Plus one blanket rule: **real images are always inverted, virtual images always upright**. Cameras, projectors and magnifiers merely park the object in different zones.
c3h: Three rays do the drawing
c3: The parallel ray bends through the focus, the centre ray walks straight, the through-focus ray leaves parallel. Any two fix the image point; the third arrives on its own — and exposes a wrong drawing on the spot.
s5fin: Starting from one bundle of parallel light, you can now predict the image at any distance: compute the image distance with **1/v = 1/f − 1/u**, then compare u with f and 2f — orientation, size and real-vs-virtual all fall out. Cameras, projectors, magnifying glasses and the lens inside your own eye all run on this one formula.
s5lkRr: Prerequisite: why does a ray bend at an interface at all? See the “through water” step of Reflection & Refraction →
:::

::: strings
s1rule3Virtual: Ray3: for u<f, the incoming ray’s backward extension passes through the near F. Light travels right to the lens and then exits parallel; it does not first travel left through F.
cOutside: finite image outside view
viewInside: The finite image and its full height fit in this drawing.
viewOutside: Image distance is finite and the image still exists. Its position or full height lies outside the fixed view; clipping is not infinity or absence of an image.
viewInfinity: u=f: rays from this point leave parallel. No finite image point; image height and magnification have no finite value here.
viewRaysOff: No rays are selected. Enable the first two again to compare the drawing with the image point.
ray3Focus: At u=f the third principal ray has no finite lens-plane intercept and is omitted. Use the first two to observe parallel output.
ray3Outside: The third ideal construction ray meets the lens plane outside this drawing and is omitted. This is a view limit, not a physical aperture calculation.
formulaFinite: Same result: u−f={delta}; signed v={v}; M=−v/u={M}; image height hᵢ=MH={h}. Y points upward; lengths share one unit and M is dimensionless.
formulaFocus: u−f=0: image at infinity (no finite image point). M and image height are not assigned a finite value in this state.
:::
