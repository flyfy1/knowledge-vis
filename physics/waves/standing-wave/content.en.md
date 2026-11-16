---
lang: en
---

::: strings
docTitle: Standing Waves · One Interaction per Step
back: ← Knowledge Index
pageTitle: Standing Waves
tagline: Two identical waves collide head-on, yet the waveform stops running and instead rises and falls in place — each point's amplitude locked by a motionless envelope, some points never moving at all. Starting from two counter-propagating waves, verify nodes, antinodes and the string's integer steps for yourself.
foot: Standing Waves · One Interaction per Step
navLabel: Step navigation
nav0: 0 Head-on superposition
nav1: 1 Nodes & antinodes
nav2: 2 The string's steps
nav3: 3 Harmonic family
nav4: 4 Resonance
nav5: 5 Self-check
nav6: 6 Wrap-up
:::

## Two waves run at each other: why does the waveform stop? {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: This step answers: given a right-going harmonic wave y₁ = A·sin(ωt − kx) and an identical wave coming the other way, y₂ = A·sin(ωt + kx), what does every point do when they add up? (Where a sine wave comes from — <a class="fourier-link" href="../../../math/geometry/trigonometry/#step2">the trigonometry page is all about this: unroll the height, and you get the sine wave →</a>) Each point's displacement is the sum of the two waves. Here A = 1, period T = 4 s; cyan is the right-going wave, orange the left-going one, white the sum. Watch the summed waveform: crests no longer migrate left or right — they only rise and fall in place. The orange dashed line is a crest marker: it stays near the same x, unlike a travelling wave. Drag P and watch P's displacement-vs-time curve below: P still vibrates sinusoidally, but its amplitude depends on where it stands — some points rise high, some never move.
canvasLabel: Interactive diagram for this step; see the text above for how to operate it
lamLab: Wavelength λ (length units)
pxLab: P's x position (arrow keys work)
viewLab: Show:
viewSum: Sum
viewRight: Right-going only
viewLeft: Left-going only
pause: ⏸ Pause
s0hint: A pattern where two counter-propagating waves add up so the waveform stops migrating and each point vibrates in place is called a **standing wave**. The sum is y = y₁ + y₂ = 2A·cos(kx)·sin(ωt): a spatial envelope times a temporal vibration — cos(kx) decides how high each point rises, sin(ωt) decides when the whole wave peaks together.
:::

::: strings
play: ▶ Play
s0ro: P at x = {x}: right-going y₁ = {y1}, left-going y₂ = {y2}, sum y = {ys} (the two waves added, computed).
:::

## Nodes and antinodes: each point's amplitude is locked by the envelope {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: First ask how far each point can move. The largest displacement magnitude is its **amplitude**; their outline is the **envelope**. Here y(x,t)=C(x)·sin(ωt), C(x)=2A·cos(kx): amplitude is |C|, not signed C. C=0 marks a stationary **node**, x=(2m+1)λ/4; |C|=2A marks an **antinode**, x=mλ/2 (integer m). Adjacent nodes are λ/2 apart; a node and its nearest antinode are λ/4 apart. Now ask whether two points rise together. Reference Q stays at x=0. Drag P or choose a preset, then play: both traces share one clock and scale.
phaseCanvas: P solid and Q dashed predictions share time and displacement axes; the comparison is explained below.
:::

