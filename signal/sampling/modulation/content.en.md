---
lang: en
---

::: strings
docTitle: Modulation & Frequency Shifting · Moving Signals Up in Frequency · One Interaction per Step
back: ← Knowledge Index
pageTitle: Modulation & Frequency Shifting
tagline: A voice on its own does not travel far, and every voice crowds into the same low-frequency corner. Modulation packs a message’s whole spectrum up next to a high-frequency carrier for the trip, then unpacks it on arrival — multiply by a cosine in time, and the spectrum moves house. AM writes the message into amplitude, FM into the swing of frequency; from crystal radios to WiFi, the mover has never changed. Every spectrum on this page is computed live by FFT from real samples, and every demodulation is computed sample by sample.
foot: visual.integ.life · Modulation & Frequency Shifting —— one interaction per step
:::

## Voices live down low — but they have to move up high {#step0 h2=s0t}

::: strings
nav0: 0 Moving House
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

The “voice” below is three sines at 3, 5 and 7 Hz stacked together — its entire spectrum huddles **near 0**. Such a signal has two problems. It does not travel far: an antenna radiates efficiently only when its size is comparable to the wavelength, and low frequencies mean absurdly large antennas. And every voice crowds into the same band, so nobody can be heard. The fix is to **move house**: shift the whole spectrum up next to a high-frequency **carrier**. Drag the carrier frequency and watch the spectrum pack up and move — the only moving tool is **multiplication**. {#s0e .explain}

::: html step0-1
s0fcLab: Carrier frequency fc
:::

The tuning knob on a radio does half of the inverse operation: **pick a street (the carrier), pick up whoever lives there**. Notice the spectrum comes in two copies — multiplying by a real cosine duplicates the spectrum to both +fc and −fc (the plot shows only positive frequencies). That atomic operation is what Step 1 examines. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: Highest message component B = <span>7 Hz</span> (measured lines at 3 / 5 / 7 Hz) · after the move, the strongest line measures <span>{peak} Hz</span>, and the line group spans <span>{lo} – {hi} Hz</span> (= fc ± 7)
cv0Msg: Baseband message m(t): 3 + 5 + 7 Hz
cv0Mod: Modulated m(t)·cos(2πfc t)
cv0SpecBase: Message spectrum (before)
cv0SpecMove: Modulated spectrum (FFT, measured)
cvFreq: Frequency f (Hz)
cvAmp: Amplitude
:::

## One multiplication, and the spectrum moves {#step1 h2=s1t}

::: strings
nav1: 1 AM
:::

Step 1 · AM {#s1k .step-kicker i18n=text}

Start with the classic move — **amplitude modulation**: s(t) = (1 + m·message) × cos(2πfc t). The carrier’s **amplitude** is sculpted by the message; m is the **modulation index** (how deep the sculpting goes). With a single 10 Hz sine as the message, the spectrum holds exactly three lines: the carrier itself (amplitude 1) and one **sideband** on each side, each exactly m/2 tall — because cos A·cos B splits into two frequencies. The spectrum below is an FFT of real samples computed by this page, and every number in the readout is measured off the line heights. Push m past 1 and the time domain gives the game away first: the envelope starts crossing zero, planting the distortion that Step 3 will harvest. {#s1e .explain}

s(t) = (1 + m·m(t))·cos(2πfc t), fc = 200 Hz {#s1f .formula i18n=text}

::: html step1-1
s1msgSingle: Message: single 10 Hz tone
s1msgDual: Message: two tones, 10 + 25 Hz
s1mLab: Modulation index m
:::

Switch to the two-tone message and every message line is copied to both sides of fc: the whole spectral packet is **shifted and mirrored**. So a modulated signal always occupies **twice** the message’s highest frequency B (the “span” in the readout is measured from the FFT lines). The variant that carries only the message, with no carrier line, is DSB (double sideband) — Step 2 demodulates exactly that. {#s1hint .hint}

::: strings
s1roSingle: Measured (FFT): carrier <span>{car}</span> · lower sideband <span>{lo}</span> · upper sideband <span>{hi}</span> · sideband/carrier = <span>{ratio}</span> (theory m/2 = <span>{half}</span>) {spanTxt}
s1roDual: Measured (FFT): carrier <span>{car}</span> · sideband pair of the 10 Hz tone <span>{sb1}</span> (theory m·a₁/2 = <span>{a1}</span>) · pair of the 25 Hz tone <span>{sb2}</span> (theory m·a₂/2 = <span>{a2}</span>) {spanTxt}
s1roZero: m = 0: only the carrier remains — nothing is being carried. Push m up and the sidebands grow out.
s1roSpanOk: modulated lines span <span>{span} Hz</span> = 2B (B = {B} Hz)
s1roSpanMiss: the sidebands are too small to pass the span threshold 0.002 — no span detected (theory 2B = {full} Hz)
s1roSpanPart: the outer sidebands fall below the span threshold — only <span>{span} Hz</span> measured (theory 2B = {full} Hz)
cv1Msg: Message (normalised)
cv1Car: Carrier cos(2πfc t)
cv1Prod: Modulated (1 + m·message)·carrier
cv1Spec: Modulated spectrum (FFT, Hann window)
cv1Carrier: carrier
cv1Side: sideband
:::

## Moving back takes aim: frequency and phase must both check out {#step2 h2=s2t}

::: strings
nav2: 2 Tuning In
:::

Step 2 · Reception {#s2k .step-kicker i18n=text}

The receiver runs the same move in reverse: multiply the incoming DSB signal **by a local carrier once more**. The product contains one copy of the message shifted back to baseband and one copy pushed up to 2fc; a low-pass filter removes the high copy and the message is back (this is **coherent demodulation**). But two accounts must balance. If the local oscillator’s **frequency** is off by Δf, the recovered message comes multiplied by cos(2πΔf·t) — it periodically fades in and out (a **beat**). If its **phase** is off by φ, the message is scaled by **cos φ** overall — and at φ = 90° the output is **exactly zero**. Drag both sliders and read the ledger. {#s2e .explain}

DSB: s(t) = m(t)·cos(2πfc t) → × 2cos(2π(fc+Δf)t + φ) → low-pass recovers m(t)·cos(2πΔf t + φ) {#s2f .formula i18n=text}

::: html step2-1
s2dfLab: LO detuning Δf
s2phiLab: LO phase offset φ
:::

Real receivers assign a dedicated circuit — the phase-locked loop (PLL) — to watch these two accounts continuously, locking the local oscillator’s frequency and phase to the incoming wave. When the accounts don’t balance, the signal doesn’t get “a bit noisy”: it shrinks or vanishes periodically, by mathematical necessity. Filter note: this page uses an ideal low-pass (FFT-domain mask, 60 Hz cutoff); Step 5’s band-pass works the same way. {#s2hint .hint}

::: strings
s2ro: Measured phase scale = <span>{scale}</span> (theory cos φ = <span>{cosphi}</span>, reconciled at Δf = 0) · measured output lines: <span>{lines}</span> (the beat pattern matches Δf)
s2roTwin: (the main output is floating-point dust, so the line positions are measured on the φ = 0 twin path at the same Δf — position depends on Δf only, never on φ)
cv2Dust: spectrum ≈ {amp} (floating-point dust, not a real signal) · axis floored at 1/4 of the original message peak — not magnified
s2linesPair: two lines at {f1} Hz and {f2} Hz (= fm ± Δf)
s2linesSingle: a single line at {f} Hz (Δf = 0, no beat)
cv2Out: Demodulated output
cv2Ref: Original message (reference)
cv2Spec: Output spectrum (FFT, measured)
:::

## The poor receiver: a diode, an RC — and where its bet fails {#step3 h2=s3t}

::: strings
nav3: 3 Envelope Detector
:::

Step 3 · Envelope Detection {#s3k .step-kicker i18n=text}

Old radios had no local oscillator. All they could afford was a diode and an RC: the diode lets the signal’s positive peaks **charge a capacitor instantly to the peak**, and between peaks the capacitor **discharges** slowly through R — so the capacitor voltage traces the carrier’s **envelope**, which is 1 + m·message. Below is a sample-by-sample simulation of exactly that circuit (instant charge, discharge as e<sup>−t/τ</sup>). It rests on a bet: **m ≤ 1**. Once m passes 1, the envelope crosses zero, the carrier phase flips, and the detector ends up following the envelope’s absolute value — the message gets **folded** at its troughs, and the distortion readout jumps on the spot. Don’t abuse τ either: too small and the ripple leaks through; too large and the discharge can’t follow the envelope’s falling edge (**diagonal clipping**). <a class="fourier-link" href="../../systems/frequency-response/#step2">This RC is a low-pass filter: how to read its Bode plot →</a> {#s3e .explain}

::: html step3-1
s3mLab: Modulation index m
s3tauLab: RC time constant τ
s3cardEnv: Envelope detector · recovered message
s3cardEnvSub: Diode peak + RC discharge, simulated sample by sample; distortion = residual after a least-squares fit of the detector output to the message
s3cardCoh: Coherent demod · same conditions (reference)
s3cardCohSub: Multiply by LO + ideal low-pass (φ = 0, Δf = 0), same AM signal
:::

Notice the absurdly large number on the coherent card — that is not rounding. That chain is mathematically **lossless** (down at floating-point dust). The envelope detector is cheap, but its ledger contains ripple, folding, and diagonal clipping. The whole difference between cheap and dear is in these readouts. {#s3hint .hint}

::: strings
s3ro: τ has a sweet spot in the middle: at τ = {tau} ms the distortion is <span>{snr}</span>. Push m past 1.0, or twist τ to either end, and watch this card.
s3snr: Distortion (fit SNR) <b>{v}</b>
cv3Sig: AM signal & detector output
cv3Env: Detector output
cv3True: True envelope 1 + m·message
:::

## FM: move the frequency’s swing instead — then a noise duel {#step4 h2=s4t}

::: strings
nav4: 4 FM & Noise
:::

Step 4 · FM {#s4k .step-kicker i18n=text}

FM takes the other road: the carrier’s amplitude never changes; its **instantaneous frequency** swings with the message — f(t) = fc + kf·m(t), with swing Δf = β·fm (β is the modulation index; fm = 10 Hz is this step’s message). The larger β, the wider the spectrum spreads: the spectrum below is still a live FFT, and the bandwidth readout is an **occupied-bandwidth** measurement (the span between the 1% and 99% cumulative-power points of the unwindowed power spectrum). Next to it sits the empirical **Carson’s rule**, 2(Δf + fm) — an estimate, not a measurement; the two numbers should be close, not equal. {#s4e .explain}

f(t) = fc + Δf·m(t), s(t) = cos(2π∫f dt), Δf = β·fm, fm = 10 Hz, fc = 200 Hz {#s4f .formula i18n=text}

::: html step4-1
s4betaLab: Modulation index β (Δf = β × 10 Hz)
:::

Watch the carrier line’s readout: as β grows it keeps shrinking — FM moves power out of the carrier into the sidebands. That is also why an FM spectrum is a “comb”: lines spaced fm apart, with heights set by Bessel functions. This page does not expand those formulas; the spectrum is measured, not drawn. {#s4hint .hint}

::: html step4-2
s4aT: The noise duel: the same noise, thrown at AM and FM
s4aE: Throw **the same** noise at both AM and FM (same seed, mulberry32 + Box–Muller Gaussians, same noise power σ = 0.2) and demodulate each: AM with Step 3’s envelope detector (m = 0.8, τ = 15 ms), FM by first **limiting** (keep only the analytic signal’s phase, discard amplitude) and then phase-difference demodulation (β = 2.5). Output quality is measured one way for both: least-squares fit the demodulated output to the original message and turn the residual into an SNR. Every number is computed from the samples — change the seed and the numbers move, but the verdict should stand.
s4seedBtn: New noise seed
s4aHint: FM’s lead is not free: upstairs it just spent several times the bandwidth. **Trading bandwidth for quiet** is the economics that won FM the whole broadcast band. Fairness note: both channels get the same noise sequence at the same power; the input SNRs differ slightly because AM and FM signals have different powers of their own, and the readout lists them separately and honestly.
:::

::: strings
s4ro: Δf = <span>{df} Hz</span> · measured occupied bandwidth = <span>{bw} Hz</span> (1%–99% cumulative power) · Carson’s rule = <span>{carson} Hz</span> (rule of thumb) · the carrier line is down to <span>{car}</span> (larger β hands more power to the sidebands)
cv4Finst: Instantaneous frequency f(t) (Hz)
cv4Wave: FM waveform (excerpt)
cv4Spec: FM spectrum (FFT, measured)
cv4Obw: Measured occupied BW
cv4Carson: Carson BW
s4aRo: Seed <span>{seed}</span> · measured noise power <span>{np}</span> · input SNR: AM <span>{inAm}</span> / FM <span>{inFm}</span> (their own signal powers differ) · after demod: AM envelope <span>{outAm}</span> · FM <span class="good">{outFm}</span> · FM ahead by <span>{margin}</span>
cv4MsgRef: Original message
cv4AmOut: AM demod (envelope)
cv4FmOut: FM demod (limit + discriminate)
:::

## Three stations on one street: tuning and crosstalk {#step5 h2=s5t}

::: strings
nav5: 5 FDM
:::

Step 5 · FDM {#s5k .step-kicker i18n=text}

Do Step 0’s move three times at once and you get **frequency-division multiplexing (FDM)**: three “stations” park their messages next to three different carriers, all sharing one channel. The receiver first circles its target with a **band-pass** (FFT mask, 25 Hz half-width), then coherently demodulates it back. Below you can pick a station, mistune the receiver, or **squeeze the stations closer together** — once a neighbour’s spectral packet creeps into your band-pass, their message leaks into your output, and the crosstalk readout climbs on the spot. Crosstalk is measured by fitting the demodulated output to the **target station’s own message** by least squares: the part that fits counts as yours, and the **residual power** that does not fit, divided by your own power, is the crosstalk. (This chain has neither noise nor nonlinearity, so the residual is entirely neighbour leakage — which is why the recovered SNR and the crosstalk come out exactly equal in size and opposite in sign: two readings of the same ledger.) {#s5e .explain}

::: html step5-1
s5tgtLab: Target station
staA: Station A
staB: Station B
staC: Station C
s5tuneLab: Receiver tuning fc (where the receiver actually points)
s5spaceLab: Station spacing factor (1 = standard 60 Hz spacing)
:::

Spectrum management is exactly this ledger: how wide the spacing is, how much bandwidth each station occupies, and how steep the receiver’s band-pass is — together they set the crosstalk. Pull the spacing factor to 0.55, or mistune by 15 Hz, and watch the recovered SNR and crosstalk move. {#s5hint .hint}

::: strings
s5ro: Target {name} (carrier <span>{fc}</span> Hz) · recovered SNR = <span>{snr}</span> · crosstalk (neighbours’ power / target power) = <span>{xt}</span> · inside the circled band, the target holds <span>{share}</span> of the power
cv5Spec: Channel spectrum (3 stations, FFT) & receiver band-pass
cv5Out: Demodulated output
cv5Ref: Target message (reference)
:::

## I/Q: two floors on the same street {#step6 h2=s6t}

::: strings
nav6: 6 Finale · I/Q
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The finale pushes the move to its limit: can **one carrier frequency** carry two messages at once? Yes — with two **orthogonal** carriers: cos carries the I stream, sin carries the Q stream, sent as one combined signal (s = I·cos − Q·sin). At the receiver, multiplying by cos and low-passing “sees” only I; multiplying by sin sees only Q, because over whole cycles the product of cos and sin integrates to zero — **orthogonality**. The crosstalk readouts tell you how clean that “only” is. Then switch orthogonality off (send both streams on cos) and watch: the two streams instantly tangle into one inseparable sum. {#s6e .explain}

s(t) = I(t)·cos(2πfc t) − Q(t)·sin(2πfc t), I = cos(2π·6t), Q = cos(2π·15t), fc = 200 Hz {#s6f .formula i18n=text}

::: html step6-1
s6orthBtn: Orthogonal (cos carries I, sin carries Q)
s6brokenBtn: Orthogonality off (both on cos)
:::

This is the alphabet of modern communications: the receiver projects the signal onto the I and Q axes and gets one point in a plane; sending different data means sending different points — the grid of points is a **QAM constellation**. Phones, WiFi and 5G modulation are all descendants of this same mixing and projection. {#s6hint .hint}

::: html step6-2
s6card1T: From crystal radios to 5G
s6card1: A 1920s crystal set used exactly Step 3’s envelope detector; FM broadcasting bought its sound quality with Step 4’s trade; phones and WiFi carry two streams at once with Step 6’s I/Q. A century changed the components — never the multiplication.
s6card2T: PLLs are everywhere
s6card2: Step 2’s two accounts are watched, moment by moment, by a phase-locked loop (PLL) in every real receiver: let the local oscillator’s frequency or phase drift and the ledger stops balancing. PLLs also hide inside CPU clock multipliers and disk-drive read channels.
s6card3T: Spectrum is a public resource
s6card3: Step 5’s parking dispute is literally the job of radio regulators worldwide: slicing the spectrum into bands, capping bandwidths and emission masks, so that systems that have never met can share one sky.
s6fin: To wrap up: **modulation is moving a spectrum house** — multiply by a cosine and the spectrum is copied twice and shifted to ±fc; demodulation does the same move again and filters away the high copy. AM writes the message into amplitude — cheap, but noise-fragile. FM writes it into the swing of frequency — trading bandwidth for quiet. FDM lets many voices live on separate streets; I/Q stacks two floors on one street with orthogonality. Every communications term you will ever meet — carrier, sideband, bandwidth, crosstalk — appears on this page in person, with its real numbers.
s6lkF: Fourier transform: what frequencies a signal is made of →
s6lkS: Sampling & aliasing: moving house, disaster scenes →
s6lkR: Frequency response & filters: the low-pass and band-pass in person →
:::

::: strings
s6ro: I branch: recovered scale <span>{ai}</span> · crosstalk (Q power leaking into I) <span>{xi}</span> · Q branch: recovered scale <span>{aq}</span> · crosstalk (I power leaking into Q) <span>{xq}</span>
cv6Tx: Transmitted combined signal
cv6I: I branch: recovered vs original
cv6Q: Q branch: recovered vs original
:::
