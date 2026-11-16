---
lang: en
---

::: strings
pageTitle: The Photoelectric Effect · Light Comes in Packets
tagline: Light on a metal: below a threshold frequency no electrons come out however bright it is; above it, the electrons' maximum energy follows only the frequency, and brightness sets only how many.
:::

## Light on a metal: when do electrons come out? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Light on metal
:::

::: html step0-1
:::

This step answers: when light hits a metal plate, under what conditions are electrons knocked out? Press play: the dots arriving from the left are **photons** (light in packets, with energy E = hf, where h is Planck's constant and f the light frequency), and the metal plate is on the right. When a photon is absorbed and E exceeds the metal's **work function** φ (the least energy needed to pull an electron out), one electron is ejected (idealised here as one electron per photon; real yields are far lower). Colour shows frequency, with dim violet/red for beyond the visible range. The metal here is sodium (φ ≈ 2.36 eV). {#s0e .explain}

::: html step0-2
s0o: First set f low (about 4) and play: photons keep arriving but no electrons leave; then raise f to 8 and replay: each photon frees one electron; raise the intensity and watch the electron count grow faster.
lF: Light frequency f (×10¹⁴ Hz)
lI: Intensity (photon arrival rate)
bPlay: Play / Pause
bReset: Reset: clear photons, electrons and counts
:::

::: strings
r0: Photon energy hf = {e} eV, work function φ = {phi} eV: {res}; {np} photons arrived, {ne} electrons ejected; maximum electron kinetic energy {ke} eV.
lIshort: intensity
barWave: Wave model: time for one atom to accumulate φ
barPhoton: Photon model: time to the first electron from the whole plate
resYes: hf > φ, electrons can be ejected
resNo: hf < φ, no electrons
:::

## One photon gives its energy to one electron: the energy ledger {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Energy ledger
:::

::: html step1-1
:::

This step answers: where does a photon's energy go? One photon hands all of its energy hf to one electron; φ of it is spent escaping the metal and the rest becomes kinetic energy: **E_k,max = hf − φ** (the maximum, for electrons leaving from the surface). If hf < φ one photon is not enough and the electron stays; several photons cannot pool their energy. The frequency where hf = φ is the **threshold frequency** f₀ = φ/h. In the figure the cyan bar is hf, the orange line is φ, the green part is the leftover kinetic energy; the meter on the right shows the photocurrent (the number of electrons), proportional to intensity. {#s1e .explain}

::: html step1-2
s1o: Choose sodium and raise f slowly from 3: the moment the bar top passes the orange line, kinetic energy and current appear. Then push the intensity to the maximum while keeping f below threshold: the current stays zero. Switch to zinc: where does the threshold move?
mCs: Cesium Cs (φ≈2.14 eV)
mNa: Sodium Na (φ≈2.36 eV)
mZn: Zinc Zn (φ≈4.3 eV)
:::

::: strings
r1: {metal}: hf = {e} eV, φ = {phi} eV, threshold f₀ = {f0}×10¹⁴ Hz; E_k,max = {ke} eV; photocurrent (relative) = {cur}.
nameCs: Cesium
nameNa: Sodium
nameZn: Zinc
:::

## Measure Planck's constant from experimental points {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Measure h
:::

::: html step2-1
:::

This step answers: can the photoelectric effect measure h? E_k,max = hf − φ is a straight line in f: the slope is h and the intercept is −φ. Drag f and press Record to add a "measured" point to the plot (with a fixed small simulated measurement error of ±0.04 eV — this is a simulation, not a real measurement). With enough points, a least-squares line fit gives h from the slope (true value 4.136×10⁻¹⁵ eV·s) and φ from the intercept. The right plot shows current against intensity: above threshold, current is proportional to intensity. {#s2e .explain}

::: html step2-2
s2o: Choose a metal and record at least 4 points at different f above threshold (the more spread out the better), and see whether the fitted h is close to 4.14; switch metal: the slope stays the same (h does not depend on the metal) and the intercept changes.
bAdd: Record a data point (f, max kinetic energy)
bClear: Clear all data points
:::

::: strings
r2: {metal}: {n} points recorded ({na} above threshold); fit: h ≈ {h}×10⁻¹⁵ eV·s, φ ≈ {phif} eV (true φ = {phi} eV).
needMore: at least 2 points above threshold are needed for a fit
:::

## Stopping voltage: push the electrons back with a retarding voltage {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Stopping voltage
:::

::: html step3-1
:::

This step answers: how can you measure the maximum kinetic energy of the electrons directly? Put a retarding voltage V on the collector: electrons must climb an eV barrier to reach it. When eV just equals E_k,max, even the fastest electrons fail, the photocurrent drops to zero, and that V is the **stopping voltage** V_s = E_k,max/e. This page assumes the electron energies are uniformly distributed from 0 to E_k,max, so I = I₀(1 − V/V_s); that is a simplification and real curves are rounder. The grey dashed curve is half the intensity: intensity changes the current, not V_s. {#s3e .explain}

::: html step3-2
s3o: Choose a metal, set f above threshold and sweep V from negative to positive: the current reaches zero at V = V_s; raise f and V_s moves right; compare V_s with E_k,max (the same number when E_k,max is in eV).
lV: Retarding voltage V (V)
:::

::: strings
r3: {metal}: hf = {e} eV, E_k,max = {ke} eV, V_s = {vs} V; current V = {v} V, photocurrent (relative) = {cur}.
:::

## Why can't the classical wave model explain it? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Where waves fail
:::

::: html step4-1
:::

This step answers: what would happen if light were a continuous wave? The wave model predicts that brighter light gives faster electrons (not seen in experiment), and that with dim light an atom must **accumulate** enough energy from the wave before releasing an electron. Estimate: an atom has a cross-section of about A = 10⁻¹⁹ m² and receives power P = I·A, so accumulating φ takes t = φ/(I·A). Photon model: the whole piece of metal (take 10⁻⁴ m²) receives I·A_plate/(hf) photons per second, so the first photon arrives after about hf/(I·A_plate). The bars below use a logarithmic time axis (seconds). In experiments electrons appear almost immediately (<10⁻⁹ s), consistent with the photon model. Sodium at f = 7×10¹⁴ Hz here. {#s4e .explain}

::: html step4-2
s4o: Raise the intensity from 10⁻⁴ to 1 W/m²: watch the orange bar (wave accumulation time) shrink from hours to the order of a second, yet it stays far longer than the blue bar (photon model, order of a billionth of a second).
lIlog: Intensity I (order of magnitude 10^x W/m²)
:::

::: strings
r4: I = {i} W/m²: the wave model needs {tc} s of accumulation per atom; the photon model gives the first electron from the whole plate after about {tp} s.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) light comes in photons, E = hf; (2) one photon gives its energy to one electron, E_k,max = hf − φ, with φ the work function; (3) below the threshold f₀ = φ/h there are no electrons however bright the light; (4) intensity sets only how many electrons (the current), not their maximum energy; (5) V_s = E_k,max/e; (6) the slope of the E_k,max–f line measures h. {#s5e .explain}

::: html step5-2
qq: Light below the threshold frequency shines on a metal and you raise its intensity to 10 times. What happens?
qo0: Electrons come out, 10 times as many as before
qo1: Still no electrons
qo2: The electron count stays the same but the energy rises
s5m: This is an idealised model: one photon frees at most one electron (real quantum efficiency is about 0.1%–10%), electron energies are uniformly distributed (reality is more complex), and contact potentials, temperature, surface condition and space charge are ignored. Work functions are common textbook approximations; the measurement error in step 2 is added artificially; step 4 is an order-of-magnitude estimate; the animation is a teaching slow-motion and photon or electron speeds are not real.
lk0: Atomic structure: why electrons are bound to atoms and need energy to break free
lk1: Lens: geometric optics, to contrast with light behaving as particles here
lk2: Interference: evidence for the wave nature of light, complementary to the photoelectric effect
:::

::: strings
qwhy: One photon has hf < φ, which is not enough to free an electron; more intensity just means more photons that each still fall short (check in step 1).
:::
