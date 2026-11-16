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
pageTitle: Quantum Tunnelling · What Passes Through the Wall Is a Probability
tagline: A wave hits a wall higher than its energy: most of it bounces back and a small share gets through — and the scanning tunnelling microscope runs on that small share.
:::

## A classical particle is always turned back, but a quantum wave leaks past {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Classical vs quantum
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Not enough energy to climb
:::

This step asks: what happens when the particle’s energy is below the barrier? A **barrier** is a region where the particle must “pay energy” to be; here it is a rectangular wall 1 eV high and a wide. The squared **wave function** |ψ|² is the probability density of finding the particle at each place (units where the incoming wave is 1). A classical particle with E &lt; 1 eV is always reflected and finds nothing behind the wall; quantum mechanics (matching ψ and its slope at both edges) gives |ψ|² decaying exponentially inside and a share still present behind, so the **transmission probability** T is the value of |ψ|² behind the wall (green dashes), and the reflection is R = 1 − T. **What to do:** drag the energy E or the width a: a thinner wall or an energy closer to the top raises the green line. The ripples to the left are the incoming and reflected waves adding up. The particle is an electron-mass steady plane wave, E and V₀ in eV, lengths in nm. {#s0e .explain}

::: html step0-2
s0cv: Steady-state probability density |ψ|²: decays inside the wall, a share remains behind (green dashes)
energyL: Particle energy E (eV)
widthL: Barrier width a (nm)
:::

::: strings
xAxisNm: position x (nm)
densLab: |ψ|²
barrierLab: barrier V₀ = {v} eV, width {a} nm
legRight: behind the wall |ψ|² = T = {T}
classical: classical: behind = 0
s0ro: E = {e} eV < V₀ = {v} eV, width {a} nm: decay constant κ = {kap} per nm; transmission T = {T}, reflection R = {R}, T + R = {sum} (the particle does not vanish).
:::

## How much does the transmission drop for each extra bit of wall? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Thicker is harder
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Thicker is harder
:::

This step asks: how sensitive is the transmission to the wall’s width? The wave inside decays as e<sup>−κx</sup> with κ = √(2m(V₀ − E))/ħ, and for a fairly thick wall T ≈ e<sup>−2κa</sup>. The vertical axis is a base-10 logarithm, so a straight line means exponential decrease. **What to do:** drag the width a and watch the orange point slide along the curve; each extra 0.1 nm multiplies T by about e<sup>−2κ·0.1</sup> (the readout gives the reciprocal factor); then drag the energy E: lower E means larger κ and a steeper curve. The result: tunnelling falls **exponentially** with width, which is why the microscope in step 4 can resolve single atoms. {#s1e .explain}

::: html step1-2
s1cv: Transmission T (log scale) against wall width: close to a straight line down
:::

::: strings
widthAxis: wall width a (nm)
TAxis: T (log scale)
s1ro: E = {e} eV, a = {a} nm: T = {T}; κ = {kap} per nm; every extra 0.1 nm shrinks T to about 1/{f} of its value (divide by {tenth}).
:::

## If the energy is above the top, does it always get through? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Energy matters
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Energy and “clearing the top”
:::

This step asks: how does the transmission change with the particle’s energy? The red dashes show the classical prediction: E &lt; V₀ all reflected (T = 0), E &gt; V₀ all transmitted (T = 1). The quantum curve (cyan) differs in two places: on the left (E &lt; V₀) T is not 0 — that is tunnelling; on the right (E &gt; V₀) T can be below 1, so there is reflection even above the top, and T = 1 only when the wave inside fits a whole number of half-wavelengths (a resonance). **What to do:** drag the energy E to find a resonance, and change the width a to see how the peaks move and crowd together: the wider the wall, the denser the peaks. {#s2e .explain}

::: html step2-2
s2cv: Transmission T against energy: cyan quantum result, red dashes the classical prediction
:::

::: strings
energyAxis: energy E (eV), barrier V₀ = 1 eV
TAxis2: transmission T
belowTop: energy below the top
aboveTop: energy above the top
classicalStep: classical: T = 0 or 1
clBlocked: classical prediction: blocked
clPasses: classical prediction: fully passes
s2ro: E = {e} eV, a = {a} nm: quantum transmission T = {T}; {cl}.
:::

## Send a lump of particle at the wall and watch it split {#step3 h2=s3t pre=1}

::: strings
nav3: 3 A packet hits the wall
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: A moving wave packet
:::

This step asks: instead of a steady wave, what happens when a real, localised wave packet hits the wall? A **wave packet** is a finite lump of wave standing in for a particle whose position is uncertain. Here we solve the time-dependent Schrödinger equation numerically in dimensionless units (ħ = m = 1): the packet starts on the left, its wave number k₀ sets the energy E = k₀²/2, and the wall height is fixed at 2 (orange line). The three bars at the bottom show the probability of finding the particle left of the wall, inside it, and to its right. **What to do:** press Run and watch the packet split into a reflected and a transmitted part; raise k₀ or narrow the wall and the right-hand share grows. Note that a packet carries a spread of energies, so the readout’s “single-energy T” is only a rough comparison. {#s3e .explain}

::: html step3-2
s3cv: A packet hitting the wall: cyan is probability density, the orange line the wall; bars show each region’s probability
run: Run
resetSim: Reset packet
kL: Wave number k₀ (energy E = k₀²/2)
widthDL: Wall width w (dimensionless)
:::

::: strings
pause: Pause
barrierShort: wall V₀ = 2
eLine: E = {e}
partL: left of wall
partB: inside wall
partR: right (transmitted)
clock3: simulation time t = {t}
s3ro: E = {E}, V₀ = {v}, w = {w}: probability now left {L}%, inside {B}%, right {R}% (sum {sum}); single-energy estimate T = {T}%.
:::

## Move the tip a little farther away and the current falls hugely — how does that draw a landscape? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 The tunnelling microscope
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Seeing atoms by tunnelling
:::

This step asks: how does a scanning tunnelling microscope (STM) draw atoms from a tunnelling current? The vacuum gap between tip and surface is the barrier, and electrons must tunnel across, giving a current I ∝ e<sup>−2κd</sup> with κ = √(2mφ)/ħ, where φ is the **work function** (the energy needed to pull an electron out of the metal, about 4–5 eV) and d is the gap. The model: a row of atoms with one taller atom (an adatom); the tip sweeps at fixed height and the current (log scale, relative to the value above the adatom) rises and falls. **What to do:** press Scan to watch the trace being drawn; the gap d only rescales the whole current (not the relative ups and downs), while a larger work function φ gives a larger κ and sharper variations. A height change of only 0.1 nm changes the current about ten-fold, which is the sub-nanometre sensitivity. This is a simplified constant-height model. {#s4e .explain}

::: html step4-2
s4cv: Top: surface and tip; bottom: tunnelling current while scanning (log scale, relative to above the adatom)
scanBtn: ▶ Scan once
gapL: Gap d from the tip to the highest point (nm)
phiL: Work function φ (eV)
:::

::: strings
tip: tip
surface: surface
currentRel: relative current (log scale)
s4ro: d = {gap} nm, φ = {phi} eV: κ = {kap} per nm; each 0.1 nm of height changes the current {per}-fold; the current above the adatom is {contrast} times that between atoms (the adatom is {adatom} Å taller).
:::

## Why can an electron tunnel but a person cannot walk through a wall? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Why nobody walks through walls
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Big and small
:::

This step asks: how sensitive is tunnelling to the particle’s mass? For the same wall (height V₀ = 2 eV, particle energy E = V₀ − ΔE) the transmission goes as e<sup>−2κa</sup>, and κ = √(2m(V₀ − E))/ħ grows as the square root of the mass. For an electron, a proton (1836 times heavier), a 1-microgram speck of dust and a 70 kg person, the readout gives the order of magnitude of T as a power of ten. **What to do:** drag the thickness a and the energy gap ΔE: the electron keeps a visible chance, the proton is pushed below 10⁻¹⁰⁰, and for the dust and the person even the exponent is astronomical. That is not “absolutely impossible”; it simply never happens in the age of the universe. Bar length is the logarithm of the number of digits in −log₁₀ T. {#s5e .explain}

::: html step5-2
s5cv: Transmission through the same wall for different particles (orders of magnitude)
gapEL: Energy gap ΔE = V₀ − E (eV)
recapTitle: Recap
recap1: Particles are waves: below the barrier the wave function decays exponentially inside the wall and a share T ≈ e^(−2κa) remains behind; T + R = 1.
recap2: Tunnelling falls exponentially with width and steeply with mass and energy gap; above the top there is still reflection and resonance.
recap3: Use: the scanning tunnelling microscope uses the current’s exponential sensitivity to the gap to resolve single atoms; for everyday objects tunnelling is so small it never happens.
modelTitle: Scope and limits of this model
modelText: Scope: one-dimensional rectangular barrier, steady plane waves and a Gaussian packet, non-relativistic, spinless, single-particle. Step 3’s time-dependent run uses finite differences and the packet has an energy spread, so it only roughly matches the single-energy T. The STM part is a simplified constant-height model (no tip shape, no density of states). Step 5 extrapolates the exponential formula for orders of magnitude and has no experimental meaning for everyday objects.
link1: → Quantum basics: amplitude, probability and measurement
link2: → Interference: the ripples before the wall are incoming plus reflected waves
link3: → Photoelectric effect: another place where energy meets quanta
:::

Page complete. {#done .readout .success i18n=text}

::: strings
p_elec: electron
p_prot: proton
p_dust: 1 µg of dust
p_person: 70 kg person
tVal: T ≈ {x}
barNote: bar length = log of the digit count (longer = harder)
s5ro: Wall {a} nm thick, ΔE = {de} eV: electron T ≈ {e1}; proton T ≈ {e2}; the proton’s exponent is about {ratio} times the electron’s (√1836).
docTitle: Quantum Tunnelling · What Passes Through the Wall Is a Probability
:::