P: orange solid trace and filled dot. Q: cyan dashed trace and open dot, fixed at x=0. Both use the same ±2A vertical axis. The last two cycles are an analytic prediction for CURRENT parameters, not measured history; edits recompute it. {#phaseLegend .hint i18n=text}

::: html step1-2
phaseControls: Edits pause and hold time; P and Q stay fixed while playing. P keyboard: arrows ±0.05, Page ±0.5, Home/End to bounds. x and λ share a length unit; A=1 is the displacement unit. T=4 s is a slow demonstration setting; changing λ is not a fixed-wave-speed frequency sweep.
envLab: Overlay envelope (±2A·cos(kx))
phaseSameBtn: Same interval P=λ/8
phaseOppBtn: Across one node P=λ/2
phaseReset: Reset and pause
btnNode: Move P to a node (x = λ/4)
btnAnti: Move P to an antinode (x = 0)
s1hint: Points within the same interval between adjacent nodes are in phase (rise together). Crossing one node reverses C and changes phase by π (half a cycle); crossing two restores the phase. A node has zero amplitude and no comparable oscillation phase. Both displacements being zero at one instant does not prove equal phase.
:::

Predict: reset, then choose Across one node. At t=0 both P and Q are zero. Does that prove equal phase? Play: no, they then move in opposite directions. Choose Node: P never moves, so calling it in or out of phase with Q is inappropriate. {#phaseQuestion .hint i18n=text}

::: html step1-3
phaseSourceTitle: Source and model limits
phaseSource: Ideal linear superposition of equal-frequency, equal-amplitude sinusoidal waves travelling in opposite directions. OpenStax 16.6 derives a spatial factor times a time factor. With this page’s shifted space/time origins, direct addition gives 2Acos(kx)sin(ωt). Spatial-sign reversal yields the phase result; at zero amplitude every phase represents the same zero function, so phase is undefined. This is not Step 2’s fixed-end string, a damped/transient solver, or measured data.
:::

::: strings
s1ro: P at x = {x} (x/λ = {xr}); amplitude |C| = 2A·|cos(kx)| = {amp} A; sampled extremum of the CURRENT-parameter analytic prediction ≈ {meas} A (not measured; includes floating-point roundoff).
clsNode: Node: amplitude stays 0, the time trace is squeezed into a straight line — it never moves.
clsAnti: Antinode: amplitude 2A, where the vibration is largest.
clsGen: Ordinary point: amplitude {amp}A, always between 0 and 2A.
phaseSame: C(P) = {c} A > 0: in phase with Q (0); amplitudes may differ.
phaseOpposite: C(P) = {c} A < 0: opposite phase to Q (π); one rises as the other falls.
phaseNode: C(P) = 0: P is a zero-amplitude node; its oscillation phase relative to Q is undefined.
phaseValues: At the SAME time t ≈ {time} s: y(P) ≈ {p} A, y(Q) ≈ {q} A.
phaseSpacing: P is ≈ {node} from the nearest node and ≈ {antinode} from the nearest antinode; node-to-node (or antinode-to-antinode) spacing stays fixed at λ/2 = {period}.
:::

## Does almost matching satisfy fixed ends? {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Fixed ends require y(0,t)=y(L,t)=0 at **every time**, not merely a zero crossing now. A is each component’s amplitude (normalized to1 here), and k=2π/λ. The original trial y=A sin(ωt−kx)−A sin(ωt+kx)=−2A cos(ωt)sin(kx) automatically fixes only x=0. The right end additionally needs sin(kL)=0, or **q=2L/λ=n, n=1,2,…**. Only then is this single free-vibration shape a normal mode, with λₙ=2L/n. An incompatible trial can be drawn for inspection, but is not actual motion of a fixed-end string.
:::

White pins/walls: required zero displacement. Cyan dashed line: incompatible trial shape; red ring: its demanded endpoint now; red dashed marker: its nonzero full-cycle endpoint envelope. Only a boundary match receives a green solid curve and nodes. Numerical tolerance handles floating-point error, not a “within 2% counts” rule. {#boundaryLegend .hint i18n=text}

::: html step2-2
lenLab: String length L (length units)
boundaryNear: Try near mode: L=6, λ=6.05
boundaryReset: Reset Step2 & pause
btnSnap: Snap: nearest reachable wavelength mode
:::

Predict: select “Try near mode”. Does q≈1.98347 count as mode 2? Inspect the endpoint envelope, then Snap: λ becomes 6 and q becomes 2; only then does the endpoint stay zero. Dragging λ is continuous. Arrow keys change it by 0.05, PageUp/Down by 0.5, Home/End go to bounds. Snap keeps the full 2L/n value, without 0.05-grid quantization. {#boundaryTask .hint i18n=text}

::: html step2-3
:::

The fixed demonstration T=4s shows candidate spatial shapes. Changing λ also changes the illustrative λ/T speed; this is not a frequency sweep of one unchanged physical string. Step 3 specifies wave speed before calculating frequency. Failure rules out this single free-mode trial, not every possible forced motion; no forced or off-resonance response is solved here. Edits pause at the same time for a hypothetical comparison. {#boundaryScope .hint i18n=text}

::: html step2-4
boundarySource: OpenStax16.6 · fixed ends select allowed modes ↗
boundaryPhase: Revisit same-point phase and superposition →
:::

::: strings
boundaryEndpoint: Demonstration time t≈{time}s: trial right-end displacement≈{instant}A; its whole-cycle endpoint amplitude≈{end}A. A zero now does not mean always zero.
s2ro: L={L}, λ≈{lam}; q=2L/λ≈{q}. Nearest reachable candidate by wavelength distance: n={n}, λₙ≈{lamn}; its |q−n|≈{dev}.
modeOk: Mode n={n}: fixed-end conditions hold within floating-point precision. λₙ=2L/n≈{lamn}; the endpoint envelope vanishes for the whole cycle. Rounded display does not replace the exact ratio.
modeNo: Incompatible trial: it demands a right-end amplitude of about {end}A, but the pin requires zero throughout the cycle. This is not an established normal mode.
:::

## The harmonic family: integer steps on one string {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: This step answers: on a string of length L = 6, what does this row of modes look like, and how are their frequencies related? The wave speed v is set by the string's tension and thickness — this page fixes v = 3 (length units/s; a modelling choice). The n-th mode has wavelength λ_n = 2L/n and frequency f_n = v/λ_n. Names: the n = 1 mode is the **fundamental**, n ≥ 2 are **harmonics** (the n-th harmonic). Instrument timbre comes from the mix of harmonics — that is the instruments line's story; not here. Switch n = 1…5 and watch shape and frequency climb the steps together.
modeLab: Mode n:
cmpLab: Overlay fundamental (n = 1) for comparison
:::

::: strings
crestMark: Crest marker
nodeMark: node
antiMark: antinode
traceTitle: P's displacement vs time
respTitle: Steady-state amplitude vs drive frequency (illustrative model)
s3ro: Mode n = {n}: λ_n = 2L/n = {lamn}; f_n = v/λ_n = {fn} Hz; f_n/f₁ = {ratio}; nodes {nodes} (including both ends), antinodes {anti}.
:::

## Resonance: the drive lands on a step {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: This step answers: drive one end of the string gently but continuously at frequency f — when does the amplitude grow large? First, the definition: **natural frequencies** are the frequencies at which the system can vibrate stably on its own — exactly the f_n = n·f₁ family from the last step. Sweep the drive frequency f from 0.05 to 1.40 Hz with the slider: only when f lands on some f_n does the whole string light up in that mode's shape and the amplitude readout shoot up; step off and it collapses. Conclusion: **resonance** = a large amplitude when the drive frequency equals a natural frequency. Resonance selects a mode; it is not “more force = more sound”. The response curve in this step is an **illustrative model, not measured data**: peak positions are computed from the f_n, while peak heights and widths are illustrative parameters.
freqLab: Drive frequency f (Hz)
s4hint: Like pushing a swing: every push lands on its own rhythm and the energy piles up; push off-rhythm and the efforts cancel. Conditions: small drive, light damping, and the drive point must not sit exactly on that mode's node (nothing moves there). Heavier damping makes the peaks shorter and wider — this page fixes light damping; peak heights and widths are illustrative parameters, not measured data.
:::

::: strings
s4ro: Drive frequency f = {f} Hz; nearest natural frequency f_{n} = {fn} Hz; steady-state amplitude (**illustrative model**, not measured) = {amp}.
resLit: Landed: the drive hits f_{n}, and the string is vibrating in the n = {n} mode's shape.
resOff: Missed: the drive sits between two steps, the amplitude collapses and the shape falls apart.
:::

## Self-check: four questions, one set of pure functions {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Step 5
s5e: Every verdict is computed by the page's pure functions — nothing is hard-coded. Work each one out yourself first, then pick. A correct answer locks; a wrong one lets you think and retry.
q1q: Q1 · A standing wave with λ = 4 (length units, this page's Step-1 rope with envelope 2A·|cos(kx)|): at x = 1, node or antinode?
q1o0: Node
q1o1: Antinode
q1o2: Neither
q2q: Q2 · A string fixed at both ends, L = 6. What is the longest wavelength that can exist?
q2o0: 12
q2o1: 6
q2o2: 3
q3q: Q3 · True or false: “A node is still because no wave ever reaches it.”
q3o0: True
q3o1: False
q4q: Q4 · Pressing a guitar string at its midpoint halves the sounding length. How many times the old value is the fundamental now?
q4o0: Twice
q4o1: Unchanged
q4o2: Half
resetQuiz: Reset the self-check (clear score)
:::

::: strings
q1ok: Correct. A(1) = 2A·|cos(2π/4·1)| = 2A·|cos(π/2)| = 0 — zero amplitude forever: a node.
q1no: Go back to Step 1: at x = 1, λ = 4, what does A(x) = 2A·|cos(kx)| compute to? Zero → node, 2A → antinode.
q2ok: Correct. The mode condition is L = n·(λ/2); n = 1 gives the longest wavelength: λ₁ = 2L = 12.
q2no: Use Step 2's rule: q = L/(λ/2) must be an integer. Which option makes n = 1 hold?
q3ok: Correct — the statement is false. Both waves do reach the node: in Step 0 you can see each wave still moving at a node; their displacements are simply exact opposites at every instant and sum to 0. The still points on the interference page work the same way.
q3no: Go back to Step 0: park P on a node and look at each wave's displacement at P — are they zero?
q4ok: Correct. f₁ = v/2L; halving the length halves the denominator, so the fundamental doubles — exactly what Step 3's formula says.
q4no: Use Step 3's formula: f₁ = v/2L. If L becomes L/2, what happens to f₁?
score: Self-check: {k}/4 answered correctly.
s5hintAll: All four verdicts come from the same pure functions — ① amplitude A(x) = 2A·|cos(kx)| is forever zero at x = 1, λ = 4; ② the mode quotient q = L/(λ/2), with L = 6 and n = 1 giving λ₁ = 12; ③ at a node the two waves' displacements are exact opposites at every instant; ④ f₁ = v/2L, so halving the string doubles the fundamental.
:::

## Wrap-up: standing waves in three sentences {#step6 h2=s6t h2part=1}

::: html step6-1
s6k: Wrap-up
s6e: This page started from two head-on waves: crests stop migrating and only rise and fall in place; the envelope locks each point's amplitude; the boundary sieves wavelengths into integer steps, and a drive that lands on a step is resonance.
card1t: 1 · Head-on superposition grows an envelope
card1: y = y₁ + y₂ = 2A·cos(kx)·sin(ωt): a spatial envelope times a temporal vibration. The waveform does not migrate — everything peaks together and returns together.
card2t: 2 · The envelope locks nodes and antinodes
card2: A(x) = 2A·|cos(kx)|: zeros are nodes (x = (2m+1)λ/4), maxima 2A are antinodes (x = mλ/2). A node is still not because no wave arrives, but because the two waves are exact opposites at every instant.
card3t: 3 · The boundary sieves integer steps
card3: Fixed ends → L = n·(λ/2), frequencies line up as f_n = n·f₁. Only a drive frequency that lands on some f_n grows large — resonance selects a mode.
windNote: Wind instruments are standing waves in an air column: with one end closed, the steps become odd multiples of λ/4 — that is the sound line's story; it is not expanded here.
linkInt1: Interference: two sources, path difference deciding reinforcement and cancellation — that is a pattern of loud and quiet in space; this page is one wave colliding head-on with its own reversed companion: vibration in place, in time →
linkInt2: Interference's steady pattern: the hyperbola family — compare it with this page's one-dimensional standing-wave envelope →
linkTrig: Where a sine wave comes from: a circle's profile, unrolled into a wave — both of this page's head-on waves are one →
:::

::: strings
phaseTrace: P solid / Q dashed · displacement y (units of A)
phasePast: t − 2T (T=4 s)
phaseNow: Current t
:::
