---
lang: en
---

::: strings
docTitle: The Z-Transform · Rolling the s-Plane into the Unit Circle · One Interaction per Step
back: ← Knowledge Index
pageTitle: Z-Transform · The Unit Circle
tagline: In the finale of the Laplace page, a point slid along the imaginary axis and its image always landed on one circle — that was no Easter egg; it was the entire map of the discrete world. Discrete signals have no continuous time, so their transform does not live on a plane — it lives on a circle: roll the s-plane up by z = e^{sT} and the left half-plane lands inside the unit circle, the axis becomes the circumference, ROCs become annuli, and stability becomes a single sentence.
foot: visual.integ.life · Z-Transform — one interaction per step series
:::

## Roll the plane up {#step0 h2=s0t}

::: strings
nav0: 0 Roll the plane
:::

Step 0 · The hook {#s0k .step-kicker i18n=text}

Turning a continuous signal x(t) into a discrete one x[n] takes a single step: sample it every T seconds. The transform follows suit: replace Laplace’s s by z = e<sup>sT</sup> and you get the **Z-transform**. This exponential map **rolls the whole s-plane up**: below, a family of points is flying along z = e<sup>sT</sup> from the s-plane on the left to the z-plane on the right — the cyan points stood on the imaginary axis and land exactly on the **unit circle**; the green ones sat in the left half-plane (σ = −1.2) and land inside the circle; the pink ones sat in the right half-plane (σ = +0.8) and land outside. Memorize those three sentences; the whole page is them. {#s0e .explain}

::: html step0-1
s0tLab: T · sampling period (stated openly in every step)
s0pause: Pause
s0trails: Show flight paths
:::

T is the sampling period: sample faster (smaller T) and e<sup>σT</sup> hugs 1, so every landing point crowds toward the unit circle — the discrete system looks more and more like its continuous original (step 5 zooms in on this). Larger T rolls harder and squeezes left-half-plane points toward the center. One more seed planted: vertically, the plane wraps once every 2π/T — two s-points 2π/T apart land on the very same z (the twin point of step 5 and the frequency fold-back of step 1 are both this fact). {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0play: Play
s0ro: T = <span>{T}</span> · points on the axis → radius <span>1</span> (the unit circle) · left column σ = −1.2 → radius e<sup>−1.2T</sup> = <span>{rL}</span> · right column σ = +0.8 → radius e<sup>0.8T</sup> = <span>{rR}</span>
cvSPlane: s-plane (continuous)
cvZPlane: z-plane (discrete)
cvUnit: unit circle |z| = 1
cvFamAxis: on the axis, σ = 0
cvFamL: σ = −1.2 (left half-plane)
cvFamR: σ = +0.8 (right half-plane)
:::

## One point is one whole sequence {#step1 h2=s1t}

::: strings
nav1: 1 A point is a sequence
:::

Step 1 · A point is a sequence {#s1k .step-kicker i18n=text}

Drop a point z = r·e<sup>jΩ</sup> anywhere in the z-plane and it immediately spells a sequence x[n] = r<sup>n</sup>·cos(Ωn): the **radius r runs growth and decay** — each step multiplies by r, so r &lt; 1 dies step by step, r = 1 holds forever, r &gt; 1 blows up; the **angle Ω runs the oscillation rate** — each step turns by Ω radians. Drag the point, or the sliders below — same thing. Now watch the Ω slider: push it past π toward 2π and the waveform does not speed up — it **folds back** and slows down: Ω and 2π − Ω produce sequences that agree sample by sample. Digital frequency has exactly one revolution of range; everything beyond is an alias (this is step 0’s “one wrap every 2π” seen from the time side). {#s1e .explain}

z = r·e^{jΩ} → x[n] = rⁿ·cos(Ωn) {#s1formula .formula i18n=text}

::: html step1-1
s1rLab: r = |z| · growth / decay
s1oLab: Ω · digital frequency (one full turn, 0 to 2π)
:::

Compare with step 0 of the Laplace page: there, σ ran life-and-death and ω ran speed — two independent knobs. Here the discrete world packs both into **the position of a single point**: distance from the center decides survival, angle around the center decides speed. That is why every Z-transform picture is drawn around a circle: inside, on, or outside the circle is the discrete system’s book of life and death. {#s1hint .hint}

::: strings
s1ro: r = <span>{r}</span> · Ω = <span>{om}</span> rad ({omPi}π) · point z = <span>{re}</span> {imSign} j·<span>{im}</span> · effective frequency Ω′ = <span>{eff}</span> rad · state: <b>{verdict}</b> · x[0] = {x0}, x[1] = {x1}, x[10] = {x10}
s1vDecay: decaying — r < 1, the envelope rⁿ flattens it step by step
s1vEqual: constant — r = 1, it rings forever
s1vGrow: growing — r > 1, out of the frame (clamped; readout is exact)
s1alias: Alias alert: the Ω = {om} you dialed is past π. Its sequence is identical, sample by sample, to the one for Ω″ = 2π − Ω = {alias} (cosine is even), and also to the one for Ω + 2π — digital frequency recognizes a single revolution; whole extra turns and mirror folds create no new sequences. The audit hook ZT.aliasMaxDiff can check this point by point. (“Identical point by point” is a mathematical identity; floating-point checks agree to a relative difference within ~1e-13.)
cvSeq: x[n] = rⁿ·cos(Ωn) (stem plot)
cvDrag: drag me
cvClip: beyond ±3.2, clamped (see readout for true values)
:::

## X(z) is not a formula — it is a sum that either settles or does not {#step2 h2=s2t}

::: strings
nav2: 2 Summation, live
:::

Step 2 · Summation, live {#s2k .step-kicker i18n=text}

The Z-transform is defined as an infinite sum: X(z) = Σ<sub>n≥0</sub> x[n]·z<sup>−n</sup>. Take the classic sequence x[n] = a<sup>n</sup>u[n]: park a probe in the z-plane and **add the terms one by one, in front of you** — the right panel plots where the partial sum S<sub>N</sub> lands in the complex plane. Each new term hops the landing point once more: the ratio q = a/z decides its fate. If |q| &lt; 1, each hop shrinks by |q| and the trail spirals into the limit z/(z−a); if |q| &gt; 1, each hop reaches farther and the trail runs away. S<sub>N</sub> is genuinely added term by term on this page, never faked by the closed form — the error |S<sub>N</sub> − limit| matches |q|<sup>N+1</sup>/|1 − q| to the last digit (both numbers sit side by side in the readout; check them). {#s2e .explain}

::: html step2-1
s2formula: X(z) = Σₙ aⁿz⁻ⁿ = 1 / (1 − a·z⁻¹), partial sum S_N = Σ_{n=0}^{N} (a/z)ⁿ
s2aLab: a · base of the sequence aⁿu[n]
s2add1: Add one term (N+1)
s2add20: Add 20 terms
s2run: Run to N = 300
s2reset: Reset N = 0
:::

Drag the probe across the dashed circle |z| = |a|: divergent inside, convergent outside — that circle is this transform’s **region-of-convergence boundary**. Now drag a negative: the sequence alternates sign, (±|a|)<sup>n</sup>, yet the ROC is still the outside of |z| = |a| — convergence only ever looks at magnitudes, never signs. Next step gives the boundary its official name: the ROC. {#s2hint .hint}

::: strings
s2roConv: a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z, |q| = <span>{qmod}</span> &lt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · limit z/(z−a) = {lre} {lImSign} j·{lim} · |S<sub>N</sub> − limit| = <span>{err}</span> (formula predicts |q|<sup>N+1</sup>/|1−q| = {errPred})
s2roDiv: a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z, |q| = <span>{qmod}</span> &gt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · each term hops ×|q| farther — the sum **diverges**; this z is outside the region of convergence
s2roBnd: a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · |q| = <span>{qmod}</span> = 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · every term has modulus exactly 1 and never decays; the partial sums just walk in circles or in a straight line — <b>no convergence on the boundary</b>
s2roSing: a = {a} · the probe sits exactly on the pole z = a: q = 1, every term is 1, and S<sub>N</sub> = N + 1 = <span>{sn}</span> grows in a straight line — a pole is where the sum gives up entirely
cvProbe: probe z
cvLimit: limit z/(z−a)
cvBnd: boundary |z| = |a|
cvSumsT: where the partial sums S_N land (one per term)
:::

## One formula, two signals — inside and outside the circle {#step3 h2=s3t}

::: strings
nav3: 3 Annular ROC
:::

Step 3 · Annular ROC {#s3k .step-kicker i18n=text}

The sequel to step 3 of the Laplace page: there, two signals shared one formula with ROCs on opposite sides; here it is exactly the same play. The causal sequence a<sup>n</sup>u[n] lives on n ≥ 0, and its sum Σa<sup>n</sup>z<sup>−n</sup> only settles when |z| &gt; |a|; the left-sided sequence −a<sup>n</sup>u[−n−1] lives on n ≤ −1, and flipping its index shows its sum Σ(z/a)<sup>m</sup> only settles when |z| &lt; |a|. **Both have the same algebra: z/(z−a)** — the only difference is an ROC outside the circle versus inside it. Switch sequences and watch the shading flip; drag the probe and test it point by point: the verdict uses the very ratio test of step 2’s live summation, and on the boundary |z| = |a| it honestly reports “no convergence”. {#s3e .explain}

Both sequences have X(z) = z / (z − a) — same formula, different ROC {#s3formula .formula i18n=text}

::: html step3-1
s3btnC: Causal · aⁿu[n] (lives on n ≥ 0)
s3btnL: Left-sided · −aⁿu[−n−1] (lives on n ≤ −1)
s3aLab: a (shared; the pole sits at z = a)
:::

The stability rule is still the same sentence: **ROC contains the unit circle ⟺ the system is stable** (the Laplace twin of “ROC contains the imaginary axis”). So the causal sequence is stable only when a &lt; 1, the left-sided one only when a &gt; 1 — drag a across 1 and the two stabilities swap. And when a is exactly 1, the ROC boundary is the unit circle itself, and the circle is not part of the (open) ROC: neither side is stable. Do not let “touching” fool you. {#s3hint .hint}

::: html step3-2
s3linkTxt: Set this beside step 3 of the Laplace page: there the ROC was a vertical strip (σ > −a or σ < −a); here it has rolled into an annulus (|z| > |a| or |z| &lt; |a|). The shape changed; the rules did not change by one word: a formula without its ROC is an unfinished sentence, and stability asks whether the ROC encloses the line where Fourier lives. There it was the axis; here it is the unit circle →
s3lkL: Laplace & the ROC →
:::

::: strings
s3curC: causal sequence aⁿu[n]
s3curL: left-sided sequence −aⁿu[−n−1]
s3ro: Current sequence: <b>{cur}</b> · a = {a} · probe |z| = <span>{zmod}</span> · for this sequence: <b>{verdict}</b> · stability: the ROC {rocTxt} the unit circle → <b>{stable}</b>
s3in: converges ✓ (inside the ROC)
s3out: diverges ✗ (outside the ROC)
s3bnd: exactly on the boundary |z| = |a|: terms never decay — no convergence
s3rocHas: contains
s3rocMiss: does not contain
s3stable: stable
s3unstable: unstable
cvRocOut: ROC: |z| > a (outside)
cvRocIn: ROC: |z| < a (inside)
cvTimeC: aⁿu[n]
cvTimeL: −aⁿu[−n−1]
:::

## Inside it lives, on it it rings, outside it blows up {#step4 h2=s4t}

::: strings
nav4: 4 Poles & the circle
:::

Step 4 · Poles & the circle {#s4k .step-kicker i18n=text}

Move a second-order system into the z-plane: H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)) with a conjugate pole pair p = r·e<sup>±jθ</sup>. Drag the upper pole (the lower one is its mirror): on the right, the impulse response h[n] = r<sup>n</sup>·sin((n+1)θ)/sin θ redraws in real time (closed form, point by point), and the grey dashed curve is the <strong>envelope ±E[n] with E[n] = r<sup>n</sup>/|sin θ|</strong> — the waveform’s peaks kiss it exactly. The third plot, the frequency response |H(e<sup>jΩ</sup>)|, is computed by honestly substituting z = e<sup>jΩ</sup> around the unit circle back into H(z): the closer the pole rides to the circle, the sharper the peak at θ and the longer h[n]’s tail — three views of one and the same fact. {#s4e .explain}

H(z) = 1 / ((1 − pz⁻¹)(1 − p̄z⁻¹)), p = r·e^{jθ} → h[n] = rⁿ·sin((n+1)θ) / sin θ {#s4formula .formula i18n=text}

::: html step4-1
s4p1: Deep inside · dull
s4p2: Hugging the circle · resonance
s4p3: Outside · blow-up
:::

Conventions, openly: with the normalization H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)), h[n] = r<sup>n</sup>sin((n+1)θ)/sin θ and the envelope is E[n] = r<sup>n</sup>/|sin θ| (peaks touch it exactly — spot-check any n). When a pole is dragged onto the real axis (θ = 0 or π) the two poles coincide and h[n] switches to the repeated-root closed form (n+1)·p<sup>n</sup> with envelope (n+1)·r<sup>n</sup>. The peak position is found by actually evaluating |H(e<sup>jΩ</sup>)| on a fine grid over Ω ∈ [0, π] — not drawn by hand; its small offset from θ is shown honestly (a finite-height peak always sits slightly off the pole angle, and the offset shrinks as r approaches the circle). {#s4note .hint}

Get the feel: pick the “hugging the circle” preset, stare at the response peak, then drag the pole a hair inward — the peak collapses at once and h[n]’s tail shortens. That is literally how digital filters work: to amplify a frequency, park a pole next to that angle on the unit circle (in step 6 you will hear it). Also drag θ close to 0: the oscillation slows until it is nearly pure growth-and-decay — the pole’s angle is the oscillation’s digital frequency, the very same quantity as Ω in step 1. {#s4hint .hint}

::: strings
s4ro: pole p = <span>{pre}</span> {imSign} j·<span>{pim}</span> (r = <span>{r}</span>, θ = <span>{th}</span> rad) · state: <b>{verdict}</b> · response peak at Ω = <span>{peakOm}</span> rad with value <span>{peakVal}</span> (θ = {th} — compare peak position with pole angle) · h[10] = {h10}, envelope E[10] = {e10}
s4vStable: stable — r < 1, the response decays to zero
s4vMarginal: marginal — r = 1, oscillation that neither decays nor grows (constant envelope)
s4vUnstable: unstable — r > 1, the response blows up (axis auto-zooms)
s4vGrowLin: unstable — r = 1 with a repeated pole (θ = 0 or π): the envelope grows linearly with n
s4peakInf: ∞ (pole exactly on the unit circle — singular)
cvEnv: envelope ±E[n]
cvImp: impulse response h[n]
cvResp: |H(e^{jΩ})| — H(z) evaluated on the unit circle
cvPeak: peak
cvClipResp: peak near the top of the axis · exact peak in the readout
:::

## T sets the tightness of the roll; the strips decide what is lost {#step5 h2=s5t}

::: strings
nav5: 5 Facing Laplace
:::

Step 5 · Facing Laplace {#s5k .step-kicker i18n=text}

Drag a pole s=σ+jω with σ&lt;0 and inspect the sampled exponential mode z=e^{sT}: |z|=e^{σT}, angleΩ=ωT. Here T is in seconds, σ in s⁻¹ and ω in rad/s; Ω is the angle increment per sample. The principal strip −π/T&lt;ω≤π/T spans 2π/T along the imaginary-frequency direction and gives one nonrepeating turn. This drawing restricts σ&lt;0, so its images lie inside the unit circle; it does not depict the whole z-plane. Turn on twins to see equal mappings for ω separated by ±2π/T. Samples alone cannot distinguish these frequencies. {#s5e .explain}

::: html step5-1
s5tLab: T · sampling period (s)
s5twinBtn: Show the twin from the next strip
:::

Units: fₛ=1/T. The sampling page’s copy spacing is fₛ Hz, or 2π/T rad/s after conversion; these are the same spacing in different units. Continuous f Hz gives ω=2πf rad/s and sampled digital Ω=ωT=2πf/fₛ rad/sample (mod 2π). Baseband uniqueness needs a known ideal bandlimit with |ω|&lt;π/T. This pole-mode map is not a general discretized transfer function for an entire analog system. {#s5hint .hint}

::: html step5-2
s5linkTxt: On the sampling page, aliasing was “fake waves”: sample too lazily and high frequencies sneak in disguised as low ones. From this page it is clearer: there is no disguise — when the plane rolls up they **genuinely land on the same point**, and the z-plane cannot tell them apart, just as a clock cannot tell 3 o’clock from 15 o’clock →
s5lkS: Sampling & aliasing →
:::

::: strings
s5twinBtnOff: Hide the twin
s5ro: pole s = <span>{sre}</span> {imSign} j·<span>{sim}</span> (σ:s⁻¹, ω:rad/s) · T = {T} s · image z = e<sup>sT</sup> = <span>{zre}</span> {zImSign} j·<span>{zim}</span> · |z| = e<sup>σT</sup> = <span>{zmod}</span> · angle increment Ω = ωT = <span>{ang}</span> rad/sample{twinTxt}
s5twinTxt: " · twin s′ = {sre} {imSign} j·{sim2} (ω + 2π/T): |z′| = {zmod}, angle ω′T = {ang2} rad ≡ {ang} (mod 2π) — the same image"
s5twinTxtM: " · twin s″ = {sre} {imSign} j·{sim3} (ω − 2π/T): |z″| = {zmod}, angle ω″T = {ang3} rad ≡ {ang} (mod 2π) — the same image"
s5twinOff: " · the twin at ω ± 2π/T lies outside this picture (small T makes strips so wide that two of them do not fit on one screen)"
cvStrip: principal strip −π/T<ω≤π/T
cvTwin: twin
cvImage: image z = e^{sT}
cvSPole: pole s
cvAxis: axis jω
:::

## The unit circle is the discrete world’s imaginary axis {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Resonator
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Gather it into one table: everything in the continuous world has a counterpart living on the circle in the discrete one. The axis rolls into the unit circle — which is why **“evaluating on the unit circle” is the discrete world’s Fourier transform** (the DTFT): z = e<sup>jΩ</sup> walks once around the circle, Ω goes from 0 to 2π, and exactly one revolution covers every digital frequency. The left half-plane rolls into the disk — so stability turns from “poles on the left” into “poles inside the circle”. Rules, intuition, even the feel carry over one to one; only the map changed shape, from flat to rolled. {#s6e .explain}

::: html step6-1
tbItem: Item
tbS: s-plane (continuous · Laplace)
tbZ: z-plane (discrete · Z-transform)
tbR1c: Where Fourier lives
tbR1s: the line σ = 0, the imaginary axis
tbR1z: the <b>unit circle</b> |z| = 1
tbR2c: Home of stability
tbR2s: left half-plane, σ &lt; 0
tbR2z: the <b>inside of the circle</b>, |z| &lt; 1
tbR3c: Stability test
tbR3s: ROC contains the axis
tbR3z: ROC contains the <b>unit circle</b>
tbR4c: Pole farther from the border
tbR4s: faster decay, steadier system
tbR4z: faster decay, steadier system (word for word)
s6rt: Closing demo: a resonator you can drag
:::

Now bolt step 4’s poles into a real filter: the input is five pure tones mixed together (300 / 700 / 1200 / 1900 / 2700 Hz, sampled at 8000 Hz), the filter is H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)), and the sound is genuinely computed sample by sample (a difference equation — not a drawn fake). Drag the pole on the left to choose the resonance angle; the r slider sets how sharp the resonance is: park the pole against the circle at a tone’s angle and that tone is the one that booms. The bars on the right are each tone’s true gain (|H(e<sup>jΩ</sup>)| evaluated point by point, displayed normalized to the maximum — true multipliers are in the readout). Hear the dry mix first, then the filtered one: let your ears do the auditing. {#s6re .explain}

::: html step6-2
s6rLab: r · how close the pole rides to the circle (how sharp the resonance)
s6playDry: ▶ Hear the original (5 tones mixed)
s6playWet: ▶ Hear it after the filter
:::

Audio etiquette (as on the sampling page): silent by default; the AudioContext is only created when you press play. The filter runs the difference equation y[n] = x[n] + 2r·cosθ·y[n−1] − r²·y[n−2] sample by sample for real, then peak-normalizes before playback to avoid clipping, at a conservative gain; each clip also fades in over 15 ms and out over 20 ms, so starting and stopping never click. In this step r is capped at 0.99 — parked exactly on the circle (r = 1) the filter would self-oscillate, which is the other face of step 4’s “on the circle it rings”. Bar gains and readout share the very same respAt evaluator as step 4’s frequency response. {#s6note .hint}

::: html step6-3
s6fin: From a point going around in circles to a plane rolled into one — the map of this catch-up line is complete: the circling point on the trig page was Ω’s first appearance, Fourier turned circles into waves, sampling cut waves into points, Laplace gave every frequency a lifetime, and the Z-transform rolled the whole plane back into a single circle. Five pages, one picture. Next time a textbook shows you the unit circle, remember this resonator: **every angle on the circle houses one frequency, and inside versus outside is life versus death.**
s6linksLab: Looking back along the line:
s6lkT: Trig functions: the circle’s first appearance →
s6lkF: Fourier transform →
s6lkL: Laplace & the ROC →
s6lkS: Sampling & aliasing →
:::

::: strings
s6ro: pole angle θ = <span>{th}</span> rad → resonance frequency f = θ·f<sub>s</sub>/(2π) = <span>{fres}</span> Hz · r = <span>{r}</span> · gains of the five tones (×): {gains} · the largest gain is {peakVal}× at Ω = {peakOm}
s6tone: {f} Hz: ×{g}
cvStableIn: inside = home of stability
cvOnCirc: on the circle = where Fourier (DTFT) lives
cvIn6: the 5 input tones’ angles
cvOut6: after filtering (normalized to max)
cvResp6: |H(e^{jΩ})|
:::
