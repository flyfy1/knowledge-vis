---
lang: en
---

::: strings
docTitle: Frequency Response & Filters · The Picky Box · One Interaction per Step
back: ← Knowledge Index
pageTitle: Frequency Response & Filters · The Picky Box
tagline: An LTI box answers a sine wave with a sine wave of the same frequency — only scaled, only delayed. Plot the pass rate |H(ω)| and the lateness φ(ω) against frequency and you have the box’s entire character: its frequency response. It is both a system’s medical report and a filter’s blueprint — filtering is just being picky by frequency. Every curve on this page is measured and computed live.
foot: visual.integ.life · Frequency Response & Filters — one interaction per step
:::

## A box that is picky by frequency {#step0 h2=s0t}

::: strings
nav0: 0 The Picky Box
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

Start with a box of unknown principle. The top trace is a **slow, clean sine wave** buried under a layer of **fast, fine noise**. Feed it through the box and look at the output — most of the noise is gone, the slow wave is almost untouched. The box has never seen this waveform. How does it know what to keep and what to throw away? <a class="fourier-link" href="../../transforms/fourier/#step5">Who splits a signal into these frequencies: the spectrum step on the Fourier page →</a> {#s0e .explain}

::: html step0-1
:::

The answer: it **judges by frequency alone**. Below, feed it pure sine waves one notch at a time: the higher the frequency, the shorter the output. Measure each frequency once, record “output amplitude ÷ input amplitude” as a point — sweep through them all and the box’s menu appears. {#s0e2 .explain}

::: html step0-2
s0fLab: Probe sine frequency f
:::

A convention, stated where it belongs: the **output waveform** above is drawn by analytic steady-state superposition (each component scaled by the closed-form |H| and shifted by the closed-form φ), while the **pass-rate readouts** below are measured by an ODE time-domain simulation — two different engines on one screen; step 1 sets them side by side as two cards and audits them against each other. {#s0engNote .hint}

This box is in fact the hero of the whole page: a first-order **RC low-pass**. Its pass rates across frequencies form the curve called the **frequency response |H(ω)|**; how much it delays each frequency is a second curve, φ(ω). This page measures both curves, teaches you to read them, and then turns them around to design filters. {#s0hint .hint}

::: html step0-3
start: Start exploring ↓
:::

::: strings
s0ro: f = <span>{f} Hz</span> · measured pass rate |H| = <span>{g}</span> (steady-state amplitude ratio from a time-domain simulation) · <span>{n}</span> frequency points measured so far
cv0In: Input: 0.5 Hz sine + 7 Hz noise
cv0Out: Output: noise mostly blocked, slow wave survives
cv0InTone: Probe sine (input)
cv0OutTone: The box’s answer (output)
cvFreq: Frequency f (Hz, log axis)
cvGain: Pass rate |H|
:::

## Sine in, sine out: only two things change {#step1 h2=s1t}

::: strings
nav1: 1 Sine In, Sine Out
:::

Step 1 · What a Frequency Response Is {#s1k .step-kicker i18n=text}

Open the box: a resistor R and a capacitor C, output taken across the capacitor — the classic first-order **RC low-pass**. Feed it cos(ωt) and, once the transient dies out, the output is **still a sine of the same frequency**, with only two changes: its amplitude is multiplied by |H(ω)|, and its phase is pushed back by φ(ω). The two cards below record the answer at the current frequency side by side: one **computed from the formula** (the analytic card), one **measured off the simulated waveform with an oscilloscope mindset** (the measured card: the page really integrates the circuit equation with RK4, then projects the steady-state waveform to extract amplitude and phase). If the two cards disagree, neither can be trusted. Drag ω through the range; every frequency you visit lights a point on the |H| curve below. {#s1e .explain}

::: html step1-1
:::

H(jω) = 1 / (1 + jωRC), τ = RC = 1 s, ωc = 1/τ = 1 rad/s {#s1formula .formula i18n=text}

::: html step1-2
s1wLab: Input angular frequency ω
s1cardA: Analytic card · from the formula
s1cardB: Measured card · from the waveform
:::

Look closely at ω = ωc = 1: |H| is exactly 1/√2 ≈ 0.707 and φ is exactly −45°. This frequency is the **cutoff**, and the next step’s whole Bode plot revolves around it. One definition, stated plainly: “measured” means **steady state** — the brief switch-on transient does not count. The simulation lets the circuit run for 6τ plus several periods before measuring, and the reviewers use the same convention (the method is printed under the measured card). {#s1hint .hint}

::: strings
s1anaSub: |H| = 1/√(1+(ωτ)²), φ = −atan(ωτ)
s1meaSub: RK4 integration of the circuit ODE (step = period/240); amplitude & phase projected over 2 steady periods
s1ro: ω = <span>{w} rad/s</span> · gap between the two routes: |Δ|H|| = <span>{dm}</span>, |Δφ| = <span>{dp}°</span> · <span>{n}</span> frequency points lit so far
cv1In: Input cos(ωt)
cv1Out: Output (steady, same frequency)
cvMag: |H(ω)|
cvLit: Points you measured yourself
cvCurve: Analytic curve
:::

## The Bode plot: how engineers read it {#step2 h2=s2t}

::: strings
nav2: 2 The Bode Plot
:::

Step 2 · The Bode Plot {#s2k .step-kicker i18n=text}

Put the two curves from step 1 on a **logarithmic frequency axis**, with amplitude in **decibels** (dB = 20·log₁₀|H|), and you get the **Bode plot** engineers stare at all day. Drag R and C and the cutoff ωc = 1/(RC) moves with them: the −3 dB point (where |H| = 1/√2) is marked on the magnitude plot, the high-frequency asymptote hugs the curve at **−20 dB/dec** (every 10× in frequency costs 20 dB), and φ(ωc) = −45° is marked on the phase plot — all three annotations are computed live from the current R and C. {#s2e .explain}

::: html step2-1
s2rLab: Resistor R
s2cLab: Capacitor C
s2quizT: Reading drill: don’t compute — read
s2quizNext: Next question
:::

The Bode trick: the curve is flat at 0 dB at low frequency, then past ωc it hugs the −20 dB/dec ramp — so if you know where ωc sits, you can sketch the whole curve freehand to within a dB or two. Two such stages ideally cascaded give a −40 dB/dec ramp (step 6 uses this; “ideal” because a real passive cascade loads its predecessor — stages need a buffer between them). {#s2hint .hint}

::: strings
s2ro: τ = RC = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · at ωc: |H| = <span>0.7071 (−3.01 dB)</span>, φ = <span>−45.0°</span> · high-frequency slope (numerical difference between 10ωc and 100ωc) = <span>{slope} dB/dec</span>
s2quizQmag: Read the magnitude plot above: at **ω = {w} rad/s**, roughly what is |H| in dB?
s2quizQph: Read the phase plot above: at **ω = {w} rad/s**, roughly what is φ in degrees?
s2quizRight: <span class="good">Correct.</span> True value {v} (computed live from the formula). {n} answered, {c} correct.
s2quizWrong: <span class="bad">Not quite.</span> The true value is {v} — find the vertical line at ω = {w} on the plot, then read across. {n} answered, {c} correct.
s2quizIdle: Pick the value you read off the plot. The truth is computed live from the formula — nothing is pre-baked.
s2quizRegen: A new question has been generated. Read the plots for the current R/C values before answering.
cvDb: Magnitude (dB)
cvPhase: Phase φ (deg)
cvCut: −3 dB point (ωc)
cvAsym: Asymptote −20 dB/dec
cvM45: φ = −45°
cvQuizPt: Quiz point
:::

## Moving-average zeros: executing one named frequency {#step3 h2=s3t}

::: strings
nav3: 3 Moving-Average Zeros
:::

Step 3 · Digital Filters {#s3k .step-kicker i18n=text}

Now discrete time: n is an integer sample index. Here ω is digital angular frequency (rad/sample, often written Ω), not the earlier RC model’s rad/s. Given a sample rate Fₛ, ω=2πf/Fₛ; without Fₛ no physical Hz value is assigned. A moving average averages the latest M samples. At ω=2πk/M, provided k is not divisible by M, those M contributions cancel. At 0 and integer multiples of 2π, |H|=1 instead. Predict the first zero, then compare the preset and actual output samples. {#s3e .explain}

::: html step3-1
s3formula: |H(ω)| = |sin(Mω/2)| / (M·|sin(ω/2)|); zeros: ω = 2πk/M, integer k not divisible by M; at ω=2πq, |H|=1.
s3mLab: Averaging length M
s3wLab: Input digital frequency ω (rad/sample)
s3pZero: Feed the zero 2π/M
s3pSide: Feed the first sidelobe peak
s3pPass: Feed a passband tone, 0.20
s3hint: Range: 0.05 to π rad/sample. Slider arrows step 0.005; Shift+arrow steps 0.05; Home selects 0.05 and End exact π. Presets keep exact frequencies rather than rounding to displayed decimals. With M=2 the first zero isπ; then change M to 3, predict amplitude 1/3 and compare analytic and measured values. A zero output cannot measure phase or delay. Sidelobes are not zeros: a moving average smooths but is no ideal stopband filter. <a class="fourier-link" href="https://www.analog.com/media/en/technical-documentation/dsp-book/dsp_book_ch15.pdf">Basis: Smith · moving-average response →</a>
:::

::: strings
s3ro: M = <span>{M}</span> · ω = <span>{w}</span> rad/sample · analytic |H| = <span>{ana}</span> · simulated steady-state amplitude = <span>{mea}</span>{sideSeg} · linear-phase group delay on nonzero bands = <span>{gd}</span> samples (phase/local group delay undefined at zeros)
s3sideSeg: " · first sidelobe peak |H| = <span>{side}</span> ({sidedb} dB)"
s3sideNoneSeg: " · first sidelobe peak: <span>none</span> (at M = 2 the zero already sits at π — no sidelobe inside [0, π])"
cv3In: Input x[n] = cos(ωn)
cv3Out: Output y[n] (steady segment)
cv3Zero: Zeros 2πk/M
cv3Cur: Current ω
cvMagW: |H(ω)| (ω: 0 → π)
:::

## Phase is character too: lateness wrecks waveforms {#step4 h2=s4t}

::: strings
nav4: 4 Phase Wrecks Waveforms
:::

Step 4 · Phase {#s4k .step-kicker i18n=text}

The first three steps stared at |H|. Now the other half of the character: **phase**. Two boxes compete: a **pure delay** (|H| identically 1 — it cuts no frequency at all — with phase −ωτ<sub>d</sub> growing linearly with frequency) and the **RC low-pass** (|H| cuts the highs, and its phase −atan(ωτ) is bent). Feed both the same pulse train: the delay’s output is merely late, its **shape identical**; the RC output has rounded edges and a tail — because its frequency components are delayed by different amounts, the formation they marched in with falls apart. Below are the two phase curves and the RC’s **group delay** τ<sub>g</sub>(ω) = −dφ/dω, computed by numerically differentiating the phase formula: it varies with frequency, and that variation is exactly why the formation breaks up. {#s4e .explain}

::: html step4-1
s4sigLab: Test signal
s4sigPulse: Pulse train
s4sigSquare: Square wave
s4tauLab: Delay τd / RC τ (one shared slider)
:::

Judging by |H| alone breeds two illusions: that a delay “changes nothing” (it changes time itself), and that the RC “only turns the volume down” (it scrambles the waveform). In audio, phase distortion muffles the sound; in images, the equivalent effect blurs edges. **Magnitude decides whether each frequency is still present; phase decides whether they still recognize each other when they come back.** One more convention: the RC waveform above is the 0–8 s steady segment obtained by **pre-integrating the circuit from rest for 8 s**, after the transient has essentially died out — not the full switch-on transient from zero. The comparison is about steady-state shape-keeping versus deformation, so the switch-on moment is deliberately excluded. {#s4hint .hint}

::: strings
s4ro: τ = <span>{tau} s</span> · pure delay: |H| ≡ <span>1 (0 dB)</span>, φ(ω) = −ωτ, group delay constantly τ · RC: group delay falls from <span>{gd0} s</span> at ω=0 to <span>{gd2} s</span> at ω=2 — unequal lateness, so the waveform must deform
cv4In: Input
cv4Delay: Delay output (shape kept)
cv4RC: RC output (edges rounded)
cv4PhD: Delay φ = −ωτd (straight line)
cv4PhRC: RC φ = −atan(ωτ) (bent)
cv4Gd: RC group delay τg(ω) (right axis, s)
cvPhase4: Phase φ (deg)
:::

## High-pass, band-pass, resonance: one mathematics, three appetites {#step5 h2=s5t}

::: strings
nav5: 5 High-Pass & Band-Pass
:::

Step 5 · Different Wiring {#s5k .step-kicker i18n=text}

Same R and C — just take the output across the **resistor** instead, and the low-pass becomes a **high-pass** on the spot: |H(jω)| = ωτ/√(1+(ωτ)²). Low frequencies are blocked, highs pass, and the −3 dB point sits at the same ωc = 1/τ. Drag τ and watch the cutoff run; compare with step 2’s low-pass Bode plot — the two are mirror images. {#s5e .explain}

::: html step5-1
s5tauLab: RC high-pass τ (ωc = 1/τ)
:::

One more step: put a low-pass and a high-pass back to back so only a **middle band** of frequencies passes — a **band-pass**. The standard second-order band-pass H(jω) = 1 / (1 + jQ(ω/ω₀ − ω₀/ω)) peaks at ω₀ with height 1, and the **quality factor Q** sets how fat the peak is — larger Q, sharper peak. One readout below is a live audit: the half-power bandwidth Δω measured off the curve (the distance between the two points where |H| falls to 1/√2 of the peak) must satisfy **Q = ω₀/Δω** — whether the measured number matches the slider is for the digits to say. This is a normalized band-pass output. A spring’s displacement/force response has a different numerator, so its peak location and height cannot be copied from this curve. <a class="fourier-link" href="../../../atlas/?trail=response&amp;node=resonance#response-lab">Compare damping, displacement peaks and poles in the atlas →</a> {#s5e2 .explain}

::: html step5-2
s5f0Lab: Band-pass peak f₀
s5qLab: Quality factor Q
:::

Tuning a radio is band-pass work: the peak aims at the station, and Q decides whether the neighboring station bleeds in. Too small a Q and two stations mush together; too large and the peak is so sharp it shaves the station’s own high frequencies. Even pickiness has to be portioned right. {#s5hint .hint}

::: strings
s5hpro: τ = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · at ωc, |H| = <span>0.7071</span> and φ = <span>+45.0°</span> (the high-pass leads where the low-pass lags — same magnitude, opposite sign) · at ω = 0.1ωc, |H| = <span>{lo}</span> (lows cut to about a tenth)
s5bpro: f₀ = <span>{f0} Hz</span> · Q set = <span>{q}</span> · measured half-power points f₁ = <span>{f1} Hz</span>, f₂ = <span>{f2} Hz</span>, Δf = <span>{bw} Hz</span> · Q recovered from the measurement, f₀/Δf = <span>{qchk}</span> (audited against the setting)
cv5hp: RC high-pass |H(ω)|
cv5bp: Second-order band-pass |H(f)|
cv5bpPh: Band-pass phase φ(f)
cv5cut: −3 dB point ωc
cv5half: Half-power points (peak/√2)
cv5peak: Peak f₀
:::

## Design bench: build a filter to spec {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Design Bench
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The last step is an exam. The job: in one signal, **50 Hz is the wanted signal and 500 Hz is interference**. The toolbox holds three tools; the parameters are yours; press “Verify” and the page computes the attenuation at both frequencies from the chosen filter’s |H| formula, **live** — how much margin, how many dB short, reported on the spot, no pre-baked verdicts. One spoiler: a first-order RC cannot pass at any setting (its rolloff is too gentle) — a direct consequence of step 2’s −20 dB/dec. The second-order cascade and the moving average each have a way through — and the moving average’s way hides in its zeros: at Fs = 4000 Hz the zeros sit at k·(4000/M) Hz. What M puts 500 Hz exactly on a zero? {#s6e .explain}

::: html step6-1
s6spec1: Keep the <b>50 Hz</b> signal: attenuation <b>≤ 1 dB</b>
s6spec2: Kill the <b>500 Hz</b> interference: attenuation <b>≥ 20 dB</b>
s6toolRc1: First-order RC low-pass
s6toolRc2: Second-order RC cascade (ideal)
s6toolMa: Moving average (Fs = 4000 Hz)
s6fcLab: Cutoff frequency fc
s6mLab: Averaging length M
s6judge: Verify →
:::

Two conventions, stated plainly. First, the second-order option is an **ideal cascade**: the two RC stages are assumed isolated by a buffer amplifier, so |H| is the square of the first-order one; a real passive cascade suffers loading — the second stage drags on the first and the curve changes shape (in hardware you either add the buffer or re-derive the network as a whole). Second, the moving average’s attenuation is computed from the Dirichlet formula with the digital frequency ω = 2πf/Fs at Fs = 4000 Hz; when 500 Hz lands exactly on a zero the attenuation is a numerical zero, displayed capped as “>120 dB”. {#s6note .hint}

::: html step6-2
s6card1T: The equalizer
s6card1: The bass / mid / treble knobs on a stereo are a row of band-passes (step 5) with staggered peak frequencies wired in parallel: each governs one slice of the spectrum — a whole equalizer is a frequency-response curve cut into strips.
s6card2T: Image blur
s6card2: In a photo, high frequencies are edges and detail, low frequencies are broad color fields. A two-dimensional low-pass over the image (average each pixel with its neighbors) is the naive form of Gaussian blur — the same act as step 3’s moving average, with a sheet of pixels instead of a row of samples.
s6card3T: Radio tuning
s6card3: The air carries hundreds of stations and channels at once; a receiver uses a band-pass to pick out the target frequency and block the rest — step 5’s Q decides how clean the pick is. This bench’s “keep 50, kill 500” is what every receiver does every day.
s6fin: To wrap up: from medical report to blueprint it is **one and the same curve** — in step 1 you measured it one frequency at a time, in step 2 you learned the engineer’s way of reading it, steps 3 and 4 showed you the tempers of zeros and of phase, step 5 re-wired the same parts into high-pass and band-pass, and here you have used a spec to **build** with it. Anyone who can read a frequency response greets every black box with the same first sentence: **show me the pass rate and the lateness at every frequency.**
s6lkL: Laplace: reading resonance from poles →
s6lkZ: Z-transform: response on the unit circle →
s6lkLti: Impulse & LTI: the h fingerprint →
:::

::: strings
s6ro: Current: <b>{tool}</b>{param} · attenuation at 50 Hz = <span>{a50}</span> (needs ≤ 1 dB) · at 500 Hz = <span>{a500}</span> (needs ≥ 20 dB)
s6roParamFc: , fc = {fc} Hz
s6roParamM: , M = {M} (zeros at k·{z} Hz)
s6pass: <span class="verdict pass">PASS</span> Both specs met: 50 Hz attenuation {a50} ≤ 1 dB, 500 Hz attenuation {a500} ≥ 20 dB. Computed live from the formula — it passes because the numbers say so.
s6fail: <span class="verdict fail">REJECTED</span> {why}. Adjust and re-verify — the shortfall is computed from the formula; it cannot be talked away.
s6failKeep: the keep-50 spec is short by {gap} dB (attenuation {a50} exceeds the 1 dB cap)
s6failKill: the kill-500 spec is short by {gap} dB (attenuation {a500} is below 20 dB)
s6failBoth: both specs fail: keep-50 short by {g1} dB, kill-500 short by {g2} dB
s6idle: Not verified yet. Set the parameters and press “Verify” — the verdict is computed live from the |H| formula.
s6huge: >120 dB (numerical zero)
cv6keep: Keep: 50 Hz
cv6kill: Kill: 500 Hz
cv6Db: |H(f)| (dB)
cv6Spec1: −1 dB line
cv6Spec2: −20 dB line
:::
