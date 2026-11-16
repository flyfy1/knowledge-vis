---
lang: en
---

::: strings
back: ← Knowledge Index
pageTitle: Impulse & LTI · One Slap
tagline: To get to know a system, don’t probe it input by input — slap it once, and record everything it answers to an impulse δ. That recording, h[n], is the system’s fingerprint: as long as the system is linear and time-invariant (LTI), its answer to any input is a weighted stacking of this one fingerprint. Everything on this page is discrete-time, and every claim is computed in front of you.
foot: visual.integ.life · Impulse & LTI —— one interaction per step
:::

## Slap it, and listen to the echo {#step0 h2=s0t}

::: strings
nav0: 0 The Slap
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

Three black boxes, three different systems inside — you don’t get to know which is which yet. The sharpest way to meet a system is to hit it with **the shortest, most standard blow there is**: a single spike of height 1 at n = 0 and zeros everywhere else — the **impulse δ[n]**. Everything the box does in response is its **impulse response h[n]**. Slap each one, guess its character from the echo, then see the reveal. {#s0e .explain}

::: html step0-1
s0guessLab: Guess its character first:
s0gRing: Rings, then settles
s0gFlat: One spike, unchanged
s0gStep: Steps up and stays
s0slap: Slap it (feed δ[n])
s0slapAll: Slap all three
:::

Three completely different echo shapes: one dies away, one is flat, one keeps everything. The rest of this page does exactly one thing: **show you where this fingerprint h[n] comes from, what it can do, and where it stops working — with every claim verified on the spot**. One ground rule: this page uses only the discrete impulse δ[n] — an ordinary sequence that is 1 at n = 0 and 0 elsewhere. Clean, exact, no hand-waving. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro0: No box has been slapped yet. Every box gets exactly the same slap — what the echo looks like is entirely up to the box.
s0roSome: <span>{m}</span> / 3 boxes slapped, echoes recorded. Press a box’s own button to slap it again.
s0roDone: All three boxes slapped: the same δ[n] went in, and the echoes came back ringing down, copied verbatim, and stepped up to stay. **Same input, three different answers — the difference is the system itself**, and h[n] records that difference in full.
s0nameAq: Black Box A
s0nameBq: Black Box B
s0nameCq: Black Box C
s0descPre: Identity classified. Slap it, and guess from the echo.
s0namePend: Box {k} · not yet revealed
s0descPend: Echo recorded. Guess its character below — only then is its identity revealed.
s0roScore: " · character guesses: {r} revealed, <span>{c}</span> correct"
s0nameA: Box A · The Echo Spring
s0descA: Revealed: a second-order resonator (a discrete spring–damper). It has a rhythm of its own: one slap and it rings at that rhythm while settling — like tapping an empty can; the sound belongs to the can.
s0nameB: Box B · The Straight Wire
s0descB: Revealed: y[n] = x[n], the system that does nothing at all. No memory, no processing: the echo is the slap itself, h[n] = δ[n].
s0nameC: Box C · The Reservoir
s0descC: Revealed: an integrator, y[n] = y[n−1] + x[n]. It keeps every drop of the slap: the level jumps once and then holds — h[n] is a single step (1 for all n ≥ 0).
cvWait: Not slapped yet — nobody knows what’s inside
cvH: the answer h[n]
:::

## Meet the slap itself: δ[n], and taking any signal apart {#step1 h2=s1t}

::: strings
nav1: 1 δ & Decomposition
:::

Step 1 · δ & Decomposition {#s1k .step-kicker i18n=text}

First, look at the slap closely. **Sifting**: multiply any signal x[n] by δ[n−k] (the impulse shifted to time k) and every stem is crushed to zero except the k-th, whose height is exactly x[k] — an impulse is a pair of tweezers that plucks any single sample out of a signal. Drag k and pluck them one by one. Then **decomposition**: write every stem of x as its own impulse component, x[n] = Σ<sub>k</sub> x[k]·δ[n−k] — a row of impulses whose heights are the signal’s samples. Flip the components on one at a time and watch their sum grow, stem by stem, into x itself. {#s1e .explain}

x[n] = Σₖ x[k] · δ[n − k] {#s1formula .formula i18n=text}

::: html step1-1
s1kLab: k · slide δ onto the k-th stem
:::

Switch on the impulse components x[k]·δ[n−k], one by one: {#s1tglLab .seq-label i18n=text}

::: html step1-2
s1all: All on
s1none: All off
:::

An honest aside on scope: continuous time has a δ(t) too, but it is not an ordinary function — it can only be defined through limits and its sifting property ∫x(t)δ(t)dt = x(0); drawing it as a finite narrow spike is always an approximation sketch. This page stays out of that swamp and uses only the discrete δ[n]: **an ordinary sequence, 1 at n = 0 and 0 elsewhere**, so every claim can be checked point by point. {#s1hint .hint}

::: strings
s1ro: k = <span>{k}</span> · the tweezers picked sample x[{k}] = <span>{v}</span> · the product x[n]·δ[n−{k}] keeps only the stem at n = {k}; every other time is flattened by a ×0
s1ro2: <span>{m}</span> / 12 components on · the current sum vs the target x, max pointwise difference = <span>{err}</span>
s1ro2full: " · all 12 on: the sum and x **coincide at every point, difference identically 0** — not drawn to look alike; the numbers are literally the same row"
cvX: the signal x[n]
cvProd: the product (one stem survives)
cvComp: components switched on
cvSum: the running sum
:::

## h[n]: know it, and you know the answer to every input {#step2 h2=s2t}

::: strings
nav2: 2 h the Fingerprint
:::

Step 2 · h the Fingerprint {#s2k .step-kicker i18n=text}

Now record a fingerprint. Pick a system; the first move is always the same: **feed δ[n] and write the answer down as h[n]**. Then feed a real signal x[n] (gray stems). By step 1, x is a sum of impulse components; if the system is **linear**, the answer to component k, x[k]·δ[n−k], must be x[k]·h[n−k] — that copy of h scaled by x[k]; if it is also **time-invariant**, every copy is shifted by k and otherwise identical. So the output is **all those scaled, shifted copies of h stacked up**. In the picture, each translucent mound is one copy; the orange stems are the total. Underneath is an audit: run the same input through the system’s defining equation directly, and compare the two routes point by point — the difference is reported, not asserted. {#s2e .explain}

::: html step2-1
s2sysMa: 3-point moving average
s2sysAcc: Exponential-decay accumulator
s2sysDiff: Differencer
s2aLab: a · the accumulator’s decay (accumulator only)
soundTitle: Hear what the same system changes
soundIntro: Repeat this step’s 28-point pattern to make about 1.87 seconds of synthetic sound. Compare the input with the selected system’s output at one shared volume. This is not a field recording; nothing plays automatically.
soundInput: ▶ Play input
soundOutput: ▶ Play processed
soundStop: ■ Stop
soundVolume: Listening volume
soundIdle: Not playing. Choose a playback button.
soundPlot: Static prefix: 56 samples (7 milliseconds); the horizontal axis is sample index n. Both raw mathematical signals use one fixed vertical scale, before audition fades. The progress above covers the whole 1.87-second clip, not a slow replay of these 56 points.
soundWave: First 56 input and output samples for the selected system, on one fixed vertical scale; horizontal axis is discrete sample index n.
soundTry: Try this: hear the input, select the moving average, then hear the output. Are the rapid changes less prominent? Compare the differencer next. Processing can also change loudness; equal volume settings do not promise equal loudness.
soundMappingTitle: How do the sounds map to the points? Limits and source
soundMapping: For audition only, one n is mapped to 1/8000 second (8000 samples/second). Repeat the 28-point pattern 515 times, then append 512 zeros for decay:14932 samples, or 1.8665 seconds. The recurrence continues across patterns without resetting every 28 samples. Audio uses the full recurrence, not the truncated h plot. The accumulator has an infinite theoretical tail; the appended silence is a truncation approximation.
soundChanging: Editing the system or a during output playback crossfades for 10 milliseconds at the same time position to a complete output computed from zero initial state with the new fixed parameters. This is an audition comparison, not the transient of a changing-coefficient system. Both playback copies also receive 8-millisecond start/end fades after the mathematical calculation to reduce clicks; plotted data remains raw.
soundLevel: Every option uses the same fixed scale 0.03, multiplied by the listening volume; there is no per-clip normalization or automatic boost. Default volume is 50%; start low. Bounded digital peaks do not guarantee acoustic sound pressure. Your device resamples the 8000-sample/second buffer to its output rate. Leaving this step, hiding the page or stopping ends playback.
soundReference: Implementation reference: W 3C Web Audio (sample rate, playback and gain scheduling)
s2copies: Show every scaled, shifted copy of h
:::

Look at the three h shapes. The differencer has just two stems (1 and −1): its “remembers only one step” character is written right there. The accumulator’s h is a run of a<sup>n</sup>: the echo of one slap never truly reaches zero, it only gets lighter — this long-tailed h returns in step 5. The moving average is three equal stems: outside the window, nothing matters; inside, everything counts the same. {#s2hint .hint}

::: html step2-2
s2linkTxt: The craft of “flip h, slide it, multiply and add” — convolution — has its own page on this site; this page only borrows its conclusion: the output is a weighted stacking of h. For the craft itself, go here →
s2lkC: Convolution: the flip-slide-multiply-add craft lives on that page →
:::

::: strings
soundProgress: Whole-clip playback progress
soundOpening: Opening audio. Stop remains available.
soundUpdating: Updating audition to the current parameters.
soundEnded: Clip ended. Play again to compare.
soundStopped: Stopped. Returning will not resume sound.
soundError: Audio could not start or data could not be generated. Click Play to retry and check browser audio settings; the visual comparison remains available.
soundUnsupported: Web Audio is unavailable in this browser. Open an audio-capable browser to listen; the input/output plots still work.
soundInterrupted: Audio was interrupted. Click Play again to resume a fresh clip.
soundSystem: {sys}{decay}
soundDecay: " (a = {a})"
soundX: Input x[n]
soundY: Output y[n]
soundPlayingInput: Playing input x[n].
soundPlayingOutput: Playing processed y[n].
docTitle: Impulse & LTI · Slap the System · One Interaction per Step
s2ro: System: <b>{sys}</b> · audit of the two routes ({N} output points): direct recursion vs stacking h, max difference = <span>{err}</span> — floating-point dust; both routes compute the same thing
cvH2: h[n] (recorded with one slap)
cvXin: input x[n]
cvCopies: each copy x[k]·h[n−k] (copy stems drawn only where |value| ≥ 0.02)
cvYout: output y[n] (the total)
:::

## Two axioms, falsifiable on the spot {#step3 h2=s3t}

::: strings
nav3: 3 The Axiom Bench
:::

Step 3 · The Axiom Bench {#s3k .step-kicker i18n=text}

Step 2’s magic isn’t free — it is mortgaged on two axioms: **linearity** (a weighted mix of inputs → the same weighted mix of outputs) and **time-invariance** (the same input arriving later → the same output, just later). These are not decorative clauses in a definition; they are contracts that can be tested here and can fail here. Welcome to the bench: three systems take the stand in turn, and both tests report **concrete deviation numbers** — passes leave only floating-point dust (around 10<sup>−16</sup>), failures are unmistakably large. {#s3e .explain}

::: html step3-1
s3sysAcc: Accumulator (claims to be LTI)
s3sysSq: Squarer y[n] = x[n]²
s3sysTv: Time-varying gain y[n] = g[n]·x[n]
s3supT: Test 1 · Superposition (linearity)
s3supE: Take two inputs x<sub>1</sub> and x<sub>2</sub>, with weights a = 2, b = −1. Left route: mix the inputs into 2x<sub>1</sub> − x<sub>2</sub> first, then run the system. Right route: run each input separately, then mix the outputs with the same 2 and −1. Linearity holds ⟺ the two routes agree at every point.
s3tiT: Test 2 · Time-invariance
s3tiE: One input x<sub>1</sub>: run it directly, and also delay it by D = 3 steps before running it. Time-invariance holds ⟺ the second output is exactly the first output delayed by 3 steps, point by point. (On the time-varying bench, g[n] = 0.25 + 0.0625n: the gain climbs with time — it is still linear in the input; what changes is *when* you feed it.)
s3fakeT: When an axiom fails: the squarer’s “fake h”
s3fakeE: Ignore the axioms and record an “h” for the squarer anyway: feeding δ returns δ² = δ, so this fake h “predicts” that every input passes through unchanged. But the true output is x[n]². Put the two curves side by side — where the axioms are absent, the prediction goes bankrupt on the spot.
:::

Read the three report cards. The accumulator passes both — it is genuinely LTI, and the h magic applies to it in full. The squarer **passes time-invariance and fails superposition**: it has no memory and no sense of time, but (2x<sub>1</sub> − x<sub>2</sub>)<sup>2</sup> ≠ 2x<sub>1</sub><sup>2</sup> − x<sub>2</sub><sup>2</sup> — the cross term is exactly where the deviation comes from. The time-varying gain is the mirror image: **passes superposition, fails time-invariance** — g[n] depends on the clock, not the input, so it stays linear in x; but feed the same signal three steps later and it gets multiplied by a different gain. Each axiom guards its own territory; you need both. {#s3hint .hint}

::: strings
s3supRo: a = 2, b = −1 · max pointwise difference between the two routes = <span>{dev}</span> · {verdict}
s3tiRo: delay D = 3 steps · max pointwise difference between the two routes = <span>{dev}</span> · {verdict}
s3fakeRo: fake-h prediction vs true output: max pointwise difference = <span>{dev}</span> — for a system that fails the axioms, “record h once, answer everything” goes bankrupt on the spot
vPass: <span class="verdict pass">PASS ✓ · only floating-point dust remains</span>
vFailSup: <span class="verdict fail">FAILS ✗ · superposition does not hold</span>
vFailTi: <span class="verdict fail">FAILS ✗ · the output is not a shift of the original</span>
cvLhs: left route: output of the mixed input
cvRhs: right route: the mix of the outputs
cvTiA: output of the delayed input
cvTiB: the original output, delayed 3
cvPred: the fake h predicts
cvTrue: the true output x[n]²
:::

## The step response s[n]: h’s close relative, linked by sums and differences {#step4 h2=s4t}

::: strings
nav4: 4 Step Response
:::

Step 4 · Step Response {#s4k .step-kicker i18n=text}

Feed one more cheap input: the **step u[n]** (0 for n &lt; 0, then 1 forever), and call the answer the **step response s[n]**. It is a close relative of h: the step itself is the running sum of impulses (stack δ’s from the start and you get a staircase), so by linearity and time-invariance the answer accumulates too: **s[n] = h[0] + h[1] + … + h[n]**; and differencing s once peels h back out. Both directions are computed for you below: the left plot is h (with diff(s) overlaid as hollow dots), the right plot is s (with cumsum(h) overlaid), and both max differences are in the readout. {#s4e .explain}

s[n] = Σₖ₌₀ⁿ h[k] ,  h[n] = s[n] − s[n−1] {#s4formula .formula i18n=text}

::: html step4-1
s4sysAcc: Exponential-decay accumulator
s4sysMa: 3-point moving average
s4aLab: a · the accumulator’s decay (accumulator only)
s4ovH: Overlay diff(s) on h for comparison
s4ovS: Overlay cumsum(h) on s for comparison
:::

Why do engineers prefer measuring s? To measure h directly you would need a slap of “infinite strength in zero time”, which no lab can deliver; measuring s only takes **flipping a switch and watching it climb** — apply DC, open a valve. That is why datasheets and labs are full of step responses; when you need h, one difference peels it out (that is the overlaid layer on the left plot). {#s4hint .hint}

::: strings
s4ro: Two-way audit: max|cumsum(h) − s| = <span>{e1}</span> · max|diff(s) − h| = <span>{e2}</span> (both floating-point dust) · currently s[24] = <span>{sv}</span>
cvH4: h[n] (feed δ[n])
cvS4: s[n] (feed u[n])
cvDiffS: diff(s) overlaid
cvCumH: cumsum(h) overlaid
:::

## No test signal needed: h alone convicts or acquits on three counts {#step5 h2=s5t}

::: strings
nav5: 5 Reading h
:::

Step 5 · Reading h {#s5k .step-kicker i18n=text}

Finally, put h itself on the examination table. Three verdicts need no test signal at all — **h alone is enough**: causality is read off its left half, stability off its total sum, memory off its tail. {#s5e .explain}

::: html step5-1
s5cauT: Check 1 · Causality: does it peek at the future?
s5cauE: A causal system’s output may only use **past and present** inputs, so its h must be exactly zero for all n &lt; 0 — no echo before the slap lands. The plot starts at n = −4: the left stretch is “before the slap”. Two suspects: the moving average only looks backward (causal); the centered average needs x[n+1] to compute y[n] — tomorrow’s input.
s5sysMa: Moving average (looks back)
s5sysCe: Centered average (peeks ahead)
s5staT: Check 2 · Stability: does Σ|h[n]| stay finite?
s5staE: BIBO stability has exactly one criterion: **Σ|h[n]| &lt; ∞** — if the absolute sum of the echo converges, no bounded input can produce an unbounded output. Take the accumulator’s h[n] = a<sup>n</sup>: the page adds |h| up to n = 4000 (the leftover tail is not hand-waved away as “negligible”: it is the exact remainder a<sup>4001</sup>/(1−a), printed digit for digit in the readout) and audits it against the closed form 1/(1−a); then it feeds the cheapest bounded input of all, x ≡ 1 with |x| ≤ 1, and watches how high the output climbs.
s5aLab: a · the accumulator’s decay (h[n] = aⁿ)
s5memT: Check 3 · Memory: how long a tail does h drag?
s5memE: Memory is the **length of h’s support**: the moving average’s h hits exactly zero outside its window — one slap’s influence lives for exactly 3 steps, a finite impulse response (FIR). The accumulator’s h is a<sup>n</sup>, which in theory never reaches zero — some whisper of the echo remains forever, an infinite impulse response (IIR).
:::

Read the three checks together: causality fixes h’s left edge, memory fixes its right edge (finite or infinite), stability fixes the total of its absolute values. Choosing a system in engineering is largely making trade-offs on these three tables — real-time forces causality, not blowing up forces Σ|h| to converge, and a simple structure means putting up with a long tail (or the reverse). {#s5hint .hint}

::: strings
s5cauRo: max |h| on the n &lt; 0 side = <span>{v}</span> · {verdict}
vCausal: <span class="verdict pass">CAUSAL ✓ · before the slap lands, the echo is exactly zero</span>
vNonCausal: <span class="verdict fail">NON-CAUSAL ✗ · it uses future inputs</span>
s5staRo: a = <span>{a}</span> · Σ|h| (summed to n = 4000) = <span>{sum}</span> · the leftover tail is not an estimate: it equals the exact remainder a<sup>4001</sup>/(1−a) = <span>{tail}</span> · the two parts add to <span>{sumtail}</span> vs the closed form 1/(1−a) = <span>{closed}</span> — audit difference <span>{diff}</span> (floating-point dust) · feed the bounded input x ≡ 1: by step 400 the output has climbed to <span>{peak}</span>, and its limit is exactly {closed} — the closer a gets to 1, the larger this number grows, with no ceiling (a = 1 is step 0’s reservoir: Σ|h| diverges, and it keeps whatever you pour in)
s5memRo: Moving average: h’s support = <span>3</span> stems (exactly the window width), strictly 0 from n ≥ 3 · Accumulator (a = 0.9): h[100] = <span>{h100}</span>, h[200] = <span>{h200}</span> — too small to see, but **not zero**
cvNeg: n < 0: before the slap lands
cvH5: h[n]
cvMa: moving average’s h (FIR)
cvAcc: accumulator’s h (a = 0.9, IIR)
cvStaNote: Only the first 160 stems are drawn (n = 0…159); the sum follows the readout, out to n = 4000
:::

## From an equation to a fingerprint, and from there to everything {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Equation to Fingerprint
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The finale gathers the whole page onto one real system: a discrete **spring–damper** model — the difference equation below *is* its definition (one n is one time step): θ sets how fast it swings (stiffness), r sets how long the ringing lasts (the closer r is to 1, the lighter the damping). The ritual is the same as always: **slap it once and record h numerically (120 stems), then feed an arbitrary input** — the left route recurses the equation directly; the right route is forbidden from touching the equation and may only stack the recorded h. Both curves, and their maximum difference, are below — reported, not rounded away. {#s6e .explain}

y[n] = x[n] + 2r·cosθ · y[n−1] − r² · y[n−2] {#s6formula .formula i18n=text}

::: html step6-1
s6thLab: θ · swing speed (stiffness)
s6rLab: r · ring length (damping — closer to 1 rings longer)
:::

Method, stated plainly: h is not drawn from a closed form — it is recorded by feeding δ[n] into the difference equation numerically. The prediction route uses only that recorded h and the input (a stacking, i.e. convolution); by prediction time the equation itself has been “forgotten”. That it still reproduces the output to the last bit of dust rests entirely on what steps 2 and 3 verified: the fingerprint, plus the two axioms. {#s6note .hint}

::: html step6-2
s6card1T: Room reverb
s6card1: Record a room’s h once (fire a pulse in the room, capture the echo), and you can move any sound “into” that room: stack the sound with this h and your headphones play that room’s reverb. The reverb plug-ins in audio software ship exactly this: libraries of recorded h’s.
s6card2T: Channel equalization
s6card2: A signal passing through cables, walls and air gets reshaped by the channel — and a channel is a system too. Send a known impulse first and measure the channel’s h, then design a system that undoes the reshaping in reverse. That is what an equalizer does: examine first, then prescribe.
s6card3T: Control systems
s6card3: The test signals and response curves on the control page follow exactly this pattern: record how the plant answers one standard blow, then design the feedback around that recording. From headphone reverb to industrial control, the move is the same — record the fingerprint first.
s6fin: To wrap up: the convolution page teaches how the “flip, slide, multiply, add” is computed; this page is about **why computing this one thing is enough** — for an LTI system, everything hides inside a single slap: any input splits into a row of impulses (step 1), each impulse’s answer is the same h scaled and shifted (step 2), and stacking them gives the whole output; the contract that makes the magic legal, and the boundary where it breaks, were both put on the bench in step 3. Next time you meet any black box, think of one thing first: **slap it, and record h.**
s6lkC: Convolution: the craft lives on that page →
s6lkZ: Z-transform: h’s algebraic ID card →
s6lkCtl: Feedback & control →
:::

::: strings
s6ro: direct recursion vs the h-only prediction: max difference over {N} output points = <span>{err}</span> — not zero: the two routes add in different orders, so their floating-point dust differs by exactly this much; and not a vague “close enough” either: this number is the whole error, not a cent more
cvH6: the freshly recorded h[n] (δ fed numerically)
cvX6: an arbitrary input x[n]
cvDir: direct recursion
cvPred6: prediction from h alone
:::
