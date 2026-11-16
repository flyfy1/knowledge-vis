---
lang: en
---

::: strings
docTitle: Wave Interference · One Interaction per Step
back: ← Knowledge Index
pageTitle: Wave Interference
tagline: Two waves meet: some points get livelier, others go completely still — and the pattern of loud and quiet never moves. Starting from one wave's vibration, verify for yourself that the path difference decides reinforcement and cancellation.
foot: Wave Interference · One Interaction per Step
navLabel: Step navigation
nav0: 0 One wave
nav1: 1 Two sources
nav2: 2 A steady pattern
nav3: 3 Phase & addition
s3instant: Same P=({x}, {y}), same time t≈{time}s: y₁≈{a}A, y₂≈{b}A, y₁+y₂≈{sum}A. Instantaneous displacement is not cycle amplitude.
nav4: 4 Self-check
nav5: 5 Wrap-up
:::

## Read one wave first: every point just vibrates in place {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: This step answers: when a wave passes, how exactly does one point on the water move? Above is the top view: a **wave source** (the point emitting the wave) ripples the surface, concentric rings spread outward; bright rings are crests (the surface at its highest), dim rings are troughs. P is a small wood chip floating on the surface. Below left is the side profile: the horizontal axis is distance r from the source, the vertical axis is the **displacement y** of the surface above its rest level; the distance between two neighbouring crests is the **wavelength λ** (marked on the plot). The **amplitude A** is the largest displacement; the period T is the time P takes for one full vibration — here T = 4 s. Drag P (or use the sliders) and watch the bottom-right curve of P's displacement over time: P only bobs up and down, it does not drift away with the rings — a wave carries vibration, not the water itself. This page treats simple harmonic waves only: each point's displacement varies sinusoidally in time.
canvasLabel: Interactive diagram for this step; see the text above for how to operate it
lamLab: Wavelength λ (length units)
pxLab: P's x position (arrow keys work)
pyLab: P's y position (arrow keys work)
pause: ⏸ Pause
s0hint: What to watch, in order: first P itself (it only moves up and down), then the rings running outward — “the point stays, the pattern runs” is what a wave is.
:::

::: strings
play: ▶ Play
s0ro: λ = {lam}; P is at distance r = {r} from the source; P's displacement right now is y = {y} (swinging between −1 and 1, A = 1).
srcLab: Source
profTitle: Side profile (distance → displacement)
traceTitle: P's displacement vs time
:::

## Two sources: reinforcement or cancellation — only the path difference decides {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: This step answers: add a second source — which points get stronger, which get weaker? Sources S₁ and S₂ ripple together with the same frequency, wavelength and starting phase. Any point P receives both waves at once, and its displacement at every instant is the **sum** of the two waves' displacements — superposition (<a class="fourier-link" href="../../../signal/transforms/fourier/#step2">Step 2 of the Fourier page is all about this: a complex waveform = simple waves added →</a>). The difference of P's distances to the two sources is the **path difference Δr**. Drag P around and watch the three curves below: each wave's displacement at P, and their sum. At some points the two waves always rise and fall together and the combined amplitude reaches 2A; at others they always oppose each other, the sum stays 0 forever, and the point never moves — a **still point**. This settling of two superposed waves into a fixed pattern of strong and weak is called **interference**.
btnMax: Move P to a reinforcement point (Δr = 0)
btnMin: Move P to a still point (Δr = λ/2)
:::

::: strings
s1ro: r₁ = {r1}, r₂ = {r2}, path difference Δr = {dr}, i.e. Δr = {n}λ; the combined amplitude at P is {amp}A (single-wave amplitude A = 1).
clsMax: Reinforcement: the two waves arrive at P in step, rising and falling together; the combined amplitude is twice a single wave's.
clsMin: Cancellation: the two waves arrive at P exactly out of step; at every instant their displacements are exact opposites and sum to 0 — P is a still point and never moves.
clsMid: Neither full reinforcement nor full cancellation: amplitude is between 0 and 2A. Small motion is not an always-still point.
clsWordMax: reinforcement point
clsWordMin: still point
clsWordMid: intermediate interference
y1Lab: Wave 1 at P
y2Lab: Wave 2 at P
sumLab: Sum
silentMark: Still
stillPt: still point
:::

## Why the pattern is steady: strong and still points each trace a family of hyperbolas {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: This step answers: the ripples look like a jumble — why call the pattern steady? Join all points with Δr exactly kλ (k = 0, 1, 2, …) and you get a family of hyperbolas — the **reinforcement lines** (green); join all points with Δr exactly (k+½)λ and you get a second family — the **still lines** (red, dashed). Turn on the envelope view: the animation keeps playing and these lines do not move at all, because whether a point is reinforced or cancelled is fixed by its path difference alone, not by time. Drag the λ slider: the smaller λ, the more densely the two families pack. Conditions: the two sources must share one frequency with a constant phase difference; with different frequencies the strong and weak spots drift over time and no steady pattern forms.
envLab: Envelope view: overlay reinforcement and still lines
legMax: — Reinforcement Δr = kλ
legMin: ┄ Still Δr = (k+½)λ
:::

::: strings
s2ro: P: Δr = {dr} = {n}λ (λ = {lam}); combined amplitude = {amp}A.
:::

## Keep the same point and time; change only relative phase {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Phase marks progress through a cycle. The source phase difference φ is measured in radians (one turn is 2π). Editing φ pauses and keeps the current P and time t; all traces are immediately recalculated. Arrival phase also includes propagation: **δ=φ−2π(r₂−r₁)/λ**. Here d=r₂−r₁ is signed. The absolute path difference used for the earlier in-phase cases cannot replace it at general φ.
:::

