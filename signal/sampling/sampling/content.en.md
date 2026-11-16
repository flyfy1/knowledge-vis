---
lang: en
---

::: strings
docTitle: Sampling & Aliasing · One Interaction at a Time
back: ← Knowledge Index
pageTitle: Sampling & Aliasing
tagline: Why can a wheel turn backwards on video? How do equally spaced samples differ from the continuous world between them? Compare sine, wheel and image examples, then test reconstruction under a known bandlimit.
foot: visual.integ.life · Sampling & Aliasing — one interaction at a time
:::

## Which way is this wheel actually turning? {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · Get fooled first {#s0k .step-kicker i18n=text}

The wheel below turns at a steady **2.5 revolutions per second** and never changes. The only thing you may touch is the camera’s frame rate: drag the slider and watch it slow down, freeze, and then **spin backwards**. The wheel never changed — the sampling did. Every camera, and every eye, only peeks at the world once in a while. {#s0e .explain}

::: html step0-1
s0fps: Camera frame rate f_s (fps)
:::

The orange dot on the rim marks the wheel’s **true position** — it keeps turning honestly, never pausing. The apparent speed is not a guess: fold the spoke-passing frequency with f<sub>alias</sub> = |f − k·f<sub>s</sub>| and divide by the spoke count, and you get exactly the speed your eyes report. Step 5 checks this formula on the spot. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: True speed {rev} rev/s (constant) · spoke-passing frequency {sp} Hz · frame rate {fps} fps → apparent speed {app} rev/s · {dir}{note}
cRealPos: true position
cSeen: what the camera sees
:::

## Can a row of dots remember a wave? {#step1 h2=s1t}

::: strings
nav1: 1 Sampling = peeking
:::

Step 1 · What sampling is {#s1k .step-kicker i18n=text}

This step uses an ideal continuous sine. **Sampling** records x[n] = x(tₙ) at tₙ = n/fₛ seconds: n is an integer index, f is cycles per second (Hz), and fₛ counts samples per second. The dots lie on the source. Straight joins or a hold are **display interpolations**, usually different from the continuous source. More samples can improve these approximations; exact ideal reconstruction also needs a known bandlimit and a suitable reconstruction filter. {#s1e .explain}

::: html step1-1
labF: Signal frequency f (Hz)
labFs: Sample rate f_s (Hz)
s1line: Connect with lines
s1hold: Hold (steps)
:::

Lower fₛ and compare straight joins with a hold: the same source samples give different display curves. These are approximations. **Removing the joins does not remove ambiguity**: different continuous waves can share every sample. Next, compare two such sines directly. {#s1hint .hint}

::: strings
dirFwd: forward, same direction
dirRev: BACKWARDS!
dirStill: frozen still
wNoteEdge: " — boundary case: exactly at ±f_s/2, forwards and backwards are indistinguishable — the wheel actually flickers between two positions (the step-3 “exactly 2f: it depends on phase” case)."
s1ro: f = {f} Hz · f_s = {fs} Hz · samples per period = {spp}
cOrig: original wave
cSamp: sample points
cRecon: display interpolation
:::

## Same samples, different continuous waves {#step2 h2=s2t h2part=1}

::: strings
nav2: 2 A fake wave is born
:::

Step 2 · A fake is born {#s2k .step-kicker i18n=text}

::: html step2-1
:::

Record one point every Δt=1/fₛ seconds. Different continuous waves can produce exactly the same samples: **aliasing**. Initially f=9 Hz and fₛ=10 Hz; the pink curve uses signed frequency g=−1 Hz and still passes through every gold sample. The sign means sin(2πgt)=−sin(2π|g|t), not a negative frequency magnitude. Select sample n, then change f or fₛ. The circled sample time and diamond-marked non-sample time are checked against the SAME curves below. Aliasing generally begins above fₛ/2; fₛ need not fall below f. {#s2e .explain}

::: html step2-2
pairLegend: Gold circle: actual sample n. Cyan dashed line and open diamonds: t=(n+¼)/fₛ BETWEEN samples, a comparison only, not an extra sample. Original is grey; folded is pink. Diamonds can coincide.
pairIndex: Select integer sample n (arrows ±1)
pairSelected: Current n =
pairReset: Reset this step
s2pSlow: Classic slow wave: f=9, f_s=10
s2pDC: Pinned to one phase: f=f_s=10
s2pFold: Folded: f=14, f_s=20
s2pClean: No aliasing: f=3, f_s=25
s2formulaNote: This page uses k=round(f/fₛ), placing signed g=f−k·fₛ in [−fₛ/2,fₛ/2], then takes the frequency magnitude |g|. Endpoints have representation ambiguity: see Step 3. Draw with g, not |g| in an unchanged-phase sine. Other steps retain the same folding function.
:::

Why equal samples? At tₙ=n/fₛ the phase difference is 2π(f−g)n/fₛ=2πkn: an integer number of turns. Sine returns to the same value after every whole turn. Thus sin(2πftₙ)=sin(2πgtₙ) for every integer n. Away from sample times, that whole-turn condition is no longer guaranteed. {#pairWhy .explain .small i18n=text}

This compares two ideal zero-initial-phase, unit-amplitude sine candidates. A few coincident points do not identify an arbitrary continuous signal. Even when these curves coincide, higher aliases remain possible. Unique reconstruction needs a known bandlimit, the complete ideal uniform sample sequence and the corresponding reconstruction conditions; neither straight joins nor this finite plot prove it. {#pairLimits .hint i18n=text}

With default9/10, predict equal values at the circle and possibly different values at the diamonds, then move n to check. Why do both displayed curves coincide at3/25? k=0 and g=f; higher candidates such as28 Hz still share the samples. {#pairQuestion .hint i18n=text}

The nastiest preset is “pinned to one phase”: when f is an exact multiple of f<sub>s</sub>, every peek lands on exactly the same phase, all dots collapse to a single value — **no matter how fast the wave, it looks frozen**. That is the truth behind the “stopped” wheel in step 0. {#s2hint .hint}

::: html step2-3
pairNext: Next: how does a known bandlimit rule out aliases? → Step 3
pairSourceTitle: Source and model limits
pairSource: TI AN236 illustrates aliases through identical sample sets and discusses ideal reconstruction with bandlimiting. The whole-turn identity here follows directly from the current sine model. Noise, quantization and clock jitter are not simulated, and finite data do not establish recovery of arbitrary signals.
:::

::: strings
s2ro: f = {f} Hz · fₛ = {fs} Hz · k = {k} · g = {g} Hz · f_alias = |g| = {alias} Hz{note}
s2noteAlias: " — that is the fake wave"
s2noteSame: " — these two curves coincide; other, higher-frequency candidates are not ruled out."
s2noteDC: " — DC: every peek hits the same phase"
cAlias: fake wave f_alias
pairSample: Spacing Δt≈{dt} s; n={n}, tₙ≈{time} s: original≈{original}, folded≈{folded}, difference≈{difference}. Equal in theory; displayed arithmetic includes floating-point roundoff.
pairBetween: NON-sample comparison t≈{other} s: original≈{o}, folded≈{a}, difference≈{d}. Values use unit amplitude. They may differ here, or happen to agree.
:::

## The Nyquist line: twice, and not a hair less {#step3 h2=s3t}

::: strings
nav3: 3 The Nyquist line
:::

Step 3 · The line {#s3k .step-kicker i18n=text}

This step compares ideal single tones. The **Nyquist condition** assumes a known bandlimit: if all components satisfy |f| ≤ B and fₛ > 2B, the complete uniform sample sequence determines the signal within that band. Here B=f: sweep fₛ across 2f. Without restricting candidate frequencies, higher aliases can still share every sample. Straight joins are display interpolation; their varying height does not decide exact reconstruction. Pin fₛ=2f and change phase to inspect the boundary ambiguity. {#s3e .explain}

::: html step3-1
s3phase: Sampling phase φ (°)
s3snap: Pin to exactly 2f
:::

At the boundary x[n] = A(−1)ⁿ sinφ. With φ=90° the dots alternate at full amplitude; with φ=0° they vanish. Even nonzero dots determine only A sinφ, not A and φ separately: A=1, φ=30° and A=0.5, φ=90° give identical samples. Nonzero dots are no guarantee of recovery. This page uses strict fₛ>2B with ideal uniform, complete sampling; quantization, noise and finite-record errors are omitted. <a class="fourier-link" href="https://www.ti.com/lit/pdf/snaa079">Basis: TI · sampling and reconstruction →</a> {#s3hint .hint}

::: strings
s3roAbove: f_s = {fs} Hz > 2f = {two} Hz: this tone is inside baseband; uniqueness still assumes a known bandlimit.
s3roBelow: f_s = {fs} Hz < 2f = {two} Hz: aliased — fake wave at {alias} Hz.
s3roAt: f_s = 2f = {two} Hz: all down to phase — max |sample| = {amp} (1 = full amplitude, 0 = wiped out).
cAmp: sample envelope
:::

## Aliasing in the frequency domain: the spectrum clones itself {#step4 h2=s4t}

::: strings
nav4: 4 Aliasing in frequency
:::

Step 4 · The frequency view {#s4k .step-kicker i18n=text}

A real sine has positive and negative frequency components. This diagram shows only **positive-frequency peak positions**, not a complete magnitude/phase spectrum. Ideal uniform sampling repeats the two-sided spectrum every fₛ Hz. With known B&lt;fₛ/2, ideal reconstruction selects the two-sided baseband. The displayed [0,fₛ/2] is only its positive half; peak locations alone do not recover a waveform. Drag fₛ to see copies fold into this region. <a class="fourier-link" href="../../transforms/fourier/#step5">Compare the Fourier spectrum →</a> <a class="fourier-link" href="../../transforms/z-transform/#step5">Convert on the Z page: spacing fₛ Hz or 2π/T rad/s →</a> {#s4e .explain}

::: html step4-1
:::

Notice what aliasing really is: not “the signal got a bit dirty”, but **high-frequency information moved bodily into the low frequencies, impersonating them**. Once sampling is done, the true peak and the alias peak look identical — no filter afterwards can separate them. Prevention has to happen before sampling. {#s4hint .hint}

::: strings
s4ro: Copy spacing = f_s = {fs} Hz · the peak inside the baseband [0, {half} Hz] sits at {alias} Hz — the same number as the time-domain fake wave in step 2.
s4roClean: Copy spacing = f_s = {fs} Hz · f_s > 2f: the baseband [0, {half} Hz] holds only the original peak. Clean.
s4roZero: This step fixes phase to zero. If f = k·f_s/2 for integer k, every sine sample is zero and no sampled-spectrum peak remains. This depends on phase; step3 shows nonzero-phase cases at the same frequency boundary.
cPeak: original peak f
cCopy: spectral copy
cBase: baseband [0, f_s/2]
cAliasPeak: alias peak f_alias
:::

## It is everywhere in daily life {#step5 h2=s5t}

::: strings
nav5: 5 Aliasing everywhere
:::

Step 5 · Aliasing everywhere {#s5k .step-kicker i18n=text}

Three exhibits, one formula. ①**Sound**: sample a high tone at a low rate, point by point and for real, then play it back — what you hear is not the original, it is the fake wave. ②**Images**: decimate a fine striped picture pixel by pixel and a moiré grows by itself. ③**The wheel**: back to step 0, checking the apparent-speed formula on the spot. {#s5e .explain}

::: html step5-1
tabAudio: ① Audio
tabImage: ② Image moiré
tabWheel: ③ Checking the wheel
s5aF: Source frequency f (Hz)
s5aFs: Nominal sample rate f_s
s5aPlayAlias: ▶ Play the sampled result
s5aPlayOrig: ▶ Play the original frequency
s5aHint: Full disclosure: the plot above shows the first 240 sample points of the playback buffer, each computed as the sine value at its true sampling instant t = n/f<sub>s</sub> — **not a low-frequency wave faking it**. The pitch you hear is the zero-crossing rate of those very points (the “measured zero-crossings” in the readout is exactly the check a reviewer would run). Silent by default, click to play, volume kept low. Above 10 kHz some people cannot hear the original at all — but its alias falls back into the audible range, where everyone can hear it. Special case: when f is an exact multiple of f<sub>s</sub> (f = f<sub>s</sub>, 2f<sub>s</sub>, …), every sample lands on the same phase (a zero crossing of the sine), so the buffer is all zeros and playback is silence — also true.
s5iSrc: Original (fine stripes)
s5iOut: After decimation (magnified)
s5iStride: Decimation stride (take one pixel every …)
patStripes: Vertical stripes
patGrid: Grid
s5iHint: There is no “draw a wavy pattern” code anywhere: the right image merely **takes one pixel out of every {m}** (nearest-neighbour decimation) and magnifies the result. The fat waves grow out of the sampling grid folding against the fine stripes — moiré is aliasing for images. Drag the stride and the waves change thickness and direction. Step6 compares prefiltering and its limits.
s5wN: Spokes N
s5wRev: True speed (rev/s)
s5wFps: Frame rate f_s (fps)
s5wHint: The check works exactly as in step 0: the spoke pattern repeats N times per revolution, so the “signal frequency” is the spoke-passing frequency N×speed; fold it against the frame rate with f<sub>alias</sub> and divide by N to get the apparent speed. A negative sign means backwards. Drag until the spoke frequency hits an exact multiple of the frame rate and the wheel “freezes”.
:::

::: strings
s5aro: Source f = {f} Hz · sample rate f_s = {fs} Hz · k = {k} · formula alias f_alias = {alias} Hz · measured zero-crossings of the buffer ≈ {zcr} Hz
cBuf: first 240 samples of the playback buffer (dot = one real sample)
patRings: Concentric rings
s5wro: Spoke-passing frequency f_sp = N × speed = {n} × {rev} = {sp} Hz · k = {k} · apparent speed = {app} rev/s · {dir}{note}
:::

## Before you sample, learn to squint {#step6 h2=s6t}

::: strings
nav6: 6 Squint first
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Anti-aliasing suppresses high frequencies before decimation. Both sides use the same source and decimator; the right side first applies a **finite box convolution twice**. Compare how much moiré weakens and how much detail is lost. A box filter has sidelobes and cannot guarantee zero aliasing; results depend on the pattern and stride. This image example is not an ideal brick-wall low-pass. {#s6e .explain}

::: html step6-1
s6direct: Direct decimation
s6blur: Blur first, then decimate
patScene: Scene + fine stripes
:::

Audio also needs anti-alias filtering before analog-to-digital conversion. For a 20 kHz passband and 44.1 kHz sample rate, the Nyquist frequency is 22.05 kHz, leaving a 2.05 kHz transition region for a practical filter to attenuate; it does not cut abruptly at 20 kHz. This illustrates a bandwidth budget, not the historical derivation of 44.1 kHz. Stopband attenuation, hearing limits and hardware performance need separate specifications. {#s6audio .explain}

::: html step6-2
s6fin: The sampling theorem does not really say “sample as fast as you can”. It says **“decide what to give up first, then sample”**: you surrender the high-frequency detail precisely so it cannot dress up as low frequency and lie to you. Two threads from this page — why spectra clone themselves, and why blur can save the day — are the home turf of the Fourier and convolution pages; feel free to go back and compare notes.
s6linkF: ← Back to Fourier: why spectra clone themselves
s6linkC: On to convolution: what the blur kernel is doing →
:::

::: strings
s5iro: Original {w}×{h} · stride {m} px · {w2}×{h2} samples left (magnified)
s6ro: Stride {m} px · both sides keep {w2}×{h2} samples · the right side applies a box blur (radius {r} px, two passes) before decimating
cEar: signal (ear limit ≈ 20 kHz)
cLpf: anti-alias filter rolloff
cHalfFs: f_s/2 = 22.05 kHz
cCD: f_s = 44.1 kHz
:::
