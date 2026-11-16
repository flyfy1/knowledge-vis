---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Gravitational Lensing · A Cosmic Convex Lens
tagline: A massive object bends spacetime and passing light follows: a distant source is magnified, split into two images, even smeared into a ring.
docTitle: Gravitational Lensing · A Cosmic Convex Lens
:::

## How much does light grazing the Sun’s edge bend? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Bending of light
:::

::: html step0-1
s0step: "Step 0 · "
s0k: How light bends
:::

<b>This step answers: how does mass bend light and by how much?</b> General relativity gives the deflection α = 4GM/(c²b), where b is the closest distance of the ray from the mass. For the Sun (M = 1 M☉) at the limb (b = R☉) α ≈ 1.75 arcseconds, twice what you get from Newtonian gravity alone. The angle is proportional to mass and inversely proportional to distance. The drawing exaggerates the angle so it is visible; the readout gives the true angle in arcseconds. {#s0e .explain}

::: html step0-2
s0cv: A light ray passing a mass and being deflected (angle exaggerated)
lblLogM: Mass (M☉, log)
lblImpact: Closest distance b (R☉)
:::

## If a background source sits slightly off the line behind the lens, what do we see? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Two images
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The lens equation and two images
:::

<b>This step answers: why do we see two images?</b> In units of the Einstein radius θ<sub>E</sub>, the source position β and an image position θ satisfy β = θ − 1/θ, which gives two images θ<sub>±</sub> = (β ± √(β² + 4))/2: one on the same side as the source and farther out, one on the opposite side and closer to the lens. When the source is exactly on the line (β = 0) the two images merge into a ring, the Einstein ring. Drag β. {#s1e .explain}

::: html step1-2
s1cv: Sky-plane view: the lens at the centre, the source in green, the two images in orange and the dashed circle as the Einstein ring
lblBeta: Source offset β (θE)
:::

## How big is the ring, and can we see it? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Ring size
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The Einstein radius
:::

<b>This step answers: what decides the angular radius of the Einstein ring?</b> θ<sub>E</sub> = √(4GM/c² · D<sub>ls</sub>/(D<sub>l</sub>D<sub>s</sub>)) grows with the square root of the mass and depends on how the lens sits between us and the source. A single star in the Milky Way gives θ<sub>E</sub> of about a milliarcsecond, too small for current telescopes to separate the images (we only see a brightening); a galaxy or cluster gives arcseconds, so the images can be resolved and stretched into rings and arcs. Pick a scenario and drag the mass and the lens position. {#s2e .explain}

::: html step2-2
s2cv: The Einstein angular radius on a logarithmic angular scale compared with telescope resolution
sStar: A star in the Milky Way
sGalaxy: A large galaxy
sCluster: A galaxy cluster
lblDlFrac: Lens position D_l/D_s (%)
:::

::: strings
lblMass: mass M
lblExag: deflection angle exaggerated; schematic
s0ro: M = {M} M☉, b = {b} R☉: deflection α = 4GM/(c²b) = {a}″; the Newtonian-only estimate is half of that, {n}″.
lblSource: source
lblImgP: image +
lblImgM: image −
lblRing: Einstein ring θE
s1roRing: β ≈ 0: the source is exactly on the line and the two images merge into a full Einstein ring (radius 1 θE).
s1ro: β = {b}: images θ₊ = {p} and θ₋ = {m} (in θE); magnifications μ₊ = {mp} and μ₋ = {mm}, total {tot}.
lblMas: 1 mas
lblAsec: 1 arcsec
lblHst: space-telescope resolution ≈ 0.05″
lblSeeing: ground seeing
lblEin: θE = {v}
axAng: angular scale (log, 1 microarcsecond to 300 arcseconds)
vResolved: the images can be resolved
vUnresolved: the images cannot be resolved; only a brightening is seen
s2ro: {sc}: M = {M}, D_l = {Dl}, D_s = {Ds}: θE = {th}; {res}.
axTimeE: time (tE)
axAmp: total magnification A
s3ro: u₀ = {u0}: peak magnification A = {peak}; at t = {t} tE: u = {u}, A = {A}.
lblSourceExt: source
kRingLike: nearly a ring
kArc: a stretched arc
kTwo: two separate images
s4ro: β = {b}, source radius ρ = {r}: {kind}.
lblObs: observer
lblLensG: lens galaxy
lblSrc: background source
lblDlDs: D_l = {dl} Mpc, D_s = {ds} Mpc
lblInferred: mass inside the ring ≈ {m}
s5ro: θE = {th}″, D_l = {Dl} Mpc, D_s = {Ds} Mpc: M = c²θE²D_lD_s/(4G·D_ls) ≈ {m}.
:::

## When one star passes in front of another, how does the brightness change? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Microlensing
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The microlensing light curve
:::

<b>This step answers: how do we detect a lens when the two images cannot be seen?</b> The total magnification of the two images together is A(u) = (u² + 2)/(u√(u² + 4)), where u is the source–lens separation in units of θ<sub>E</sub>. As the source moves past, u(t) = √(u₀² + (t/t<sub>E</sub>)²), the brightness rises and falls, peaking at about 1/u₀ for small u₀. The smaller the closest approach, the higher the peak. Drag u₀ and the time. {#s3e .explain}

::: html step3-2
s3cv: Top: the source path and the two images; bottom: the total magnification against time
lblU0: Closest approach u₀
lblT: Time t (tE)
:::

## Why is an extended galaxy stretched into arcs when it is lensed? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Arcs and rings
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Arcs and rings
:::

<b>This step answers: what shape do the images of a real, extended galaxy take?</b> Map every point of the dashed green circle through the lens equation into two images and you get the two orange shapes: the outer one stretched into an arc and the inner one small and faint. The closer the source is to the axis (small β) the longer the arc, joining into a complete ring as β → 0; the larger the source, the thicker the arc. Drag the position and the size. {#s4e .explain}

::: html step4-2
s4cv: The dashed green circle (the source) and its two images in orange (arcs or a ring)
lblRho: Source radius ρ (θE)
:::

## Can we measure the lens’s mass from the size of the ring? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Weighing
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · weighing with a lens
:::

<b>This step answers: how do you turn a deflection into a mass?</b> Invert the Einstein-radius formula: M = c²/(4G) · θ<sub>E</sub>² · D<sub>l</sub>D<sub>s</sub>/D<sub>ls</sub>. Measure the angular radius of the ring and know the two distances and you get the total mass inside it, whether it shines or not: a gravitational lens weighs everything. Drag the ring radius, the lens distance and the source-distance factor. {#s5e .explain}

::: html step5-2
s5cv: A sketch of the observer, the lensing galaxy and the background source with bent rays
lblTheta: Ring angular radius θE (″)
lblDl: Lens distance D_l (Mpc)
lblFac: Source distance / lens distance
recapTitle: Recap
recap1: Light bends near a mass by α = 4GM/(c²b); the lens equation β = θ − 1/θ gives two images, and a source on the axis forms a ring.
recap2: θE grows with the square root of the mass: milliarcseconds for stars (only a brightening, microlensing), arcseconds for galaxies and clusters (visible arcs and rings).
recap3: Conversely, measuring the ring gives the lens’s total mass, whether it shines or not.
modelTitle: Scope and limits of the model
modelText: Model: a point-mass lens, weak field, small angles and a thin lens, with distances subtracted Euclidean-style (an approximation at cosmological distances, where angular-diameter distances must be used). Real galaxy lenses are extended mass distributions that give more images and elliptical rings; the numbers show the order of magnitude and the mechanism.
link0: → Convex Lens Imaging: how an ordinary lens forms images
link1: → Cosmic Expansion: distances and redshift
link2: → Reflection & Refraction: why light bends at an interface
:::

Page complete. {#done .readout .success i18n=text}