Traces are the previous two cycles of the CURRENT-parameter analytic prediction, not recorded measurements; edits redraw the whole prediction. Right-end dots show the same instant. The first two rows span ±A; the sum row spans ±2A. Do not compare screen heights across these different scales. Cycle amplitude is the largest excursion, so a zero sum now does not imply zero amplitude. {#phaseTrace .hint i18n=text}

::: html step3-2
phaseSlider: Source phase φ/π (0–2; editing pauses)
:::

Predict: keep P equidistant and compare φ=0, 0.5π, π, 2π. The cycle amplitudes are 2A, √2A, 0, 2A. Then move P to either side and compare the signed propagation distance. Editing φ does not move P or advance the clock. {#phaseTask .hint i18n=text}

::: html step3-3
phiLab: Phase difference φ:
phi0: φ = 0 (in-phase start)
phiPi: φ = π (opposite start)
phaseReset: Reset Step3 & pause
:::

Model: linear sinusoidal waves of the same frequency, equal received amplitudes and fixed phase difference (coherence). A=1 is normalized displacement and T=4s is a teaching setting. Spreading, attenuation, reflection and dispersion are omitted. Rings illustrate crest positions, not a fluid solution. Still points use only floating-point-scale tolerance; near cancellation remains nonzero and tiny amplitudes are not rounded to an exact zero. {#phaseScope .hint i18n=text}

::: html step3-4
phaseEnergyTitle: Amplitude is not intensity
phaseEnergy: Amplitude is maximum displacement; intensity is average energy flow per area. Only under the appropriate same-medium, same-frequency traveling-wave assumptions does average intensity scale with amplitude squared. Do not call 2A “twice the intensity”. This page calculates neither energy flux in the 2D field nor source power, and cancellation at one point does not mean energy is destroyed.
phaseEnergySource: OpenStax16.4 · wave energy and power ↗
phaseMap: Back to the atlas: superposition & interference →
phaseSource: OpenStax16.5 · add waves at the same point ↗
:::

::: strings
s3ro: Directed path difference d={d} ({n}λ); source phase φ={phi}π rad, arrival phase δ≈{delta}π rad. Cycle amplitude B=2A|cos(δ/2)|≈{amp}A.
:::

## Self-check: three questions, one ruler — the path difference {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: For each question, work out Δr/λ yourself first, then pick an option. A correct answer locks; a wrong one lets you think and retry.
q1q: Q1 · A point has path difference Δr = 1.5λ to the two sources, which start in phase (φ = 0). This point is…
q1o0: a reinforcement point
q1o1: a still point (cancellation)
q1o2: sometimes reinforced, sometimes cancelled
q2q: Q2 · In the plot below P is fixed with Δr = 1 unit. First read its verdict at λ = 2, then use the button to halve λ to 1 and re-judge. Question: after halving λ, this point becomes…
lamToggle: Toggle λ: 2 ↔ 1 (re-judge)
q2o0: still a still point
q2o1: a reinforcement point
q2o2: a partially reinforced point
q3q: Q3 · True or false: “A still point in an interference pattern is still because neither wave ever reaches it.”
q3o0: True
q3o1: False
resetQuiz: Reset the self-check (clear score)
:::

::: strings
q1ok: Correct. Δr/λ = 1.5 is a half-integer: the waves arrive exactly out of step and cancel at every instant — a still point, still forever.
q1no: Compute again: Δr/λ = 1.5. Whole multiples reinforce, half multiples cancel; the pattern is steady, so a still point never changes with time.
q2demo: λ = {lam}: P has Δr = 1, so Δr/λ = {n} → {cls}.
q2ok: Correct. Halving λ moves Δr/λ from 0.5 to 1 — from half-integer to integer — so the former still point is now reinforced. The verdict reads Δr/λ, never Δr alone.
q2no: Look at the live bench above: after toggling λ, what did Δr/λ become? Integer → reinforcement, half-integer → still point.
q3ok: Correct — the statement is false. Both waves do reach the still point: in Step 1's traces each wave is visibly still moving there; their displacements are simply exact opposites at every instant and sum to 0.
q3no: Go back to Step 1, park P on a still point and watch the traces: each wave's displacement at P is not zero — they are exact opposites.
score: Self-check: {k}/3 answered correctly.
:::

## Wrap-up: interference in three sentences {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Wrap-up
s5e: This page started from one wave's vibration: a wave carries vibration, not matter. Once two waves meet, each point's fate is decided by its path difference (and the starting phase difference), so the strong–weak pattern is fixed by geometry alone.
card1t: 1 · Adding is the whole mechanism
card1: Every point's displacement is the sum of the two waves' displacements. Reinforcement and cancellation are not two mechanisms — they are the two extremes of one addition: in step gives 2A, exactly opposed gives 0.
card2t: 2 · The path difference decides
card2: In-phase sources: Δr = kλ reinforces, Δr = (k+½)λ cancels. With a phase difference φ, convert φ into cycles and combine it with Δr/λ: a whole number reinforces, a half number cancels.
card3t: 3 · Geometry fixes the pattern
card3: Reinforcement points trace one family of hyperbolas, still points another, and neither drifts with time; the smaller λ, the denser both families. The premise: same frequency, constant phase difference.
slitNote: Light is a wave too: double-slit interference keeps the same ledger — fringe positions on the screen are likewise set by path differences. The quantitative fringe-spacing formula waits for the optics line; this page settles the ledger itself.
linkFourier: Adding waveforms: a complex waveform = simple waves added — the superposition principle on the Fourier page →
linkTrig: Where a sine wave comes from: a circle's projection, unrolled, is a sine wave →
:::
