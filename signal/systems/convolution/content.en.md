---
lang: en
---

::: strings
docTitle: Convolution · One Interaction at a Time
back: ← Knowledge Index
pageTitle: Convolution
tagline: Blurring a photo, adding echo to a sound, teaching an AI to recognise a cat — one operation sits behind all of them. This page starts from “a weighted average on the move” and builds it up until you can compute it yourself.
foot: knowledge.integ.life · Convolution — one interaction at a time
:::

## One operation, two faces {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · The punchline first {#s0k .step-kicker i18n=text}

Here is a photo. Drag the comparison slider: on the right it is blurred soft; switch to “Edge” and the same picture turns into a bare outline. The two effects look unrelated, yet they are **the same operation** — the only difference is a small grid of numbers it uses, called a **kernel**. That operation is **convolution**, and this page takes it apart. {#s0e .explain}

::: html step0-1
s0split: Split position
s0blur: Blur kernel
s0edge: Edge kernel
:::

The blur kernel is a 3×3 average with a heavier centre; the edge kernel is “centre minus surroundings”. In step 4 you will edit these numbers yourself. For now, keep the picture in mind: **change the kernel and you change the effect — the operation never changes.** {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
cOrig: Original
cAfter: After convolution
:::

## Moving average: convolution in its simplest clothes {#step1 h2=s1t}

::: strings
nav1: 1 Moving average
:::

Step 1 · See it work first {#s1k .step-kicker i18n=text}

This is a noisy curve (think temperature or a stock price). Slide a **window** along it and **average** whatever falls inside: the output is instantly smoother. A wider window smooths more — but it also flattens the peaks and drags everything later. Remember this motion: **a window of weights, sliding along and taking weighted sums**. That is the whole skeleton of convolution. {#s1e .explain}

::: html step1-1
s1win: Window width W
:::

Here every weight is 1/W (kernel = [1,1,…,1]/W). Swap in a different weight profile and you get convolution in general — the next step takes this “slide and sum” apart and does the arithmetic in the open. {#s1note .hint i18n=text}

::: strings
s1play: ▶ Play
s1pause: ⏸ Pause
s1ro: Window width W = {w} · current window average = {avg} · output lags the input by about {lag} samples
cRaw: Raw (noisy)
cSmooth: Moving average
cWin: Window
:::

## Flip, slide, multiply, add {#step2 h2=s2t h2id=s2-title}

::: strings
nav2: 2 Step by step
:::

Step 2 · Taking it apart {#s2k .step-kicker i18n=text}

Discrete convolution **reverses** the kernel to g[−k], then **shifts** it by output index n, giving g[n−k] in column k. **Multiply overlapping pairs and sum** to obtain y[n]. Here f stores k=0…4 and g stores j=0…2; values outside are zero. Edit any value or select output n to inspect an edge. The original Step button still walks alignment, multiplication and summation. {#s2e .explain}

::: html step2-1
s2f: Input sequence f
s2g: Kernel g
convSelect: Inspect output index n (arrows ±1)
convSelected: Current n =
:::

Selecting n pauses, clears accumulated playback time and reveals this computed output. Earlier filled cells are recomputed from the current arrays, not a record of completed learning steps. n, k and j are discrete indices, not seconds. {#convSeekNote .hint i18n=text}

::: html step2-2
s2step: Step →
s2reset: Reset
:::

Zero extension: f[k] is stored at0…4 and g[j] at0…2; all other indices mean0. Requiring0≤k≤4 and0≤n−k≤2 gives k∈[max(0,n−2),min(4,n)]. This is INDEX overlap, not a guarantee of nonzero products or sum: n=3 can cancel. Potentially nonzero outputs span0…6; outside, no pairs overlap and y[n]=0. No circular wrap or same/valid crop is used. {#convBounds .hint i18n=text}

Actual inputs are bounded to−99…99; empty/nonfinite inputs mean0, and a committed field mirrors its stored value. Diagram boxes retain overview rounding (about2 decimals; tiny values may display0). Equations and the index list show up to9 significant digits, scientific notation for tiny values and floating-point roundoff. Use the list for readable small-screen or decimal detail. {#convPrecision .hint i18n=text}

With the default arrays inspect n=0,2,3,6. Why does an edge have1 pair and the middle3? How can n=3 overlap yet give0? Edit one value to a decimal and check the pairs. Reset restores the default arrays and pauses. {#convQuestion .hint i18n=text}

::: html step2-3
convSourceTitle: Convolution, correlation and boundaries
convCorrelation: This is full linear convolution of real sequences indexed from0: y[n]=Σₖ f[k]g[n−k]. NumPy’s official documentation uses this definition and N+M−1 length. For comparison, one correlation lag convention is r[ℓ]=Σₖ f[k]g[k−ℓ]. As k grows its second index grows; convolution’s n−k decreases. The formulas generally differ, though special inputs can give the same values. Opposite lag conventions also exist; no second experiment is introduced here. Step3 separately explains a continuous integral; this step is not a continuous-time approximation.
s2formulaNote: In the formula (f \* g)[n] = Σ<sub>k</sub> f[k] · g[n − k], the minus sign in g[n − k] is exactly where the flip comes from: with n fixed, as k grows, n−k shrinks — the kernel meets f in reverse order. The animation shows the kernel reversed relative to the input boxes for precisely this reason.
:::

::: strings
s2flip: g[{n}−k]
s2prod: Products
s2out: Output y = f \* g
s2play: ▶ Play
s2idle: Press “Step” to begin: first the kernel flips, then it slides and settles accounts position by position.
s2align: Output #{n}: kernel flipped and aligned at position {n}.
s2prods: Multiply the overlapping pairs (grey = no overlap, does not count):
s2sum: y[{n}] = {terms} = {sum}
s2done: Done: y = [{vals}]. Change the numbers above and run it again.
convSupport: For y[{n}]: valid k runs from {lo} to {hi}, {count} pairs; j={n}−k. Full linear-convolution length N+M−1={length}.
convTermPair: k={k} → j={j}: align f[{k}]≈{f} with g[{j}]≈{g}.
convTermProduct: k={k} → j={j}: f[{k}]≈{f} × g[{j}]≈{g}, product≈{p}.
convInput: Value of {name}[{index}] (−99 to99)
:::

## Slide, and measure the overlap {#step3 h2=s3t}

::: strings
nav3: 3 Overlap area
:::

Step 3 · The continuous version {#s3k .step-kicker i18n=text}

Swap the sequences for continuous pulses and the same moves become: slide one pulse across the other — **the area of overlap** is the output at that shift. Drag the shift τ and watch the output curve below grow point by point. Rectangle × rectangle convolves into a **triangle**: its base is the sum of the two widths, its peak the overlap area at perfect alignment. {#s3e .explain}

::: html step3-1
s3shift: Shift τ
s3rr: Rect × Rect
s3rt: Rect × Triangle
:::

Continuous convolution is written (f \* g)(τ) = ∫ f(t) · g(τ − t) dt: for each shift τ, multiply the two curves pointwise and integrate — which is precisely the overlapping area. Switch to the triangle pulse and the output rounds off: multiply-and-accumulate always files down some of the corners. {#s3note .hint i18n=text}

::: strings
s3ro: τ = {tau} · overlap area (= output value) = {area}
cFixedF: f (fixed)
cSlideG: g (sliding)
cOverlap: Overlap
cOut: Output (f \* g)(τ)
:::

## Image kernels: every pixel settles its own account {#step4 h2=s4t}

::: strings
nav4: 4 Image kernels
:::

Step 4 · The main event {#s4k .step-kicker i18n=text}

Shrink the window to 3×3 and slide it across a whole photo and you get image convolution: every output pixel is the **weighted sum** of its 3×3 neighbourhood under the kernel. Edit the kernel cell by cell, or pick a preset — the right image is recomputed immediately, pixel by pixel, for real. Hover (or tap) any pixel in the output and its full arithmetic is laid out below. **A CNN “convolutional layer” is exactly this**, except its kernel is not hand-written — it is learned from data. {#s4e .explain}

::: html step4-1
s4src: Source
s4out: Convolved
s4div: Divisor
s4off: Offset
pIdentity: Identity (original)
pBlur: Blur
pSharpen: Sharpen
pEdge: Edge detect
pEmboss: Emboss
s4accT: How this pixel is computed
:::

::: strings
s4idle: No pixel selected yet — hover over the output image (tap on mobile) and the full 3×3 multiply-and-add for that pixel appears here.
s4accHead: Output pixel ({x}, {y}) — red channel shown (green and blue work identically):
s4accSum: Red total = {sum} → ÷{div} {off}→ clamped to 0–255 gives {val}; likewise G = {g}, B = {b}.
s4offTxt: "+ offset {off} "
:::

## One operation, three disguises {#step5 h2=s5t}

::: strings
nav5: 5 Three disguises
:::

Step 5 · Same skeleton, new scene {#s5k .step-kicker i18n=text}

Once you can see the skeleton, convolution turns up everywhere: echoes in audio, blur in photos, smoothing in data — always “each output point is a weighted sum of a neighbourhood of the input, with weights from a kernel”. Open each disguise in turn. {#s5e .explain}

::: html step5-1
tabAudio: ① Audio echo
tabPhoto: ② Photo blur
tabData: ③ Smoothing data
aDelay: Delay (s)
aDecay: Decay
aReps: Echo count
aDry: ▶ Play dry
aEcho: ▶ Play with echo
s5aNote: An echo is the original sound convolved with a train of impulses (spikes at delayed instants): each spike plays a copy of the sound, scaled down by the decay, later in time. Play the echo version, then drag delay, decay and the echo count and listen again. The spikes drawn below are that kernel. <a class="fourier-link" href="../lti-systems/#step1">The impulse itself: how any signal splits into a train of spikes →</a>
pRadius: Blur radius
s5pNote: Blur is step 4’s box kernel grown larger, computed as two separable 1-D box convolutions. The bigger the radius, the harder it blurs — drag it up and watch detail disappear.
dPass: Passes of [1,2,1]/4
legRaw: Raw (noisy)
legBox: Box average (width 5)
legGauss: [1,2,1]/4, several passes
s5dNote: Back to 1-D: grey is a width-5 moving average (box kernel); cyan applies the little hill kernel [1,2,1]/4 over and over — with each pass the kernel gets closer to a bell (Gaussian) shape and the curve gets smoother.
:::

::: strings
cIR: Impulse response (the kernel)
:::

## Meeting Fourier: convolution becomes pointwise multiplication {#step6 h2=s6t}

::: strings
nav6: 6 Meet Fourier
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

One last thing — the handshake with the previous page: **honest time-domain convolution gives exactly the same answer as Fourier-transforming both, multiplying frequency by frequency, and transforming back.** The plot below overlays the two routes in the same axes: the cyan solid curve is computed point by point, the orange dashed one takes the frequency shortcut. The maximum error between them is stated below. Swap signals and kernels freely — the error should stay essentially zero. {#s6e .explain}

::: html step6-1
s6sig: Signal f
sigRect: Rectangular pulse
sigTri: Triangular pulse
sigSine: Sine burst
sigSteps: Random steps
s6ker: Kernel g
kerSmooth: Smoothing kernel [1,2,3,2,1]
kerDiff: Difference kernel [−1, 1]
kerEcho: Echo kernel (impulse train)
s6fin: So the spinning circles on the Fourier page are not just pretty — **they turn convolution from “multiply everything out” into “multiply frequency by frequency”**: with FFT, how much faster depends on the sequence length and the implementation — the longer the convolution, the bigger the win, up to hundreds or thousands of times faster for long ones; for short sequences it may not pay off at all. By now you have met the same skeleton four times: moving average, discrete sum, overlap area, image kernel. Audio EQ, image processing, CNNs — even the distribution of a sum of two independent random variables in probability — all run on it.
s6link: Back to the Fourier page and its circles →
s6linkH: h[n]: a system's complete answer to one impulse →
:::

::: strings
s6ro: Maximum error between the two routes = {err} (in double precision, expect around 1e-13)
cTime: Time-domain convolution (point by point)
cFreq: Frequency-domain product (FFT)
cSpec: Spectra |F|, |G| and product |F·G|
:::
