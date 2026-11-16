---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Double-Slit Experiment · Single Particles Still Build Fringes
tagline: Fire particles one at a time and fringes grow by themselves; the moment you know which slit one took, the fringes vanish.
docTitle: The Double-Slit Experiment · Single Particles Still Build Fringes
:::

## What decides how far apart the bright fringes on the screen are? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Fringe spacing
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Fringe spacing
:::

<b>This step answers: how does the fringe spacing depend on the wavelength and the slit separation?</b> The path difference from the two slits to a point on the screen is d·sinθ, and the waves reinforce when it is a whole number of wavelengths. For small angles the bright fringes are Δy = λL/d apart: a longer wavelength, a farther screen or closer slits spread the fringes out. The grey strip below is what you would see on the screen. (The path-difference logic is in the Interference page; here only the spacing matters.) {#s0e .explain}

::: html step0-2
s0cv: The double-slit intensity curve and grey strip with the fringe spacing marked
lblLam: Wavelength λ (nm)
lblD: Slit separation d (mm)
lblL: Screen distance L (m)
:::

## Why do the fringes fade toward the sides and even disappear? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Slit envelope
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The single-slit envelope
:::

<b>This step answers: what role does the width of each slit play?</b> A real slit has a width a and diffracts on its own; its brightness falls off with a sinc² envelope that reaches zero at y = ±λL/a (red dashed lines). The fine double-slit fringes sit under this envelope: I = cos²(πdy/λL)·sinc²(πay/λL). A narrower slit gives a wider envelope and more visible fringes; the cyan line is the result with one slit open. Drag the slit width and separation. {#s1e .explain}

::: html step1-2
s1cv: Double-slit intensity (orange) under the single-slit envelope (cyan) with the first zeros as red dashed lines
lblA: Slit width a (µm)
:::

## If only one particle is fired at a time, do fringes still appear? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One at a time
:::

::: html step2-1
s2step: "Step 2 · "
s2k: One particle at a time
:::

<b>This step answers: how do individual landing points accumulate into fringes?</b> Each particle leaves a single dot on the screen, its position drawn at random from the intensity curve above (a fixed seed, so it is repeatable). A few dozen look like scattered dots; after thousands, clear fringes appear. The fringes are a probability distribution, not the path of any one particle. The readout counts particles that land in dark zones (intensity below 5%). {#s2e .explain}

::: html step2-2
s2cv: A histogram of landing counts gradually revealing fringes with the theoretical intensity as an orange line
fire1: Fire 1
fire10: Fire 10
fire100: Fire 100
fire1000: Fire 1000
reset: Reset
:::

::: strings
s2ro0: No particles yet. Press a Fire button.
s2ro: {n} particles fired; {dark} ({pct}%) landed in dark zones (intensity below 5%).
lblDetOn: detector: can tell the slit
lblDetOff: no detector
kNone: path fully known: no fringes
kFull: path unknown: full fringes
kPart: partly known: fainter fringes
s3ro: D = {D}: visibility V = √(1−D²) = {V}, V² + D² = {sum} ({kind}).
:::

## If you could tell which slit a particle used, what happens to the fringes? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Which slit
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Knowing which slit
:::

<b>This step answers: how are path information and interference related?</b> The fringe visibility V and the distinguishability D (how reliably a detector tells which slit was used) obey V² + D² ≤ 1 (the ideal equality case is used here). D = 0: no idea which slit, fully clear fringes; D = 1: full knowledge, fringes vanish and only the sum of two single-slit patterns remains. What matters is not “disturbance” but whether information can tell the two paths apart. Drag D. {#s3e .explain}

::: html step3-2
s3cv: The intensity curve and grey strip losing fringe contrast as the distinguishability D grows
lblDist: Path distinguishability D
:::

## Electrons can interfere, so why can’t a baseball? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Matter waves
:::

::: html step4-1
s4step: "Step 4 · "
s4k: The wavelength of matter
:::

<b>This step answers: when does the wave nature become visible?</b> The de Broglie wavelength is λ = h/(mv). An electron at 10⁶ m/s has λ of about 7×10⁻¹⁰ m, comparable to crystal spacings, so it diffracts; a C₆₀ fullerene at 200 m/s has λ of about 3×10⁻¹² m and interference has still been observed experimentally; a baseball’s λ is about 10⁻³⁴ m, far too small to observe. The readout uses 100 nm slit spacing and a 1 m screen distance to estimate the fringe spacing and judge whether it could be resolved (spacing above 1 µm). The speed slider changes speed by a logarithmic factor. {#s4e .explain}

::: html step4-2
s4cv: Log-scale bars of the de Broglie wavelengths of an electron, neutron, C60 and a baseball with a cyan line at 100 nm
oElectron: Electron 10⁶ m/s
oNeutron: Thermal neutron 2200 m/s
oC60: C₆₀ molecule 200 m/s
oBall: Baseball 0.15 kg · 40 m/s
lblSpeed: Speed (log factor)
:::

::: strings
lblSlit: slit gap 100 nm
canSee: fringes could be resolved
cannotSee: cannot be resolved
s4ro: {name} (current speed {v} m/s): λ = h/(mv) = {lam} m; with 100 nm slits and a 1 m screen the fringe spacing is about {sp} m ({see}).
:::

## Which factors can make the fringes disappear? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 What decides it
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · what decides the fringes
:::

<b>This step answers: what does the clarity of the fringes depend on?</b> Three knobs: close the second slit (only the single-slit envelope remains); raise the path distinguishability D (the contrast V = √(1−D²) falls); widen the spread of wavelengths (fringes of different wavelengths shift against each other and blur out). The readout computes the visibility V = (I_max − I_min)/(I_max + I_min) from one fringe period on the screen. {#s5e .explain}

::: html step5-2
s5cv: The screen intensity curve and grey strip combining slit count, distinguishability and wavelength spread
slit2Open: Second slit: open
lblSpread: Wavelength spread (%)
recapTitle: Recap
recap1: The double-slit fringe spacing is Δy = λL/d; the width of each slit gives a sinc² single-slit envelope.
recap2: A single particle lands as one dot and the fringes are a probability distribution built from many; knowing which slit was used (V² + D² ≤ 1) removes the fringes.
recap3: The wavelength of matter is λ = h/(mv): wave behaviour is visible only when λ is comparable with the slit scale.
modelTitle: Scope and limits of the model
modelText: Model: far-field (Fraunhofer) scalar waves, an ideal monochromatic coherent source; the visibility V = √(1−D²) is the ideal equality case; landing points are random draws from the intensity curve and the detection process is not simulated. Real electron double-slit experiments involve electron optics and detector efficiency; the page offers no interpretation of “measurement” and shows only its observable consequences.
link0: → Wave Interference: path difference and reinforcement
link1: → Quantum Basics: amplitudes and measurement
link2: → Photoelectric Effect: the particle side of light
:::

Page complete. {#done .readout .success i18n=text}

::: strings
axY: screen position y (mm)
lblSpacing: Δy = {s} mm
s0ro: λ = {lam} nm, d = {d} mm, L = {L} m: fringe spacing Δy = λL/d = {s} mm; the m-th bright fringe is at y = m·Δy.
lblEnv: cyan: one slit open
s1ro: Slit width {a} µm, separation {d} mm: the envelope’s first zeros are at ±{z} mm, fringe spacing {sp} mm, about {n} bright fringes in the central envelope; d/a = {ratio}.
slit2Closed: Second slit: closed
kClear: clear fringes
kFaint: faint fringes
kGone: fringes gone
s5ro: {slit}; D = {D}; wavelength spread {sp}%: visibility V = {V} ({kind}).
:::
