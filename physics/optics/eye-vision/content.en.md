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
pageTitle: The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens
tagline: The eye is a camera with a built-in zoom: the lens focuses light on the retina; when focus lands in front of it you are short-sighted and a concave lens pushes it back.
docTitle: The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens
:::

## When you look at something near and the lens does not adjust, where does the image fall? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Eye as camera
:::

::: html step0-1
s0step: "Step 0 · "
s0k: The eye as a camera
:::

<b>This step answers: how does the distance of an object change where its image forms?</b> Simplify the eye to a thin lens plus a retina 17 mm behind it. The relaxed lens has a focal length of about 17 mm, so distant light focuses exactly on the retina; as an object comes closer the image moves <b>behind</b> the retina (thin-lens equation 1/v = 1/f − 1/u) and the retina gets only a blurred spot (the disc on the right; above about 10 µm we perceive blur). Drag the object distance; the spread of the drawn rays is schematic. {#s0e .explain}

::: html step0-2
s0cv: The simplified eye: rays focusing through the lens with the focus position relative to the retina and the blur spot
lblObj: Object distance
:::

## How does the eye keep objects at different distances sharp? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Accommodation
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Accommodation
:::

<b>This step answers: how does the eye see near objects clearly?</b> The ciliary muscle makes the lens rounder and its focal length shorter, adding power. For an object at distance u it must add 1/u (in diopters, D = 1/metre). The added power has a limit, the amplitude of accommodation A: about 10 D in young people, falling with age, so the near point is 1/A and anything closer than that stays blurred (presbyopia). Drag the object distance and the amplitude. {#s1e .explain}

::: html step1-2
s1cv: Rays after accommodation: the focus returns to the retina unless the amplitude is exceeded
lblAmp: Amplitude A (D)
:::

## If the eyeball is slightly too long or too short, do distant things go blurred? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Myopia
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Myopia and hyperopia
:::

<b>This step answers: how does the length of the eyeball decide short- or long-sightedness?</b> The relaxed lens has a power of about 58.8 D (focal length 17 mm). If the axial length L is too long (&gt; 17 mm), the focus of distant parallel light falls <b>in front of</b> the retina: myopia; if L is too short, the focus lies <b>behind</b> it: hyperopia. The refractive error is 1000/L − 58.8 D: negative means myopia, and its reciprocal is the farthest distance seen clearly without glasses (the far point). Drag the axial length. {#s2e .explain}

::: html step2-2
s2cv: Parallel light from a distant object with the focus position against the retina as the axial length changes
lblAxial: Axial length L (mm)
:::

## What lens power puts the distant image back on the retina? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Glasses
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Putting on glasses
:::

<b>This step answers: how is the power of glasses chosen?</b> A lens held against the eye adds its power directly: total power = 58.8 + P. Myopia needs a concave lens with P &lt; 0 (diverging, pushes the focus back); hyperopia needs a convex lens with P &gt; 0 (converging, pulls the focus forward). The P that makes distant objects sharp equals the refractive error (for example −2.0 D, often called “200 degrees” of myopia). Drag the axial length and the lens power until it turns green (sharp). {#s3e .explain}

::: html step3-2
s3cv: The focus of distant parallel light against the retina once a lens is worn
lblLensP: Lens power P (D)
:::

## Why is everything at various distances sharper when the pupil is small in bright light? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Pupil and depth
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Pupil size and depth of field
:::

<b>This step answers: how does pupil size set the range over which things look sharp?</b> Blur-spot diameter ≈ pupil diameter × |image distance − retina distance| / image distance. A smaller pupil makes the same defocus produce a smaller spot, so the range of sharp object distances (depth of field, green band) is wider, the same idea as a pinhole camera. The curve shows the blur diameter for different object distances and the dashed line is the visibility threshold of about 10 µm. Drag the pupil diameter and the focus distance. {#s4e .explain}

::: html step4-2
s4cv: Blur diameter against object distance with the depth of field shaded green
lblPupil: Pupil diameter (mm)
lblFocus: Focus distance
:::

::: strings
lblFocusPt: focus
far: infinity
lblRetina: retina
lblLens: lens
lblSharp: sharp
lblBlur: blur spot
vSharp: sharp
vBlurred: blurred
s0ro: Object at {u}: image distance v = {v} mm (the retina is at 17 mm), the spot on the retina is about {blur} across, {verdict}.
s1ro: Object at {u}: {need} D must be added, the available amplitude is {A} D; total lens power {P} D; near point {near}; {verdict}.
kMyopia: myopia (focus in front of the retina)
kHyper: hyperopia (focus behind the retina)
kNormal: normal
s2ro: L = {L} mm: refractive error {se} D ({kind}); image distance of distant light {v} mm; farthest clear distance without glasses or accommodation: {far}.
s3ro: L = {L} mm (error {se} D), lens {p} D: the spot on the retina is about {blur}, {verdict}; the right lens power is {best} D.
lblThresh: visibility threshold ≈ 10 µm
axDist: object distance (m, log)
axBlur: blur diameter
s4ro: Pupil {p} mm, focused at {fu}: sharp from {near} to {far}.
:::

## Which range of distances can a normal, short-sighted, long-sighted and presbyopic eye see sharply? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Who needs what
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · different eyes
:::

<b>This step answers: putting the axial length and the amplitude together, what range does each person see sharply?</b> An object distance u is sharp when the accommodation needed, refractive error − P + 1/u, lies between 0 and the amplitude A. The green bar is the range with correction (glasses with P equal to the refractive error) and the orange bar is the bare eye. A myope has a limited far point; a hyperope must accommodate even to see far and tires easily; a presbyope has a small A and a distant near point and needs extra power for reading (about 3 D minus their own A). {#s5e .explain}

::: html step5-2
s5cv: Bars of the sharp distance range for four kinds of eye, bare and corrected
pNormal: Normal eye (amplitude 10 D)
pMyope: Short-sighted eye (axial length 17.6 mm)
pHyper: Long-sighted eye (axial length 16.6 mm)
pPresb: Presbyopic eye (amplitude 1 D)
recapTitle: Recap
recap1: Thin-lens equation 1/v = 1/f − 1/u: a nearer object moves the image farther; the eye pulls it back onto the retina by changing the lens power (accommodation).
recap2: Myopia is an axis that is too long with focus in front of the retina, corrected by a concave lens (P < 0); hyperopia is the opposite, corrected by a convex lens (P > 0); the power equals the refractive error.
recap3: The smaller the pupil, the larger the depth of field; the amplitude of accommodation falls with age and the near point recedes (presbyopia).
modelTitle: Scope and limits of the model
modelText: Model: a reduced eye, a single thin lens plus a retina with a relaxed focal length of 17 mm and imaging in air. A real eye has a cornea and a lens, media with different refractive indices, aberrations and diffraction, and the refractive error here also ignores the distance between lens and eye. The numbers illustrate the principle and are not an eye test or medical advice.
link0: → Convex Lens Imaging: how object distance decides the image
link1: → Pinhole Camera: smaller holes give sharper images
link2: → Reflection & Refraction: why light bends at an interface
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblUncorr: bare eye, sharp range
lblCorr: with corrective lens
s5ro: {name}: refractive error {se} D, A = {A} D. Bare-eye sharp range {nearU} to {farU}; with a {rx} D lens the near point is {nearC}; reading (at about 33 cm) needs roughly {add} D more.
:::
