# BRIEF · blackbody-radiation 黑体辐射

category `physics`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: photoelectric-effect and quantum-basics cover quanta of light and amplitudes; kinetic-theory covers gas T; none teaches thermal spectra, Wien/Stefan laws or the UV catastrophe (<30% overlap).

## Steps
**0 Colour and T.** Knows: hot things glow. Question: what decides the colour? Input T 800–10000 K; seek λmax = b/T, display colour. Controls: slider recolours the ball, brightness from visible-band power, moves the peak line on a log wavelength strip. Holds: ideal blackbody; colour is an approximation.
**1 Spectrum.** Knows: peak. Question: how much energy at each wavelength? Input T; seek M(λ) from Planck, peak value, total σT⁴ and visible share. Controls: slider; grey references 3000/6000 K. Fixed y scale so growth is visible.
**2 Wien shift.** Knows: spectrum. Question: where do body, bulb, Sun peak? Input T 250–10000; seek b/T vs numerically found argmax. Controls: slider and four presets. Holds: peak per unit wavelength (not per frequency).
**3 T⁴ law.** Knows: spectrum area. Question: doubling T → ? Input T; seek σT⁴ and numerical integral of M(λ) (log grid 10 nm–5 mm, error <0.1%). Controls: slider.
**4 UV catastrophe.** Knows: Planck. Question: why does classical diverge? Inputs T, λ; seek classical/Planck ratio. Controls: sliders. Holds: Rayleigh–Jeans law for exitance 2πckT/λ⁴.
**5 Energy in lumps.** Knows: classical fails. Question: how do lumps tame it? Inputs T, λ; seek x = hc/(λkT), 1/(eˣ−1) vs 1/x. Controls: sliders move the marker. Links: photoelectric-effect#step0, quantum-basics#step0, kinetic-theory#step1.

## First-appearance terms
Blackbody, peak wavelength, Wien's law (0); radiant exitance, Planck's law (1); Stefan–Boltzmann law (3); Rayleigh–Jeans, ultraviolet catastrophe (4); quantum, hν, x = hc/(λkT) (5).

## Simulation vs reality
Ideal emitter with emissivity 1; display colour from a published approximation; exitance rather than radiance; the sliders sample the formula and add no noise; stars and bulbs deviate from blackbody curves.
