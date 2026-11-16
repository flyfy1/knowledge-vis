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
pageTitle: Sound Is a Wave · Seeing Your Own Voice
tagline: Sound is a pattern of squeezing and loosening carried through air: frequency sets how close the pattern is, amplitude the loudness, and the wave’s shape the timbre; v = fλ ties speed, wavelength and frequency together. This page plays no sound, it only draws the waves.
:::

## When sound travels through air, what is moving? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Squeeze and stretch
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: A wave in air
:::

This step asks: what is it that travels when sound goes through air? The row of cyan dots above stands for a row of air molecules (a sketch); the source squeezes and loosens them, and the tight places (bright dots) and loose places (dim dots) travel forward — but each dot only shuffles a little around its own spot and does not run along with the wave (the displacement is hugely exaggerated here; the real one is micrometres). The orange curve below is the **pressure** change at each place: peaks are the tightest, troughs the loosest. The length of one squeeze-and-loosen pattern is the **wavelength λ** (green segment), and how many patterns pass in a second is the **frequency f**. Sound travels in air at about 343 m/s. **What to do:** drag the frequency: the pattern gets denser and λ = v/f shorter; drag the amplitude: the contrast grows (louder, see [[sound-vibration#step1|loudness]] on the previous page) but the spacing stays. The animation is slowed 250 times and can be paused. {#s0e .explain}

::: html step0-2
s0cv: Top: a row of air dots squeezed or stretched by a sound wave; bottom: the pressure along the row (orange)
pause: Pause
freqL: Frequency f (Hz)
ampL: Amplitude (relative)
:::

::: strings
resume: Resume
particles: a row of air dots (displacement exaggerated)
pressure: pressure
slowNote: slowed {s} times
s0ro: f = {f} Hz: period T = 1/f = {T} ms; in air v = {v} m/s, so λ = v/f = {lam} m; the 4 m shown holds {cyc} wavelengths.
:::

## For one sound wave, how is a period on an oscilloscope related to a wavelength on the ground? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 v = fλ
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Seen in time, seen in space
:::

This step asks: how do frequency and wavelength connect? The top plot records the pressure at **one fixed place** against **time** (like an oscilloscope screen): the time for one full ripple is the **period T**, T = 1/f. The bottom plot is a photograph at **one instant** of the pressure against **position**: the length of one full ripple is the **wavelength λ**. The wave advances one wavelength per period, so the speed is **v = fλ** (λ = v/f). **What to do:** choose a medium (air 343, water 1480, steel 5000 m/s) and drag the frequency: at the same frequency the period is unchanged (top plot the same) while the wavelength grows with the medium’s speed (bottom plot stretches); in one medium a higher frequency means a shorter wavelength. {#s1e .explain}

::: html step1-2
s1cv: Top: pressure–time at a fixed place (period T); bottom: pressure–position at one instant (wavelength λ)
med_air: Air 343 m/s
med_water: Water 1480 m/s
med_steel: Steel 5000 m/s
:::

::: strings
timeTrace: time trace
spaceSnap: position snapshot
s1ro: {med} (v = {v} m/s), f = {f} Hz: period T = {T} ms, wavelength λ = v/f = {lam} m; check f×λ = {chk} m/s (should equal v).
:::

## Why do two almost-equal pitches played together swell and fade, “wah — wah —”? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Beats
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Two sounds together
:::

This step asks: what happens when two sound waves add? The pressure at a point is the sum of what each wave would produce (the principle of superposition, as in [[standing-wave#step0|standing waves]]). When two frequencies f₁ and f₂ are close, they are sometimes in step (adding up, louder) and sometimes out of step (cancelling, quieter), so the amplitude of the sum swells and fades at the frequency |f₁ − f₂|: this is a **beat**, and the **beat frequency** is |f₁ − f₂|. Cyan is the sum and orange its envelope (the outline of the swelling). **What to do:** slide f₂ toward f₁: the swelling slows down and disappears when they are equal; above a difference of about 15 Hz it sounds like a rough flutter rather than separate beats (a property of the ear, not of the formula). Piano tuners use beats to line up two strings. No sound is played here, only the waveform is drawn. {#s2e .explain}

::: html step2-2
s2cv: Two waves added: cyan is the sum, orange the envelope; the green line is the length of one beat
faL: Frequency of sound 1, f₁ (Hz)
fbL: Frequency of sound 2, f₂ (Hz)
:::

::: strings
legSum: the sum
legEnv: envelope (outline of the swelling)
beatPeriod: one beat {p} ms
steady: same frequency, no beats
slowBeats: slow beats: you hear swell and fade one at a time
rough: a larger gap, heard more like a rough flutter
s2ro: f₁ = {a} Hz, f₂ = {b} Hz: beat frequency |f₁ − f₂| = {df} Hz; the sum’s mean frequency is about {avg} Hz ({kind}).
:::

## Why does the same note sound different on a piano and a violin? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Timbre
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Same pitch, different timbre
:::

This step asks: what decides timbre? Besides the sine wave at the fundamental frequency f (the 1st harmonic), an instrument sounds sine waves at 2f, 3f, 4f… at the same time (the **harmonics**) with different strengths; added together the whole still repeats every 1/f (the pitch is unchanged) but the waveform’s shape differs, and that is the **timbre**. The bars on the right show each harmonic’s strength (the spectrum). Three modes: a pure sine with only the fundamental; only odd harmonics (clarinet-like, squarer waveform); all harmonics (violin-like, sawtooth-like). The slider b sets how fast higher harmonics fade: strength ∝ n⁻ᵇ. **What to do:** switch modes and drag b: the green segment (one period) is always the same length while the curve’s shape (how pointed or square) changes. {#s3e .explain}

::: html step3-2
s3cv: Left: the waveform at one fundamental frequency (220 Hz); right: strength of each harmonic (the spectrum)
mode_sine: Pure sine (fundamental only)
mode_odd: Odd harmonics only
mode_all: All harmonics
rollL: Roll-off exponent b of higher harmonics (larger = mellower)
:::

::: strings
samePeriod: one period {T} ms, pitch unchanged
spectrum: harmonic strength
s3ro: {mode}, b = {b}, fundamental {f} Hz: {n} clear harmonics; 2nd harmonic strength {a2}, 3rd {a3}; waveform peak (before normalising) {pk}.
:::

## You count some seconds from the flash to the thunder: how do you get the distance? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 How far is the thunder
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: How far is the thunder
:::

This step asks: how can the speed of sound estimate how far lightning is? Light arrives almost instantly (3×10⁸ m/s) while sound in air travels about 343 m each second (331.3 m/s at 0 °C and about 0.6 m/s more per degree: v ≈ 331.3 + 0.606T), so the gap between flash and thunder is the time the sound needs for that distance: d = v·Δt. About 3 seconds per kilometre. **What to do:** drag the temperature and the gap: a longer gap means farther away; warmer air carries sound slightly faster so the same gap means a slightly larger distance; the readout also gives the time light takes, too small to matter. This is uniform-air approximation; real speed also depends on wind, humidity and height. {#s4e .explain}

::: html step4-2
s4cv: Top: distance from the lightning (orange) to you (green); bottom: the speed of sound against temperature
tempL: Air temperature (°C)
delayL: Gap from seeing the flash to hearing the thunder (s)
:::

::: strings
lightning: lightning
you: you
tempAxis: temperature (°C)
speedAxis: speed of sound (m/s)
s4ro: Temperature {T} °C: speed of sound {v} m/s; gap {dt} s → distance {d} m ({km} km); about {perKm} s per kilometre; the light needs only {light} microseconds.
:::

## Is every sound something a human ear can hear? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 What we can hear
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: What we can hear
:::

This step asks: how wide is the range of sound-wave frequencies and which part can we hear? The horizontal axis is frequency (log scale, 1 Hz to 1 MHz). The human ear hears roughly 20 Hz to 20,000 Hz; below that is **infrasound** (violet, such as elephant rumbles and earthquakes) and above it **ultrasound** (orange, such as bats and medical imaging). The cyan bars are rough ranges for some sources. Drag the slider to read the wavelength in air, λ = 343/f: about 17 m at 20 Hz and only about 1.7 cm at 20 kHz. There is also a classification question: choose which band the frequency belongs to and press Check; “Next” gives another frequency and “Start over” zeroes the score. {#s5e .explain}

::: html step5-2
s5cv: The frequency axis (log): infrasound, audible and ultrasound, and the rough ranges of some sources
logFreqL: Frequency (log slider)
infra: Infrasound
audible: Audible
ultra: Ultrasound
chk5: Check
nx5: Next
rs5: Start over
recapTitle: Recap
recap1: Sound is a squeeze-and-loosen pattern travelling through a medium: frequency f sets how dense the pattern is and the wavelength is λ = v/f; v = fλ joins the period in time to the wavelength in space.
recap2: Two close frequencies added make beats at |f₁ − f₂|; the strengths of the harmonics set the waveform, i.e. the timbre, while the pitch is set only by the fundamental.
recap3: The speed of sound depends on the medium and temperature (air about 343 m/s, water 1480, steel 5000); humans hear roughly 20 Hz–20 kHz, beyond which are infrasound and ultrasound.
modelTitle: Scope and limits of this model
modelText: Scope: one-dimensional, linear, lossless sound waves; speed v is constant (air 343 m/s, with a temperature formula as approximation); displacements are exaggerated for the picture and the animation is slowed 250 times; beats and timbre are computed from ideal sine sums without the ear’s complex hearing; the “range we can hear” gives typical values and individuals vary a lot; this page plays no sound at all — everything is drawn from computed waveforms.
link1: → Sound from vibration: loudness and pitch first
link2: → Doppler effect: why frequency changes when the source moves
link3: → Standing waves: two waves adding up can also leave fixed nodes
:::

Page complete. {#done .readout .success i18n=text}

::: strings
mk_elephant: elephant calls
mk_voice: human voice
mk_piano: piano
mk_dog: dog hearing
mk_bat: bat echolocation
s5ro: Frequency {f}: wavelength in air {lam}, which is {kind}.
quizAsk: Question {n}: which band is {q}? Choose one and check. Score {score}/{tot}.
quizOk: Correct: {q} is {kind}. Score {score}/{tot}.
quizNo: Not quite: {q} is {kind}. Score {score}/{tot}.
docTitle: Sound Is a Wave · Seeing Your Own Voice
:::
